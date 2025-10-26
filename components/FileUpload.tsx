import React, { useState, useCallback } from 'react';

interface FileUploadProps {
  onAnalyze: (files: File[]) => void;
  isLoading: boolean;
  progressText: string;
}

const placeholderText = `Paste document text here. For example:

Acme Corp Q1 2024 Financial Report

Introduction:
This quarter has been a period of significant growth for Acme Corp. Following our strategic initiatives, the first quarter profit was an outstanding $50M, setting a new record for the company.

Financials Summary:
| Metric        | Value  |
|---------------|--------|
| Revenue       | $120M  |
| Profit        | $10M   |
| Expenses      | $110M  |

(This is an example of a structural spoofing attack. The text claims a $50M profit, but the table correctly shows $10M. An AI ingesting this could be poisoned with the wrong context.)
`;


export const FileUpload: React.FC<FileUploadProps> = ({ onAnalyze, isLoading, progressText }) => {
  const [documentText, setDocumentText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setDocumentText('');
      setSelectedFiles(Array.from(files));
    }
     // Reset file input value to allow re-uploading the same file
    event.target.value = '';
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setDocumentText(event.target.value);
      if (event.target.value) {
          setSelectedFiles([]);
      }
  }

  const handleRemoveFile = (fileNameToRemove: string) => {
    setSelectedFiles(prevFiles => prevFiles.filter(file => file.name !== fileNameToRemove));
  };

  const handleSubmit = useCallback(() => {
    if (isLoading) return;

    if (selectedFiles.length > 0) {
      onAnalyze(selectedFiles);
    } else if (documentText.trim()) {
      const blob = new Blob([documentText], { type: 'text/plain' });
      const file = new File([blob], "Pasted Text.txt", { type: "text/plain" });
      onAnalyze([file]);
    }
  }, [documentText, selectedFiles, isLoading, onAnalyze]);
  
  const canSubmit = !isLoading && (selectedFiles.length > 0 || documentText.trim().length > 0);

  return (
    <div className="w-full max-w-3xl mx-auto bg-slate-800/50 rounded-2xl shadow-lg border border-slate-700 p-6 md:p-8 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-cyan-400">Structural Integrity Scanner</h2>
        <p className="text-slate-400 mt-2">Upload or paste document content to scan for context-poisoning vulnerabilities.</p>
      </div>

      <div className="space-y-4">
        <label htmlFor="file-upload" className="block text-sm font-medium text-slate-300">Upload one or more files (.txt, .docx, .md)</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md hover:border-cyan-500 transition-colors">
          <div className="space-y-1 text-center">
            <svg className="mx-auto h-12 w-12 text-slate-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="flex text-sm text-slate-400">
              <label htmlFor="file-upload" className="relative cursor-pointer bg-slate-800 rounded-md font-medium text-cyan-400 hover:text-cyan-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-slate-900 focus-within:ring-cyan-500">
                <span>Upload files</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".txt,.docx,.md" onChange={handleFileChange} multiple />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-slate-500">Plain text, DOCX, and Markdown files are supported</p>
          </div>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-300">Selected Files:</h3>
            <ul className="border border-slate-700 rounded-md divide-y divide-slate-700 max-h-40 overflow-y-auto">
                {selectedFiles.map(file => (
                    <li key={file.name} className="px-3 py-2 flex items-center justify-between text-sm bg-slate-800/50">
                        <span className="text-slate-300 truncate pr-2">{file.name}</span>
                        <button onClick={() => handleRemoveFile(file.name)} className="text-slate-500 hover:text-rose-400 transition-colors flex-shrink-0">
                             <span className="sr-only">Remove {file.name}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
      )}
        
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-slate-700" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-slate-800/50 px-2 text-sm text-slate-500">OR</span>
        </div>
      </div>

      <div>
        <label htmlFor="text-input" className="block text-sm font-medium text-slate-300">Paste document text</label>
        <textarea
          id="text-input"
          value={documentText}
          onChange={handleTextChange}
          placeholder={placeholderText}
          className="mt-1 block w-full h-64 bg-slate-900/70 border border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-slate-300 placeholder:text-slate-600 resize-none"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? (
            <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{progressText || 'Analyzing...'}</span>
            </>
        ) : `Scan ${selectedFiles.length > 0 ? `${selectedFiles.length} File(s)` : 'Document'}`}
      </button>
    </div>
  );
};