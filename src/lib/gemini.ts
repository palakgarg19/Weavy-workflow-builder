import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function runGemini(modelName: string, prompt: string, images: string[] = []) {
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
  }

  const model = genAI.getGenerativeModel({ model: modelName });

  // const imageParts = images.map(img => fileToGenerativePart(img, "image/jpeg")); // Implementation detail: need base64 handling
  // For now assuming images are base64 strings if passed
  const imageParts = images.map(base64 => ({
    inlineData: {
      data: base64.split(',')[1], // Remove "data:image/jpeg;base64," prefix
      mimeType: "image/jpeg" // Simplified assumption for demo
    }
  }));

  const result = await model.generateContent([prompt, ...imageParts]);
  return result.response.text();
}
