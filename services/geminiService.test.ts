import { afterEach, describe, expect, it, vi } from 'vitest';
import { analyzeDocument, validateAnalysisResult } from './geminiService';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('analysis result contract', () => {
  it('accepts the advisory no-issue status', () => {
    expect(
      validateAnalysisResult({
        status: 'no_issue_detected',
        summary: 'No internal mismatch was identified in the extracted text.',
        issues: [],
      }),
    ).toEqual({
      status: 'no_issue_detected',
      summary: 'No internal mismatch was identified in the extracted text.',
      issues: [],
    });
  });

  it('rejects the legacy safe/threat boolean contract', () => {
    expect(() =>
      validateAnalysisResult({
        isSafe: true,
        summary: 'safe',
      }),
    ).toThrow(/unsupported status/i);
  });

  it('rejects unknown status values and malformed issues', () => {
    expect(() =>
      validateAnalysisResult({ status: 'safe', summary: 'bad contract' }),
    ).toThrow(/unsupported status/i);

    expect(() =>
      validateAnalysisResult({
        status: 'review',
        summary: 'review',
        issues: [{ text_claim: 'claim' }],
      }),
    ).toThrow(/malformed issues/i);
  });
});

describe('analysis API client', () => {
  it('validates a successful server response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            status: 'review',
            summary: 'A concrete mismatch requires human review.',
            issues: [
              {
                text_claim: 'Q1 was 10',
                structural_reference: 'Q1 | 50',
                explanation: 'The values differ.',
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    );

    const result = await analyzeDocument('untrusted document text');
    expect(result.status).toBe('review');
    expect(result.issues).toHaveLength(1);
  });

  it('surfaces server failure instead of inventing a verdict', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: 'Analysis provider is not configured on the server.' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    await expect(analyzeDocument('document')).rejects.toThrow(/not configured/i);
  });
});
