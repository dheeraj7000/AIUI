import { z } from 'zod';
import { eq } from 'drizzle-orm';
import type { AiuiMcpServer } from '../server';
import { getDb } from '../lib/db';
import { assets } from '@aiui/design-core';

export function registerAssetManifest(server: AiuiMcpServer) {
  server.registerTool(
    'get_asset_manifest',
    'Return a categorized list of project assets with CloudFront public URLs and metadata.',
    {
      projectId: z.string().uuid().describe('The project ID'),
    },
    async (args) => {
      const db = getDb();
      const projectId = args.projectId as string;

      const projectAssets = await db
        .select({
          id: assets.id,
          name: assets.name,
          type: assets.type,
          fileName: assets.fileName,
          mimeType: assets.mimeType,
          publicUrl: assets.publicUrl,
          sizeBytes: assets.sizeBytes,
          metadataJson: assets.metadataJson,
        })
        .from(assets)
        .where(eq(assets.projectId, projectId));

      // Group by type
      const grouped: Record<string, typeof projectAssets> = {};
      for (const asset of projectAssets) {
        if (!grouped[asset.type]) grouped[asset.type] = [];
        grouped[asset.type].push(asset);
      }

      return {
        projectId,
        total: projectAssets.length,
        byType: grouped,
      };
    }
  );
}
