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

    // Tre agenter, der håndterer spørgsmålet fra forskellige perspektiver
    const [internalQnA, externalFactFinding, agentResponse] = await Promise.all([
      openai.responses.create({
        model: "gpt-4.1-mini",
        input: `You are the Internal Q&A agent. Answer briefly using internal knowledge and concise reasoning about: ${message}`,
      }),
      openai.responses.create({
        model: "gpt-4.1-mini",
        input: `You are the External Fact-Finding agent. Bring relevant public information and facts related to: ${message}`,
      }),
      openai.responses.create({
        model: "gpt-4.1-mini",
        input: `You are a General Agent. Give a neutral summary and synthesis of the topic: ${message}`,
      }),
    ]);

    // Samlet svarstruktur
    const combinedOutput = {
      query: message,
      internal_answer: internalQnA.output_text,
      external_answer: externalFactFinding.output_text,
      general_summary: agentResponse.output_text,
      note: "This combines internal, external, and general reasoning layers.",
    };

    return NextResponse.json(combinedOutput);
  } catch (error: any) {
    console.error("Error in chat route:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
