import { NextRequest, NextResponse } from "next/server";
import { InferenceClient } from "@huggingface/inference";
import { z } from "zod";

// Define Zod Schema
const HuggingFaceSchema = z.object({
    model: z.string(),
    prompt: z.string(),
    task: z.enum(["text-to-image", "image-to-image"]).default("text-to-image"),
    imageInput: z.string().optional(),
});

// Initialize HuggingFace Client
const hf = new InferenceClient(process.env.HF_TOKEN);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate with Zod
        const parseResult = HuggingFaceSchema.safeParse(body);

        if (!parseResult.success) {
            return NextResponse.json(
                { error: "Invalid request data", details: parseResult.error.issues },
                { status: 400 }
            );
        }

        const { model, prompt, task } = parseResult.data;

        if (task === "text-to-image") {
            const blob = await hf.textToImage({
                model,
                inputs: prompt,
            });

            // Convert Blob to Buffer
            const arrayBuffer = await (blob as any).arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            return new NextResponse(buffer, {
                headers: {
                    "Content-Type": "image/jpeg",
                    "Content-Length": buffer.length.toString(),
                },
            });
        }

        return NextResponse.json(
            { error: "Image-to-image not supported yet" },
            { status: 400 }
        );

    } catch (error: any) {
        console.error("HuggingFace API Error:", error);

        // Enhanced error messages
        if (error.message?.includes('429') || error.status === 429) {
            return NextResponse.json(
                { error: "HuggingFace quota exceeded. Please try again later." },
                { status: 429 }
            );
        }

        if (error.message?.includes('401') || error.status === 401) {
            return NextResponse.json(
                { error: "Invalid HuggingFace token. Please check your HF_TOKEN in .env.local" },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: error.message || "HuggingFace API request failed" },
            { status: 500 }
        );
    }
}
