import { z } from 'zod';
import type { AiuiMcpServer } from '../server';
import { runDesignAudit, runAllAccessibilityChecks } from './detectors';

export function registerAuditDesignPrinciples(server: AiuiMcpServer) {
  server.registerTool(
    'audit_design_principles',
    'Generic, project-agnostic heuristic audit for design quality + accessibility. Catches typographic hierarchy issues, excessive color/font variation, missing alt/aria attributes, contrast problems. ' +
      "For PROJECT-AWARE evaluation tied to the user's actual tokens, prefer the dedicated evaluators: `evaluate_typography`, `evaluate_color_palette`, `evaluate_visual_density`. This generic audit is best for snippets where you don't have a projectId yet (e.g. early-discovery designs, AI-generated drafts before init).",
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
