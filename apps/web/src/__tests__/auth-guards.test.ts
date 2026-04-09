import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Module mocks — vi.hoisted() ensures these are available when vi.mock runs
// ---------------------------------------------------------------------------

const {
  mockVerifyOrgMembership,
  mockListProjects,
  mockCreateProject,
  mockGetStylePack,
  mockListStylePacks,
  mockCreateApiKey,
  mockListApiKeys,
  mockCreateStylePack,
  mockUpdateStylePack,
  mockDeleteStylePack,
} = vi.hoisted(() => ({
  mockVerifyOrgMembership: vi.fn<() => Promise<boolean>>(),
  mockListProjects: vi.fn(),
  mockCreateProject: vi.fn(),
  mockGetStylePack: vi.fn(),
  mockListStylePacks: vi.fn(),
  mockCreateApiKey: vi.fn(),
  mockListApiKeys: vi.fn(),
  mockCreateStylePack: vi.fn(),
  mockUpdateStylePack: vi.fn(),
  mockDeleteStylePack: vi.fn(),
}));

vi.mock('@aiui/design-core', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@aiui/design-core');
  return {
    ...actual,
    createDb: vi.fn(() => ({})),
    verifyOrgMembership: mockVerifyOrgMembership,
    listProjects: mockListProjects,
    createProject: mockCreateProject,
    getStylePack: mockGetStylePack,
    listStylePacks: mockListStylePacks,
    createStylePack: mockCreateStylePack,
    updateStylePack: mockUpdateStylePack,
    deleteStylePack: mockDeleteStylePack,
    createApiKey: mockCreateApiKey,
    listApiKeys: mockListApiKeys,
  };
});

// Stub DATABASE_URL so getDb() inside route handlers does not throw
vi.stubEnv('DATABASE_URL', 'postgres://test:test@localhost:5432/test');

// ---------------------------------------------------------------------------
// Route handler imports (resolved AFTER the mock is in place)
// ---------------------------------------------------------------------------

import { GET as getProjects, POST as postProject } from '@/app/api/projects/route';
import { GET as getStylePackById } from '@/app/api/style-packs/[id]/route';
import { POST as postApiKey, GET as getApiKeys } from '@/app/api/api-keys/route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Deterministic UUIDs for test clarity */
const USER_ID = '00000000-0000-4000-a000-000000000001';
const OWN_ORG_ID = '00000000-0000-4000-a000-000000000010';
const FOREIGN_ORG_ID = '00000000-0000-4000-a000-000000000099';
const STYLE_PACK_ID = '00000000-0000-4000-a000-000000000020';

function mockRequest(options: {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: unknown;
}): NextRequest {
  const { method = 'GET', url = 'http://localhost:3000', headers = {}, body } = options;
  return new NextRequest(url, {
    method,
    headers: new Headers(headers),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

/** Helper to build a route-context object for dynamic routes like /style-packs/[id] */
function routeContext(id: string) {
  return { params: Promise.resolve({ id }) };
}

// ---------------------------------------------------------------------------
// Reset all mocks before every test
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
});

// ===========================================================================
// 1. verifyOrgMembership — unit-level logic
// ===========================================================================

describe('verifyOrgMembership (unit logic)', () => {
  // We cannot easily unit-test the real drizzle-backed function without a DB,
  // but we CAN import the actual source and verify its logic with a mock db.
  it('returns true when the db query returns a row', async () => {
    const { verifyOrgMembership: realFn } =
      await vi.importActual<typeof import('@aiui/design-core')>('@aiui/design-core');

    // Build a minimal chainable mock that mimics drizzle's select().from().where().limit()
    const fakeDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'row-1' }]),
    };

    const result = await realFn(fakeDb as never, USER_ID, OWN_ORG_ID);
    expect(result).toBe(true);
  });

  it('returns false when the db query returns an empty array', async () => {
    const { verifyOrgMembership: realFn } =
      await vi.importActual<typeof import('@aiui/design-core')>('@aiui/design-core');

    const fakeDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    };

    const result = await realFn(fakeDb as never, USER_ID, FOREIGN_ORG_ID);
    expect(result).toBe(false);
  });
});

// ===========================================================================
// 2. GET /api/projects — org membership enforcement
// ===========================================================================

