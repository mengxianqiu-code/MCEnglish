import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateMinecraftSentence(word: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an English teacher for a middle school student who loves Minecraft. 
      Generate a short, simple English example sentence using the word "${word}". 
      The sentence MUST be themed around Minecraft (e.g., mining, crafting, creepers, diamonds, surviving).
      Also provide the Chinese translation.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentence: { type: Type.STRING, description: "The English example sentence about Minecraft" },
            translation: { type: Type.STRING, description: "The Chinese translation of the sentence" }
          },
          required: ["sentence", "translation"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Error generating sentence:", error);
    return null;
  }
}
