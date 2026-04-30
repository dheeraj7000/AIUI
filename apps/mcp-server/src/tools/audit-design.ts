import { z } from 'zod';
import type { AiuiMcpServer } from '../server';
import { runDesignAudit, runAllAccessibilityChecks } from './detectors';

export function registerAuditDesignPrinciples(server: AiuiMcpServer) {
  server.registerTool(
    'audit_design_principles',
    'Heuristic audit of a UI snippet for design quality and accessibility. ' +
      'Complements `validate_ui_output` (which is token-focused): this one catches typographic hierarchy issues, excessive color/font variation, missing alt/aria attributes, and contrast problems. ' +
      'Use BEFORE returning a finished UI to the user, especially for marketing pages, dashboards, or anything with rich visual hierarchy.',
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