describe('GET /api/projects', () => {
  it('returns 401 when x-user-id header is missing', async () => {
    const req = mockRequest({
      url: `http://localhost:3000/api/projects?orgId=${OWN_ORG_ID}&limit=50&offset=0`,
    });

    const res = await getProjects(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 403 when user is NOT a member of the requested org', async () => {
    mockVerifyOrgMembership.mockResolvedValue(false);

    const req = mockRequest({
      url: `http://localhost:3000/api/projects?orgId=${FOREIGN_ORG_ID}&limit=50&offset=0`,
      headers: { 'x-user-id': USER_ID },
    });

    const res = await getProjects(req);
    expect(res.status).toBe(403);

    const json = await res.json();
    expect(json.error).toBe('Forbidden');
    expect(mockVerifyOrgMembership).toHaveBeenCalledWith(
      expect.anything(), // db object
      USER_ID,
      FOREIGN_ORG_ID
    );
  });

  it('returns 200 with project data when user IS a member', async () => {
    mockVerifyOrgMembership.mockResolvedValue(true);
    mockListProjects.mockResolvedValue({ projects: [{ id: 'p1' }], total: 1 });

    const req = mockRequest({
      url: `http://localhost:3000/api/projects?orgId=${OWN_ORG_ID}&limit=50&offset=0`,
      headers: { 'x-user-id': USER_ID },
    });

    const res = await getProjects(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data).toEqual([{ id: 'p1' }]);
    expect(json.total).toBe(1);
    expect(mockVerifyOrgMembership).toHaveBeenCalledWith(expect.anything(), USER_ID, OWN_ORG_ID);
  });
});

// ===========================================================================
// 3. POST /api/projects — org membership enforcement
// ===========================================================================

describe('POST /api/projects', () => {
  it('returns 403 when user is NOT a member of the target org', async () => {
    mockVerifyOrgMembership.mockResolvedValue(false);

    const req = mockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/projects',
      headers: { 'x-user-id': USER_ID, 'content-type': 'application/json' },
      body: { orgId: FOREIGN_ORG_ID, name: 'Evil Project' },
    });

    const res = await postProject(req);
    expect(res.status).toBe(403);

    const json = await res.json();
    expect(json.error).toBe('Forbidden');
  });

  it('returns 201 when user IS a member', async () => {
    mockVerifyOrgMembership.mockResolvedValue(true);
    mockCreateProject.mockResolvedValue({ id: 'new-p', name: 'Good Project' });

    const req = mockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/projects',
      headers: { 'x-user-id': USER_ID, 'content-type': 'application/json' },
      body: { orgId: OWN_ORG_ID, name: 'Good Project' },
    });

    const res = await postProject(req);
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json.name).toBe('Good Project');
  });
});

// ===========================================================================
// 4. GET /api/style-packs/[id] — resource-level org check
// ===========================================================================

