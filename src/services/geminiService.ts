import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateSeasonImage(season: string, prompt: string = "") {
  const basePrompt = `A RAW, unedited, real-life photograph of ${season} in Korea. This must be a genuine, non-AI-looking photo, like something found on a travel blog or a personal smartphone gallery. Avoid any "AI-style" perfection, smoothing, or dramatic digital lighting. It should have natural imperfections, realistic lens characteristics, and the authentic atmosphere of a real place in Korea (e.g., a busy street in Seoul, a quiet mountain path, or a local park). Focus on 100% photorealism. ${prompt}`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: {
      parts: [
        {
          text: basePrompt,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: "1K"
      },
      tools: [
        {
          googleSearch: {
            searchTypes: {
              webSearch: {},
              imageSearch: {},
            }
          },
        },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
}

export async function editSeasonImage(base64Image: string, editPrompt: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image.split(',')[1],
            mimeType: "image/png",
          },
        },
        {
          text: `Modify this photo while maintaining 100% realism: ${editPrompt}. The result must look like a real, unedited photograph with natural lighting and no AI artifacts.`,
        },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
}
