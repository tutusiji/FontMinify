
import { GoogleGenAI } from "@google/genai";

export async function analyzeFontProject(fontName: string, text: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Analyze the following font subset request:
    Font Name: ${fontName}
    Text to Subset: "${text}"
    
    Provide a professional assessment including:
    1. The visual personality of a font like this.
    2. Best use cases for the specific text provided (e.g., Header, Branding, UI).
    3. A short, creative CSS snippet for a modern hover effect using this subset.
    
    Return the response as a clear, concise markdown string.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "AI analysis unavailable at this moment.";
  }
}
