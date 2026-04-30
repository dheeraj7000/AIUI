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

      const [project] = await db
        .select({
          id: projects.id,
          organizationId: projects.organizationId,
        })
        .from(projects)
        .where(eq(projects.slug, projectSlug))
        .limit(1);

      if (!project) {
        throw new NotFoundError('Project', projectSlug);
      }

      if (ctx?.organizationId && project.organizationId !== ctx.organizationId) {
        throw new NotFoundError('Project', projectSlug);
      }

      // Build a map of approved token values from the project's tokens
      const approvedTokens = new Map<string, string>();
      const tokens = await db
        .select({
          tokenKey: styleTokens.tokenKey,
          tokenValue: styleTokens.tokenValue,
        })
        .from(styleTokens)
        .where(eq(styleTokens.projectId, project.id));

      for (const t of tokens) {
        approvedTokens.set(t.tokenKey, t.tokenValue);
      }

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
        const approvedValue = approvedTokens.get(violation.token);
        const replacement = approvedValue || violation.expected;

        const tokenBaseName = violation.token.split('.').pop() || violation.token;
        const tailwindPrefixes = ['bg', 'text', 'border', 'ring', 'from', 'to', 'via', 'shadow'];

        let replaced = false;

        for (const prefix of tailwindPrefixes) {
          const arbPattern = `${prefix}-[${violation.found}]`;
          const semanticClass = `${prefix}-${tokenBaseName}`;
          if (fixedCode.includes(arbPattern)) {
            fixedCode = fixedCode.split(arbPattern).join(semanticClass);
            fixesApplied.push({
              token: violation.token,
              found: arbPattern,
              replacedWith: semanticClass,
              line: violation.line,
            });
            replaced = true;
          }
        }

        if (!replaced && fixedCode.includes(violation.found)) {
          fixedCode = fixedCode.split(violation.found).join(replacement);
          fixesApplied.push({
            token: violation.token,
            found: violation.found,
            replacedWith: replacement,
            line: violation.line,
          });
          replaced = true;
        }

        if (!replaced) {
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
