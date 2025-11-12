import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { message, conversation_id } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Tjek / opret samtale
    let conversationId = conversation_id;
    if (!conversationId) {
      const { data, error } = await supabase
        .from("conversations")
        .insert([{ agent_type: "assistant" }])
        .select("id")
        .single();

      if (error) throw error;
      conversationId = data.id;
    }

    // Gem brugerbesked
    await supabase.from("messages").insert([
      {
        conversation_id: conversationId,
        sender: "user",
        role: "user",
        content: message,
      },
    ]);

    // Hent tidligere beskeder
    const { data: recentMessages } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(10);

    const messagesForAI = (recentMessages || []).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    messagesForAI.push({ role: "user", content: message });

    // OpenAI kald med sikkerhedsnet
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messagesForAI,
      temperature: 0.7,
    });

    const reply =
      completion?.choices?.[0]?.message?.content ||
      "Beklager, jeg kunne ikke generere et svar.";

    // Gem AI-svar
    await supabase.from("messages").insert([
      {
        conversation_id: conversationId,
        sender: "assistant",
        role: "assistant",
        content: reply,
      },
    ]);

    return NextResponse.json({ reply, conversation_id: conversationId });
  } catch (error: any) {
    console.error("Error in route:", error);
    return NextResponse.json(
      { error: error.message || "Unexpected error in chat" },
      { status: 500 }
    );
  }
}
