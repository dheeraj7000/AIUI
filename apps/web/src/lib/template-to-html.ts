/**
 * Transforms JSX/HTML code templates into renderable HTML for iframe previews.
 *
 * Handles three template formats:
 * 1. Plain HTML (class="...") — pass through directly
 * 2. JSX (className="...") — transform to HTML
 * 3. TypeScript/React components (interface, import) — extract JSX body and transform
 *
 * Returns null if the template cannot be safely transformed (e.g., has imports or hooks).
 */

// ---------------------------------------------------------------------------
// Classification
// ---------------------------------------------------------------------------

export function canRenderLive(codeTemplate: string): boolean {
  const code = codeTemplate.trim();

  // Has import statements → needs bundler
  if (/^import\s/m.test(code)) return false;

  // Has "use client" directive → likely uses hooks
  if (code.startsWith('"use client"') || code.startsWith("'use client'")) return false;

  // Uses React hooks directly
  if (/\buse(State|Effect|Ref|Callback|Memo|Id|Context)\b/.test(code)) return false;

  // Uses motion/framer imports
  if (/\bmotion\b/.test(code) && /\banimate\b/.test(code)) return false;

  return true;
}

// ---------------------------------------------------------------------------
// Sample value generation from JSON schema
// ---------------------------------------------------------------------------

function sampleValue(propName: string, schema: Record<string, unknown>): string {
  const type = schema.type as string | undefined;
  const enumValues = schema.enum as string[] | undefined;
  const defaultVal = schema.default;

  if (defaultVal !== undefined) return String(defaultVal);
  if (enumValues && enumValues.length > 0) return enumValues[0];

  // Generate sensible defaults by prop name
  const nameLower = propName.toLowerCase();
  if (nameLower.includes('title') || nameLower.includes('headline'))
    return 'Welcome to Our Platform';
  if (nameLower.includes('subtitle') || nameLower.includes('subheadline'))
    return 'Build something amazing with our tools';
  if (nameLower.includes('description') || nameLower.includes('desc'))
    return 'A brief description of this amazing feature that helps users understand the value.';
  if (
    nameLower.includes('ctatext') ||
    nameLower.includes('buttontext') ||
    nameLower.includes('button')
  )
    return 'Get Started';
  if (nameLower.includes('link') || nameLower.includes('href') || nameLower.includes('url'))
    return '#';
  if (nameLower.includes('name')) return 'Jane Doe';
  if (nameLower.includes('email')) return 'hello@example.com';
  if (nameLower.includes('price')) return '$29';
  if (nameLower.includes('label')) return 'Label';
  if (nameLower.includes('image') || nameLower.includes('src') || nameLower.includes('avatar'))
    return 'https://placehold.co/400x300/e2e8f0/64748b?text=Preview';
  if (nameLower.includes('alt')) return 'Preview image';
  if (nameLower.includes('icon')) return '★';
  if (nameLower.includes('quote') || nameLower.includes('testimonial'))
    return '"This product transformed how we work. Highly recommended!"';
  if (nameLower.includes('role') || nameLower.includes('position')) return 'Product Manager';
  if (nameLower.includes('company')) return 'Acme Inc.';
  if (nameLower.includes('rating')) return '5';
  if (nameLower.includes('count') || nameLower.includes('number')) return '42';
  if (nameLower.includes('children')) return 'Click me';

  // By type
  if (type === 'string') return 'Sample text';
  if (type === 'number') return '42';
  if (type === 'boolean') return 'true';
  if (type === 'array') return '';

  return 'Sample';
}

function generateSampleValues(jsonSchema: unknown): Record<string, string> {
  const samples: Record<string, string> = {};
  if (!jsonSchema || typeof jsonSchema !== 'object') return samples;

  const schema = jsonSchema as Record<string, unknown>;
  const properties = schema.properties as Record<string, Record<string, unknown>> | undefined;
  if (!properties) return samples;

  for (const [key, propSchema] of Object.entries(properties)) {
    samples[key] = sampleValue(key, propSchema);
  }

  return samples;
}

// ---------------------------------------------------------------------------
// JSX to HTML transformation
// ---------------------------------------------------------------------------

