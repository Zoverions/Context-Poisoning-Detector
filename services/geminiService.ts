import type { AnalysisResult, AnalysisStatus, Issue } from '../types';

const VALID_STATUSES = new Set<AnalysisStatus>([
  'no_issue_detected',
  'review',
  'unknown',
]);

const isIssue = (value: unknown): value is Issue => {
  if (!value || typeof value !== 'object') return false;
  const issue = value as Record<string, unknown>;
  return (
    typeof issue.text_claim === 'string' &&
    typeof issue.structural_reference === 'string' &&
    typeof issue.explanation === 'string'
  );
};

export const validateAnalysisResult = (value: unknown): AnalysisResult => {
  if (!value || typeof value !== 'object') {
    throw new Error('Invalid analysis response: expected an object.');
  }

  const result = value as Record<string, unknown>;
  if (
    typeof result.status !== 'string' ||
    !VALID_STATUSES.has(result.status as AnalysisStatus)
  ) {
    throw new Error('Invalid analysis response: unsupported status.');
  }
  if (typeof result.summary !== 'string' || !result.summary.trim()) {
    throw new Error('Invalid analysis response: summary is required.');
  }

  const issues = result.issues;
  if (issues !== undefined) {
    if (!Array.isArray(issues) || !issues.every(isIssue)) {
      throw new Error('Invalid analysis response: malformed issues list.');
    }
  }

  return {
    status: result.status as AnalysisStatus,
    summary: result.summary.trim(),
    issues: Array.isArray(issues) ? issues : undefined,
  };
};

export const analyzeDocument = async (
  documentText: string,
  signal?: AbortSignal,
): Promise<AnalysisResult> => {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ documentText }),
    signal,
  });

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`Analysis service returned invalid JSON (${response.status}).`);
  }

  if (!response.ok) {
    const detail =
      payload && typeof payload === 'object' && typeof (payload as Record<string, unknown>).error === 'string'
        ? (payload as Record<string, string>).error
        : `Analysis service failed with HTTP ${response.status}.`;
    throw new Error(detail);
  }

  return validateAnalysisResult(payload);
};
