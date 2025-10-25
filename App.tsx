
import React, { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { ResultsDisplay } from './components/ResultsDisplay';
import { analyzeDocument } from './services/geminiService';
import { AppState } from './types';
import type { AnalysisResult } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.Initial);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async (text: string) => {
    setAppState(AppState.Loading);
    setError(null);
    try {
      const result = await analyzeDocument(text);
      setAnalysisResult(result);
      setAppState(AppState.Results);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      setAppState(AppState.Error);
    }
  }, []);

  const handleReset = useCallback(() => {
    setAppState(AppState.Initial);
    setAnalysisResult(null);
    setError(null);
  }, []);

  const renderContent = () => {
    switch (appState) {
      case AppState.Initial:
      case AppState.Loading:
        return <FileUpload onAnalyze={handleAnalyze} isLoading={appState === AppState.Loading} />;
      case AppState.Results:
        return analysisResult && <ResultsDisplay result={analysisResult} onReset={handleReset} />;
      case AppState.Error:
        return (
          <div className="w-full max-w-3xl mx-auto text-center bg-rose-900/30 border border-rose-500/50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-rose-400">Analysis Failed</h2>
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
                Safeguarding RAG systems against structural spoofing attacks.
            </p>
        </header>
        <main className="flex justify-center">
            {renderContent()}
        </main>
      </div>
       <footer className="text-center py-8 text-slate-500 text-sm">
        <p>Powered by Gemini. Built for enterprise-grade AI security.</p>
      </footer>
    </div>
  );
};

export default App;
