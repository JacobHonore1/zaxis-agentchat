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

    // Tre asynkrone agenter
    const [internalQnA, externalFactFinding, agentResponse] = await Promise.all([
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are the Internal Q&A agent. Answer using internal reasoning." },
          { role: "user", content: message },
        ],
      }),
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are the External Fact-Finding agent. Use factual external context." },
          { role: "user", content: message },
        ],
      }),
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a General Summary agent. Combine and summarize clearly." },
          { role: "user", content: message },
        ],
      }),
    ]);

    // Udpak tekst fra hvert svar
    const internal = internalQnA.choices[0]?.message?.content ?? "No internal response";
    const external = externalFactFinding.choices[0]?.message?.content ?? "No external response";
    const summary = agentResponse.choices[0]?.message?.content ?? "No summary";

    const combinedOutput = {
      query: message,
      internal_answer: internal,
      external_answer: external,
      general_summary: summary,
      note: "Combined insights from three parallel agents.",
    };

    return NextResponse.json(combinedOutput);
  } catch (error: any) {
    console.error("Error in chat route:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
