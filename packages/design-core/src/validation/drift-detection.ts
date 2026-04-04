export interface DriftChange {
  tokenKey: string;
  tokenType?: string;
  type: 'added' | 'removed' | 'changed';
  oldValue?: string;
  newValue?: string;
}

export interface DriftResult {
  score: number;
  compliant: boolean;
  changes: DriftChange[];
  summary: {
    added: number;
    removed: number;
    changed: number;
    unchanged: number;
    total: number;
  };
}

/**
 * Compare two token maps and compute a drift score.
 * Score 100 = fully compliant (no changes), lower = more drift.
 */
export function detectDrift(
  baseline: Record<string, string>,
  current: Record<string, string>
): DriftResult {
  const changes: DriftChange[] = [];
  const baselineKeys = new Set(Object.keys(baseline));
  const currentKeys = new Set(Object.keys(current));

  let unchanged = 0;

  const extractTokenType = (key: string): string | undefined => {
    const dotIndex = key.indexOf('.');
    return dotIndex > 0 ? key.substring(0, dotIndex) : undefined;
  };

  // Check for changed and removed tokens
  for (const key of baselineKeys) {
    if (!currentKeys.has(key)) {
      changes.push({
        tokenKey: key,
        tokenType: extractTokenType(key),
        type: 'removed',
        oldValue: baseline[key],
      });
    } else if (current[key] !== baseline[key]) {
      changes.push({
        tokenKey: key,
        tokenType: extractTokenType(key),
        type: 'changed',
        oldValue: baseline[key],
        newValue: current[key],
      });
    } else {
      unchanged++;
    }
  }

  // Check for added tokens
  for (const key of currentKeys) {
    if (!baselineKeys.has(key)) {
      changes.push({
        tokenKey: key,
        tokenType: extractTokenType(key),
        type: 'added',
        newValue: current[key],
      });
    }
  }

  const total = Math.max(baselineKeys.size, currentKeys.size);
  const score = total === 0 ? 100 : Math.round((unchanged / total) * 100);

  return {
    score,
    compliant: score >= 80,
    changes,
    summary: {
      added: changes.filter((c) => c.type === 'added').length,
      removed: changes.filter((c) => c.type === 'removed').length,
      changed: changes.filter((c) => c.type === 'changed').length,
      unchanged,
      total,
    },
  };
}
