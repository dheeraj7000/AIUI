import { describe, it, expect } from 'vitest';
import { GET as getHealth } from '../app/api/health/route';

// ---------------------------------------------------------------------------
// Health route handler export verification
// ---------------------------------------------------------------------------

describe('Health route handler — /api/health', () => {
  it('exports GET as a function', () => {
    expect(typeof getHealth).toBe('function');
  });

  it('GET handler takes zero arguments', () => {
    expect(getHealth.length).toBe(0);
  });

  it('GET handler is async', () => {
    expect(getHealth.constructor.name).toBe('AsyncFunction');
  });
});

// ---------------------------------------------------------------------------
// Functional test — health endpoint can be called without dependencies
// ---------------------------------------------------------------------------

describe('Health route handler — functional', () => {
  it('returns a Response with status 200', async () => {
    const response = await getHealth();
    expect(response.status).toBe(200);
  });

  it('returns JSON with status "ok"', async () => {
    const response = await getHealth();
    const body = await response.json();
    expect(body.status).toBe('ok');
  });

  it('returns a valid ISO timestamp', async () => {
    const response = await getHealth();
    const body = await response.json();
    expect(body.timestamp).toBeDefined();
    // Verify it parses as a valid date
    const date = new Date(body.timestamp);
    expect(date.getTime()).not.toBeNaN();
  });

  it('returns a version string', async () => {
    const response = await getHealth();
    const body = await response.json();
    expect(typeof body.version).toBe('string');
  });

  it('response has correct Content-Type header', async () => {
    const response = await getHealth();
    const contentType = response.headers.get('content-type');
    expect(contentType).toContain('application/json');
  });
});
