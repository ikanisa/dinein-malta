import { NextRequest, NextResponse } from "next/server";
import { geminiModel } from "@/lib/ai/gemini";

export async function POST(req: NextRequest) {
    try {
        const { messages, venueName, menuContext } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Messages array required" }, { status: 400 });
        }

        // Construct history from previous messages
        const history = messages.slice(0, -1).map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
        }));

        const lastMessage = messages[messages.length - 1].content;

        const chat = geminiModel.startChat({
            history: [
                {
                    role: "user",
                    parts: [{
                        text: `System: You are a helpful waiter assistant for the restaurant "${venueName}". 
                    Here is the menu context:\n${menuContext}\n
                    Answer customer questions based ONLY on this menu. If asked about items not on the menu, politely say you don't offer them.
                    Be concise, friendly, and helpful. Recommend items if asked about flavors (scency, spicy, vegan, etc).` }]
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I am ready to help guests with the menu." }]
                },
                ...history
            ],
            generationConfig: {
                maxOutputTokens: 200, // Keep answers concise
            },
        });

        const result = await chat.sendMessage(lastMessage);
        const responseText = result.response.text();

        return NextResponse.json({ role: 'assistant', content: responseText });

    } catch (error) {
        console.error("Chat Error:", error);
        return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
    }
}
