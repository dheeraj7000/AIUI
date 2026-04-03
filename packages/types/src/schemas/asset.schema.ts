import { z } from 'zod';

export const assetSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  organizationId: z.string().uuid().optional(),
  type: z.enum(['logo', 'font', 'icon', 'illustration', 'screenshot', 'brand-media']),
  name: z.string().min(1),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  storageKey: z.string().min(1),
  publicUrl: z.string().url().optional(),
  sizeBytes: z.number().int().nonnegative(),
  metadataJson: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const createAssetSchema = assetSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type AssetSchema = z.infer<typeof assetSchema>;
export type CreateAssetSchema = z.infer<typeof createAssetSchema>;
