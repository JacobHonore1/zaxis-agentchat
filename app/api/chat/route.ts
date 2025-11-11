import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

// Opret forbindelse til Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Opret forbindelse til OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { message, conversation_id } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Hvis der ikke findes et conversation_id, opret en ny samtale
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

    // Gem brugerens besked i databasen
    await supabase.from("messages").insert([
      {
        conversation_id: conversationId,
        sender: "user",
        role: "user",
        content: message,
      },
    ]);

    // Hent de seneste 10 beskeder for denne samtale
    const { data: recentMessages, error: fetchError } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(10);

    if (fetchError) throw fetchError;

    // Klargør chat-historikken til OpenAI
    const messagesForAI = recentMessages?.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })) || [];

    // Tilføj brugerens nye besked til slutningen
    messagesForAI.push({ role: "user", content: message });

    // Send hele samtaleforløbet til OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messagesForAI,
    });

    const reply = completion.choices[0].message.content;

    // Gem AI’ens svar i databasen
    await supabase.from("messages").insert([
      {
        conversation_id: conversationId,
        sender: "assistant",
        role: "assistant",
        content: reply,
      },
    ]);

    // Returnér AI’ens svar + samtale-id til frontend
    return NextResponse.json({
      reply,
      conversation_id: conversationId,
    });

  } catch (error) {
    console.error("Error in chat route:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
