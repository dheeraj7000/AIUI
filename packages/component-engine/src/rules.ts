export interface RuleResult {
  passed: boolean;
  message?: string;
}

export interface CombinationRule {
  id: string;
  description: string;
  severity: 'error' | 'warning';
  check: (
    types: string[],
    ids: string[],
    recipes?: unknown[]
  ) => { pass: boolean; message: string };
}

// ---------------------------------------------------------------------------
// Existing rules (converted to new CombinationRule interface)
// ---------------------------------------------------------------------------

/** At most 1 hero-type component per page. */
const maxOneHero: CombinationRule = {
  id: 'max-one-hero',
  description: 'At most one hero component allowed per page',
  severity: 'error',
  check: (types) => {
    const heroCount = types.filter((t) => t === 'hero').length;
    if (heroCount > 1) {
      return {
        pass: false,
        message: `Found ${heroCount} hero components; only 1 is allowed per page`,
      };
    }
    return { pass: true, message: '' };
  },
};

/** Same component type should not appear more than once. */
const noDuplicateSections: CombinationRule = {
  id: 'no-duplicate-sections',
  description: 'Same component ID cannot appear twice',
  severity: 'error',
  check: (_types, ids) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) {
        return {
          pass: false,
          message: `Duplicate component: "${id}" appears more than once`,
        };
      }
      seen.add(id);
    }
    return { pass: true, message: '' };
  },
};

/** If more than 3 sections selected, a footer should be included. */
const requireFooter: CombinationRule = {
  id: 'require-footer',
  description: 'Pages with more than 3 sections should include a footer',
  severity: 'warning',
  check: (types) => {
    if (types.length > 3 && !types.includes('footer')) {
      return {
        pass: false,
        message: 'More than 3 sections selected but no footer component included',
      };
    }
    return { pass: true, message: '' };
  },
};

// ---------------------------------------------------------------------------
// New rules
// ---------------------------------------------------------------------------

/** Multi-page templates should include a navigation component. */
const requireNavForMultiPage: CombinationRule = {
  id: 'require-nav-for-multi-page',
  description: 'Page templates should include a navigation component',
  severity: 'warning',
  check: (types) => {
    if (types.includes('page-template') && !types.includes('navigation')) {
      return {
        pass: false,
        message: 'Page template detected but no navigation component included',
      };
    }
    return { pass: true, message: '' };
  },
};

/** Modal or dialog components need a trigger (button or CTA). */
const modalNeedsTrigger: CombinationRule = {
  id: 'modal-needs-trigger',
  description: 'Modal or dialog components need a button or CTA trigger',
  severity: 'warning',
  check: (types) => {
    const hasModal = types.includes('modal') || types.includes('dialog');
    const hasTrigger = types.includes('button') || types.includes('cta');
    if (hasModal && !hasTrigger) {
      return {
        pass: false,
        message: 'Modal/dialog component found but no button or CTA to trigger it',
      };
    }
    return { pass: true, message: '' };
  },
};

/** Contact forms need at least one input-type component. */
const formNeedsInputs: CombinationRule = {
  id: 'form-needs-inputs',
  description: 'Contact forms need at least one input-type component',
  severity: 'warning',
  check: (types) => {
    const inputTypes = ['input', 'textarea', 'select', 'checkbox', 'radio'];
    if (types.includes('contact') && !types.some((t) => inputTypes.includes(t))) {
      return {
        pass: false,
        message:
          'Contact component found but no input-type component (input, textarea, select, checkbox, radio)',
      };
    }
    return { pass: true, message: '' };
  },
};

/** Sidebar components should include navigation or menu. */
const sidebarNeedsNav: CombinationRule = {
  id: 'sidebar-needs-nav',
  description: 'Sidebar should include navigation or menu component',
  severity: 'warning',
  check: (types) => {
    if (types.includes('sidebar') && !types.includes('navigation') && !types.includes('menu')) {
      return {
        pass: false,
        message: 'Sidebar component found but no navigation or menu component included',
      };
    }
    return { pass: true, message: '' };
  },
};

/** Table components should be accompanied by data components. */
const tableNeedsData: CombinationRule = {
  id: 'table-needs-data',
  description: 'Table components should be accompanied by data-related components',
  severity: 'warning',
  check: (types) => {
    const dataTypes = ['pagination', 'filter', 'search', 'sort', 'data-source'];
    if (types.includes('table') && !types.some((t) => dataTypes.includes(t))) {
      return {
        pass: false,
        message:
          'Table component found without accompanying data components (pagination, filter, search, sort, data-source)',
      };
    }
    return { pass: true, message: '' };
  },
};

