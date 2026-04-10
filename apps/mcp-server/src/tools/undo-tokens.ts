import { z } from 'zod';
import type { AiuiMcpServer } from '../server';
import { getContext } from '../lib/context';
import { requireScope } from '../lib/auth';

export function registerUndoTokens(server: AiuiMcpServer) {
  server.registerTool(
    'undo_last_token_change',
    '(stub) Revert the most recent design token change for a project. ' +
      'Not yet implemented: per-token before/after history is not currently tracked. ' +
      'Returns a not_implemented status with suggested alternatives. ' +
      'Will land when the changelog gains per-token before/after state. ' +
      'For now, use `apply_style_pack` to swap packs or `update_tokens` to manually revert values.',
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
          'Token change history is not yet tracked per-token. To revert: use `apply_style_pack` ' +
          'to switch back to a previous pack, or use `update_tokens` to manually set tokens to ' +
          'their prior values. Full undo will land when the changelog gains per-token before/after state.',
        suggestedAlternatives: ['apply_style_pack', 'update_tokens'],
      };
    }
  );
}
