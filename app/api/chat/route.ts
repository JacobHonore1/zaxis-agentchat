import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body?.messages ?? [];

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // sættes i Vercel
    });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // hurtigt og billigt; skift efter behov
      messages: [
        { role: "system", content: "Du er en hjælpsom dansk assistent." },
        ...messages,
      ],
      temperature: 0.3,
    });

    const reply = completion.choices[0]?.message ?? { role: "assistant", content: "…" };
    return Response.json({ reply });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message ?? "Serverfejl" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
