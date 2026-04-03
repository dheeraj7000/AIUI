/**
 * Memory differ: computes the diff between old and new design memory states,
 * enabling incremental updates instead of full regeneration.
 */

export interface MemoryDiff {
  hasChanges: boolean;
  tokensAdded: Array<{ key: string; type: string; value: string }>;
  tokensRemoved: Array<{ key: string; type: string; value: string }>;
  tokensModified: Array<{ key: string; type: string; oldValue: string; newValue: string }>;
  componentsAdded: Array<{ name: string; type: string }>;
  componentsRemoved: Array<{ name: string; type: string }>;
  summary: string;
}

/**
 * Compute the diff between old and new token maps and component lists.
 *
 * @param oldTokens - Previous token map: { "color": { "primary": "#000" }, ... }
 * @param newTokens - Current token map: { "color": { "primary": "#FFF" }, ... }
 * @param oldComponents - Previous component list
 * @param newComponents - Current component list
 * @returns A MemoryDiff describing all changes
 */
export function computeMemoryDiff(
  oldTokens: Record<string, Record<string, string>>,
  newTokens: Record<string, Record<string, string>>,
  oldComponents: Array<{ id: string; name: string }>,
  newComponents: Array<{ id: string; name: string }>
): MemoryDiff {
  const tokensAdded: MemoryDiff['tokensAdded'] = [];
  const tokensRemoved: MemoryDiff['tokensRemoved'] = [];
  const tokensModified: MemoryDiff['tokensModified'] = [];

  // Flatten token maps into key-value pairs with type info
  const oldFlat = flattenTokens(oldTokens);
  const newFlat = flattenTokens(newTokens);

  // Find removed and modified tokens
  for (const [fullKey, oldEntry] of oldFlat) {
    const newEntry = newFlat.get(fullKey);
    if (!newEntry) {
      tokensRemoved.push({ key: fullKey, type: oldEntry.type, value: oldEntry.value });
    } else if (newEntry.value !== oldEntry.value) {
      tokensModified.push({
        key: fullKey,
        type: oldEntry.type,
        oldValue: oldEntry.value,
        newValue: newEntry.value,
      });
    }
  }

  // Find added tokens
  for (const [fullKey, newEntry] of newFlat) {
    if (!oldFlat.has(fullKey)) {
      tokensAdded.push({ key: fullKey, type: newEntry.type, value: newEntry.value });
    }
  }

  // Component diffs by ID
  const oldComponentIds = new Set(oldComponents.map((c) => c.id));
  const newComponentIds = new Set(newComponents.map((c) => c.id));

  const componentsAdded: MemoryDiff['componentsAdded'] = newComponents
    .filter((c) => !oldComponentIds.has(c.id))
    .map((c) => ({ name: c.name, type: (c as { type?: string }).type ?? 'unknown' }));

  const componentsRemoved: MemoryDiff['componentsRemoved'] = oldComponents
    .filter((c) => !newComponentIds.has(c.id))
    .map((c) => ({ name: c.name, type: (c as { type?: string }).type ?? 'unknown' }));

  const hasChanges =
    tokensAdded.length > 0 ||
    tokensRemoved.length > 0 ||
    tokensModified.length > 0 ||
    componentsAdded.length > 0 ||
    componentsRemoved.length > 0;

  // Build summary string
  const parts: string[] = [];
  const tokenChangeCount = tokensAdded.length + tokensRemoved.length + tokensModified.length;
  if (tokenChangeCount > 0) {
    const tokenParts: string[] = [];
    if (tokensAdded.length > 0) tokenParts.push(`${tokensAdded.length} added`);
    if (tokensRemoved.length > 0) tokenParts.push(`${tokensRemoved.length} removed`);
    if (tokensModified.length > 0) tokenParts.push(`${tokensModified.length} modified`);
    parts.push(
      `${tokenChangeCount} token${tokenChangeCount !== 1 ? 's' : ''} changed (${tokenParts.join(', ')})`
    );
  }
  const componentChangeCount = componentsAdded.length + componentsRemoved.length;
  if (componentChangeCount > 0) {
    const compParts: string[] = [];
    if (componentsAdded.length > 0) compParts.push(`${componentsAdded.length} added`);
    if (componentsRemoved.length > 0) compParts.push(`${componentsRemoved.length} removed`);
    parts.push(
      `${componentChangeCount} component${componentChangeCount !== 1 ? 's' : ''} changed (${compParts.join(', ')})`
    );
  }

  const summary = hasChanges ? parts.join(', ') : 'No changes detected';

  return {
    hasChanges,
    tokensAdded,
    tokensRemoved,
    tokensModified,
    componentsAdded,
    componentsRemoved,
    summary,
  };
}

/**
 * Flatten a nested token map into a Map of "type.key" -> { type, value }.
 */
function flattenTokens(
  tokens: Record<string, Record<string, string>>
): Map<string, { type: string; value: string }> {
  const flat = new Map<string, { type: string; value: string }>();
  for (const [type, typeTokens] of Object.entries(tokens)) {
    for (const [key, value] of Object.entries(typeTokens)) {
      flat.set(`${type}.${key}`, { type, value });
    }
  }
  return flat;
}
