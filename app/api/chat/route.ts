import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseServer } from "@/lib/supabaseClient";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { conversation_id, message } = await req.json();

    if (!conversation_id || !message) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // Gem brugerens besked i Supabase
    await supabaseServer.from("messages").insert([
      {
        conversation_id,
        sender: "user",
        content: message,
        role: "user",
      },
    ]);

    // Hent tidligere beskeder for kontekst
    const { data: pastMessages } = await supabaseServer
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversation_id)
      .order("created_at", { ascending: true });

    const messages = pastMessages || [];

    // Tilføj den nye besked til konteksten
    const conversation = [
      { role: "system", content: "Du er en hjælpsom AI-assistent." },
      ...messages,
    ];

    // Få svar fra OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: conversation,
    });

    const reply = completion.choices[0].message?.content || "";

    // Gem AI-svaret i Supabase
    await supabaseServer.from("messages").insert([
      {
        conversation_id,
        sender: "assistant",
        content: reply,
        role: "assistant",
      },
    ]);

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
