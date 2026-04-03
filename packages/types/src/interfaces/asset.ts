export interface Asset {
  id: string;
  projectId: string;
  organizationId?: string;
  type: 'logo' | 'font' | 'icon' | 'illustration' | 'screenshot' | 'brand-media';
  name: string;
  fileName: string;
  mimeType: string;
  storageKey: string;
  publicUrl?: string;
  sizeBytes: number;
  metadataJson?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
