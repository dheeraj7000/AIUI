import { z } from 'zod';
import type { AiuiMcpServer } from '../server';

/**
 * Discipline-named aliases for the canonical MCP tools.
 *
 * The canonical tools use function-style names that describe implementation
 * (`validate_ui_output`, `get_theme_tokens`, ...). When a user says
 * "polish this" or "critique this UI", an LLM naturally reaches for a tool
 * whose name matches the verb. These aliases expose the same capabilities
 * under discipline-style names used by impeccable.style (`audit`, `polish`,
 * `critique`, `typeset`, ...) while preserving the originals — deployed
 * clients that invoke canonical names keep working.
 *
 * Two shapes are used:
 *   - pass-through: the alias forwards args verbatim to the canonical
 *     handler and returns its result unchanged. Cheapest and safest.
 *   - composed: the alias calls multiple canonical handlers and merges
 *     their results into a single structured response (see `polish` which
 *     chains validate -> fix, and `typeset` which filters type tokens +
 *     type violations).
 *
 * Aliases must be registered AFTER all canonical tools (see index.ts) so
 * `server.getToolHandler(...)` lookups resolve.
 */

type Handler = (args: Record<string, unknown>) => Promise<unknown>;

function requireHandler(server: AiuiMcpServer, name: string): Handler {
  const h = server.getToolHandler(name);
  if (!h) {
    throw new Error(
      `Alias registration failed: canonical tool "${name}" not registered. ` +
        `registerAliases must run after registerAllTools' primary pass.`
    );
  }
  return h;
}

