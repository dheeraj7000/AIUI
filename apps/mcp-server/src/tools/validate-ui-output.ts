import { z } from 'zod';
import { eq } from 'drizzle-orm';
import type { AiuiMcpServer } from '../server';
import { getDb } from '../lib/db';
import { projects, styleTokens } from '@aiui/design-core';
import { NotFoundError } from '../lib/errors';

interface Violation {
  type: 'color' | 'font' | 'component' | 'general';
  severity: 'error' | 'warning';
  message: string;
  line?: number;
}

/**
 * Extract color hex values from code string.
 */
function extractColors(code: string): string[] {
  const matches = code.match(/#[0-9a-fA-F]{3,8}\b/g);
  return matches ? [...new Set(matches)] : [];
}

/**
 * Extract font family references from code.
 */
function extractFonts(code: string): string[] {
  const matches = code.match(/font-(?:family|sans|serif|mono)[\s:]*["']?([^"';,}]+)/g);
  return matches ? [...new Set(matches)] : [];
}

export function registerValidateUiOutput(server: AiuiMcpServer) {
  server.registerTool(
    'validate_ui_output',
    'Check generated UI code for compliance against the project design profile. Validates colors, fonts, and component usage.',
    {
      projectId: z.string().uuid().describe('The project ID to validate against'),
      code: z.string().describe('The generated UI code to validate'),
    },
    async (args) => {
      const db = getDb();
      const projectId = args.projectId as string;
      const code = args.code as string;

      const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);

      if (!project || !project.activeStylePackId) {
        throw new NotFoundError('Project', projectId);
      }

      // Fetch approved tokens
      const tokens = await db
        .select({
          tokenKey: styleTokens.tokenKey,
          tokenValue: styleTokens.tokenValue,
          tokenType: styleTokens.tokenType,
        })
        .from(styleTokens)
        .where(eq(styleTokens.stylePackId, project.activeStylePackId));

      const approvedColors = new Set(
        tokens.filter((t) => t.tokenType === 'color').map((t) => t.tokenValue.toLowerCase())
      );

      const approvedFonts = new Set(
        tokens.filter((t) => t.tokenType === 'font').map((t) => t.tokenValue.toLowerCase())
      );

      const violations: Violation[] = [];

      // Check colors
      const usedColors = extractColors(code);
      for (const color of usedColors) {
        if (!approvedColors.has(color.toLowerCase())) {
          violations.push({
            type: 'color',
            severity: 'warning',
            message: `Color "${color}" is not in the approved token set`,
          });
        }
      }

      // Check fonts
      const usedFonts = extractFonts(code);
      for (const font of usedFonts) {
        const fontName = font.replace(/font-(?:family|sans|serif|mono)[\s:]*["']?/, '').trim();
        if (fontName && !approvedFonts.has(fontName.toLowerCase())) {
          violations.push({
            type: 'font',
            severity: 'warning',
            message: `Font reference "${fontName}" is not in the approved token set`,
          });
        }
      }

      const errorCount = violations.filter((v) => v.severity === 'error').length;
      const warningCount = violations.filter((v) => v.severity === 'warning').length;

      return {
        compliant: violations.length === 0,
        score: Math.max(0, 100 - errorCount * 20 - warningCount * 5),
        violations,
        summary: {
          errors: errorCount,
          warnings: warningCount,
          checkedColors: usedColors.length,
          checkedFonts: usedFonts.length,
        },
      };
    }
  );
}
