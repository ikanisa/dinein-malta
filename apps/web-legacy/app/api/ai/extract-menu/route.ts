import { NextRequest, NextResponse } from "next/server";
import { ocrModel } from "@/lib/ai/gemini";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const venueId = formData.get("venueId") as string;

        if (!file || !venueId) {
            return NextResponse.json({ error: "Missing file or venueId" }, { status: 400 });
        }

        // Convert file to base64
        const arrayBuffer = await file.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString("base64");
        const mimeType = file.type;

        const prompt = `
            Analyze this menu image and extract all menu items.
            Return a JSON array where each object has:
            - name: string
            - description: string (or null)
            - price: number (just the value)
            - currency: string (e.g. "RWF", "USD")
            - category: string (infer from headers like "Starters", "Main Course", etc.)
            - dietary_tags: string[] (infer from symbols or descriptions, e.g. "Vegetarian", "Spicy")
            
            Example format:
            [
                { "name": "Burger", "description": "Juicy beef", "price": 5000, "currency": "RWF", "category": "Burgers", "dietary_tags": [] }
            ]
        `;

        const result = await ocrModel.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                }
            }
        ]);

        const response = result.response;
        const text = response.text();

        // Clean markdown code blocks if present
        const jsonStr = text.replace(/```json\n?|```/g, "").trim();
        const menuItems = JSON.parse(jsonStr);

        return NextResponse.json({ items: menuItems });

    } catch (error) {
        console.error("OCR Error:", error);
        return NextResponse.json({ error: "Failed to process image" }, { status: 500 });
    }
}
