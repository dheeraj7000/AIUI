import { z } from 'zod';
import type { AiuiMcpServer } from '../server';

export function registerSuggestPromotion(server: AiuiMcpServer) {
  server.registerTool(
    'suggest_pattern_promotion',
    'Surface a recurring hardcoded value as a candidate for promotion to a project token. ' +
      "Call this when you've used the same hex / spacing / radius value 3+ times across components — it produces a human-readable suggestion the user can confirm. " +
      '**After the user agrees, call `promote_pattern` to actually create the token.** ' +
      "This tool is the 'propose'; `promote_pattern` is the 'commit'.",
    {
      patternValue: z
        .string()
        .describe('The hardcoded value or pattern (e.g. "#123456" or "bg-[20px]")'),
      usageCount: z.number().describe('How many times this pattern was found in the codebase'),
      proposedName: z
        .string()
        .describe(
          'Suggested semantic name for the new token or recipe (e.g. "brand-accent" or "dashboard-card")'
        ),
      reason: z
        .string()
        .describe(
          'Why this pattern should be promoted (e.g. "Used in 5 different dashboard components")'
        ),
    },
    async (args) => {
      // In a real implementation, this would save to the project's "Suggested Promotions" table
      // For now, we return a confirmation and instructions for the user.

      return {
        content: [
          {
            type: 'text',
            text:
              `### 🚀 Pattern Promotion Suggestion\n\n` +
              `The AI agent has identified an emerging pattern that should be promoted to the design system:\n\n` +
              `- **Pattern:** \`${args.patternValue}\`\n` +
              `- **Suggested Name:** \`${args.proposedName}\`\n` +
              `- **Usage Count:** ${args.usageCount} times\n` +
              `- **Reason:** ${args.reason}\n\n` +
              `To approve this, go to the **AIUI Studio** and click "Promote to Token".`,
          },
        ],
      };
    }
  );
}
