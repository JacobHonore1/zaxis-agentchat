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

    // Gem brugerens besked
    const { error: insertError1 } = await supabaseServer
      .from("messages")
      .insert({
        conversation_id,
        sender: "user",
        content: message,
        role: "user",
      });

    if (insertError1) console.error("User message insert error:", insertError1);

    // Hent tidligere beskeder som kontekst
    const { data: history, error: fetchError } = await supabaseServer
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversation_id)
      .order("created_at", { ascending: true });

    if (fetchError) console.error("Fetch messages error:", fetchError);

    const messages = history || [];

    // Tilføj systemprompt og brugerens input
    const conversation = [
      { role: "system", content: "Du er en hjælpsom AI-assistent." },
      ...messages,
    ];

    // Kald OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: conversation,
    });

    const reply = completion.choices[0].message?.content || "";

    // Gem AI'ens svar
    const { error: insertError2 } = await supabaseServer
      .from("messages")
      .insert({
        conversation_id,
        sender: "assistant",
        content: reply,
        role: "assistant",
      });

    if (insertError2) console.error("Assistant message insert error:", insertError2);

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
