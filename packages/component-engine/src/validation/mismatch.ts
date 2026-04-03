export interface MismatchViolation {
  type: 'unapproved' | 'slot-violation' | 'incompatible';
  componentId: string;
  message: string;
}

export interface MismatchResult {
  valid: boolean;
  violations: MismatchViolation[];
}

/**
 * Detect component mismatches: unapproved components, slot violations, or style pack incompatibilities.
 */
export function detectMismatches(
  usedComponentIds: string[],
  approvedComponentIds: string[],
  componentMetadata?: Map<
    string,
    { compatiblePacks: string[] | '*'; slots?: Record<string, string> }
  >,
  activeStylePackId?: string
): MismatchResult {
  const violations: MismatchViolation[] = [];
  const approvedSet = new Set(approvedComponentIds);

  for (const id of usedComponentIds) {
    // Check if component is approved
    if (!approvedSet.has(id)) {
      violations.push({
        type: 'unapproved',
        componentId: id,
        message: `Component "${id}" is not in the approved component list`,
      });
      continue;
    }

    // Check style pack compatibility
    if (componentMetadata && activeStylePackId) {
      const meta = componentMetadata.get(id);
      if (meta && meta.compatiblePacks !== '*') {
        if (!meta.compatiblePacks.includes(activeStylePackId)) {
          violations.push({
            type: 'incompatible',
            componentId: id,
            message: `Component "${id}" is incompatible with style pack "${activeStylePackId}"`,
          });
        }
      }
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}
