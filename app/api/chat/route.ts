// app/api/chat/route.ts
import OpenAI from "openai";

export const runtime = "edge"; // hurtig & billig på Vercel

type Msg = { role: "user" | "assistant" | "system"; content: string };

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as { messages: Msg[] };

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY mangler i miljøvariabler." }),
        { status: 500, headers: { "content-type": "application/json" } }
      );
    }

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Du er en hjælpsom dansk assistent." },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.7,
    });

    const reply =
      completion.choices[0]?.message?.content ??
      "Jeg kunne ikke generere et svar.";

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message ?? "Ukendt serverfejl." }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
