'use client';

import { useMemo } from 'react';
import { generatePreviewHtml, canRenderLive } from '@/lib/template-to-html';
import { ComponentMockup } from './ComponentMockup';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Token {
  tokenKey: string;
  tokenType: string;
  tokenValue: string;
}

interface ComponentPreviewProps {
  /** Raw code template from the recipe */
  codeTemplate: string;
  /** Component type (hero, pricing, card, etc.) */
  type: string;
  /** Component name */
  name: string;
  /** JSON schema for generating sample prop values */
  jsonSchema?: unknown;
  /** Style pack tokens for theming */
  tokens?: Token[];
  /** Primary color for fallback mockup */
  primaryColor?: string;
  /** Height of the preview frame */
  height?: number;
  /** Show as a large preview (detail page) */
  large?: boolean;
  /** Additional className */
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders a live iframe preview if the template is compatible,
 * otherwise falls back to the static ComponentMockup.
 */
export function ComponentPreview({
  codeTemplate,
  type,
  name,
  jsonSchema,
  tokens = [],
  primaryColor,
  height = 200,
  large = false,
  className = '',
}: ComponentPreviewProps) {
  const isLive = useMemo(() => canRenderLive(codeTemplate), [codeTemplate]);

  const previewHtml = useMemo(() => {
    if (!isLive) return null;
    return generatePreviewHtml({
      codeTemplate,
      jsonSchema,
      tokens,
    });
  }, [isLive, codeTemplate, jsonSchema, tokens]);

  if (previewHtml) {
    return (
      <div
        className={`relative overflow-hidden rounded-lg border border-gray-200 bg-white ${className}`}
      >
        {/* Live badge */}
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          Live
        </div>
        <iframe
          srcDoc={previewHtml}
          sandbox="allow-scripts"
          title={`Preview: ${name}`}
          className="w-full border-0"
          style={{ height: large ? 400 : height, pointerEvents: large ? 'auto' : 'none' }}
          loading="lazy"
        />
      </div>
    );
  }

  // Fallback: static mockup
  const colors = primaryColor ? { primary: primaryColor } : undefined;

  return <ComponentMockup type={type} name={name} colors={colors} large={large} />;
}

// ---------------------------------------------------------------------------
// Grid preview (smaller, for list pages)
// ---------------------------------------------------------------------------

export function ComponentPreviewCard({
  codeTemplate,
  type,
  name,
  jsonSchema,
  tokens = [],
  primaryColor,
}: Omit<ComponentPreviewProps, 'height' | 'large' | 'className'>) {
  return (
    <ComponentPreview
      codeTemplate={codeTemplate}
      type={type}
      name={name}
      jsonSchema={jsonSchema}
      tokens={tokens}
      primaryColor={primaryColor}
      height={160}
      large={false}
      className="hover-lift"
    />
  );
}
