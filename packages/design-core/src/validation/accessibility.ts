/**
 * Default accessibility guidelines per component type for the AIUI design system.
 *
 * Provides WCAG-aligned rules that every component should satisfy. Unknown
 * component types gracefully return an empty rule set.
 */

export interface A11yRule {
  rule: string;
  description: string;
  severity: 'error' | 'warning';
  wcagCriteria: string;
}

/**
 * Mapping of component types to their default accessibility rules.
 */
export const DEFAULT_A11Y_RULES: Record<string, A11yRule[]> = {
  button: [
    {
      rule: 'button-role',
      description: 'Must have role="button" or use a native <button> element.',
      severity: 'error',
      wcagCriteria: '4.1.2',
    },
    {
      rule: 'button-keyboard',
      description: 'Must be activatable with Enter and Space keys.',
      severity: 'error',
      wcagCriteria: '2.1.1',
    },
    {
      rule: 'button-focus-visible',
      description: 'Must display a visible focus ring when focused.',
      severity: 'error',
      wcagCriteria: '2.4.7',
    },
    {
      rule: 'button-icon-only-label',
      description: 'Icon-only buttons must provide an aria-label or aria-labelledby.',
      severity: 'error',
      wcagCriteria: '1.1.1',
    },
  ],

  input: [
    {
      rule: 'input-label',
      description: 'Must have an associated <label> element or aria-label.',
      severity: 'error',
      wcagCriteria: '1.3.1',
    },
    {
      rule: 'input-error-description',
      description: 'Must use aria-describedby to associate error messages.',
      severity: 'error',
      wcagCriteria: '3.3.2',
    },
    {
      rule: 'input-required',
      description: 'Required inputs must use aria-required="true".',
      severity: 'warning',
      wcagCriteria: '3.3.2',
    },
  ],

  modal: [
    {
      rule: 'modal-role',
      description: 'Must have role="dialog".',
      severity: 'error',
      wcagCriteria: '4.1.2',
    },
    {
      rule: 'modal-aria-modal',
      description: 'Must set aria-modal="true".',
      severity: 'error',
      wcagCriteria: '4.1.2',
    },
    {
      rule: 'modal-focus-trap',
      description: 'Must trap focus within the modal while it is open.',
      severity: 'error',
      wcagCriteria: '2.4.3',
    },
    {
      rule: 'modal-escape',
      description: 'Must close when the Escape key is pressed.',
      severity: 'error',
      wcagCriteria: '2.1.2',
    },
    {
      rule: 'modal-return-focus',
      description: 'Must return focus to the triggering element on close.',
      severity: 'error',
      wcagCriteria: '2.4.3',
    },
  ],

  dialog: [
    {
      rule: 'dialog-role',
      description: 'Must have role="dialog".',
      severity: 'error',
      wcagCriteria: '4.1.2',
    },
    {
      rule: 'dialog-aria-modal',
      description: 'Must set aria-modal="true".',
      severity: 'error',
      wcagCriteria: '4.1.2',
    },
    {
      rule: 'dialog-focus-trap',
      description: 'Must trap focus within the dialog while it is open.',
      severity: 'error',
      wcagCriteria: '2.4.3',
    },
    {
      rule: 'dialog-escape',
      description: 'Must close when the Escape key is pressed.',
      severity: 'error',
      wcagCriteria: '2.1.2',
    },
    {
      rule: 'dialog-return-focus',
      description: 'Must return focus to the triggering element on close.',
      severity: 'error',
      wcagCriteria: '2.4.3',
    },
  ],

  tooltip: [
    {
      rule: 'tooltip-role',
      description: 'Must have role="tooltip".',
      severity: 'error',
      wcagCriteria: '4.1.2',
    },
    {
      rule: 'tooltip-describedby',
      description: 'Trigger element must reference the tooltip via aria-describedby.',
      severity: 'error',
      wcagCriteria: '4.1.2',
    },
    {
      rule: 'tooltip-escape',
      description: 'Must be dismissible with the Escape key.',
      severity: 'error',
      wcagCriteria: '1.4.13',
    },
  ],

  tabs: [
    {
      rule: 'tabs-roles',
      description:
        'Must use role="tablist" on the container, role="tab" on each tab, and role="tabpanel" on each panel.',
      severity: 'error',
      wcagCriteria: '4.1.2',
    },
    {
      rule: 'tabs-arrow-keys',
      description: 'Arrow keys must move focus between tabs.',
      severity: 'error',
      wcagCriteria: '4.1.2',
    },
    {
      rule: 'tabs-aria-selected',
      description: 'The active tab must have aria-selected="true".',
      severity: 'error',
      wcagCriteria: '4.1.2',
    },
  ],

  alert: [
    {
      rule: 'alert-role',
      description: 'Must have role="alert" or use aria-live="assertive".',
      severity: 'error',
      wcagCriteria: '4.1.3',
    },
  ],

  navigation: [
    {
      rule: 'navigation-landmark',
      description: 'Must use a <nav> element or role="navigation".',
      severity: 'error',
      wcagCriteria: '1.3.1',
    },
    {
      rule: 'navigation-label',
      description: 'Must provide an aria-label when multiple nav landmarks exist.',
      severity: 'warning',
      wcagCriteria: '1.3.1',
    },
  ],

  table: [
    {
      rule: 'table-caption',
      description: 'Must include a <caption> or aria-label describing the table.',
      severity: 'error',
      wcagCriteria: '1.3.1',
    },
    {
      rule: 'table-th-scope',
      description: 'Header cells (<th>) must use the scope attribute.',
      severity: 'error',
      wcagCriteria: '1.3.1',
    },
    {
      rule: 'table-headers',
      description: 'Complex tables must associate data cells with row and column headers.',
      severity: 'warning',
      wcagCriteria: '1.3.1',
    },
  ],

  loader: [
    {
      rule: 'loader-aria-busy',
      description: 'The loading region must set aria-busy="true" while loading.',
      severity: 'error',
      wcagCriteria: '4.1.3',
    },
    {
      rule: 'loader-live-region',
      description: 'Must use aria-live="polite" to announce loading state changes.',
      severity: 'warning',
      wcagCriteria: '4.1.3',
    },
  ],

  skeleton: [
    {
      rule: 'skeleton-aria-busy',
      description: 'The skeleton region must set aria-busy="true" while loading.',
      severity: 'error',
      wcagCriteria: '4.1.3',
    },
    {
      rule: 'skeleton-live-region',
      description: 'Must use aria-live="polite" to announce when content has loaded.',
      severity: 'warning',
      wcagCriteria: '4.1.3',
    },
  ],

  dropdown: [
    {
      rule: 'dropdown-expanded',
      description: 'Trigger must use aria-expanded to indicate open/closed state.',
      severity: 'error',
      wcagCriteria: '4.1.2',
    },
    {
      rule: 'dropdown-haspopup',
      description: 'Trigger must set aria-haspopup="listbox" or appropriate value.',
      severity: 'error',
      wcagCriteria: '4.1.2',
    },
    {
      rule: 'dropdown-keyboard',
      description: 'Must support arrow key navigation through options.',
      severity: 'error',
      wcagCriteria: '2.1.1',
    },
  ],

  select: [
    {
      rule: 'select-expanded',
      description: 'Trigger must use aria-expanded to indicate open/closed state.',
      severity: 'error',
      wcagCriteria: '4.1.2',
    },
    {
      rule: 'select-haspopup',
      description: 'Trigger must set aria-haspopup="listbox" or appropriate value.',
      severity: 'error',
      wcagCriteria: '4.1.2',
    },
    {
      rule: 'select-keyboard',
      description: 'Must support arrow key navigation through options.',
      severity: 'error',
      wcagCriteria: '2.1.1',
    },
  ],

  checkbox: [
    {
      rule: 'checkbox-checked-state',
      description: 'Must expose checked state via native checkbox or aria-checked.',
      severity: 'error',
      wcagCriteria: '4.1.2',
    },
    {
      rule: 'checkbox-group',
      description: 'Related checkboxes must be grouped with <fieldset> and <legend>.',
      severity: 'warning',
      wcagCriteria: '1.3.1',
    },
  ],

  radio: [
    {
      rule: 'radio-checked-state',
      description: 'Must expose checked state via native radio or aria-checked.',
      severity: 'error',
      wcagCriteria: '4.1.2',
    },
    {
      rule: 'radio-group',
      description: 'Radio buttons must be grouped with <fieldset> and <legend>.',
      severity: 'error',
      wcagCriteria: '1.3.1',
    },
  ],

  switch: [
    {
      rule: 'switch-role',
      description: 'Must have role="switch".',
      severity: 'error',
      wcagCriteria: '4.1.2',
    },
    {
      rule: 'switch-aria-checked',
      description: 'Must use aria-checked to indicate on/off state.',
      severity: 'error',
      wcagCriteria: '4.1.2',
    },
  ],

  toggle: [
    {
      rule: 'toggle-role',
      description: 'Must have role="switch".',
      severity: 'error',
      wcagCriteria: '4.1.2',
    },
    {
      rule: 'toggle-aria-checked',
      description: 'Must use aria-checked to indicate on/off state.',
      severity: 'error',
      wcagCriteria: '4.1.2',
    },
  ],

  progress: [
    {
      rule: 'progress-role',
      description: 'Must have role="progressbar".',
      severity: 'error',
      wcagCriteria: '4.1.2',
    },
    {
      rule: 'progress-values',
      description: 'Must set aria-valuenow, aria-valuemin, and aria-valuemax.',
      severity: 'error',
      wcagCriteria: '4.1.2',
    },
  ],

  toast: [
    {
      rule: 'toast-live-region',
      description: 'Must use aria-live="polite" so screen readers announce it.',
      severity: 'error',
      wcagCriteria: '4.1.3',
    },
    {
      rule: 'toast-auto-dismiss-timeout',
      description:
        'Non-critical toasts that auto-dismiss must remain visible for at least 5 seconds.',
      severity: 'warning',
      wcagCriteria: '2.2.1',
    },
  ],

  breadcrumb: [
    {
      rule: 'breadcrumb-nav',
      description: 'Must be wrapped in a <nav> element with aria-label="Breadcrumb".',
      severity: 'error',
      wcagCriteria: '1.3.1',
    },
  ],

  menu: [
    {
      rule: 'menu-roles',
      description: 'Must use role="menu" on the container and role="menuitem" on each item.',
      severity: 'error',
      wcagCriteria: '4.1.2',
    },
    {
      rule: 'menu-keyboard',
      description: 'Must support keyboard navigation through menu items.',
      severity: 'error',
      wcagCriteria: '4.1.2',
    },
  ],

  avatar: [
    {
      rule: 'avatar-alt-text',
      description: 'Image avatars must provide meaningful alt text.',
      severity: 'error',
      wcagCriteria: '1.1.1',
    },
  ],

  badge: [
    {
      rule: 'badge-text-alternative',
      description:
        'If the badge relies on color alone to convey meaning, a text alternative must be provided.',
      severity: 'error',
      wcagCriteria: '1.4.1',
    },
  ],

  divider: [
    {
      rule: 'divider-role',
      description: 'Semantic dividers must use role="separator".',
      severity: 'warning',
      wcagCriteria: '1.3.1',
    },
  ],

  stepper: [
    {
      rule: 'stepper-current',
      description: 'The active step must be marked with aria-current="step".',
      severity: 'error',
      wcagCriteria: '4.1.2',
    },
    {
      rule: 'stepper-label',
      description: 'Each step must have an accessible aria-label.',
      severity: 'error',
      wcagCriteria: '4.1.2',
    },
  ],

  popover: [
    {
      rule: 'popover-expanded',
      description: 'Trigger must use aria-expanded to indicate open/closed state.',
      severity: 'error',
      wcagCriteria: '4.1.2',
    },
    {
      rule: 'popover-escape',
      description: 'Must close when the Escape key is pressed.',
      severity: 'error',
      wcagCriteria: '4.1.2',
    },
  ],

  textarea: [
    {
      rule: 'textarea-label',
      description: 'Must have an associated <label> element or aria-label.',
      severity: 'error',
      wcagCriteria: '1.3.1',
    },
    {
      rule: 'textarea-error-description',
      description: 'Must use aria-describedby to associate error messages.',
      severity: 'error',
      wcagCriteria: '3.3.2',
    },
    {
      rule: 'textarea-required',
      description: 'Required textareas must use aria-required="true".',
      severity: 'warning',
      wcagCriteria: '3.3.2',
    },
  ],

  toolbar: [
    {
      rule: 'toolbar-role',
      description: 'Must have role="toolbar".',
      severity: 'error',
      wcagCriteria: '4.1.2',
    },
    {
      rule: 'toolbar-keyboard',
      description: 'Must support arrow key navigation between toolbar items.',
      severity: 'error',
      wcagCriteria: '4.1.2',
    },
  ],
};

/**
 * Returns the default accessibility rules for the given component type.
 * Unknown component types return an empty array.
 */
export function getDefaultA11yRules(componentType: string): A11yRule[] {
  return DEFAULT_A11Y_RULES[componentType] ?? [];
}
