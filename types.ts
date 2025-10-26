
export interface Issue {
  text_claim: string;
  structural_reference: string;
  explanation: string;
}

export interface AnalysisResult {
  isSafe: boolean;
  summary?: string;
  issues?: Issue[];
}

export interface FileAnalysisResult {
  fileName: string;
  result: AnalysisResult;
}

export enum AppState {
  Initial = 'initial',
  Loading = 'loading',
  Results = 'results',
  Error = 'error'
}