describe('GET /api/style-packs/[id]', () => {
  it('returns 403 when user is NOT a member of the style pack org', async () => {
    mockGetStylePack.mockResolvedValue({
      id: STYLE_PACK_ID,
      name: 'Secret Pack',
      organizationId: FOREIGN_ORG_ID,
    });
    mockVerifyOrgMembership.mockResolvedValue(false);

    const req = mockRequest({
      url: `http://localhost:3000/api/style-packs/${STYLE_PACK_ID}`,
      headers: { 'x-user-id': USER_ID },
    });

    const res = await getStylePackById(req, routeContext(STYLE_PACK_ID));
    expect(res.status).toBe(403);

    const json = await res.json();
    expect(json.error).toBe('Forbidden');
    expect(mockVerifyOrgMembership).toHaveBeenCalledWith(
      expect.anything(),
      USER_ID,
      FOREIGN_ORG_ID
    );
  });

  it('returns 200 when user IS a member of the style pack org', async () => {
    mockGetStylePack.mockResolvedValue({
      id: STYLE_PACK_ID,
      name: 'My Pack',
      organizationId: OWN_ORG_ID,
    });
    mockVerifyOrgMembership.mockResolvedValue(true);

    const req = mockRequest({
      url: `http://localhost:3000/api/style-packs/${STYLE_PACK_ID}`,
      headers: { 'x-user-id': USER_ID },
    });

    const res = await getStylePackById(req, routeContext(STYLE_PACK_ID));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.name).toBe('My Pack');
  });

  it('returns 404 when style pack does not exist', async () => {
    mockGetStylePack.mockResolvedValue(null);

    const req = mockRequest({
      url: `http://localhost:3000/api/style-packs/${STYLE_PACK_ID}`,
      headers: { 'x-user-id': USER_ID },
    });

    const res = await getStylePackById(req, routeContext(STYLE_PACK_ID));
    expect(res.status).toBe(404);
  });

  it('skips org check and returns 200 for packs with no organizationId', async () => {
    mockGetStylePack.mockResolvedValue({
      id: STYLE_PACK_ID,
      name: 'Public Pack',
      organizationId: null,
    });

    const req = mockRequest({
      url: `http://localhost:3000/api/style-packs/${STYLE_PACK_ID}`,
      headers: { 'x-user-id': USER_ID },
    });

    const res = await getStylePackById(req, routeContext(STYLE_PACK_ID));
    expect(res.status).toBe(200);
    // verifyOrgMembership should NOT have been called
    expect(mockVerifyOrgMembership).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// 5. POST /api/api-keys — org membership enforcement
// ===========================================================================

describe('POST /api/api-keys', () => {
  it('returns 401 when x-user-id header is missing', async () => {
    const req = mockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/api-keys',
      headers: { 'content-type': 'application/json' },
      body: { name: 'key-1', organizationId: OWN_ORG_ID },
    });

    const res = await postApiKey(req);
    expect(res.status).toBe(401);
  });

  it('returns 403 when user is NOT a member of the target org', async () => {
    mockVerifyOrgMembership.mockResolvedValue(false);

    const req = mockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/api-keys',
      headers: { 'x-user-id': USER_ID, 'content-type': 'application/json' },
      body: { name: 'stolen-key', organizationId: FOREIGN_ORG_ID },
    });

    const res = await postApiKey(req);
    expect(res.status).toBe(403);

    const json = await res.json();
    expect(json.error).toBe('Forbidden');
    expect(mockVerifyOrgMembership).toHaveBeenCalledWith(
      expect.anything(),
      USER_ID,
      FOREIGN_ORG_ID
    );
  });

  it('returns 201 when user IS a member of the target org', async () => {
    mockVerifyOrgMembership.mockResolvedValue(true);
    mockCreateApiKey.mockResolvedValue({
      id: 'key-1',
      rawKey: 'aiui_abc123',
      keyPrefix: 'aiui_abc',
      name: 'my-key',
      scopes: ['mcp:read', 'mcp:write'],
      createdAt: new Date().toISOString(),
    });

    const req = mockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/api-keys',
      headers: { 'x-user-id': USER_ID, 'content-type': 'application/json' },
      body: { name: 'my-key', organizationId: OWN_ORG_ID },
    });

    const res = await postApiKey(req);
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json.name).toBe('my-key');
    expect(json.rawKey).toBeDefined();
  });

  it('returns 400 when required fields are missing', async () => {
    const req = mockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/api-keys',
      headers: { 'x-user-id': USER_ID, 'content-type': 'application/json' },
      body: {},
    });

    const res = await postApiKey(req);
    expect(res.status).toBe(400);
  });
});

// ===========================================================================
// 6. GET /api/api-keys — user scoping (no cross-org vector here, but verify auth)
// ===========================================================================

describe('GET /api/api-keys', () => {
  it('returns 401 when x-user-id header is missing', async () => {
    const req = mockRequest({ url: 'http://localhost:3000/api/api-keys' });

    const res = await getApiKeys(req);
    expect(res.status).toBe(401);
  });

  it('returns 200 with keys scoped to the authenticated user', async () => {
    mockListApiKeys.mockResolvedValue([{ id: 'k1', name: 'my-key' }]);

    const req = mockRequest({
      url: 'http://localhost:3000/api/api-keys',
      headers: { 'x-user-id': USER_ID },
    });

    const res = await getApiKeys(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toHaveLength(1);
    expect(mockListApiKeys).toHaveBeenCalledWith(expect.anything(), USER_ID);
  });
});

// ===========================================================================
// 7. Cross-cutting: membership check receives correct arguments
// ===========================================================================

describe('Cross-org guard contract', () => {
  it('always passes (db, userId, orgId) in that order to verifyOrgMembership', async () => {
    mockVerifyOrgMembership.mockResolvedValue(true);
    mockListProjects.mockResolvedValue({ projects: [], total: 0 });

    const req = mockRequest({
      url: `http://localhost:3000/api/projects?orgId=${OWN_ORG_ID}&limit=50&offset=0`,
      headers: { 'x-user-id': USER_ID },
    });

    await getProjects(req);

    const call = mockVerifyOrgMembership.mock.calls[0] as unknown[];
    expect(call[0]).toBeDefined(); // db instance (mocked to {})
    expect(call[1]).toBe(USER_ID); // from x-user-id header
    expect(call[2]).toBe(OWN_ORG_ID); // from query param
  });

  it('never calls downstream operations when membership is denied', async () => {
    mockVerifyOrgMembership.mockResolvedValue(false);

    const req = mockRequest({
      url: `http://localhost:3000/api/projects?orgId=${FOREIGN_ORG_ID}&limit=50&offset=0`,
      headers: { 'x-user-id': USER_ID },
    });

    await getProjects(req);

    expect(mockListProjects).not.toHaveBeenCalled();
    expect(mockCreateProject).not.toHaveBeenCalled();
  });
});
