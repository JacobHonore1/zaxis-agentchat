// app/api/chat/route.ts
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
      apiKey: process.env.OPENAI_API_KEY, // husk at sætte den i Vercel
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Du er en hjælpsom dansk assistent." },
        { role: "user", content: message },
      ],
      temperature: 0.7,
    });

    const reply =
      completion.choices?.[0]?.message?.content?.trim() ??
      "Jeg kunne ikke generere et svar.";

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error("API error:", err);
    const msg = err?.message || "Ukendt serverfejl";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
