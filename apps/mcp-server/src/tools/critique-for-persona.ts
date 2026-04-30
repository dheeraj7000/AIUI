import { z } from 'zod';
import { eq } from 'drizzle-orm';
import type { AiuiMcpServer } from '../server';
import { getDb } from '../lib/db';
import { NotFoundError } from '../lib/errors';
import {
  projects,
  designProfiles,
  getPersona,
  getDefaultPersona,
  extractPersonaSignals,
  cognitiveLoadScore,
  type PersonaSignals,
} from '@aiui/design-core';
import { getContext } from '../lib/context';
import { loadProjectTokens } from './evaluators/core';

/**
 * `critique_for_persona` — the project-grounded UX critique tool.
 *
 * Difference vs impeccable's `critique` skill: that one critiques against
 * universal craft principles. This one critiques against THIS project's
 * specific audience, JTBD, emotional target, and brand personality —
 * pulled from the project's `studioDraft.shape` and tokens.
 *
 * The tool itself doesn't write the critique. It marshals all the
 * project context + extracts heuristic signals from the code, then
 * returns a `prompt` field the calling LLM uses to compose the critique
 * inline. Output is grounded; reasoning happens in the LLM.
 */
export function registerCritiqueForPersona(server: AiuiMcpServer) {
  server.registerTool(
    'critique_for_persona',
    "Project-grounded UX critique from a specific user persona's perspective. " +
      "Resolution order for the persona: (1) the `personaId` you pass — looked up in the project's stored personas table; (2) the inline `persona` override; (3) the project's default persona (the one with isDefault=true); (4) `studioDraft.shape` (legacy single-shape input). " +
      'Extracts cognitive-load + hierarchy + friction + trust signals from the code. ' +
      'Returns a `prompt` field designed for you (the LLM) to compose the critique on top of. ' +
      '**Use after generating any user-facing surface** — landing pages, onboarding, pricing, checkout — where the *experience* matters more than token compliance. Pair with `evaluate_typography` / `evaluate_color_palette` / `evaluate_visual_density` for full coverage.',
    {
      projectId: z
        .string()
        .uuid()
        .describe('The project ID — used to pull persona shape + tokens + voice/tone.'),
      code: z.string().describe('The UI code (JSX, HTML, or CSS) to critique'),
      personaId: z
        .string()
        .uuid()
        .optional()
        .describe(
          'Optional explicit persona ID. The project must own this persona. Highest-priority resolution.'
        ),
      persona: z
        .object({
          name: z.string().optional(),
          audience: z.string().optional(),
          jobToBeDone: z.string().optional(),
          emotionalState: z.string().optional(),
          emotionAfterUse: z.array(z.string()).optional(),
          brandPersonality: z.array(z.string()).optional(),
          antiReferences: z.array(z.string()).optional(),
          constraints: z.array(z.string()).optional(),
        })
        .optional()
        .describe(
          'Optional inline persona override. Lower priority than personaId, higher than the project default.'
        ),
      surface: z
        .enum(['landing', 'dashboard', 'form', 'pricing', 'settings', 'auth', 'other'])
        .optional()
        .describe(
          'Surface type. Helps weight the critique (a landing page is judged differently than a settings panel).'
        ),
    },
    async (args) => {
      const db = getDb();
      const projectId = args.projectId as string;
      const code = args.code as string;
      const personaId = args.personaId as string | undefined;
      const personaOverride = args.persona as
        | {
            name?: string;
            audience?: string;
            jobToBeDone?: string;
            emotionalState?: string;
            emotionAfterUse?: string[];
            brandPersonality?: string[];
            antiReferences?: string[];
            constraints?: string[];
          }
        | undefined;
      const surface = (args.surface as string | undefined) ?? 'other';

      const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
      if (!project) throw new NotFoundError('Project', projectId);

      const authCtx = getContext();
      if (authCtx?.organizationId && project.organizationId !== authCtx.organizationId) {
        throw new NotFoundError('Project', projectId);
      }

      const persona = await resolvePersona(db, projectId, personaId, personaOverride, project);

      const signals = extractPersonaSignals(code);
      const cognitiveLoad = cognitiveLoadScore(signals);

      const tokens = await loadProjectTokens(db, projectId);

      // Voice/tone from the project's design profile (if set)
      const [profile] = await db
        .select({ voiceToneJson: designProfiles.voiceToneJson })
        .from(designProfiles)
        .where(eq(designProfiles.projectId, projectId))
        .limit(1);
      const voiceTone = (profile?.voiceToneJson ?? null) as Record<string, unknown> | null;

      const prompt = renderCritiquePrompt({ project, persona, signals, cognitiveLoad, surface });

      return {
        score: cognitiveLoad,
        persona,
        signals,
        designContext: {
          colorTokens: (tokens['color'] ?? []).map((t) => `${t.key} = ${t.value}`),
          fontTokens: (tokens['font'] ?? []).map((t) => `${t.key} = ${t.value}`),
          fontSizeTokens: (tokens['font-size'] ?? []).map((t) => `${t.key} = ${t.value}`),
          spacingTokens: (tokens['spacing'] ?? []).map((t) => `${t.key} = ${t.value}`),
          voiceTone,
        },
        prompt,
        summary:
          `Persona: ${persona.audience ?? 'unspecified audience'}; surface: ${surface}; ` +
          `cognitive-load score: ${cognitiveLoad}/100; ${signals.interactiveElements} interactive elements; ` +
          `${signals.competingCtas} competing CTA(s); ${signals.trustElements.length} trust signal(s) detected.`,
      };
    }
  );
}

