import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Mocks — hoisted so vi.mock can reference them
// ---------------------------------------------------------------------------

const { mockGetProjectById, mockVerifyOrgMembership, mockCreateDb } = vi.hoisted(() => ({
  mockGetProjectById: vi.fn(),
  mockVerifyOrgMembership: vi.fn<() => Promise<boolean>>(),
  mockCreateDb: vi.fn(() => ({})),
}));

vi.mock('@aiui/design-core', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@aiui/design-core');
  return {
    ...actual,
    createDb: mockCreateDb,
    getProjectById: mockGetProjectById,
    verifyOrgMembership: mockVerifyOrgMembership,
  };
});

process.env.DATABASE_URL = 'postgres://stub';

import { requireProjectAccess } from '../lib/project-access';

function mockRequest(headers: Record<string, string> = {}): NextRequest {
  return new NextRequest('http://localhost:3000/api/projects/abc', {
    method: 'GET',
    headers: new Headers(headers),
  });
}

beforeEach(() => {
  mockGetProjectById.mockReset();
  mockVerifyOrgMembership.mockReset();
  mockCreateDb.mockClear();
});

describe('requireProjectAccess', () => {
  // Regression: every `/api/projects/[id]/*` subroute used to be written
  // freehand and several forgot to verify org membership, leaking an IDOR
  // where any authenticated user could read/write any other org's project.
  // These tests lock in that the shared helper enforces every layer.

  it('returns 401 when x-user-id header is missing', async () => {
    const result = await requireProjectAccess(mockRequest(), 'project-1');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(401);
      const body = await result.response.json();
      expect(body).toEqual({ error: 'Unauthorized' });
    }
    expect(mockGetProjectById).not.toHaveBeenCalled();
  });

  it('returns 404 when the project does not exist', async () => {
    mockGetProjectById.mockResolvedValue(null);

    const result = await requireProjectAccess(mockRequest({ 'x-user-id': 'user-1' }), 'missing');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(404);
      const body = await result.response.json();
      expect(body).toEqual({ error: 'Project not found' });
    }
    expect(mockVerifyOrgMembership).not.toHaveBeenCalled();
  });

  it('returns 403 when the user is not a member of the project org (IDOR block)', async () => {
    mockGetProjectById.mockResolvedValue({
      id: 'project-1',
      organizationId: 'org-other',
    });
    mockVerifyOrgMembership.mockResolvedValue(false);

    const result = await requireProjectAccess(mockRequest({ 'x-user-id': 'user-1' }), 'project-1');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(403);
      const body = await result.response.json();
      expect(body).toEqual({ error: 'Forbidden' });
    }
    expect(mockVerifyOrgMembership).toHaveBeenCalledWith(expect.anything(), 'user-1', 'org-other');
  });

  it('returns ok with db/userId/project on the happy path', async () => {
    const project = { id: 'project-1', organizationId: 'org-mine', slug: 'p1' };
    mockGetProjectById.mockResolvedValue(project);
    mockVerifyOrgMembership.mockResolvedValue(true);

    const result = await requireProjectAccess(mockRequest({ 'x-user-id': 'user-1' }), 'project-1');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.userId).toBe('user-1');
      expect(result.project).toEqual(project);
      expect(result.db).toBeDefined();
    }
  });

  it('skips org membership check for projects with no organizationId', async () => {
    // Legacy/unowned projects (organizationId null) — still accessible to
    // any authed user, matching the behavior of the existing routes.
    mockGetProjectById.mockResolvedValue({
      id: 'project-1',
      organizationId: null,
    });

    const result = await requireProjectAccess(mockRequest({ 'x-user-id': 'user-1' }), 'project-1');

    expect(result.ok).toBe(true);
    expect(mockVerifyOrgMembership).not.toHaveBeenCalled();
  });
});
