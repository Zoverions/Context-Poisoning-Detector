
import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const systemInstruction = `You are a Structural Integrity Scanner for a Retrieval-Augmented Generation (RAG) system. Your task is to detect 'Context Poisoning' attacks, specifically 'Structural Spoofing'.

Analyze the provided document text. Identify any potential mismatches between stated facts in the text and any data presented in tables, lists, or other structured formats. For example, a sentence might claim 'Q1 profit was $10M', but a table in the document shows the Q1 profit as '$50M'. Also, look for misleading references or summaries.

You must respond in the specified JSON format.`;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    isSafe: {
      type: Type.BOOLEAN,
      description: "True if the document is safe, false if a potential issue is found."
    },
    summary: {
      type: Type.STRING,
      description: "A brief explanation of why the document is safe. Only present if isSafe is true."
    },
    issues: {
      type: Type.ARRAY,
      description: "A list of issues found. Only present if isSafe is false.",
      items: {
        type: Type.OBJECT,
        properties: {
          text_claim: {
            type: Type.STRING,
            description: "The specific claim made in the text that is suspicious."
          },
          structural_reference: {
            type: Type.STRING,
            description: "The conflicting data found in a table, list, or other structure."
          },
          explanation: {
            type: Type.STRING,
            description: "An explanation of the mismatch and why it is a potential threat."
          }
        },
        required: ["text_claim", "structural_reference", "explanation"]
      }
    }
  },
  required: ["isSafe"]
};

export const analyzeDocument = async (documentText: string): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: documentText,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    // Basic validation
    if (typeof result.isSafe !== 'boolean') {
      throw new Error("Invalid response format from API: isSafe is not a boolean.");
    }
    
    return result as AnalysisResult;

  } catch (error) {
    console.error("Error analyzing document:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to analyze document: ${error.message}`);
    }
    throw new Error("An unknown error occurred during analysis.");
  }
};
