import { z } from 'zod';
import type { AiuiMcpServer } from '../server';
import { getDb } from '../lib/db';
import { getProjectContext } from '@aiui/design-core/src/operations/project-context';
import { NotFoundError } from '../lib/errors';

export function registerGetProjectContext(server: AiuiMcpServer) {
  server.registerTool(
    'get_project_context',
    'Fetch the complete design profile for a project by slug. Returns framework target, active style pack, components, assets, and token count.',
    { slug: z.string().describe('The project slug (URL-safe identifier)') },
    async (args) => {
      const db = getDb();
      const context = await getProjectContext(db, args.slug as string);

      if (!context) {
        throw new NotFoundError('Project', args.slug as string);
      }

      return context;
    }
  );
}
