export interface ResourceTag {
  id: string;
  tagId: string;
  resourceId: string;
  resourceType: 'style_pack' | 'component_recipe' | 'asset';
}
