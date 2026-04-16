import { GoogleGenAI, Type } from "@google/genai";
import { Tone } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function transformText(text: string, tone: Tone) {
  const toneInstructions: Record<Tone, string> = {
    friendly: "Make it warm, approachable, and casual but still respectful.",
    formal: "Make it strictly professional, using formal language and standard corporate etiquette.",
    professor: "Make it academic, highly respectful, and clear. Use appropriate honorifics if necessary.",
    boss: "Make it professional, concise, and results-oriented. Show initiative and respect for their time.",
    partner: "Make it gentle, empathetic, and clear. Focus on constructive communication and emotional intelligence."
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Transform the following blunt or unprofessional text into a professional, polite, and editorial-grade correspondence. 
    Target Tone/Audience: ${tone}. 
    Specific Instructions: ${toneInstructions[tone]}

    Provide the result in JSON format with the following fields:
    - politeText: The transformed text.
    - toneInsight: A brief explanation of why this transformation works for the specific tone/audience.
    - editorialScore: A score from 0 to 100 representing the professional quality.
    - tags: An array of 2-3 descriptive tags (e.g., "Professional", "Softened", "Concise").

    Original text: "${text}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          politeText: { type: Type.STRING },
          toneInsight: { type: Type.STRING },
          editorialScore: { type: Type.NUMBER },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["politeText", "toneInsight", "editorialScore", "tags"]
      }
    }
  });

  return JSON.parse(response.text);
}
