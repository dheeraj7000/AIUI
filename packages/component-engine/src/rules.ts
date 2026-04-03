export interface RuleResult {
  passed: boolean;
  message?: string;
}

export interface CombinationRule {
  id: string;
  description: string;
  check: (componentTypes: string[]) => RuleResult;
}

/** At most 1 hero-type component per page. */
const maxOneHero: CombinationRule = {
  id: 'max-one-hero',
  description: 'At most one hero component allowed per page',
  check: (types) => {
    const heroCount = types.filter((t) => t === 'hero').length;
    if (heroCount > 1) {
      return {
        passed: false,
        message: `Found ${heroCount} hero components; only 1 is allowed per page`,
      };
    }
    return { passed: true };
  },
};

/** Same component type should not appear more than once. */
const noDuplicateSections: CombinationRule = {
  id: 'no-duplicate-sections',
  description: 'Same component ID cannot appear twice',
  check: (types) => {
    // This rule operates on IDs, not types — but we receive types here
    // The caller passes component IDs to check for duplicates
    const seen = new Set<string>();
    for (const t of types) {
      if (seen.has(t)) {
        return {
          passed: false,
          message: `Duplicate component: "${t}" appears more than once`,
        };
      }
      seen.add(t);
    }
    return { passed: true };
  },
};

/** If more than 3 sections selected, a footer should be included. */
const requireFooter: CombinationRule = {
  id: 'require-footer',
  description: 'Pages with more than 3 sections should include a footer',
  check: (types) => {
    if (types.length > 3 && !types.includes('footer')) {
      return {
        passed: false,
        message: 'More than 3 sections selected but no footer component included',
      };
    }
    return { passed: true };
  },
};

export const DEFAULT_RULES: CombinationRule[] = [maxOneHero, noDuplicateSections, requireFooter];

/**
 * Run combination rules against a list of component types/IDs.
 */
export function runRules(
  componentTypesOrIds: string[],
  rules: CombinationRule[] = DEFAULT_RULES
): { passed: boolean; results: Array<{ ruleId: string; result: RuleResult }> } {
  const results = rules.map((rule) => ({
    ruleId: rule.id,
    result: rule.check(componentTypesOrIds),
  }));

  return {
    passed: results.every((r) => r.result.passed),
    results,
  };
}
