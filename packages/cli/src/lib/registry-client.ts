import * as fs from 'node:fs';
import * as path from 'node:path';
import type { AiuiConfig } from './config.js';

export interface RegistryToken {
  key: string;
  type: string;
  value: string;
  description?: string;
}

export interface RegistryComponent {
  id: string;
  name: string;
  slug: string;
  type: string;
  description?: string;
  codeTemplate: string;
  propsSchema?: Record<string, unknown>;
  aiUsageRules?: string;
  stylePackId: string;
  dependencies?: string[];
}

export interface RegistryItem {
  name: string;
  slug: string;
  version: string;
  category: string;
  description: string;
  tokenCount: number;
  componentCount: number;
  tokens: RegistryToken[];
  componentSlugs: string[];
}

export interface RegistryIndexItem {
  name: string;
  slug: string;
  version: string;
  category: string;
  description: string;
  tokenCount: number;
  componentCount: number;
}

const DEFAULT_REGISTRY = process.env.AIUI_REGISTRY_URL ?? 'https://aiui.store';

/**
 * Resolve a pack identifier to a registry URL.
 * Supports: "saas-clean" (default registry) or "@namespace/slug" (custom registry).
 */
function resolvePackUrl(packId: string, config?: AiuiConfig | null): string {
  const registryUrl = config?.registryUrl ?? DEFAULT_REGISTRY;

  if (packId.startsWith('@')) {
    // @namespace/slug format
    const parts = packId.slice(1).split('/');
    if (parts.length !== 2) {
      throw new Error(`Invalid pack identifier: ${packId}. Expected @namespace/slug`);
    }
    const [namespace, slug] = parts;
    const customBase = config?.registries?.[namespace];
    if (customBase) {
      return `${customBase}/api/registry/pack/${slug}`;
    }
    // Fall back to default registry with namespace
    return `${registryUrl}/api/registry/pack/${slug}`;
  }

  return `${registryUrl}/api/registry/pack/${packId}`;
}

/**
 * Resolve a component identifier to a registry URL.
 */
function resolveComponentUrl(componentId: string, config?: AiuiConfig | null): string {
  const registryUrl = config?.registryUrl ?? DEFAULT_REGISTRY;
  return `${registryUrl}/api/registry/component/${componentId}`;
}

/**
 * Fetch the registry index (list of all available packs).
 */
export async function fetchRegistryIndex(registryUrl?: string): Promise<RegistryIndexItem[]> {
  const url = `${registryUrl ?? DEFAULT_REGISTRY}/api/registry/index`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch registry index: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<RegistryIndexItem[]>;
}

/**
 * Fetch a single pack from the registry.
 */
export async function fetchPack(packId: string, config?: AiuiConfig | null): Promise<RegistryItem> {
  const url = resolvePackUrl(packId, config);
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Style pack "${packId}" not found in registry`);
    }
    throw new Error(`Failed to fetch pack: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<RegistryItem>;
}

/**
 * Fetch a single component from the registry.
 */
export async function fetchComponent(
  componentId: string,
  config?: AiuiConfig | null
): Promise<RegistryComponent> {
  const url = resolveComponentUrl(componentId, config);
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Component "${componentId}" not found in registry`);
    }
    throw new Error(`Failed to fetch component: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<RegistryComponent>;
}

/**
 * Cache a fetched pack locally in .aiui/.cache/.
 */
export function cachePack(pack: RegistryItem, cwd: string = process.cwd()): void {
  const cacheDir = path.join(cwd, '.aiui', '.cache');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  fs.writeFileSync(path.join(cacheDir, `${pack.slug}.json`), JSON.stringify(pack, null, 2));
}
