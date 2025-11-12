import { NextResponse } from "next/server";
import OpenAI, { type ChatCompletionMessageParam } from "openai";
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

    // Opret ny samtale, hvis ingen ID findes
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

    // Gem brugerens besked
    await supabase.from("messages").insert([
      {
        conversation_id: conversationId,
        sender: "user",
        role: "user",
        content: message,
      },
    ]);

    // Hent tidligere beskeder fra denne samtale
    const { data: recentMessages, error: fetchError } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(15);

    if (fetchError) throw fetchError;

    // Byg besked-array med korrekt type
    const messagesForAI: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content:
          "Du er Zaxis AgentChat – en AI-assistent der kan huske tidligere beskeder i denne samtale. Du gemmer alt i en database og kan derfor referere til, hvad brugeren tidligere har skrevet. Du skal svare på dansk, professionelt og kortfattet.",
      },
      ...(recentMessages || []).map(
        (msg) =>
          ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          }) as ChatCompletionMessageParam
      ),
      { role: "user", content: message } as ChatCompletionMessageParam,
    ];

    // Send til OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messagesForAI,
      temperature: 0.7,
    });

    const reply =
      completion?.choices?.[0]?.message?.content ||
      "Beklager, jeg kunne ikke generere et svar denne gang.";

    // Gem AI-svaret i databasen
    await supabase.from("messages").insert([
      {
        conversation_id: conversationId,
        sender: "assistant",
        role: "assistant",
        content: reply,
      },
    ]);

    // Returnér AI’ens svar
    return NextResponse.json({
      reply,
      conversation_id: conversationId,
    });
  } catch (error: any) {
    console.error("Error in /api/chat route:", error);
    return NextResponse.json(
      { error: error.message || "Unexpected error in chat route" },
      { status: 500 }
    );
  }
}
