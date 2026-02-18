import React, { useState } from 'react';
import type { FileAnalysisResult, Issue } from '../types';

interface ResultsDisplayProps {
  results: FileAnalysisResult[];
  onReset: () => void;
}

const IssueCard: React.FC<{ issue: Issue }> = ({ issue }) => (
  <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3">
    <div className="space-y-1">
      <h4 className="text-sm font-semibold text-slate-400">Textual Claim</h4>
      <p className="font-mono text-sm bg-slate-900 p-2 rounded text-rose-400">"{issue.text_claim}"</p>
    </div>
    <div className="space-y-1">
      <h4 className="text-sm font-semibold text-slate-400">Conflicting Structural Data</h4>
      <p className="font-mono text-sm bg-slate-900 p-2 rounded text-amber-400">"{issue.structural_reference}"</p>
    </div>
    <div className="space-y-1">
      <h4 className="text-sm font-semibold text-slate-400">Explanation</h4>
      <p className="text-slate-300 text-sm">{issue.explanation}</p>
    </div>
  </div>
);

const ResultCard: React.FC<{ fileResult: FileAnalysisResult }> = ({ fileResult }) => {
    const { fileName, result } = fileResult;
    const { isSafe, summary, issues } = result;
    const [isExpanded, setIsExpanded] = useState(!isSafe);

    return (
        <div className={`rounded-lg border ${isSafe ? 'border-green-500/30 bg-green-900/20' : 'border-rose-500/30 bg-rose-900/20'}`}>
            <button
                className="w-full flex justify-between items-center p-4 text-left"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
                aria-controls={`result-details-${fileName}`}
            >
                <div className="flex items-center space-x-3 overflow-hidden">
                    {isSafe ? (
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    )}
                    <div className="overflow-hidden">
                        <h3 className={`font-semibold truncate ${isSafe ? 'text-green-400' : 'text-rose-400'}`}>{isSafe ? 'Safe' : 'Threat Detected'}</h3>
                        <p className="text-sm text-slate-400 truncate">{fileName}</p>
                    </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-slate-400 transform transition-transform flex-shrink-0 ml-2 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isExpanded && (
                 <div id={`result-details-${fileName}`} className="px-4 pb-4 pt-2 border-t border-slate-700/50">
                    {isSafe ? (
                        <p className="text-slate-300 text-sm">{summary || "No structural inconsistencies or context-poisoning threats were detected."}</p>
                    ) : (
                         <div className="space-y-4">
                            <p className="text-slate-300 text-sm">
                                {summary || (issues && issues.length > 0 ? "The following structural mismatches were found and require review." : "A potential threat was detected, but no specific issues were detailed.")}
                            </p>
                            {issues?.map((issue, index) => <IssueCard key={index} issue={issue} />)}
                        </div>
                    )}
                 </div>
            )}
        </div>
    )
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, onReset }) => {
    const [filter, setFilter] = useState<'all' | 'safe' | 'threats'>('all');

    const safeCount = results.filter(r => r.result.isSafe).length;
    const threatCount = results.length - safeCount;

    const filteredResults = results.filter(r => {
        if (filter === 'all') return true;
        if (filter === 'safe') return r.result.isSafe;
        if (filter === 'threats') return !r.result.isSafe;
        return true;
    });

    const handleExport = () => {
        const dataStr = JSON.stringify(results, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `scan-results-${new Date().toISOString()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="w-full max-w-4xl mx-auto bg-slate-800/50 rounded-2xl shadow-lg border border-slate-700 p-6 md:p-8 space-y-6">
            <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-cyan-400">Analysis Complete</h2>
                <p className="text-slate-400 mt-2">
                    Scanned <span className="font-bold text-slate-200">{results.length}</span> document(s). 
                    Found <span className="font-bold text-green-400">{safeCount}</span> safe document(s) and <span className="font-bold text-rose-400">{threatCount}</span> potential threat(s).
                </p>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <div className="flex space-x-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'all' ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('safe')}
                         className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'safe' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                        Safe ({safeCount})
                    </button>
                    <button
                        onClick={() => setFilter('threats')}
                         className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'threats' ? 'bg-rose-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                        Threats ({threatCount})
                    </button>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600 transition-colors border border-slate-600"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export JSON
                </button>
            </div>

            <div className="space-y-4">
                {filteredResults.length > 0 ? (
                    filteredResults.map((res, index) => (
                        <ResultCard key={`${res.fileName}-${index}`} fileResult={res} />
                    ))
                ) : (
                    <div className="text-center py-8 text-slate-500 italic">
                        No documents match the selected filter.
                    </div>
                )}
            </div>

            <button
                onClick={onReset}
                className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500"
            >
                Scan More Documents
            </button>
        </div>
    );
};