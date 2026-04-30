import { StudioClient } from './StudioClient';

export const metadata = { title: 'Design Studio - AIUI' };
export const dynamic = 'force-dynamic';

/**
 * The studio is now fully client-driven against project-scoped APIs:
 *   - GET /api/projects        (project list)
 *   - GET/PUT /api/projects/[id]/tokens
 *   - GET/PUT /api/projects/[id]/studio-draft
 *
 * No server-side fetch is needed before render — everything keys off
 * "the user's selected project", and that selection happens after the
 * client mounts and the auth provider has settled.
 */
export default function StudioPage() {
  return <StudioClient />;
}
