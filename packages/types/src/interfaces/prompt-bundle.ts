export interface PromptBundle {
  id: string;
  designProfileId: string;
  projectId: string;
  bundleJson: Record<string, unknown>;
  version: string;
  checksum?: string;
  createdAt: Date;
}
