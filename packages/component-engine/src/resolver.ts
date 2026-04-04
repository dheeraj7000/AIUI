import type { TokenMap } from '@aiui/prompt-compiler';
import { runRules, DEFAULT_RULES, type CombinationRule } from './rules';

const TOKEN_REF_PREFIX = '$token:';
const MAX_COMPOSITION_DEPTH = 5;

/* ------------------------------------------------------------------ */
/*  Variant / State schema types (T08)                                */
/* ------------------------------------------------------------------ */

export interface VariantDimension {
  values: string[];
  default: string;
}

export interface StateDef {
  tokens?: Record<string, string>;
}

/* ------------------------------------------------------------------ */
/*  Composition types (T11)                                           */
/* ------------------------------------------------------------------ */

export interface CompositionRef {
  role: string;
  componentType: string;
  required: boolean;
  maxCount?: number;
}

export interface CompositionInfo {
  composedOf: CompositionRef[];
  resolvedChildren: Array<{ role: string; componentId: string }>;
}

/* ------------------------------------------------------------------ */
/*  Core interfaces                                                   */
/* ------------------------------------------------------------------ */

export interface ComponentRecipe {
  id: string;
  name: string;
  type: string;
  compatiblePacks: string[] | '*';
  requiredTokens?: string[];
  slots?: Record<string, string>;
  variantsSchema?: Record<string, VariantDimension>;
  statesSchema?: Record<string, StateDef>;
  composedOf?: CompositionRef[];
}

export interface ComponentSelection {
  componentId: string;
  slotOverrides?: Record<string, string>;
  variants?: Record<string, string>;
}

export interface ResolvedComponent {
  componentId: string;
  name: string;
  type: string;
  compatible: boolean;
  slots: Record<string, string>;
  issues: string[];
  resolvedVariants?: Record<string, string>;
  resolvedStates?: Record<string, Record<string, string>>;
  composition?: CompositionInfo;
}

