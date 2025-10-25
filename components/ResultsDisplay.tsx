
import React from 'react';
import type { AnalysisResult, Issue } from '../types';

interface ResultsDisplayProps {
  result: AnalysisResult;
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

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, onReset }) => {
  const { isSafe, summary, issues } = result;

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-800/50 rounded-2xl shadow-lg border border-slate-700 p-6 md:p-8 space-y-6">
      {isSafe ? (
        <div className="text-center p-6 bg-green-900/20 border border-green-500/30 rounded-lg">
          <div className="flex justify-center items-center mb-4">
            <div className="bg-green-500/20 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-green-400">Document is Safe</h2>
          <p className="text-slate-300 mt-2">{summary || "No structural inconsistencies or context-poisoning threats were detected."}</p>
        </div>
      ) : (
        <div className="p-6 bg-rose-900/20 border border-rose-500/30 rounded-lg">
           <div className="text-center">
             <div className="flex justify-center items-center mb-4">
                <div className="bg-rose-500/20 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-rose-400">Potential Context Poisoning Detected</h2>
              <p className="text-slate-300 mt-2">The following structural mismatches were found and require review.</p>
           </div>
          <div className="mt-6 space-y-4">
            {issues?.map((issue, index) => <IssueCard key={index} issue={issue} />)}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-700">
        {!isSafe && (
            <>
                <button className="w-full sm:w-auto flex-1 order-2 sm:order-1 py-2 px-4 border border-amber-500 rounded-md shadow-sm text-sm font-medium text-amber-400 hover:bg-amber-500/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-amber-500">
                Quarantine
                </button>
                <button className="w-full sm:w-auto flex-1 order-1 sm:order-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-slate-900 bg-slate-300 hover:bg-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-slate-400">
                Approve Anyway
                </button>
            </>
        )}
      </div>

       <button
        onClick={onReset}
        className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500"
      >
        Scan Another Document
      </button>
    </div>
  );
};
