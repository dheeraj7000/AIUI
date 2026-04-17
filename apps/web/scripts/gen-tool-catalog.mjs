#!/usr/bin/env node
// Generate a static MCP tool catalog JSON from the canonical tool
// registrations in apps/mcp-server/src/tools/*.ts. This keeps the dashboard
// fallback (and any offline doc surface) from drifting when tools are added,
// removed, or renamed.
//
// We deliberately parse source rather than importing the TS module so this
// script stays lightweight at Next build time and does not pull in
// drizzle/express/etc. Tool registrations follow a strict shape
// (`server.registerTool('name', 'description', ...)`) that makes a regex
// extraction reliable. A smoke test in apps/mcp-server asserts the shape
// stays parseable.

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const WEB_ROOT = resolve(__dirname, '..');
const TOOLS_DIR = resolve(WEB_ROOT, '../mcp-server/src/tools');
const OUT_PATH = resolve(WEB_ROOT, 'src/generated/mcp-tool-catalog.json');

// Tool names that mutate state. Must match http-server.ts WRITE_TOOLS.
const WRITE_TOOLS = new Set([
  'init_project',
  'create_style_pack',
  'apply_style_pack',
  'update_tokens',
  'fix_compliance_issues',
  'reset_project_to_starter',
  'undo_last_token_change',
]);

// Match server.registerTool('name', 'description' | "description" | `description`, ...)
// Captures name (group 1) and description string literal body (group 2).
// Descriptions can be string-concatenated across multiple lines, which we
// handle by a post-step that walks forward from the first literal.
const REGISTER_RE =
  /server\.registerTool\s*\(\s*['"]([a-z_][a-z0-9_]*)['"]\s*,\s*/g;

function parseStringLiteralAt(src, idx) {
  // Consume one or more adjacent string literals joined by `+` (whitespace
  // and comments between is allowed). Returns { value, endIdx } or null.
  let pos = idx;
  let combined = '';
  let sawLiteral = false;
  while (pos < src.length) {
    // Skip whitespace and /* */ comments
    while (pos < src.length) {
      const ch = src[pos];
      if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
        pos++;
        continue;
      }
      if (ch === '/' && src[pos + 1] === '/') {
        while (pos < src.length && src[pos] !== '\n') pos++;
        continue;
      }
      if (ch === '/' && src[pos + 1] === '*') {
        pos += 2;
        while (pos < src.length && !(src[pos] === '*' && src[pos + 1] === '/')) pos++;
        pos += 2;
        continue;
      }
      break;
    }
    const quote = src[pos];
    if (quote !== "'" && quote !== '"' && quote !== '`') break;
    pos++;
    let value = '';
    while (pos < src.length && src[pos] !== quote) {
      if (src[pos] === '\\' && pos + 1 < src.length) {
        const next = src[pos + 1];
        if (next === 'n') value += '\n';
        else if (next === 't') value += '\t';
        else if (next === 'r') value += '\r';
        else value += next;
        pos += 2;
      } else {
        value += src[pos];
        pos++;
      }
    }
    pos++; // closing quote
    combined += value;
    sawLiteral = true;
    // Look ahead for `+` continuation
    let lookahead = pos;
    while (lookahead < src.length) {
      const ch = src[lookahead];
      if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
        lookahead++;
        continue;
      }
      break;
    }
    if (src[lookahead] === '+') {
      pos = lookahead + 1;
      continue;
    }
    break;
  }
  return sawLiteral ? { value: combined, endIdx: pos } : null;
}

const files = readdirSync(TOOLS_DIR)
  .filter((f) => f.endsWith('.ts') && f !== 'index.ts')
  .map((f) => resolve(TOOLS_DIR, f));

const tools = [];
for (const file of files) {
  const src = readFileSync(file, 'utf8');
  REGISTER_RE.lastIndex = 0;
  let match;
  while ((match = REGISTER_RE.exec(src)) !== null) {
    const name = match[1];
    const afterArgs = REGISTER_RE.lastIndex;
    const parsed = parseStringLiteralAt(src, afterArgs);
    if (!parsed) {
      console.warn(`[gen-tool-catalog] Could not parse description for ${name} in ${file}`);
      continue;
    }
    tools.push({
      name,
      description: parsed.value.trim(),
      category: WRITE_TOOLS.has(name) ? 'write' : 'read',
    });
  }
}

// Sort: reads first, then writes; alphabetical within group.
tools.sort((a, b) => {
  if (a.category !== b.category) return a.category === 'read' ? -1 : 1;
  return a.name.localeCompare(b.name);
});

const catalog = {
  generatedAt: new Date().toISOString(),
  count: tools.length,
  tools,
};

mkdirSync(dirname(OUT_PATH), { recursive: true });
writeFileSync(OUT_PATH, JSON.stringify(catalog, null, 2) + '\n');
console.log(`[gen-tool-catalog] Wrote ${catalog.count} tools to apps/web/src/generated/mcp-tool-catalog.json`);