export function registerAliases(server: AiuiMcpServer) {
  // ---------------------------------------------------------------------
  // audit — pass-through to validate_ui_output
  // ---------------------------------------------------------------------
  const validateHandler = requireHandler(server, 'validate_ui_output');
  const validateSchema = server.getToolSchema('validate_ui_output') ?? {
    projectId: z.string().uuid(),
    code: z.string(),
  };

  server.registerTool(
    'audit',
    'Audit this code for token and taste violations.',
    validateSchema,
    async (args) => validateHandler(args)
  );

  // ---------------------------------------------------------------------
  // polish — composed: validate, then suggest fixes for any violations
  // ---------------------------------------------------------------------
  const fixHandler = requireHandler(server, 'fix_compliance_issues');

  server.registerTool(
    'polish',
    'Polish this code — find issues and suggest fixes.',
    {
      projectId: z.string().uuid().describe('The project ID to validate against'),
      projectSlug: z
        .string()
        .describe('Project slug (used by the fix pass to look up approved tokens)'),
      code: z.string().describe('The generated UI code to polish'),
    },
    async (args) => {
      const validation = (await validateHandler({
        projectId: args.projectId,
        code: args.code,
      })) as {
        compliant?: boolean;
        violations?: Array<{ type: string; message: string; line?: number }>;
      };

      // If fully compliant, skip the fix pass — nothing to do.
      if (validation.compliant || !validation.violations?.length) {
        return { validation, fixes: null, applied: false };
      }

      // The fix handler expects a more structured violation list than
      // validate returns. We best-effort map what we have; callers with
      // richer token context can still call fix_compliance_issues directly.
      const fixInput = validation.violations.map((v) => ({
        token: '',
        found: v.message,
        expected: '',
        line: v.line,
      }));

      let fixes: unknown;
      try {
        fixes = await fixHandler({
          code: args.code,
          violations: fixInput,
          projectSlug: args.projectSlug,
        });
      } catch (err) {
        fixes = {
          error:
            err instanceof Error
              ? err.message
              : 'fix_compliance_issues failed while generating polish suggestions',
        };
      }

      return { validation, fixes, applied: false };
    }
  );

  // ---------------------------------------------------------------------
  // critique — persona-flavored validation
  //
  // The personas critique mode is being added to validate_ui_output by
  // another agent. Until that lands, we forward args unchanged and
  // annotate the response so consumers can tell the mode wasn't honored.
  // TODO(personas-mode): once validate_ui_output accepts `mode: 'personas'`,
  // set that flag below and drop the annotation.
  // ---------------------------------------------------------------------
  server.registerTool(
    'critique',
    'Critique this UI from multiple user personas.',
    validateSchema,
    async (args) => {
      const result = (await validateHandler({
        ...args,
        // Forward the personas mode flag optimistically — handlers that
        // don't know it will ignore it, handlers that do will switch modes.
        mode: 'personas',
      })) as Record<string, unknown>;
      const hasPersonas = 'personas' in result || 'critique' in result;
      return {
        ...result,
        ...(hasPersonas ? {} : { personasModePending: true }),
      };
    }
  );

  // ---------------------------------------------------------------------
  // typeset — composed: type tokens + type-only violations
  // ---------------------------------------------------------------------
  const tokensHandler = requireHandler(server, 'get_theme_tokens');

  server.registerTool(
    'typeset',
    'Typeset this UI — inspect font tokens and flag type-level violations.',
    {
      projectId: z.string().uuid().describe('The project ID'),
      code: z.string().optional().describe('Optional code to scan for type violations'),
      format: z.enum(['tailwind', 'css', 'json']).default('json').describe('Token output format'),
    },
    async (args) => {
      const tokens = (await tokensHandler({
        projectId: args.projectId,
        format: args.format ?? 'json',
      })) as { tokens?: Record<string, string> } & Record<string, unknown>;

      // Filter to font / type-size tokens. Token keys commonly follow
      // `font.*` / `font-size.*` / `line-height.*` / `letter-spacing.*`.
      const typeRe = /^(font|font-size|line-height|letter-spacing|text)(\.|-|$)/i;
      const rawTokens = tokens.tokens ?? {};
      const typeTokens: Record<string, string> = {};
      for (const [k, v] of Object.entries(rawTokens)) {
        if (typeRe.test(k)) typeTokens[k] = v;
      }

      let typeViolations: Array<Record<string, unknown>> = [];
      if (typeof args.code === 'string' && args.code.length > 0) {
        const validation = (await validateHandler({
          projectId: args.projectId,
          code: args.code,
        })) as { violations?: Array<{ type: string }> };
        typeViolations = (validation.violations ?? []).filter(
          (v) => v.type === 'font' || v.type === 'font-size'
        );
      }

      return { typeTokens, typeViolations };
    }
  );

  // ---------------------------------------------------------------------
  // Pure pass-through aliases
  //
  // Each is spelled out as an explicit `server.registerTool(...)` call (not
  // a loop) so the build-time catalog generator in
  // apps/web/scripts/gen-tool-catalog.mjs — which regex-parses source — can
  // pick them up.
  // ---------------------------------------------------------------------
  const tokensSchema = server.getToolSchema('get_theme_tokens') ?? {};
  server.registerTool(
    'tokens',
    'Show the active design tokens for this project.',
    tokensSchema,
    async (args) => tokensHandler(args)
  );

  const contextHandler = requireHandler(server, 'get_project_context');
  const contextSchema = server.getToolSchema('get_project_context') ?? {};
  server.registerTool('context', 'Load the project design context.', contextSchema, async (args) =>
    contextHandler(args)
  );

  const listHandler = requireHandler(server, 'list_components');
  const listSchema = server.getToolSchema('list_components') ?? {};
  server.registerTool('components', 'List available component recipes.', listSchema, async (args) =>
    listHandler(args)
  );

  const recipeHandler = requireHandler(server, 'get_component_recipe');
  const recipeSchema = server.getToolSchema('get_component_recipe') ?? {};
  server.registerTool('recipe', 'Fetch a component recipe by id.', recipeSchema, async (args) =>
    recipeHandler(args)
  );
}

/**
 * The canonical-name map, exported so the catalog generator (and smoke
 * tests) can mark aliases distinctly without re-deriving the mapping.
 */
export const ALIAS_MAP: Readonly<Record<string, string>> = Object.freeze({
  audit: 'validate_ui_output',
  polish: 'validate_ui_output+fix_compliance_issues',
  critique: 'validate_ui_output',
  typeset: 'get_theme_tokens+validate_ui_output',
  tokens: 'get_theme_tokens',
  context: 'get_project_context',
  components: 'list_components',
  recipe: 'get_component_recipe',
});
