import { z } from 'zod';

const variantDimensionSchema = z.object({
  values: z.array(z.string().min(1)),
  default: z.string(),
});

const variantsSchemaObj = z.record(z.string(), variantDimensionSchema);

const statesSchemaObj = z.object({
  states: z.array(z.string()),
  tokenMappings: z.record(z.string(), z.record(z.string(), z.string())).optional(),
});

const compositionRefSchema = z.object({
  role: z.string().min(1),
  componentType: z.string().min(1),
  required: z.boolean(),
  maxCount: z.number().int().positive().nullable(),
});

const accessibilityGuidelinesSchema = z.object({
  ariaRoles: z.array(z.string()).optional(),
  keyboardNav: z.array(z.string()).optional(),
  focusManagement: z.string().optional(),
  screenReader: z.string().optional(),
  contrastNotes: z.string().optional(),
});

const contentGuidelinesSchema = z.object({
  tone: z.string().optional(),
  capitalization: z.string().optional(),
  maxLength: z.number().optional(),
});

const guidelinesSchema = z.object({
  whenToUse: z.array(z.string()).optional(),
  whenNotToUse: z.array(z.string()).optional(),
  doPatterns: z.array(z.string()).optional(),
  dontPatterns: z.array(z.string()).optional(),
  accessibility: accessibilityGuidelinesSchema.optional(),
  contentGuidelines: contentGuidelinesSchema.optional(),
});

export const componentRecipeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  type: z.enum([
    // Existing section-level types
    'hero',
    'pricing',
    'faq',
    'footer',
    'header',
    'cta',
    'testimonial',
    'feature',
    'contact',
    'card',
    'navigation',
    // Atomic components (Layer 2)
    'button',
    'input',
    'badge',
    'avatar',
    'tooltip',
    'modal',
    'dropdown',
    'tabs',
    'loader',
    'toggle',
    'checkbox',
    'radio',
    'select',
    'textarea',
    'switch',
    'tag',
    'alert',
    'divider',
    'skeleton',
    'progress',
    // Organism & template types (Layer 4)
    'table',
    'sidebar',
    'layout',
    'page-template',
    'breadcrumb',
    'stepper',
    'toolbar',
    'accordion',
    'dialog',
    'popover',
    'menu',
    'toast',
  ]),
  stylePackId: z.string().uuid().optional(),
  previewUrl: z.string().url().optional(),
  codeTemplate: z.string().min(1),
  jsonSchema: z.record(z.string(), z.unknown()),
  aiUsageRules: z.string().optional(),
  variantsSchema: variantsSchemaObj.nullable().optional(),
  statesSchema: statesSchemaObj.nullable().optional(),
  composedOf: z.array(compositionRefSchema).nullable().optional(),
  tier: z.enum(['atom', 'molecule', 'organism', 'template']).nullable().optional(),
  guidelinesJson: guidelinesSchema.nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const createComponentRecipeSchema = componentRecipeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ComponentRecipeSchema = z.infer<typeof componentRecipeSchema>;
export type CreateComponentRecipeSchema = z.infer<typeof createComponentRecipeSchema>;
export type VariantsSchema = z.infer<typeof variantsSchemaObj>;
export type StatesSchema = z.infer<typeof statesSchemaObj>;
export type CompositionRef = z.infer<typeof compositionRefSchema>;
export type GuidelinesSchema = z.infer<typeof guidelinesSchema>;
