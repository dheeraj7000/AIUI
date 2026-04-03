export interface DesignProfile {
  id: string;
  projectId: string;
  name: string;
  version: string;
  stylePackId?: string;
  overridesJson?: Record<string, unknown>;
  selectedComponents: string[];
  compiledJson?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
