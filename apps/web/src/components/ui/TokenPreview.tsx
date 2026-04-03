/**
 * Visual preview components for design tokens.
 *
 * Server-compatible — no client hooks. All dynamic values applied via inline styles
 * so Tailwind does not need to know them at build time.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TokenPreviewProps {
  tokenKey: string;
  tokenType: string;
  tokenValue: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse a CSS length (px / rem) to a rough pixel number. Returns null on failure. */
function parseLengthToPx(value: string): number | null {
  const trimmed = value.trim();
  const pxMatch = trimmed.match(/^([\d.]+)\s*px$/i);
  if (pxMatch) return parseFloat(pxMatch[1]);
  const remMatch = trimmed.match(/^([\d.]+)\s*rem$/i);
  if (remMatch) return parseFloat(remMatch[1]) * 16;
  return null;
}

/** Clamp a number between min and max. */
function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** Best-effort readable label derived from a tokenKey like "spacing.md". */
function shortLabel(tokenKey: string): string {
  const parts = tokenKey.split('.');
  return parts[parts.length - 1] ?? tokenKey;
}

// ---------------------------------------------------------------------------
// Per-type previews
// ---------------------------------------------------------------------------

function ColorPreview({ tokenKey, tokenValue }: TokenPreviewProps) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="h-16 w-16 shrink-0 rounded-lg border border-gray-200"
        style={{ backgroundColor: tokenValue }}
        title={tokenValue}
      />
      <span className="max-w-[72px] truncate text-[11px] font-medium text-gray-700">
        {shortLabel(tokenKey)}
      </span>
      <span className="max-w-[72px] truncate text-[10px] text-gray-400">{tokenValue}</span>
    </div>
  );
}

function FontPreview({ tokenKey, tokenValue }: TokenPreviewProps) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="flex h-16 w-20 items-center justify-center rounded-lg border border-gray-200 bg-white"
        style={{ fontFamily: tokenValue }}
      >
        <span className="text-2xl font-semibold text-gray-800">Aa</span>
      </div>
      <span className="max-w-[80px] truncate text-[11px] font-medium text-gray-700">
        {shortLabel(tokenKey)}
      </span>
      <span className="max-w-[80px] truncate text-[10px] text-gray-400">{tokenValue}</span>
    </div>
  );
}

function RadiusPreview({ tokenKey, tokenValue }: TokenPreviewProps) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="h-12 w-12 shrink-0 border-2 border-gray-300 bg-white"
        style={{ borderRadius: tokenValue }}
        title={tokenValue}
      />
      <span className="max-w-[56px] truncate text-[11px] font-medium text-gray-700">
        {shortLabel(tokenKey)}
      </span>
      <span className="text-[10px] text-gray-400">{tokenValue}</span>
    </div>
  );
}

function ShadowPreview({ tokenKey, tokenValue }: TokenPreviewProps) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="h-12 w-16 shrink-0 rounded-lg bg-white"
        style={{ boxShadow: tokenValue }}
        title={tokenValue}
      />
      <span className="max-w-[72px] truncate text-[11px] font-medium text-gray-700">
        {shortLabel(tokenKey)}
      </span>
    </div>
  );
}

function ElevationPreview({ tokenKey, tokenValue }: TokenPreviewProps) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="h-12 w-16 shrink-0 rounded-lg"
        style={{
          boxShadow: tokenValue,
          background: 'linear-gradient(to bottom, #ffffff, #f8f9fb)',
        }}
        title={tokenValue}
      />
      <span className="max-w-[72px] truncate text-[11px] font-medium text-gray-700">
        {shortLabel(tokenKey)}
      </span>
    </div>
  );
}

function SpacingPreview({ tokenKey, tokenValue }: TokenPreviewProps) {
  const px = parseLengthToPx(tokenValue);
  const barWidth = px !== null ? clamp(px, 4, 200) : 24;

  return (
    <div className="flex items-center gap-3">
      <div
        className="h-4 shrink-0 rounded-sm bg-blue-400"
        style={{ width: `${barWidth}px` }}
        title={tokenValue}
      />
      <span className="text-[11px] font-medium text-gray-700">{shortLabel(tokenKey)}</span>
      <span className="text-[10px] text-gray-400">{tokenValue}</span>
    </div>
  );
}

function FallbackPreview({ tokenKey, tokenValue }: TokenPreviewProps) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-gray-100 px-3 py-2">
      <div className="min-w-0">
        <div className="truncate text-xs font-medium text-gray-700">{tokenKey}</div>
        <div className="truncate text-xs text-gray-400">{tokenValue}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main TokenPreview
// ---------------------------------------------------------------------------

const previewMap: Record<string, (props: TokenPreviewProps) => React.JSX.Element> = {
  color: ColorPreview,
  font: FontPreview,
  radius: RadiusPreview,
  shadow: ShadowPreview,
  elevation: ElevationPreview,
  spacing: SpacingPreview,
};

export function TokenPreview(props: TokenPreviewProps) {
  const Renderer = previewMap[props.tokenType] ?? FallbackPreview;
  return <Renderer {...props} />;
}

// ---------------------------------------------------------------------------
// TokenStrip — compact preview for pack list cards
// ---------------------------------------------------------------------------

export interface TokenStripProps {
  tokens: Array<{ tokenKey: string; tokenType: string; tokenValue: string }>;
}

export function TokenStrip({ tokens }: TokenStripProps) {
  // Pick representative tokens for the strip
  const colors = tokens.filter((t) => t.tokenType === 'color').slice(0, 6);
  const fonts = tokens.filter((t) => t.tokenType === 'font').slice(0, 1);
  const radii = tokens.filter((t) => t.tokenType === 'radius').slice(0, 1);

  const hasContent = colors.length > 0 || fonts.length > 0 || radii.length > 0;

  if (!hasContent) {
    return (
      <div className="flex h-14 items-center justify-center rounded-t-xl bg-gray-50">
        <span className="text-xs text-gray-400">No preview available</span>
      </div>
    );
  }

  return (
    <div className="flex h-14 items-center gap-3 overflow-hidden rounded-t-xl bg-gray-50/80 px-4">
      {/* Color circles */}
      {colors.length > 0 && (
        <div className="flex items-center -space-x-1">
          {colors.map((c) => (
            <div
              key={c.tokenKey}
              className="h-7 w-7 shrink-0 rounded-full border-2 border-white"
              style={{ backgroundColor: c.tokenValue }}
              title={`${c.tokenKey}: ${c.tokenValue}`}
            />
          ))}
        </div>
      )}

      {/* Separator */}
      {colors.length > 0 && (fonts.length > 0 || radii.length > 0) && (
        <div className="h-6 w-px shrink-0 bg-gray-200" />
      )}

      {/* Font sample */}
      {fonts.map((f) => (
        <div
          key={f.tokenKey}
          className="shrink-0 text-lg font-semibold text-gray-700"
          style={{ fontFamily: f.tokenValue }}
          title={`${f.tokenKey}: ${f.tokenValue}`}
        >
          Aa
        </div>
      ))}

      {/* Radius sample */}
      {radii.map((r) => (
        <div
          key={r.tokenKey}
          className="h-7 w-7 shrink-0 border-2 border-gray-300 bg-white"
          style={{ borderRadius: r.tokenValue }}
          title={`${r.tokenKey}: ${r.tokenValue}`}
        />
      ))}
    </div>
  );
}
