import { z } from 'zod';
import type { AiuiMcpServer } from '../server';
import { getContext } from '../lib/context';
import { requireScope } from '../lib/auth';

export function registerUndoTokens(server: AiuiMcpServer) {
  server.registerTool(
    'undo_last_token_change',
    '(stub) Revert the most recent design token change for a project. ' +
      'Not yet implemented: per-token before/after history is not currently tracked. ' +
      'Will land when the changelog gains per-token before/after state. ' +
      'For now, use `update_tokens` to manually revert values, or `reset_project_to_starter` to wipe all tokens back to defaults.',
    {
      slug: z.string().min(1).describe('Project slug whose last token change you want to revert.'),
    },
    async () => {
      const ctx = getContext();
      if (ctx) {
        requireScope(ctx.scopes, 'mcp:write');
      }

      return {
        status: 'not_implemented',
        message:
          'Token change history is not yet tracked per-token. To revert: use `update_tokens` ' +
          'to manually set tokens to their prior values, or `reset_project_to_starter` to wipe ' +
          'back to the default token set. Full undo will land when the changelog gains per-token before/after state.',
        suggestedAlternatives: ['update_tokens', 'reset_project_to_starter'],
      };
    }
  );
}
