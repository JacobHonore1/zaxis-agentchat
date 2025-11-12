import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

// Log om miljøvariablen er korrekt indlæst
console.log("🧠 OPENAI KEY LOADED:", !!process.env.OPENAI_API_KEY);

// Opret forbindelse til Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialiser OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // Hvis beskeden mangler
    if (!message) {
      console.error("⚠️ Ingen besked modtaget fra frontend");
      return NextResponse.json(
        { error: "Ingen besked modtaget" },
        { status: 400 }
      );
    }

    // Opret ny samtale (for test – kan senere kobles til bruger-id)
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .insert([{ agent_type: "default" }])
      .select()
      .single();

    if (convError) {
      console.error("❌ Fejl ved oprettelse af samtale:", convError.message);
      return NextResponse.json(
        { error: "Kunne ikke oprette samtale" },
        { status: 500 }
      );
    }

    // Gem brugerens besked i Supabase
    await supabase.from("messages").insert([
      {
        conversation_id: conversation.id,
        sender: "user",
        role: "user",
        content: message,
      },
    ]);

    console.log("📨 Brugerbesked gemt:", message);

    // Kald OpenAI med kontekst
    const messagesForAI = [
      {
        role: "system",
        content:
          "Du er en hjælpsom dansk assistent, som besvarer spørgsmål naturligt og præcist.",
      },
      { role: "user", content: message },
    ];

    // Kalder OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messagesForAI,
      temperature: 0.7,
    });

    const reply = completion.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      console.error("⚠️ Ingen svar fra OpenAI:", completion);
      return NextResponse.json(
        { error: "Ingen svar fra AI" },
        { status: 500 }
      );
    }

    console.log("🤖 AI svarer:", reply);

    // Gem AI-svar i Supabase
    await supabase.from("messages").insert([
      {
        conversation_id: conversation.id,
        sender: "assistant",
        role: "assistant",
        content: reply,
      },
    ]);

    // Returnér svaret til frontend
    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("💥 Fejl i /api/chat route:", {
      message: error.message,
      details: error.stack,
    });

    return NextResponse.json(
      { error: "Intern serverfejl – se logs for detaljer" },
      { status: 500 }
    );
  }
}
