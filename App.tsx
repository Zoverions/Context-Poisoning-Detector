import React, { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { ResultsDisplay } from './components/ResultsDisplay';
import { analyzeDocument } from './services/geminiService';
import { AppState } from './types';
import { parseFile } from './utils/fileParsers';
import type { FileAnalysisResult } from './types';

const unknownResult = (summary: string) => ({
  status: 'unknown' as const,
  summary,
  issues: [],
});

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.Initial);
  const [analysisResults, setAnalysisResults] = useState<FileAnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progressText, setProgressText] = useState<string>('');

  const handleAnalyze = useCallback(async (files: File[]) => {
    setAppState(AppState.Loading);
    setError(null);
    setAnalysisResults([]);
    const results: FileAnalysisResult[] = [];

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      try {
        setProgressText(`Extracting "${file.name}" (${i + 1} of ${files.length})...`);
        const text = await parseFile(file);

        if (!text.trim()) {
          results.push({
            fileName: file.name,
            result: unknownResult(
              'No extractable text was found. This file was not assessed and requires separate review.',
            ),
          });
          continue;
        }

        setProgressText(`Advisory review of "${file.name}" (${i + 1} of ${files.length})...`);
        const analysisResult = await analyzeDocument(text);
        results.push({ fileName: file.name, result: analysisResult });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        results.push({
          fileName: file.name,
          result: unknownResult(`Unable to assess this file: ${errorMessage}`),
        });
      }
    }

    setAnalysisResults(results);
    setAppState(AppState.Results);
    setProgressText('');
  }, []);

  const handleReset = useCallback(() => {
    setAppState(AppState.Initial);
    setAnalysisResults([]);
    setError(null);
    setProgressText('');
  }, []);

  const renderContent = () => {
    switch (appState) {
      case AppState.Initial:
      case AppState.Loading:
        return (
          <FileUpload
            onAnalyze={handleAnalyze}
            isLoading={appState === AppState.Loading}
            progressText={progressText}
          />
        );
      case AppState.Results:
        return analysisResults.length > 0 && (
          <ResultsDisplay results={analysisResults} onReset={handleReset} />
        );
      case AppState.Error:
        return (
          <div className="w-full max-w-3xl mx-auto text-center bg-rose-900/30 border border-rose-500/50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-rose-400">Unable to continue</h2>
            <p className="text-slate-300 mt-2">{error}</p>
            <button
              onClick={handleReset}
              className="mt-6 py-2 px-5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500"
            >
              Try Again
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 selection:bg-cyan-300 selection:text-cyan-900">
      <div className="w-full p-4">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-cyan-400">
            Context-Poisoning Detector
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-slate-400">
            Experimental RAG ingestion triage for spotting internal prose-versus-structure mismatches.
          </p>
          <p className="mt-2 max-w-2xl mx-auto text-sm text-amber-300/90">
            Advisory only. “No mismatch detected” is not proof that a document is safe or trustworthy.
          </p>
        </header>
        <main className="flex justify-center">{renderContent()}</main>
      </div>
      <footer className="text-center py-8 text-slate-500 text-sm max-w-3xl">
        <p>Model output is untrusted evidence for human review, not an autonomous security decision.</p>
      </footer>
    </div>
  );
};

export default App;
