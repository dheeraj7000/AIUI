// Resolver
export { resolveComponents } from './resolver';
export type {
  ComponentRecipe,
  ComponentSelection,
  ResolvedComponent,
  ResolutionResult,
  VariantDimension,
  StateDef,
  CompositionRef,
  CompositionInfo,
} from './resolver';

// Validation
export { detectMismatches } from './validation/mismatch';
export type { MismatchViolation, MismatchResult } from './validation/mismatch';

// Rules
export { runRules, DEFAULT_RULES } from './rules';
export type { CombinationRule, RuleResult } from './rules';
