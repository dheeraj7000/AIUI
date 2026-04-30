import { z } from 'zod';
import type { AiuiMcpServer } from '../server';
import { runDesignAudit, runAllAccessibilityChecks } from './detectors';

export function registerAuditDesignPrinciples(server: AiuiMcpServer) {
  server.registerTool(
    'audit_design_principles',
    'Perform a heuristic design and accessibility audit on a snippet of UI code. Checks for typographic hierarchy, visual noise, and common accessibility issues.',
    {
      code: z.string().describe('The UI code snippet to audit (JSX, HTML, or CSS)'),
    },
    async (args) => {
      const code = args.code as string;

      const designViolations = runDesignAudit(code);
      const accessibilityViolations = runAllAccessibilityChecks(code);

      const allViolations = [...designViolations, ...accessibilityViolations];

      if (allViolations.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: '✅ No design or accessibility issues detected in the provided code.',
            },
          ],
        };
      }

      const report = allViolations
        .map(
          (v) =>
            `- [${v.severity.toUpperCase()}] ${v.type}: ${v.message}${
              v.line ? ` (Line ${v.line})` : ''
            }`
        )
        .join('\n');

      return {
        content: [
          {
            type: 'text',
            text: `### Design & Accessibility Audit Report\n\n${report}`,
          },
        ],
      };
    }
  );
}