function renderCritiquePrompt(input: {
  project: { name: string; slug: string };
  persona: {
    audience: string | null;
    jobToBeDone: string | null;
    emotionalState: string | null;
    emotionAfterUse: string[] | null;
    brandPersonality: string[] | null;
    antiReferences: string[] | null;
    constraints: string[];
  };
  signals: PersonaSignals;
  cognitiveLoad: number;
  surface: string;
}): string {
  const { persona, signals, cognitiveLoad, surface } = input;
  const lines: string[] = [];

  lines.push('Write a UX critique grounded in this specific project.');
  lines.push('');
  lines.push('## Persona');
  lines.push(`- Audience: ${persona.audience ?? '(not defined — infer from surface type)'}`);
  lines.push(`- Job-to-be-done: ${persona.jobToBeDone ?? '(not defined)'}`);
  if (persona.emotionalState) lines.push(`- Emotional state on arrival: ${persona.emotionalState}`);
  if (persona.emotionAfterUse?.length)
    lines.push(
      `- Emotion the project wants them to leave with: ${persona.emotionAfterUse.join(', ')}`
    );
  if (persona.constraints?.length) lines.push(`- Constraints: ${persona.constraints.join(', ')}`);

  if (persona.brandPersonality?.length || persona.antiReferences?.length) {
    lines.push('');
    lines.push('## Brand voice');
    if (persona.brandPersonality?.length)
      lines.push(`- Personality: ${persona.brandPersonality.join(', ')}`);
    if (persona.antiReferences?.length)
      lines.push(`- Anti-references (avoid feeling like): ${persona.antiReferences.join(', ')}`);
  }

  lines.push('');
  lines.push(`## Surface: ${surface}`);
  lines.push('');
  lines.push('## Signals from the code');
  lines.push(`- Cognitive-load score: ${cognitiveLoad}/100`);
  lines.push(`- Interactive elements: ${signals.interactiveElements}`);
  lines.push(`- Decision points (selects + radio + checkbox): ${signals.decisionPoints}`);
  lines.push(
    `- Headings: ${signals.headings.length}` +
      (signals.headings.length
        ? ` — ${signals.headings.map((h) => `h${h.level}: "${h.text}"`).join(' / ')}`
        : '')
  );
  lines.push(
    `- Primary CTAs: ${signals.primaryCtas.length}` +
      (signals.primaryCtas.length ? ` — "${signals.primaryCtas.join('", "')}"` : '')
  );
  lines.push(
    `- Competing CTAs (other interactive surfaces near primaries): ${signals.competingCtas}`
  );
  lines.push(`- Form fields: ${signals.totalFormFields} (${signals.requiredFormFields} required)`);
  lines.push(`- Modals / overlays: ${signals.modalsAndOverlays}`);
  lines.push(`- Word count of body copy: ${signals.wordCount}`);
  lines.push(
    `- Tone indicators: formal ${signals.formalIndicators}, casual ${signals.casualIndicators}`
  );
  lines.push(`- Trust signals detected: ${signals.trustElements.join(', ') || 'none'}`);
  lines.push(`- Visual density: ${signals.density}`);

  lines.push('');
  lines.push('## What to write');
  lines.push('');
  lines.push(
    "Critique this UI from the persona's perspective along these axes (skip any that aren't applicable):"
  );
  lines.push('1. **Cognitive load** — would the persona orient quickly, or feel overwhelmed?');
  lines.push(
    "2. **Hierarchy** — does the persona's primary action jump out, or get lost among siblings?"
  );
  lines.push(
    '3. **Emotional resonance** — does the tone (formality + warmth + density) match what the persona arrives needing?'
  );
  lines.push(
    '4. **Friction** — what specifically would slow this persona down? (form length, decisions, gates)'
  );
  lines.push(
    "5. **Trust** — does the persona's emotional state need reassurance? Is enough provided?"
  );
  lines.push('');
  lines.push(
    "Be specific. Reference concrete elements (\"the second CTA reading 'Subscribe' competes with the primary 'Get started'\") rather than abstract advice. Suggest at most 3 concrete fixes."
  );

  return lines.join('\n');
}

