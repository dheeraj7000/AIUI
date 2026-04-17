// ---------------------------------------------------------------------------
// Integration tests for the auth-coverage hardening pass.
//
// Each route family below got a new org/project membership check added in
// the hardening pass. These tests pin the 401 / 403 / 2xx contract so the
// guards cannot silently regress.
//
// The existing auth-guards.test.ts already covers /api/projects, /api/api-keys,
// and /api/style-packs/[id] GET. We extend coverage to the previously
// unguarded routes: style-pack tokens, component-recipes/[id], assets,
// design-profiles, usage, organizations/[orgId], and invitations.
// ---------------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const {
  mockVerifyOrgMembership,
  mockCreateToken,
  mockBulkImportTokens,
  mockGetRecipe,
  mockDeleteRecipe,
  mockCreateAsset,
  mockListAssets,
  mockCreateProfile,
  mockGetUsage,
  mockGetUsageHistory,
  mockGetOrganization,
  mockUpdateOrganization,
  mockCreateInvitation,
  mockListPendingInvitations,
  mockRevokeInvitation,
} = vi.hoisted(() => ({
  mockVerifyOrgMembership: vi.fn<() => Promise<boolean>>(),
  mockCreateToken: vi.fn(),
  mockBulkImportTokens: vi.fn(),
  mockGetRecipe: vi.fn(),
  mockDeleteRecipe: vi.fn(),
  mockCreateAsset: vi.fn(),
  mockListAssets: vi.fn(),
  mockCreateProfile: vi.fn(),
  mockGetUsage: vi.fn(),
  mockGetUsageHistory: vi.fn(),
  mockGetOrganization: vi.fn(),
  mockUpdateOrganization: vi.fn(),
  mockCreateInvitation: vi.fn(),
  mockListPendingInvitations: vi.fn(),
  mockRevokeInvitation: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Minimal chainable-drizzle fake. Each route either consults
// stylePacks/projects/componentRecipes/organizationMembers — all of which go
// through db.select(...).from(...).where(...).limit(...). We intercept the
// terminal `.limit()` with a queue of mock rows set by the caller.
// ---------------------------------------------------------------------------

type DbRow = Record<string, unknown>;

const dbRowQueue: DbRow[][] = [];

function queueDbRows(...sets: DbRow[][]) {
  dbRowQueue.length = 0;
  dbRowQueue.push(...sets);
}

function shiftQueuedRows(): DbRow[] {
  return dbRowQueue.shift() ?? [];
}

function makeFakeDb() {
  const chain = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    limit: vi.fn(async () => shiftQueuedRows()),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn(async () => shiftQueuedRows()),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  };
  return chain;
}

vi.mock('@aiui/design-core', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@aiui/design-core');
  return {
    ...actual,
    createDb: vi.fn(() => makeFakeDb()),
    verifyOrgMembership: mockVerifyOrgMembership,
    createToken: mockCreateToken,
    bulkImportTokens: mockBulkImportTokens,
    getRecipe: mockGetRecipe,
    deleteRecipe: mockDeleteRecipe,
    createAsset: mockCreateAsset,
    listAssets: mockListAssets,
    getUsage: mockGetUsage,
    getUsageHistory: mockGetUsageHistory,
    getOrganization: mockGetOrganization,
    updateOrganization: mockUpdateOrganization,
    createInvitation: mockCreateInvitation,
    listPendingInvitations: mockListPendingInvitations,
    revokeInvitation: mockRevokeInvitation,
  };
});

// Sub-path mocks for routes that import from deep paths
vi.mock('@aiui/design-core/src/operations/design-profiles', async () => {
  const actual = await vi.importActual<Record<string, unknown>>(
    '@aiui/design-core/src/operations/design-profiles'
  );
  return {
    ...actual,
    createProfile: mockCreateProfile,
    listProfiles: vi.fn(async () => []),
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    deleteProfile: vi.fn(),
    compileDesignProfile: vi.fn(),
  };
});

vi.stubEnv('DATABASE_URL', 'postgres://test:test@localhost:5432/test');

// ---------------------------------------------------------------------------
// Route imports (after mocks)
// ---------------------------------------------------------------------------

import { POST as tokensPost, GET as tokensGet } from '@/app/api/style-packs/[id]/tokens/route';
import { POST as bulkTokensPost } from '@/app/api/style-packs/[id]/tokens/bulk/route';
import { GET as recipeGet, DELETE as recipeDelete } from '@/app/api/component-recipes/[id]/route';
import { POST as assetsPost, GET as assetsGet } from '@/app/api/assets/route';
import { POST as profilesPost } from '@/app/api/design-profiles/route';
import { GET as usageGet } from '@/app/api/usage/route';
import { GET as usageHistoryGet } from '@/app/api/usage/history/route';
import { GET as orgGet, PATCH as orgPatch } from '@/app/api/organizations/[orgId]/route';
import {
  POST as inviteCreate,
  GET as inviteList,
} from '@/app/api/organizations/[orgId]/invitations/route';
import { DELETE as inviteRevoke } from '@/app/api/organizations/[orgId]/invitations/[inviteId]/route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const USER_ID = '00000000-0000-4000-a000-000000000001';
const OTHER_USER_ID = '00000000-0000-4000-a000-000000000002';
const OWN_ORG_ID = '00000000-0000-4000-a000-000000000010';
const FOREIGN_ORG_ID = '00000000-0000-4000-a000-000000000099';
const STYLE_PACK_ID = '00000000-0000-4000-a000-000000000020';
const RECIPE_ID = '00000000-0000-4000-a000-000000000030';
const PROJECT_ID = '00000000-0000-4000-a000-000000000040';
const TOKEN_ID = '00000000-0000-4000-a000-000000000050';
const INVITE_ID = '00000000-0000-4000-a000-000000000060';

function mockRequest(options: {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: unknown;
}): NextRequest {
  const { method = 'GET', url = 'http://localhost:3000', headers = {}, body } = options;
  const finalHeaders: Record<string, string> = { ...headers };
  if (body && !finalHeaders['content-type']) finalHeaders['content-type'] = 'application/json';
  return new NextRequest(url, {
    method,
    headers: new Headers(finalHeaders),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

function ctx<T extends Record<string, string>>(params: T) {
  return { params: Promise.resolve(params) };
}

beforeEach(() => {
  vi.clearAllMocks();
  // clearAllMocks clears history but not queued return values; reset
  // the membership mock explicitly so tests stay independent.
  mockVerifyOrgMembership.mockReset();
  dbRowQueue.length = 0;
});

// ===========================================================================
// Style-pack token routes
// ===========================================================================

describe('POST /api/style-packs/[id]/tokens', () => {
  it('401 when unauthed', async () => {
    const req = mockRequest({
      method: 'POST',
      url: `http://localhost:3000/api/style-packs/${STYLE_PACK_ID}/tokens`,
      body: { tokenKey: 'color.primary', tokenValue: '#000', tokenType: 'color' },
    });
    const res = await tokensPost(req, ctx({ id: STYLE_PACK_ID }));
    expect(res.status).toBe(401);
  });

  it('403 when user is not a member of the pack org', async () => {
    queueDbRows([{ organizationId: FOREIGN_ORG_ID }]); // stylePacks lookup
    mockVerifyOrgMembership.mockResolvedValueOnce(false);

    const req = mockRequest({
      method: 'POST',
      url: `http://localhost:3000/api/style-packs/${STYLE_PACK_ID}/tokens`,
      headers: { 'x-user-id': USER_ID },
      body: { tokenKey: 'color.primary', tokenValue: '#000', tokenType: 'color' },
    });
    const res = await tokensPost(req, ctx({ id: STYLE_PACK_ID }));
    expect(res.status).toBe(403);
    expect(mockCreateToken).not.toHaveBeenCalled();
  });

  it('201 when user is a member of the pack org', async () => {
    queueDbRows(
      [{ organizationId: OWN_ORG_ID }], // pack lookup for auth
      [], // affectedProjects query
      [{ organizationId: OWN_ORG_ID }] // audit pack lookup
    );
    mockVerifyOrgMembership.mockResolvedValue(true);
    mockCreateToken.mockResolvedValue({ data: { id: 'tok-1', tokenKey: 'color.primary' } });

    const req = mockRequest({
      method: 'POST',
      url: `http://localhost:3000/api/style-packs/${STYLE_PACK_ID}/tokens`,
      headers: { 'x-user-id': USER_ID },
      body: { tokenKey: 'color.primary', tokenValue: '#000', tokenType: 'color' },
    });
    const res = await tokensPost(req, ctx({ id: STYLE_PACK_ID }));
    expect(res.status).toBe(201);
    expect(mockCreateToken).toHaveBeenCalledWith(
      expect.anything(),
      STYLE_PACK_ID,
      expect.objectContaining({ tokenKey: 'color.primary' })
    );
  });

  it('404 when the style pack is missing entirely', async () => {
    queueDbRows([]); // pack lookup returns no rows
    const req = mockRequest({
      method: 'POST',
      url: `http://localhost:3000/api/style-packs/${STYLE_PACK_ID}/tokens`,
      headers: { 'x-user-id': USER_ID },
      body: { tokenKey: 'color.missing', tokenValue: '#fff', tokenType: 'color' },
    });
    const res = await tokensPost(req, ctx({ id: STYLE_PACK_ID }));
    expect(res.status).toBe(404);
    expect(mockCreateToken).not.toHaveBeenCalled();
  });
});

describe('GET /api/style-packs/[id]/tokens', () => {
  it('401 when unauthed', async () => {
    const req = mockRequest({
      url: `http://localhost:3000/api/style-packs/${STYLE_PACK_ID}/tokens`,
    });
    const res = await tokensGet(req, ctx({ id: STYLE_PACK_ID }));
    expect(res.status).toBe(401);
  });

  it('403 when user is not a member of the pack org', async () => {
    queueDbRows([{ organizationId: FOREIGN_ORG_ID }]);
    mockVerifyOrgMembership.mockResolvedValueOnce(false);
    const req = mockRequest({
      url: `http://localhost:3000/api/style-packs/${STYLE_PACK_ID}/tokens`,
      headers: { 'x-user-id': USER_ID },
    });
    const res = await tokensGet(req, ctx({ id: STYLE_PACK_ID }));
    expect(res.status).toBe(403);
  });
});

describe('POST /api/style-packs/[id]/tokens/bulk', () => {
  it('403 when user is not a member of the pack org', async () => {
    queueDbRows([{ organizationId: FOREIGN_ORG_ID }]);
    mockVerifyOrgMembership.mockResolvedValueOnce(false);
    const req = mockRequest({
      method: 'POST',
      url: `http://localhost:3000/api/style-packs/${STYLE_PACK_ID}/tokens/bulk`,
      headers: { 'x-user-id': USER_ID },
      body: { tokens: [{ tokenKey: 'color.a', tokenValue: '#000', tokenType: 'color' }] },
    });
    const res = await bulkTokensPost(req, ctx({ id: STYLE_PACK_ID }));
    expect(res.status).toBe(403);
    expect(mockBulkImportTokens).not.toHaveBeenCalled();
  });
});

// Unused here, silences the import warning
void TOKEN_ID;

// ===========================================================================
// Component recipes
// ===========================================================================

describe('GET /api/component-recipes/[id]', () => {
  it('401 when unauthed', async () => {
    const req = mockRequest({ url: `http://localhost:3000/api/component-recipes/${RECIPE_ID}` });
    const res = await recipeGet(req, ctx({ id: RECIPE_ID }));
    expect(res.status).toBe(401);
  });

  it('403 when the recipe belongs to a foreign org', async () => {
    queueDbRows([{ organizationId: FOREIGN_ORG_ID }]);
    mockVerifyOrgMembership.mockResolvedValueOnce(false);
    const req = mockRequest({
      url: `http://localhost:3000/api/component-recipes/${RECIPE_ID}`,
      headers: { 'x-user-id': USER_ID },
    });
    const res = await recipeGet(req, ctx({ id: RECIPE_ID }));
    expect(res.status).toBe(403);
    expect(mockGetRecipe).not.toHaveBeenCalled();
  });

  it('200 when user is a member', async () => {
    queueDbRows([{ organizationId: OWN_ORG_ID }]);
    mockVerifyOrgMembership.mockResolvedValue(true);
    mockGetRecipe.mockResolvedValue({ id: RECIPE_ID, name: 'Button' });
    const req = mockRequest({
      url: `http://localhost:3000/api/component-recipes/${RECIPE_ID}`,
      headers: { 'x-user-id': USER_ID },
    });
    const res = await recipeGet(req, ctx({ id: RECIPE_ID }));
    expect(res.status).toBe(200);
  });

  it('404 when recipe does not exist', async () => {
    queueDbRows([]);
    const req = mockRequest({
      url: `http://localhost:3000/api/component-recipes/${RECIPE_ID}`,
      headers: { 'x-user-id': USER_ID },
    });
    const res = await recipeGet(req, ctx({ id: RECIPE_ID }));
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/component-recipes/[id]', () => {
  it('403 when recipe belongs to a foreign org', async () => {
    queueDbRows([{ organizationId: FOREIGN_ORG_ID }]);
    mockVerifyOrgMembership.mockResolvedValueOnce(false);
    const req = mockRequest({
      method: 'DELETE',
      url: `http://localhost:3000/api/component-recipes/${RECIPE_ID}`,
      headers: { 'x-user-id': USER_ID },
    });
    const res = await recipeDelete(req, ctx({ id: RECIPE_ID }));
    expect(res.status).toBe(403);
    expect(mockDeleteRecipe).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// Assets
// ===========================================================================

describe('POST /api/assets', () => {
  it('401 when unauthed', async () => {
    const req = mockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/assets',
      body: {
        projectId: PROJECT_ID,
        type: 'logo',
        name: 'x',
        fileName: 'x.png',
        mimeType: 'image/png',
        storageKey: 'x',
        sizeBytes: 1,
      },
    });
    const res = await assetsPost(req);
    expect(res.status).toBe(401);
  });

  it('403 when target project is in a foreign org', async () => {
    queueDbRows([{ organizationId: FOREIGN_ORG_ID }]);
    mockVerifyOrgMembership.mockResolvedValueOnce(false);
    const req = mockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/assets',
      headers: { 'x-user-id': USER_ID },
      body: {
        projectId: PROJECT_ID,
        type: 'logo',
        name: 'x',
        fileName: 'x.png',
        mimeType: 'image/png',
        storageKey: 'x',
        sizeBytes: 1,
      },
    });
    const res = await assetsPost(req);
    expect(res.status).toBe(403);
    expect(mockCreateAsset).not.toHaveBeenCalled();
  });

  it('201 when user is a member of the project org', async () => {
    queueDbRows([{ organizationId: OWN_ORG_ID }]);
    mockVerifyOrgMembership.mockResolvedValue(true);
    mockCreateAsset.mockResolvedValue({ id: 'a1' });
    const req = mockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/assets',
      headers: { 'x-user-id': USER_ID },
      body: {
        projectId: PROJECT_ID,
        type: 'logo',
        name: 'x',
        fileName: 'x.png',
        mimeType: 'image/png',
        storageKey: 'x',
        sizeBytes: 1,
      },
    });
    const res = await assetsPost(req);
    expect(res.status).toBe(201);
  });
});

describe('GET /api/assets', () => {
  it('403 when listing assets for a foreign project', async () => {
    queueDbRows([{ organizationId: FOREIGN_ORG_ID }]);
    mockVerifyOrgMembership.mockResolvedValueOnce(false);
    const req = mockRequest({
      url: `http://localhost:3000/api/assets?projectId=${PROJECT_ID}`,
      headers: { 'x-user-id': USER_ID },
    });
    const res = await assetsGet(req);
    expect(res.status).toBe(403);
    expect(mockListAssets).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// Design profiles POST
// ===========================================================================

describe('POST /api/design-profiles', () => {
  it('403 when the target project is in a foreign org', async () => {
    queueDbRows([{ organizationId: FOREIGN_ORG_ID }]);
    mockVerifyOrgMembership.mockResolvedValueOnce(false);
    const req = mockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/design-profiles',
      headers: { 'x-user-id': USER_ID },
      body: {
        projectId: PROJECT_ID,
        name: 'Profile A',
        stylePackId: STYLE_PACK_ID,
      },
    });
    const res = await profilesPost(req);
    expect(res.status).toBe(403);
    expect(mockCreateProfile).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// Usage
// ===========================================================================

describe('GET /api/usage', () => {
  it('401 when unauthed', async () => {
    const req = mockRequest({
      url: `http://localhost:3000/api/usage?organizationId=${OWN_ORG_ID}`,
    });
    const res = await usageGet(req);
    expect(res.status).toBe(401);
  });

  it('403 when user is not a member of the target org', async () => {
    mockVerifyOrgMembership.mockResolvedValueOnce(false);
    const req = mockRequest({
      url: `http://localhost:3000/api/usage?organizationId=${FOREIGN_ORG_ID}`,
      headers: { 'x-user-id': USER_ID },
    });
    const res = await usageGet(req);
    expect(res.status).toBe(403);
    expect(mockGetUsage).not.toHaveBeenCalled();
  });

  it('200 when user is a member', async () => {
    mockVerifyOrgMembership.mockResolvedValue(true);
    mockGetUsage.mockResolvedValue({ credits: 0 });
    const req = mockRequest({
      url: `http://localhost:3000/api/usage?organizationId=${OWN_ORG_ID}`,
      headers: { 'x-user-id': USER_ID },
    });
    const res = await usageGet(req);
    expect(res.status).toBe(200);
  });
});

describe('GET /api/usage/history', () => {
  it('403 when user is not a member of the target org', async () => {
    mockVerifyOrgMembership.mockResolvedValueOnce(false);
    const req = mockRequest({
      url: `http://localhost:3000/api/usage/history?organizationId=${FOREIGN_ORG_ID}`,
      headers: { 'x-user-id': USER_ID },
    });
    const res = await usageHistoryGet(req);
    expect(res.status).toBe(403);
    expect(mockGetUsageHistory).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// Organizations
// ===========================================================================

describe('GET /api/organizations/[orgId]', () => {
  it('401 when unauthed', async () => {
    const req = mockRequest({ url: `http://localhost:3000/api/organizations/${OWN_ORG_ID}` });
    const res = await orgGet(req, ctx({ orgId: OWN_ORG_ID }));
    expect(res.status).toBe(401);
  });

  it('403 when user is not a member', async () => {
    mockVerifyOrgMembership.mockResolvedValueOnce(false);
    const req = mockRequest({
      url: `http://localhost:3000/api/organizations/${FOREIGN_ORG_ID}`,
      headers: { 'x-user-id': USER_ID },
    });
    const res = await orgGet(req, ctx({ orgId: FOREIGN_ORG_ID }));
    expect(res.status).toBe(403);
    expect(mockGetOrganization).not.toHaveBeenCalled();
  });

  it('200 when user is a member', async () => {
    mockVerifyOrgMembership.mockResolvedValue(true);
    mockGetOrganization.mockResolvedValue({ id: OWN_ORG_ID, name: 'My Org' });
    const req = mockRequest({
      url: `http://localhost:3000/api/organizations/${OWN_ORG_ID}`,
      headers: { 'x-user-id': USER_ID },
    });
    const res = await orgGet(req, ctx({ orgId: OWN_ORG_ID }));
    expect(res.status).toBe(200);
  });
});

describe('PATCH /api/organizations/[orgId]', () => {
  it('403 when user is a plain member (not admin/owner)', async () => {
    queueDbRows([{ role: 'member' }]);
    const req = mockRequest({
      method: 'PATCH',
      url: `http://localhost:3000/api/organizations/${OWN_ORG_ID}`,
      headers: { 'x-user-id': USER_ID },
      body: { name: 'Renamed' },
    });
    const res = await orgPatch(req, ctx({ orgId: OWN_ORG_ID }));
    expect(res.status).toBe(403);
    expect(mockUpdateOrganization).not.toHaveBeenCalled();
  });

  it('403 when user is not a member at all', async () => {
    queueDbRows([]);
    const req = mockRequest({
      method: 'PATCH',
      url: `http://localhost:3000/api/organizations/${FOREIGN_ORG_ID}`,
      headers: { 'x-user-id': OTHER_USER_ID },
      body: { name: 'Hacked' },
    });
    const res = await orgPatch(req, ctx({ orgId: FOREIGN_ORG_ID }));
    expect(res.status).toBe(403);
    expect(mockUpdateOrganization).not.toHaveBeenCalled();
  });

  it('200 when user is an admin', async () => {
    queueDbRows([{ role: 'admin' }]);
    mockUpdateOrganization.mockResolvedValue({ id: OWN_ORG_ID, name: 'Renamed' });
    const req = mockRequest({
      method: 'PATCH',
      url: `http://localhost:3000/api/organizations/${OWN_ORG_ID}`,
      headers: { 'x-user-id': USER_ID },
      body: { name: 'Renamed' },
    });
    const res = await orgPatch(req, ctx({ orgId: OWN_ORG_ID }));
    expect(res.status).toBe(200);
  });
});

// ===========================================================================
// Invitations
// ===========================================================================

describe('POST /api/organizations/[orgId]/invitations', () => {
  it('403 when user is a plain member', async () => {
    queueDbRows([{ role: 'member' }]);
    const req = mockRequest({
      method: 'POST',
      url: `http://localhost:3000/api/organizations/${OWN_ORG_ID}/invitations`,
      headers: { 'x-user-id': USER_ID },
      body: { email: 'new@example.com', role: 'member' },
    });
    const res = await inviteCreate(req, ctx({ orgId: OWN_ORG_ID }));
    expect(res.status).toBe(403);
    expect(mockCreateInvitation).not.toHaveBeenCalled();
  });

  it('201 when user is an owner', async () => {
    queueDbRows([{ role: 'owner' }]);
    mockCreateInvitation.mockResolvedValue({ data: { id: INVITE_ID } });
    const req = mockRequest({
      method: 'POST',
      url: `http://localhost:3000/api/organizations/${OWN_ORG_ID}/invitations`,
      headers: { 'x-user-id': USER_ID },
      body: { email: 'new@example.com', role: 'member' },
    });
    const res = await inviteCreate(req, ctx({ orgId: OWN_ORG_ID }));
    expect(res.status).toBe(201);
  });
});

describe('GET /api/organizations/[orgId]/invitations', () => {
  it('403 when user is not a member', async () => {
    mockVerifyOrgMembership.mockResolvedValueOnce(false);
    const req = mockRequest({
      url: `http://localhost:3000/api/organizations/${FOREIGN_ORG_ID}/invitations`,
      headers: { 'x-user-id': USER_ID },
    });
    const res = await inviteList(req, ctx({ orgId: FOREIGN_ORG_ID }));
    expect(res.status).toBe(403);
    expect(mockListPendingInvitations).not.toHaveBeenCalled();
  });
});

describe('DELETE /api/organizations/[orgId]/invitations/[inviteId]', () => {
  it('403 when user is a plain member', async () => {
    queueDbRows([{ role: 'member' }]);
    const req = mockRequest({
      method: 'DELETE',
      url: `http://localhost:3000/api/organizations/${OWN_ORG_ID}/invitations/${INVITE_ID}`,
      headers: { 'x-user-id': USER_ID },
    });
    const res = await inviteRevoke(req, ctx({ orgId: OWN_ORG_ID, inviteId: INVITE_ID }));
    expect(res.status).toBe(403);
    expect(mockRevokeInvitation).not.toHaveBeenCalled();
  });

  it('200 when user is an admin', async () => {
    queueDbRows([{ role: 'admin' }]);
    mockRevokeInvitation.mockResolvedValue(true);
    const req = mockRequest({
      method: 'DELETE',
      url: `http://localhost:3000/api/organizations/${OWN_ORG_ID}/invitations/${INVITE_ID}`,
      headers: { 'x-user-id': USER_ID },
    });
    const res = await inviteRevoke(req, ctx({ orgId: OWN_ORG_ID, inviteId: INVITE_ID }));
    expect(res.status).toBe(200);
  });
});