/** At most 2 modal/dialog components per page. */
const maxModals: CombinationRule = {
  id: 'max-modals',
  description: 'At most 2 modal or dialog components per page',
  severity: 'error',
  check: (types) => {
    const modalCount = types.filter((t) => t === 'modal' || t === 'dialog').length;
    if (modalCount > 2) {
      return {
        pass: false,
        message: `Found ${modalCount} modal/dialog components; at most 2 are allowed per page`,
      };
    }
    return { pass: true, message: '' };
  },
};

/** Alerts should appear before hero/main content sections. */
const alertsAboveContent: CombinationRule = {
  id: 'alerts-above-content',
  description: 'Alert components should appear before hero sections',
  severity: 'warning',
  check: (types) => {
    const heroIndex = types.indexOf('hero');
    const alertIndex = types.indexOf('alert');
    if (alertIndex !== -1 && heroIndex !== -1 && alertIndex > heroIndex) {
      return {
        pass: false,
        message: 'Alert component appears after hero; alerts typically belong above main content',
      };
    }
    return { pass: true, message: '' };
  },
};

// ---------------------------------------------------------------------------
// Default rules registry
// ---------------------------------------------------------------------------

export const DEFAULT_RULES: CombinationRule[] = [
  maxOneHero,
  noDuplicateSections,
  requireFooter,
  requireNavForMultiPage,
  modalNeedsTrigger,
  formNeedsInputs,
  sidebarNeedsNav,
  tableNeedsData,
  maxModals,
  alertsAboveContent,
];

// ---------------------------------------------------------------------------
// Rule runner
// ---------------------------------------------------------------------------

/**
 * Normalize a rule check result to the internal RuleResult shape.
 * Supports both { pass, message } (new) and { passed, message } (legacy).
 */
function toRuleResult(raw: { pass?: boolean; passed?: boolean; message?: string }): RuleResult {
  if ('pass' in raw) {
    return { passed: !!raw.pass, message: raw.message || undefined };
  }
  // Legacy shape — { passed, message }
  return { passed: !!raw.passed, message: raw.message };
}

/**
 * Run combination rules against component types, IDs, and optional recipes.
 *
 * Overloads preserve backward compatibility:
 *   runRules(typesOrIds: string[])
 *   runRules(typesOrIds: string[], legacyRules: CombinationRule[])
 *   runRules(types: string[], ids: string[], recipes?: unknown[], customRules?: CombinationRule[])
 */
export function runRules(
  types: string[],
  idsOrRules?: string[] | CombinationRule[],
  recipes?: unknown[],
  customRules?: CombinationRule[]
): { passed: boolean; results: Array<{ ruleId: string; result: RuleResult }> } {
  let ids: string[];
  let rules: CombinationRule[];
  let resolvedRecipes: unknown[] | undefined;

  // Detect legacy call pattern: second arg is CombinationRule[] or omitted
  if (
    idsOrRules === undefined ||
    (Array.isArray(idsOrRules) &&
      idsOrRules.length > 0 &&
      typeof idsOrRules[0] === 'object' &&
      idsOrRules[0] !== null &&
      'id' in idsOrRules[0] &&
      'check' in idsOrRules[0])
  ) {
    // Legacy: runRules(typesOrIds) or runRules(typesOrIds, rules)
    ids = types;
    rules = (idsOrRules as CombinationRule[] | undefined) ?? DEFAULT_RULES;
    resolvedRecipes = undefined;
  } else if (
    Array.isArray(idsOrRules) &&
    (idsOrRules.length === 0 || typeof idsOrRules[0] === 'string')
  ) {
    // New: runRules(types, ids, recipes?, customRules?)
    ids = idsOrRules as string[];
    rules = customRules ?? DEFAULT_RULES;
    resolvedRecipes = recipes;
  } else {
    // Fallback — treat as legacy with no rules
    ids = types;
    rules = DEFAULT_RULES;
    resolvedRecipes = undefined;
  }

  const results = rules.map((rule) => ({
    ruleId: rule.id,
    result: toRuleResult(rule.check(types, ids, resolvedRecipes)),
  }));

  return {
    passed: results.every((r) => r.result.passed),
    results,
  };
}
