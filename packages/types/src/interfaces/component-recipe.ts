export interface ComponentRecipe {
  id: string;
  name: string;
  slug: string;
  type:
    | 'hero'
    | 'pricing'
    | 'faq'
    | 'footer'
    | 'header'
    | 'cta'
    | 'testimonial'
    | 'feature'
    | 'contact'
    | 'card'
    | 'navigation';
  stylePackId?: string;
  previewUrl?: string;
  codeTemplate: string;
  jsonSchema: Record<string, unknown>;
  aiUsageRules?: string;
  createdAt: Date;
  updatedAt: Date;
}