interface ResolvedPersona {
  source: 'personaId' | 'override' | 'project-default' | 'studio-shape' | 'none';
  name: string;
  audience: string | null;
  jobToBeDone: string | null;
  emotionalState: string | null;
  emotionAfterUse: string[] | null;
  brandPersonality: string[] | null;
  antiReferences: string[] | null;
  constraints: string[];
}

/**
 * Resolve which persona to use, in priority order:
 * 1. `personaId` argument — looked up via getPersona, must belong to projectId
 * 2. `personaOverride` argument — used inline as-is
 * 3. Project's default persona row (isDefault = true)
 * 4. Project's `studioDraft.shape` (legacy single-shape input)
 * 5. Empty fallback
 */
async function resolvePersona(
  db: ReturnType<typeof getDb>,
  projectId: string,
  personaId: string | undefined,
  personaOverride:
    | {
        name?: string;
        audience?: string;
        jobToBeDone?: string;
        emotionalState?: string;
        emotionAfterUse?: string[];
        brandPersonality?: string[];
        antiReferences?: string[];
        constraints?: string[];
      }
    | undefined,
  project: typeof projects.$inferSelect
): Promise<ResolvedPersona> {
  // 1. explicit personaId
  if (personaId) {
    const row = await getPersona(db, personaId, projectId);
    if (!row) {
      throw new NotFoundError('Persona', personaId);
    }
    return {
      source: 'personaId',
      name: row.name,
      audience: row.audience ?? null,
      jobToBeDone: row.jobToBeDone ?? null,
      emotionalState: row.emotionalState ?? null,
      emotionAfterUse: (row.emotionAfterUse as string[] | null) ?? null,
      brandPersonality: (row.brandPersonality as string[] | null) ?? null,
      antiReferences: (row.antiReferences as string[] | null) ?? null,
      constraints: (row.constraints as string[] | null) ?? [],
    };
  }

  // 2. inline override
  if (personaOverride) {
    return {
      source: 'override',
      name: personaOverride.name ?? 'project audience',
      audience: personaOverride.audience ?? null,
      jobToBeDone: personaOverride.jobToBeDone ?? null,
      emotionalState: personaOverride.emotionalState ?? null,
      emotionAfterUse: personaOverride.emotionAfterUse ?? null,
      brandPersonality: personaOverride.brandPersonality ?? null,
      antiReferences: personaOverride.antiReferences ?? null,
      constraints: personaOverride.constraints ?? [],
    };
  }

  // 3. project default persona
  const defaultRow = await getDefaultPersona(db, projectId);
  if (defaultRow) {
    return {
      source: 'project-default',
      name: defaultRow.name,
      audience: defaultRow.audience ?? null,
      jobToBeDone: defaultRow.jobToBeDone ?? null,
      emotionalState: defaultRow.emotionalState ?? null,
      emotionAfterUse: (defaultRow.emotionAfterUse as string[] | null) ?? null,
      brandPersonality: (defaultRow.brandPersonality as string[] | null) ?? null,
      antiReferences: (defaultRow.antiReferences as string[] | null) ?? null,
      constraints: (defaultRow.constraints as string[] | null) ?? [],
    };
  }

  // 4. studioDraft.shape (legacy single-shape input)
  const shape = (project.studioDraft as { shape?: Record<string, unknown> } | null)?.shape;
  if (shape) {
    return {
      source: 'studio-shape',
      name: 'project audience',
      audience: typeof shape.audience === 'string' ? shape.audience : null,
      jobToBeDone: typeof shape.jobToBeDone === 'string' ? shape.jobToBeDone : null,
      emotionalState: null,
      emotionAfterUse:
        Array.isArray(shape.emotionAfterUse) &&
        shape.emotionAfterUse.every((s) => typeof s === 'string')
          ? (shape.emotionAfterUse as string[])
          : null,
      brandPersonality:
        Array.isArray(shape.brandPersonality) &&
        shape.brandPersonality.every((s) => typeof s === 'string')
          ? (shape.brandPersonality as string[])
          : null,
      antiReferences:
        Array.isArray(shape.antiReferences) &&
        shape.antiReferences.every((s) => typeof s === 'string')
          ? (shape.antiReferences as string[])
          : null,
      constraints: [],
    };
  }

  // 5. empty
  return {
    source: 'none',
    name: 'project audience',
    audience: null,
    jobToBeDone: null,
    emotionalState: null,
    emotionAfterUse: null,
    brandPersonality: null,
    antiReferences: null,
    constraints: [],
  };
}
