import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import {
  projects,
  designProfiles,
  styleTokens,
  getPersona,
  getDefaultPersona,
  extractPersonaSignals,
  cognitiveLoadScore,
  type PersonaSignals,
} from '@aiui/design-core';
import { requireProjectAccess } from '@/lib/project-access';

type RouteContext = { params: Promise<{ id: string }> };

const inlinePersonaSchema = z.object({
  name: z.string().optional(),
  audience: z.string().optional(),
  jobToBeDone: z.string().optional(),
  emotionalState: z.string().optional(),
  emotionAfterUse: z.array(z.string()).optional(),
  brandPersonality: z.array(z.string()).optional(),
  antiReferences: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
});

const bodySchema = z.object({
  code: z.string().min(1).max(200_000),
  personaId: z.string().uuid().optional(),
  persona: inlinePersonaSchema.optional(),
  surface: z
    .enum(['landing', 'dashboard', 'form', 'pricing', 'settings', 'auth', 'other'])
    .optional(),
});

/**
 * POST /api/projects/[id]/critique
 *
 * Web-side equivalent of the MCP `critique_for_persona` tool. Takes the
 * same inputs (code + persona resolution + surface) and returns the same
 * structured signals + design context + LLM-ready prompt.
 *
 * The actual LLM call to compose the critique is left to the caller —
 * the dashboard renders the prompt + signals; users with an LLM provider
 * can copy the prompt or wire it to their own model.
 *
 * Auth: web cookie (browser), gated by requireProjectAccess.
 */
export async function POST(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const access = await requireProjectAccess(req, id);
  if (!access.ok) return access.response;

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid request body' },
      { status: 400 }
    );
  }

  // Resolve persona: id > inline > project default > studio shape > none
  const project = access.project;
  const resolved = await resolvePersonaForCritique(access.db, id, project, body);
  if (resolved === 'persona-not-found') {
    return NextResponse.json({ error: 'Persona not found on this project' }, { status: 404 });
  }
  const persona = resolved;

  const signals = extractPersonaSignals(body.code);
  const cognitiveLoad = cognitiveLoadScore(signals);

  // Tokens summary
  const tokens = await access.db
    .select({
      tokenKey: styleTokens.tokenKey,
      tokenType: styleTokens.tokenType,
      tokenValue: styleTokens.tokenValue,
    })
    .from(styleTokens)
    .where(eq(styleTokens.projectId, id));
  const tokensByType: Record<string, string[]> = {};
  for (const t of tokens) {
    (tokensByType[t.tokenType] ??= []).push(`${t.tokenKey} = ${t.tokenValue}`);
  }

  // Voice/tone
  const [profile] = await access.db
    .select({ voiceToneJson: designProfiles.voiceToneJson })
    .from(designProfiles)
    .where(eq(designProfiles.projectId, id))
    .limit(1);
  const voiceTone = (profile?.voiceToneJson ?? null) as Record<string, unknown> | null;

  const surface = body.surface ?? 'other';
  const prompt = renderCritiquePrompt({ persona, signals, cognitiveLoad, surface });

  return NextResponse.json({
    score: cognitiveLoad,
    persona,
    signals,
    designContext: {
      colorTokens: tokensByType['color'] ?? [],
      fontTokens: tokensByType['font'] ?? [],
      fontSizeTokens: tokensByType['font-size'] ?? [],
      spacingTokens: tokensByType['spacing'] ?? [],
      voiceTone,
    },
    prompt,
    summary:
      `Persona: ${persona.audience ?? 'unspecified audience'}; surface: ${surface}; ` +
      `cognitive-load score: ${cognitiveLoad}/100; ${signals.interactiveElements} interactive elements; ` +
      `${signals.competingCtas} competing CTA(s); ${signals.trustElements.length} trust signal(s) detected.`,
  });
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

async function resolvePersonaForCritique(
  db: NonNullable<Awaited<ReturnType<typeof requireProjectAccess>> & { ok: true }>['db'],
  projectId: string,
  project: typeof projects.$inferSelect,
  body: z.infer<typeof bodySchema>
): Promise<ResolvedPersona | 'persona-not-found'> {
  if (body.personaId) {
    const row = await getPersona(db, body.personaId, projectId);
    if (!row) return 'persona-not-found';
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
  if (body.persona) {
    return {
      source: 'override',
      name: body.persona.name ?? 'project audience',
      audience: body.persona.audience ?? null,
      jobToBeDone: body.persona.jobToBeDone ?? null,
      emotionalState: body.persona.emotionalState ?? null,
      emotionAfterUse: body.persona.emotionAfterUse ?? null,
      brandPersonality: body.persona.brandPersonality ?? null,
      antiReferences: body.persona.antiReferences ?? null,
      constraints: body.persona.constraints ?? [],
    };
  }
  const def = await getDefaultPersona(db, projectId);
  if (def) {
    return {
      source: 'project-default',
      name: def.name,
      audience: def.audience ?? null,
      jobToBeDone: def.jobToBeDone ?? null,
      emotionalState: def.emotionalState ?? null,
      emotionAfterUse: (def.emotionAfterUse as string[] | null) ?? null,
      brandPersonality: (def.brandPersonality as string[] | null) ?? null,
      antiReferences: (def.antiReferences as string[] | null) ?? null,
      constraints: (def.constraints as string[] | null) ?? [],
    };
  }
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

function renderCritiquePrompt(input: {
  persona: ResolvedPersona;
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
    lines.push(`- Emotion to leave with: ${persona.emotionAfterUse.join(', ')}`);
  if (persona.constraints?.length) lines.push(`- Constraints: ${persona.constraints.join(', ')}`);
  if (persona.brandPersonality?.length || persona.antiReferences?.length) {
    lines.push('');
    lines.push('## Brand voice');
    if (persona.brandPersonality?.length)
      lines.push(`- Personality: ${persona.brandPersonality.join(', ')}`);
    if (persona.antiReferences?.length)
      lines.push(`- Anti-references: ${persona.antiReferences.join(', ')}`);
  }
  lines.push('');
  lines.push(`## Surface: ${surface}`);
  lines.push('');
  lines.push('## Signals from the code');
  lines.push(`- Cognitive-load score: ${cognitiveLoad}/100`);
  lines.push(`- Interactive elements: ${signals.interactiveElements}`);
  lines.push(`- Competing CTAs: ${signals.competingCtas}`);
  lines.push(`- Form fields: ${signals.totalFormFields} (${signals.requiredFormFields} required)`);
  lines.push(`- Trust signals: ${signals.trustElements.join(', ') || 'none'}`);
  lines.push(`- Visual density: ${signals.density}`);
  lines.push('');
  lines.push('## What to write');
  lines.push(
    "Critique this UI from the persona's perspective along: (1) cognitive load, (2) hierarchy, (3) emotional resonance, (4) friction, (5) trust. Be specific. Suggest at most 3 concrete fixes."
  );
  return lines.join('\n');
}
