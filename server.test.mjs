import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createAppServer } from './server.mjs';

let server;
let baseUrl;
const originalApiKey = process.env.GEMINI_API_KEY;

beforeEach(async () => {
  delete process.env.GEMINI_API_KEY;
  server = createAppServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterEach(async () => {
  if (originalApiKey === undefined) {
    delete process.env.GEMINI_API_KEY;
  } else {
    process.env.GEMINI_API_KEY = originalApiKey;
  }
  if (server?.listening) {
    await new Promise(resolve => server.close(resolve));
  }
});

describe('server-side analysis boundary', () => {
  it('fails closed when the server-side provider key is absent', async () => {
    const response = await fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentText: 'Claim and table text' }),
    });

    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.error).toMatch(/not configured/i);
  });

  it('rejects empty extracted text before provider access', async () => {
    process.env.GEMINI_API_KEY = 'unit-test-only';
    const response = await fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentText: '   ' }),
    });

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/extractable text/i);
  });

  it('rejects oversized request bodies', async () => {
    const response = await fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentText: 'x'.repeat(600 * 1024) }),
    });

    expect(response.status).toBe(413);
  });

  it('does not expose undeclared API routes', async () => {
    const response = await fetch(`${baseUrl}/api/anything-else`);
    expect(response.status).toBe(404);
  });
});
