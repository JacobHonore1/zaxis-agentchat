import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: 'Missing "message" (string) in request body' },
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Simpelt kald – du kan bygge videre her senere med flere agenter
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // stabil og hurtig
      messages: [
        {
          role: "system",
          content:
            "You are Zaxis AI Agent. You provide clear, helpful, and professional answers in concise text.",
        },
        { role: "user", content: message },
      ],
    });

    // Udpak svaret fra OpenAI
    const reply = completion.choices[0]?.message?.content || "No response generated.";

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
