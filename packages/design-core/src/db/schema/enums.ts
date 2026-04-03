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
]);
