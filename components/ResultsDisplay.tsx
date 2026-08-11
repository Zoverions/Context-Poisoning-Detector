import React, { useState } from 'react';
import type { AnalysisStatus, FileAnalysisResult, Issue } from '../types';

interface ResultsDisplayProps {
  results: FileAnalysisResult[];
  onReset: () => void;
}

const STATUS_COPY: Record<
  AnalysisStatus,
  { label: string; border: string; background: string; text: string }
> = {
  no_issue_detected: {
    label: 'No mismatch detected',
    border: 'border-cyan-500/30',
    background: 'bg-cyan-900/20',
    text: 'text-cyan-300',
  },
  review: {
    label: 'Review suggested',
    border: 'border-amber-500/30',
    background: 'bg-amber-900/20',
    text: 'text-amber-300',
  },
  unknown: {
    label: 'Not assessed',
    border: 'border-slate-500/30',
    background: 'bg-slate-800/40',
    text: 'text-slate-300',
  },
};

const IssueCard: React.FC<{ issue: Issue }> = ({ issue }) => (
  <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3">
    <div className="space-y-1">
      <h4 className="text-sm font-semibold text-slate-400">Textual claim</h4>
      <p className="font-mono text-sm bg-slate-900 p-2 rounded text-amber-300">
        “{issue.text_claim}”
      </p>
    </div>
    <div className="space-y-1">
      <h4 className="text-sm font-semibold text-slate-400">Potentially conflicting structure</h4>
      <p className="font-mono text-sm bg-slate-900 p-2 rounded text-cyan-300">
        “{issue.structural_reference}”
      </p>
    </div>
    <div className="space-y-1">
      <h4 className="text-sm font-semibold text-slate-400">Advisory explanation</h4>
      <p className="text-slate-300 text-sm">{issue.explanation}</p>
    </div>
  </div>
);

const ResultCard: React.FC<{ fileResult: FileAnalysisResult }> = ({ fileResult }) => {
  const { fileName, result } = fileResult;
  const { status, summary, issues } = result;
  const statusCopy = STATUS_COPY[status];
  const [isExpanded, setIsExpanded] = useState(status !== 'no_issue_detected');

  return (
    <div className={`rounded-lg border ${statusCopy.border} ${statusCopy.background}`}>
      <button
        className="w-full flex justify-between items-center p-4 text-left"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls={`result-details-${fileName}`}
      >
        <div className="overflow-hidden">
          <h3 className={`font-semibold truncate ${statusCopy.text}`}>{statusCopy.label}</h3>
          <p className="text-sm text-slate-400 truncate">{fileName}</p>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 text-slate-400 transform transition-transform flex-shrink-0 ml-2 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && (
        <div id={`result-details-${fileName}`} className="px-4 pb-4 pt-2 border-t border-slate-700/50">
          <p className="text-slate-300 text-sm">{summary}</p>
          {status === 'no_issue_detected' && (
            <p className="mt-3 text-xs text-amber-200/80">
              This result only means the advisory model did not identify an internal structural mismatch in the extracted text. It is not an approval or safety verdict.
            </p>
          )}
          {issues && issues.length > 0 && (
            <div className="space-y-4 mt-4">
              {issues.map((issue, index) => <IssueCard key={index} issue={issue} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, onReset }) => {
  const [filter, setFilter] = useState<'all' | AnalysisStatus>('all');

  const noIssueCount = results.filter(r => r.result.status === 'no_issue_detected').length;
  const reviewCount = results.filter(r => r.result.status === 'review').length;
  const unknownCount = results.filter(r => r.result.status === 'unknown').length;

  const filteredResults = results.filter(r => filter === 'all' || r.result.status === filter);

  const handleExport = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `advisory-scan-results-${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-800/50 rounded-2xl shadow-lg border border-slate-700 p-6 md:p-8 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-cyan-400">Advisory review complete</h2>
        <p className="text-slate-400 mt-2">
          Reviewed <span className="font-bold text-slate-200">{results.length}</span> document(s):{' '}
          <span className="font-bold text-cyan-300">{noIssueCount}</span> with no mismatch detected,{' '}
          <span className="font-bold text-amber-300">{reviewCount}</span> suggested for review, and{' '}
          <span className="font-bold text-slate-300">{unknownCount}</span> not assessed.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-800/80 p-3 rounded-lg border border-slate-700">
        <div className="flex flex-wrap gap-2">
          {([
            ['all', 'All'],
            ['no_issue_detected', `No mismatch (${noIssueCount})`],
            ['review', `Review (${reviewCount})`],
            ['unknown', `Not assessed (${unknownCount})`],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === value ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={handleExport}
          className="flex items-center px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600 transition-colors border border-slate-600"
        >
          Export advisory JSON
        </button>
      </div>

      <div className="space-y-4">
        {filteredResults.length > 0 ? (
          filteredResults.map((res, index) => (
            <ResultCard key={`${res.fileName}-${index}`} fileResult={res} />
          ))
        ) : (
          <div className="text-center py-8 text-slate-500 italic">No documents match this filter.</div>
        )}
      </div>

      <button
        onClick={onReset}
        className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500"
      >
        Review more documents
      </button>
    </div>
  );
};
