import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

// Opret forbindelse til Supabase (server side)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Opret forbindelse til OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { message, conversation_id } = await req.json();
    const convId = conversation_id || uuidv4();

    // Sørg for at samtalen eksisterer
    const { error: convError } = await supabase
      .from("conversations")
      .upsert([{ id: convId, agent_type: "default" }]);

    if (convError) {
      console.error("Fejl ved oprettelse af samtale:", convError);
      return NextResponse.json({ error: "Databasefejl (conversation)" }, { status: 500 });
    }

    // Gem brugerens besked
    const { error: userError } = await supabase.from("messages").insert([
      {
        id: uuidv4(),
        conversation_id: convId,
        sender: "user",
        content: message,
        role: "user",
      },
    ]);

    if (userError) {
      console.error("Fejl ved indsættelse af brugerbesked:", userError);
      return NextResponse.json({ error: "Databasefejl (user message)" }, { status: 500 });
    }

    // Send besked til OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Du er en hjælpsom dansk assistent." },
        { role: "user", content: message },
      ],
    });

    const aiMessage = completion.choices[0].message.content || "Jeg har ingen data lige nu.";

    // Gem AI's svar i Supabase
    const { error: aiError } = await supabase.from("messages").insert([
      {
        id: uuidv4(),
        conversation_id: convId,
        sender: "assistant",
        content: aiMessage,
        role: "assistant",
      },
    ]);

    if (aiError) {
      console.error("Fejl ved indsættelse af AI-svar:", aiError);
    }

    // Returnér svar til frontend
    return NextResponse.json({
      reply: aiMessage,
      conversation_id: convId,
    });
  } catch (err) {
    console.error("Fejl i /api/chat:", err);
    return NextResponse.json({ error: "Intern serverfejl" }, { status: 500 });
  }
}
