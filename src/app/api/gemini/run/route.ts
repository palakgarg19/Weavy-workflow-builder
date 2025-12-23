import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

// --- 1. Define Zod Schema ---
const GenerateSchema = z.object({
  model: z.string().default("gemini-2.5-flash"),
  prompt: z.string().optional().default(""),
  systemInstruction: z.string().optional(),
  images: z.array(z.string()).optional(),
});

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // --- 2. Validate with Zod ---
    const parseResult = GenerateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parseResult.error.issues },
        { status: 400 }
      );
    }

    // Use the validated data
    let { model, prompt, images, systemInstruction } = parseResult.data;

    if (model.startsWith("models/")) {
      model = model.replace("models/", "");
    }

    // --- 3. Standard Gemini Logic ---
    const aiModel = genAI.getGenerativeModel({
      model,
      systemInstruction: systemInstruction ? { role: "system", parts: [{ text: systemInstruction }] } : undefined
    });

    const parts: any[] = [];

    // Add text if it exists
    if (prompt) {
      parts.push({ text: prompt });
    }

    // Add images if they exist
    if (images && images.length > 0) {
      images.forEach((img) => {
        if (img.includes("base64,")) {
          const base64Data = img.split(",")[1];
          parts.push({
            inlineData: {
              data: base64Data,
              mimeType: "image/jpeg",
            },
          });
        }
      });
    }

    // Guard
    if (parts.length === 0) {
      return NextResponse.json(
        { error: "Request must contain at least a prompt or an image." },
        { status: 400 }
      );
    }

    const result = await aiModel.generateContent(parts);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ output: text });

  } catch (error: any) {
    console.error("Gemini API Error details:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong with Gemini" },
      { status: 500 }
    );
  }
}