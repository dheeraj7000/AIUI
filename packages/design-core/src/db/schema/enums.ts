import { pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['owner', 'admin', 'member']);

export const orgPlanEnum = pgEnum('org_plan', ['free', 'pro', 'enterprise']);

export const tokenCategoryEnum = pgEnum('token_category', [
  'color',
  'radius',
  'font',
  'spacing',
  'shadow',
  'elevation',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'breakpoint',
  'z-index',
  'opacity',
  'border-width',
  'animation',
  'transition',
]);

export const assetTypeEnum = pgEnum('asset_type', [
  'logo',
  'font',
  'icon',
  'illustration',
  'screenshot',
  'brand-media',
]);

export const resourceTypeEnum = pgEnum('resource_type', [
  'style_pack',
  'component_recipe',
  'asset',
]);

export const frameworkTargetEnum = pgEnum('framework_target', [
  'nextjs-tailwind',
  'react-tailwind',
]);

export const componentTypeEnum = pgEnum('component_type', [
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
]);
