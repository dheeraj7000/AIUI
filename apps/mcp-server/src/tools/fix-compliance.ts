import { z } from 'zod';
import { eq } from 'drizzle-orm';
import type { AiuiMcpServer } from '../server';
import { getDb } from '../lib/db';
import { projects, styleTokens } from '@aiui/design-core';
import { NotFoundError } from '../lib/errors';
import { getContext } from '../lib/context';
import { requireScope } from '../lib/auth';

export function registerFixCompliance(server: AiuiMcpServer) {
  server.registerTool(
    'fix_compliance_issues',
    'Auto-fix design token compliance violations in code. Replaces non-compliant values with approved design tokens.',
    {
      code: z.string().describe('The source code to fix'),
      violations: z
        .array(
          z.object({
            token: z.string().describe('The token key that should be used'),
            found: z.string().describe('The non-compliant value found in code'),
            expected: z.string().describe('The expected compliant value'),
            line: z.number().optional().describe('Line number where violation was found'),
          })
        )
        .describe('Array of compliance violations to fix'),
      projectSlug: z.string().describe('Project slug to look up approved tokens'),
    },
    async (args) => {
      // Enforce write scope if running in authenticated context
      const ctx = getContext();
      if (ctx) {
        requireScope(ctx.scopes, 'mcp:write');
      }

      const db = getDb();
      const code = args.code as string;
      const violations = args.violations as Array<{
        token: string;
        found: string;
        expected: string;
        line?: number;
      }>;
      const projectSlug = args.projectSlug as string;

      // Fetch the project and its active style pack tokens
      const [project] = await db
        .select({
          id: projects.id,
          activeStylePackId: projects.activeStylePackId,
        })
        .from(projects)
        .where(eq(projects.slug, projectSlug))
        .limit(1);

      if (!project) {
        throw new NotFoundError('Project', projectSlug);
      }

      // Build a map of approved token values
      const approvedTokens = new Map<string, string>();
      if (project.activeStylePackId) {
        const tokens = await db
          .select({
            tokenKey: styleTokens.tokenKey,
            tokenValue: styleTokens.tokenValue,
          })
          .from(styleTokens)
          .where(eq(styleTokens.stylePackId, project.activeStylePackId));

        for (const t of tokens) {
          approvedTokens.set(t.tokenKey, t.tokenValue);
        }
      }

      // Apply fixes
      let fixedCode = code;
      const fixesApplied: Array<{
        token: string;
        found: string;
        replacedWith: string;
        line?: number;
      }> = [];
      const remainingIssues: Array<{
        token: string;
        found: string;
        reason: string;
      }> = [];

      for (const violation of violations) {
        // Determine the replacement value:
        // prefer the approved token value from the database, fall back to the expected value
        const approvedValue = approvedTokens.get(violation.token);
        const replacement = approvedValue || violation.expected;

        // Check if the found value actually exists in the code
        if (fixedCode.includes(violation.found)) {
          fixedCode = fixedCode.split(violation.found).join(replacement);
          fixesApplied.push({
            token: violation.token,
            found: violation.found,
            replacedWith: replacement,
            line: violation.line,
          });
        } else {
          remainingIssues.push({
            token: violation.token,
            found: violation.found,
            reason: 'Value not found in code (may have been fixed by a previous replacement)',
          });
        }
      }

      return {
        fixedCode,
        fixesApplied: fixesApplied.length,
        fixes: fixesApplied,
        remainingIssues,
      };
    }
  );
}
