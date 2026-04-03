import { NextRequest, NextResponse } from 'next/server';
import { parseTokens } from '@aiui/design-core';

/**
 * POST /api/imports/tokens/preview — Parse tokens from CSS, Tokens Studio, or
 * Tailwind content without persisting anything to the database.
 */
export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    const { content, format } = body as {
      content: string;
      format?: 'css' | 'tokens-studio' | 'tailwind' | 'auto';
    };

    if (!content) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }

    const result = parseTokens(content, format);

    return NextResponse.json({
      tokens: result.tokens,
      stats: result.stats,
      warnings: result.warnings,
      detectedFormat: result.detectedFormat,
    });
  } catch (error) {
    console.error('Failed to preview tokens:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
