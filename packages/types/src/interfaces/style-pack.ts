export interface StylePack {
  id: string;
  name: string;
  slug: string;
  category: string;
  description?: string;
  version: string;
  previewUrl?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}
