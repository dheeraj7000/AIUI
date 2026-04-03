import { NextRequest, NextResponse } from 'next/server';
import { parseFigmaUrl, extractFigmaTokens } from '@aiui/design-core';

/**
 * POST /api/imports/figma/preview — Preview tokens from a Figma file without
 * persisting anything to the database.
 */
export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    const { fileUrl, accessToken } = body as {
      fileUrl: string;
      accessToken: string;
    };

    if (!fileUrl || !accessToken) {
      return NextResponse.json({ error: 'fileUrl and accessToken are required' }, { status: 400 });
    }

    const fileKey = parseFigmaUrl(fileUrl);
    if (!fileKey) {
      return NextResponse.json(
        { error: 'Invalid Figma URL. Expected format: https://www.figma.com/file/<key>/...' },
        { status: 400 }
      );
    }

    const result = await extractFigmaTokens(fileKey, accessToken);

    return NextResponse.json({
      fileName: result.fileName,
      tokens: result.tokens,
      stats: result.stats,
      warnings: result.warnings,
    });
  } catch (error) {
    console.error('Failed to preview Figma tokens:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