export interface ResolutionResult {
  components: ResolvedComponent[];
  valid: boolean;
  errors: string[];
  warnings: string[];
  compositionWarnings: string[];
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

/* ------------------------------------------------------------------ */
/*  Variant resolution (T08)                                          */
/* ------------------------------------------------------------------ */

/**
 * Validate requested variants against the schema and apply defaults for
 * any unspecified dimensions.
 *
 * Returns the final resolved map plus any issues encountered.
 */
function resolveVariants(
  recipe: ComponentRecipe,
  requestedVariants?: Record<string, string>
): { resolved: Record<string, string>; issues: string[] } {
  const resolved: Record<string, string> = {};
  const issues: string[] = [];

  if (!recipe.variantsSchema) return { resolved, issues };

  for (const [dimension, def] of Object.entries(recipe.variantsSchema)) {
    const requested = requestedVariants?.[dimension];

    if (requested !== undefined) {
      if (def.values.includes(requested)) {
        resolved[dimension] = requested;
      } else {
        issues.push(
          `Variant "${dimension}" value "${requested}" is not valid for "${recipe.name}". ` +
            `Allowed: ${def.values.join(', ')}. Falling back to default "${def.default}".`
        );
        resolved[dimension] = def.default;
      }
    } else {
      // Apply default for unspecified dimension
      resolved[dimension] = def.default;
    }
  }

  // Warn about unknown variant dimensions the caller supplied
  if (requestedVariants) {
    for (const key of Object.keys(requestedVariants)) {
      if (!(key in recipe.variantsSchema)) {
        issues.push(`Unknown variant dimension "${key}" for "${recipe.name}"; ignoring.`);
      }
    }
  }

  return { resolved, issues };
}

/* ------------------------------------------------------------------ */
/*  State resolution (T08)                                            */
/* ------------------------------------------------------------------ */

/**
 * Resolve token mappings for every state defined in statesSchema.
 *
 * For each state, each token reference is resolved against the provided
 * TokenMap.  If a referenced token is missing, the raw reference is kept
 * and a warning is emitted.
 */
function resolveStates(
  recipe: ComponentRecipe,
  tokens: TokenMap
): { resolved: Record<string, Record<string, string>>; warnings: string[] } {
  const resolved: Record<string, Record<string, string>> = {};
  const warnings: string[] = [];

  if (!recipe.statesSchema) return { resolved, warnings };

  for (const [stateName, stateDef] of Object.entries(recipe.statesSchema)) {
    const mappings: Record<string, string> = {};

    if (stateDef.tokens) {
      for (const [prop, ref] of Object.entries(stateDef.tokens)) {
        if (typeof ref === 'string' && ref.startsWith(TOKEN_REF_PREFIX)) {
          const tokenPath = ref.slice(TOKEN_REF_PREFIX.length);
          const tokenValue = tokens[tokenPath];
          if (tokenValue !== undefined) {
            mappings[prop] = String(tokenValue);
          } else {
            warnings.push(
              `State "${stateName}" on "${recipe.name}" references missing token "${tokenPath}" for property "${prop}"`
            );
            mappings[prop] = ref;
          }
        } else {
          mappings[prop] = ref;
        }
      }
    }

    resolved[stateName] = mappings;
  }

  return { resolved, warnings };
}

/* ------------------------------------------------------------------ */
/*  Composition resolution helpers (T11)                              */
/* ------------------------------------------------------------------ */

/**
 * Detect circular composition references by walking the composedOf graph.
 * Returns true if a cycle is found within `maxDepth` levels.
 */
function hasCircularComposition(
  recipeId: string,
  recipeMap: Map<string, ComponentRecipe>,
  maxDepth: number = MAX_COMPOSITION_DEPTH
): boolean {
  const visited = new Set<string>();

  function walk(id: string, depth: number): boolean {
    if (depth > maxDepth) return true;
    if (visited.has(id)) return true;
    visited.add(id);

    const recipe = recipeMap.get(id);
    if (!recipe?.composedOf) return false;

    // Walk children by finding recipes matching each ref's componentType
    for (const ref of recipe.composedOf) {
      for (const [childId, childRecipe] of recipeMap) {
        if (childRecipe.type === ref.componentType) {
          if (walk(childId, depth + 1)) return true;
        }
      }
    }

    visited.delete(id);
    return false;
  }

  return walk(recipeId, 0);
}

/**
 * Validate composition constraints for all resolved components.
 *
 * For each component that has `composedOf`:
 * - `required: true` refs must have at least one matching componentType in the resolved set
 * - `maxCount` must not be exceeded
 * - Circular composition (depth > MAX_COMPOSITION_DEPTH) is flagged
 */
function validateComposition(
  components: ResolvedComponent[],
  recipeMap: Map<string, ComponentRecipe>
): { compositionWarnings: string[]; errors: string[] } {
  const compositionWarnings: string[] = [];
  const errors: string[] = [];

  // Build a type-count map for all resolved components
  const typeCounts = new Map<string, number>();
  const typeToIds = new Map<string, string[]>();

  for (const comp of components) {
    typeCounts.set(comp.type, (typeCounts.get(comp.type) ?? 0) + 1);
    const ids = typeToIds.get(comp.type) ?? [];
    ids.push(comp.componentId);
    typeToIds.set(comp.type, ids);
  }

  for (const comp of components) {
    const recipe = recipeMap.get(comp.componentId);
    if (!recipe?.composedOf) continue;

    // Check for circular composition
    if (hasCircularComposition(comp.componentId, recipeMap)) {
      compositionWarnings.push(
        `Component "${recipe.name}" has circular composition (depth > ${MAX_COMPOSITION_DEPTH})`
      );
    }

    const resolvedChildren: Array<{ role: string; componentId: string }> = [];

    for (const ref of recipe.composedOf) {
      const count = typeCounts.get(ref.componentType) ?? 0;

      // Required check
      if (ref.required && count === 0) {
        errors.push(
          `Component "${recipe.name}" requires a "${ref.componentType}" child (role: "${ref.role}") but none is present`
        );
      }

      // Max count check
      if (ref.maxCount !== undefined && count > ref.maxCount) {
        errors.push(
          `Component "${recipe.name}" allows at most ${ref.maxCount} "${ref.componentType}" child(ren) (role: "${ref.role}") but ${count} found`
        );
      }

      // Build resolved children list
      const matchingIds = typeToIds.get(ref.componentType) ?? [];
      for (const childId of matchingIds) {
        resolvedChildren.push({ role: ref.role, componentId: childId });
      }
    }

    // Attach composition info to the resolved component
    comp.composition = {
      composedOf: recipe.composedOf,
      resolvedChildren,
    };
  }

  return { compositionWarnings, errors };
}

/* ------------------------------------------------------------------ */
/*  Main resolver                                                     */
/* ------------------------------------------------------------------ */

/**
 * Resolve selected components against a style pack and token map.
 *
 * Checks compatibility, resolves slot defaults from tokens,
 * validates variant selections, resolves state token mappings,
 * checks composition constraints, and enforces combination rules.
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

    // --- T08: Variant resolution ---
    const { resolved: resolvedVariants, issues: variantIssues } = resolveVariants(
      recipe,
      selection.variants
    );
    issues.push(...variantIssues);
    for (const vi of variantIssues) {
      warnings.push(vi);
    }

    // --- T08: State resolution ---
    const { resolved: resolvedStates, warnings: stateWarnings } = resolveStates(recipe, tokens);
    warnings.push(...stateWarnings);

    const resolved: ResolvedComponent = {
      componentId: selection.componentId,
      name: recipe.name,
      type: recipe.type,
      compatible,
      slots,
      issues,
    };

    // Only attach variant/state fields when the recipe defines them
    if (recipe.variantsSchema) {
      resolved.resolvedVariants = resolvedVariants;
    }
    if (recipe.statesSchema) {
      resolved.resolvedStates = resolvedStates;
    }

    components.push(resolved);
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
      severity: 'error' as const,
      check: (items: string[]) => {
        const seen = new Set<string>();
        for (const item of items) {
          if (seen.has(item)) {
            return { pass: false, message: `Duplicate component ID: "${item}"` };
          }
          seen.add(item);
        }
        return { pass: true, message: '' };
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

  // --- T11: Composition validation ---
  const { compositionWarnings, errors: compositionErrors } = validateComposition(
    components,
    recipeMap
  );
  errors.push(...compositionErrors);

  return {
    components,
    valid: errors.length === 0,
    errors,
    warnings,
    compositionWarnings,
  };
}
