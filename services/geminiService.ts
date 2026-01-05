import { GoogleGenAI } from "@google/genai";
import { VideoProject } from "../types";

const initAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateTitleIdeas = async (project: VideoProject): Promise<string[]> => {
  const ai = initAI();
  if (!ai) throw new Error("API Key missing");

  const prompt = `
    I am a YouTube creator working on a video titled: "${project.title}".
    Current description: "${project.metadata.description}".
    
    Please generate 5 high-CTR (Click Through Rate), clickbaity but honest YouTube video titles for this video.
    Return ONLY the titles as a plain text list, one per line. No numbers or bullet points.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    const text = response.text || '';
    return text.split('\n').filter(line => line.trim().length > 0);
  } catch (error) {
    console.error("Gemini Title Generation Error:", error);
    return ["Error generating titles. Please check API Key."];
  }
};

export const refineScript = async (script: string, tone: string): Promise<string> => {
    const ai = initAI();
    if (!ai) throw new Error("API Key missing");
  
    const prompt = `
      Act as a professional YouTube scriptwriter. 
      Refine the following script segment to be more engaging, concise, and optimized for viewer retention.
      Tone: ${tone}.
      
      Script:
      ${script}
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text || script;
    } catch (error) {
      console.error("Gemini Script Refine Error:", error);
      return script;
    }
  };
