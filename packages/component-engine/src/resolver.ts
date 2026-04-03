import type { TokenMap } from '@aiui/prompt-compiler';
import { runRules, DEFAULT_RULES, type CombinationRule } from './rules';

const TOKEN_REF_PREFIX = '$token:';

export interface ComponentRecipe {
  id: string;
  name: string;
  type: string;
  compatiblePacks: string[] | '*';
  requiredTokens?: string[];
  slots?: Record<string, string>;
}

export interface ComponentSelection {
  componentId: string;
  slotOverrides?: Record<string, string>;
}

export interface ResolvedComponent {
  componentId: string;
  name: string;
  type: string;
  compatible: boolean;
  slots: Record<string, string>;
  issues: string[];
}

export interface ResolutionResult {
  components: ResolvedComponent[];
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Check if a component recipe is compatible with a given style pack.
 */
function isCompatible(recipe: ComponentRecipe, stylePackId: string): boolean {
  if (recipe.compatiblePacks === '*') return true;
  return recipe.compatiblePacks.includes(stylePackId);
}

/**
 * Resolve slot values from tokens, applying overrides.
 */
function resolveSlots(
  recipe: ComponentRecipe,
  tokens: TokenMap,
  slotOverrides?: Record<string, string>
): { slots: Record<string, string>; warnings: string[] } {
  const slots: Record<string, string> = {};
  const warnings: string[] = [];

  if (!recipe.slots) return { slots, warnings };

  for (const [slotName, slotDefault] of Object.entries(recipe.slots)) {
    // Check for override first
    if (slotOverrides && slotName in slotOverrides) {
      slots[slotName] = slotOverrides[slotName];
      continue;
    }

    // Resolve $token: references
    if (typeof slotDefault === 'string' && slotDefault.startsWith(TOKEN_REF_PREFIX)) {
      const tokenPath = slotDefault.slice(TOKEN_REF_PREFIX.length);
      const tokenValue = tokens[tokenPath];
      if (tokenValue !== undefined) {
        slots[slotName] = String(tokenValue);
      } else {
        warnings.push(
          `Slot "${slotName}" on "${recipe.name}" references missing token "${tokenPath}"; using hardcoded default`
        );
        slots[slotName] = slotDefault;
      }
    } else {
      slots[slotName] = slotDefault;
    }
  }

  return { slots, warnings };
}

/**
 * Resolve selected components against a style pack and token map.
 *
 * Checks compatibility, resolves slot defaults from tokens,
 * and enforces combination rules.
 */
export function resolveComponents(
  selections: ComponentSelection[],
  recipes: ComponentRecipe[],
  stylePackId: string,
  tokens: TokenMap,
  rules: CombinationRule[] = DEFAULT_RULES
): ResolutionResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const components: ResolvedComponent[] = [];

  const recipeMap = new Map(recipes.map((r) => [r.id, r]));

  for (const selection of selections) {
    const recipe = recipeMap.get(selection.componentId);

    if (!recipe) {
      errors.push(`Component "${selection.componentId}" not found in recipe registry`);
      components.push({
        componentId: selection.componentId,
        name: 'Unknown',
        type: 'unknown',
        compatible: false,
        slots: {},
        issues: [`Component "${selection.componentId}" not found`],
      });
      continue;
    }

    const issues: string[] = [];
    const compatible = isCompatible(recipe, stylePackId);

    if (!compatible) {
      const packList =
        recipe.compatiblePacks === '*' ? 'all' : (recipe.compatiblePacks as string[]).join(', ');
      issues.push(
        `"${recipe.name}" is incompatible with style pack "${stylePackId}". Compatible packs: ${packList}`
      );
      errors.push(issues[issues.length - 1]);
    }

    // Check required tokens
    if (recipe.requiredTokens) {
      for (const tokenPath of recipe.requiredTokens) {
        if (!(tokenPath in tokens)) {
          issues.push(`Required token "${tokenPath}" missing for "${recipe.name}"`);
          warnings.push(`Required token "${tokenPath}" missing for "${recipe.name}"`);
        }
      }
    }

    // Resolve slots
    const { slots, warnings: slotWarnings } = resolveSlots(recipe, tokens, selection.slotOverrides);
    warnings.push(...slotWarnings);

    components.push({
      componentId: selection.componentId,
      name: recipe.name,
      type: recipe.type,
      compatible,
      slots,
      issues,
    });
  }

  // Run combination rules against component types
  const componentTypes = components.map((c) => c.type);
  const ruleResults = runRules(componentTypes, rules);
  if (!ruleResults.passed) {
    for (const r of ruleResults.results) {
      if (!r.result.passed && r.result.message) {
        errors.push(r.result.message);
      }
    }
  }

  // Also check for duplicate IDs
  const ids = selections.map((s) => s.componentId);
  const idResults = runRules(ids, [
    {
      id: 'no-duplicate-ids',
      description: 'No duplicate component IDs',
      check: (items) => {
        const seen = new Set<string>();
        for (const item of items) {
          if (seen.has(item)) {
            return { passed: false, message: `Duplicate component ID: "${item}"` };
          }
          seen.add(item);
        }
        return { passed: true };
      },
    },
  ]);
  if (!idResults.passed) {
    for (const r of idResults.results) {
      if (!r.result.passed && r.result.message) {
        errors.push(r.result.message);
      }
    }
  }

  return {
    components,
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
