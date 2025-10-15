import OpenAI from "openai";
import { NextResponse } from "next/server";

// (valgfrit) hurtigere cold start
export const runtime = "edge"; // eller fjern linjen hvis du vil køre Node runtime

type Msg = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as { messages: Msg[] };

    if (!process.env.OPENAI_API_KEY) {
      return new NextResponse("Missing OPENAI_API_KEY", { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Brug en billig, hurtig model – kan skiftes til fx gpt-4o, o4-mini, osv.
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: 0.7
    });

    const reply = completion.choices[0]?.message?.content ?? "Tomt svar.";
    return NextResponse.json({ reply });
  } catch (err: any) {
    const message = typeof err?.message === "string" ? err.message : "Server error";
    return new NextResponse(message, { status: 500 });
  }
}
