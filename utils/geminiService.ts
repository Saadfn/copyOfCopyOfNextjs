
import { GoogleGenAI, Type } from "@google/genai";

export interface AnalysisResult {
  summary: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  suggestions: string[];
}

export const analyzeMedicalRecord = async (symptoms: string, history: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{
      parts: [
        {
          text: `Analyze the following patient data for a doctor's assistance. 
    Symptoms: ${symptoms}
    History: ${history}`
        }
      ]
    }],
    config: {
      systemInstruction: "You are a professional medical diagnostic assistant. Provide a structured summary, risk assessment, and actionable suggestions based on symptoms and history. Do not provide a definitive diagnosis, use cautious language.",
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 32768 },
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          riskLevel: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] },
          suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["summary", "riskLevel", "suggestions"]
      }
    }
  });

  try {
    const jsonStr = response.text?.trim() || "{}";
    return JSON.parse(jsonStr);
  } catch (e) {
    return {
      summary: "Error analyzing medical data structure.",
      riskLevel: "LOW",
      suggestions: ["Consult a senior specialist for manual review."]
    };
  }
};
