import { NextResponse } from "next/server";
import OpenAI from "openai";
import { DriveFile } from "../../../types/DriveFile";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const { message, agent, file }: { message: string; agent: string; file?: DriveFile } =
      await req.json();

    let systemPrompt = "Du er en hjælpsom assistent.";
    let fileContext = "";

    if (file?.text) {
      fileContext =
        `Her er kontekst fra dokumentet "${file.name}":\n\n` +
        file.text.slice(0, 12000) +
        "\n\n---\n\n";
    }

    const prompt = fileContext + message;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ]
    });

    return NextResponse.json({
      reply: completion.choices[0].message.content
    });
  } catch (err: any) {
    console.error("CHAT API FEJL:", err);
    return NextResponse.json(
      { error: err.message || "Ukendt serverfejl" },
      { status: 500 }
    );
  }
}
