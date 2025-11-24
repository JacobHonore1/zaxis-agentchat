import { NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, agent } = body;

    console.log("=== API REQUEST ===");
    console.log("Agent:", agent);
    console.log("Message:", message);

    // Løsning B — Fast fil pr agent
    const agentFile = path.join(process.cwd(), `docs/agents/${agent}.md`);

    let agentInstruction = "Ingen instruktionsfil fundet.";
    if (fs.existsSync(agentFile)) {
      agentInstruction = fs.readFileSync(agentFile, "utf-8");
    }

    console.log("Agent instruktion fundet:", fs.existsSync(agentFile));

    // System prompt
    const systemPrompt = `
Du er agenten "${agent}".

AGENT SPECIFIKKE INSTRUKTIONER:
${agentInstruction}
`.trim();

    console.log("SYSTEM PROMPT SENDT TIL OPENAI:\n", systemPrompt);

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.4
    });

    const aiReply = response.choices[0].message?.content || "";

    console.log("MODEL SVAR:", aiReply);

    return NextResponse.json({ reply: aiReply });

  } catch (err) {
    console.error("SERVER FEJL:", err);
    return NextResponse.json(
      { error: "Serverfejl", details: String(err) },
      { status: 500 }
    );
  }
}