function jsxToHtml(jsx: string): string {
  let html = jsx;

  // Handle className={`template literal`} → class="static content"
  // Extracts the static string parts, strips ${...} interpolations
  html = html.replace(/className=\{`([^`]*)`\}/g, (_match, content) => {
    const staticContent = content
      .replace(/\$\{[^}]*\}/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    return `className="${staticContent}"`;
  });

  // Handle className={cn(...)} or className={someVar} → extract string literals
  html = html.replace(/className=\{([^}]+)\}/g, (_match, expr) => {
    // Extract string literals from the expression
    const strings = expr.match(/["']([^"']+)["']/g);
    if (strings) {
      const classes = strings.map((s: string) => s.replace(/["']/g, '')).join(' ');
      return `className="${classes}"`;
    }
    // If no string literals found, remove the attribute
    return '';
  });

  // Replace className with class
  html = html.replace(/\bclassName=/g, 'class=');

  // Replace JSX self-closing tags: <Component /> → <div></div> (for unknown components)
  // But keep HTML self-closing tags like <img />, <br />, <hr />, <input />
  const htmlSelfClosing = new Set([
    'img',
    'br',
    'hr',
    'input',
    'meta',
    'link',
    'source',
    'area',
    'base',
    'col',
    'embed',
    'wbr',
  ]);
  html = html.replace(/<(\w+)(\s[^>]*)?\s*\/>/g, (match, tag, attrs) => {
    if (htmlSelfClosing.has(tag.toLowerCase())) return match;
    return `<${tag}${attrs || ''}></${tag}>`;
  });

  // Replace JSX expressions {expr} with empty string (if not already replaced by sample values)
  // But preserve style={{ }} objects by converting them
  html = html.replace(/style=\{\{([^}]*)\}\}/g, (_match, styles) => {
    // Convert camelCase CSS to kebab-case
    const cssProps = styles
      .split(',')
      .map((s: string) => {
        const [key, ...valueParts] = s.split(':');
        if (!key || valueParts.length === 0) return '';
        const cssKey = key
          .trim()
          .replace(/([A-Z])/g, '-$1')
          .toLowerCase();
        const cssValue = valueParts.join(':').trim().replace(/['"]/g, '');
        return `${cssKey}: ${cssValue}`;
      })
      .filter(Boolean)
      .join('; ');
    return `style="${cssProps}"`;
  });

  // Remove remaining JSX expression fragments like onClick={() => ...} or onSubmit={...}
  html = html.replace(/\bon\w+\s*=\s*\{[^}]*\}/g, '');

  // Remove {...props} spread
  html = html.replace(/\{\.\.\.[\w]+\}/g, '');

  // Remove JSX conditional rendering: {condition && <el>...</el>}
  // Keep the HTML part, discard the condition
  html = html.replace(/\{\w+\s*&&\s*(<[^}]+>)\}/g, '$1');

  // Remove ternary expressions: {condition ? <a> : <b>} → keep the first branch
  html = html.replace(/\{[^?]+\?\s*(<[^:]+>)\s*:\s*[^}]+\}/g, '$1');

  // Replace {children} with empty string
  html = html.replace(/\{children\}/g, '');

  // Replace {variable} template expressions with visible sample text
  html = html.replace(/\{(\w+(?:\.\w+)*)\}/g, '<span>$1</span>');

  // Remove remaining complex JSX expressions (map, ternary, etc.)
  html = html.replace(/\{[^}]{20,}\}/g, '');

  // Remove TypeScript type annotations from tag attributes
  html = html.replace(/\bas\s+\w+/g, '');

  // Clean up empty attributes (class= without value)
  html = html.replace(/\bclass=\s+/g, '');

  return html;
}

function extractJsxBody(code: string): string {
  // Strip TypeScript interfaces
  let cleaned = code.replace(/interface\s+\w+\s*(\{[^}]*\}|extends\s+[^{]*\{[^}]*\})/gs, '');

  // Strip type declarations
  cleaned = cleaned.replace(/type\s+\w+\s*=\s*[^;]+;/g, '');

  // Strip export function/const wrapper — extract the return JSX
  const returnMatch = cleaned.match(/return\s*\(\s*([\s\S]*)\s*\);?\s*\}$/m);
  if (returnMatch) {
    return returnMatch[1].trim();
  }

  // If no return statement, try to find the JSX directly (single expression component)
  const jsxMatch = cleaned.match(/<[a-zA-Z][\s\S]*>/);
  if (jsxMatch) {
    return jsxMatch[0].trim();
  }

  return cleaned.trim();
}

// ---------------------------------------------------------------------------
// Main: generate full HTML document for iframe srcdoc
// ---------------------------------------------------------------------------

export interface PreviewOptions {
  codeTemplate: string;
  jsonSchema?: unknown;
  tokens?: Array<{ tokenKey: string; tokenType: string; tokenValue: string }>;
  darkBackground?: boolean;
}

export function generatePreviewHtml(options: PreviewOptions): string | null {
  const { codeTemplate, jsonSchema, tokens = [], darkBackground = false } = options;

  if (!canRenderLive(codeTemplate)) return null;

  // Generate sample values from schema
  const samples = generateSampleValues(jsonSchema);

  // Extract JSX body and strip wrappers
  let body = extractJsxBody(codeTemplate);

  // Replace template variables with sample values
  for (const [key, value] of Object.entries(samples)) {
    body = body.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }

  // Transform JSX → HTML
  body = jsxToHtml(body);

  // Build CSS custom properties from tokens
  const tokenCss = tokens
    .map((t) => {
      const key = t.tokenKey.replace(/\./g, '-');
      return `--${key}: ${t.tokenValue};`;
    })
    .join('\n    ');

  // Build font-face imports for font tokens
  const fontTokens = tokens.filter((t) => t.tokenType === 'font');
  const googleFonts = fontTokens
    .map((t) => t.tokenValue.split(',')[0].trim().replace(/['"]/g, ''))
    .filter(
      (f) => f && !f.includes('system-ui') && !f.includes('sans-serif') && !f.includes('monospace')
    )
    .map((f) => f.replace(/\s+/g, '+'));
  const fontLink =
    googleFonts.length > 0
      ? `<link href="https://fonts.googleapis.com/css2?${googleFonts.map((f) => `family=${f}:wght@400;500;600;700`).join('&')}&display=swap" rel="stylesheet">`
      : '';

  const bgClass = darkBackground ? 'bg-gray-950' : 'bg-white';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://cdn.tailwindcss.com"></script>
  ${fontLink}
  <style>
    :root {
      ${tokenCss}
    }
    body {
      margin: 0;
      padding: 16px;
      font-family: ${fontTokens[0]?.tokenValue ?? "'Inter', system-ui, sans-serif"};
      overflow: hidden;
    }
    /* Scale content to fit preview frame */
    .preview-wrapper {
      transform-origin: top left;
    }
  </style>
</head>
<body class="${bgClass}">
  <div class="preview-wrapper">
    ${body}
  </div>
</body>
</html>`;
}
