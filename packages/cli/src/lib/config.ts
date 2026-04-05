import * as fs from 'node:fs';
import * as path from 'node:path';
import { z } from 'zod';

const AIUI_DIR = '.aiui';
const CONFIG_FILE = 'config.json';

export const configSchema = z.object({
  projectSlug: z.string(),
  framework: z.string(),
  registryUrl: z.string(),
  activePack: z.string(),
  lastSynced: z.string().optional(),
  registries: z.record(z.string(), z.string()).optional(),
});

export type AiuiConfig = z.infer<typeof configSchema>;

/**
 * Ensure the .aiui/ directory exists.
 */
export function ensureAiuiDir(cwd: string = process.cwd()): string {
  const dir = path.join(cwd, AIUI_DIR);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/**
 * Read and validate .aiui/config.json. Returns null if not found.
 */
export function readConfig(cwd: string = process.cwd()): AiuiConfig | null {
  const configPath = path.join(cwd, AIUI_DIR, CONFIG_FILE);
  if (!fs.existsSync(configPath)) return null;

  const raw = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const parsed = configSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Invalid .aiui/config.json: ${parsed.error.message}`);
  }
  return parsed.data;
}

/**
 * Write .aiui/config.json.
 */
export function writeConfig(config: AiuiConfig, cwd: string = process.cwd()): void {
  const dir = ensureAiuiDir(cwd);
  const configPath = path.join(dir, CONFIG_FILE);
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
}
