import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseServer } from "@/lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message, conversation_id } = await req.json();

    // Opret samtale hvis ingen eksisterer
    let convId = conversation_id || uuidv4();

    // Gem brugerens besked i Supabase
    await supabaseServer.from("messages").insert([
      {
        id: uuidv4(),
        conversation_id: convId,
        sender: "user",
        content: message,
        role: "user",
      },
    ]);

    // Send til OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Du er en hjælpsom dansk assistent." },
        { role: "user", content: message },
      ],
    });

    const aiMessage = completion.choices[0].message.content;

    // Gem AI’ens svar
    await supabaseServer.from("messages").insert([
      {
        id: uuidv4(),
        conversation_id: convId,
        sender: "assistant",
        content: aiMessage,
        role: "assistant",
      },
    ]);

    return NextResponse.json({ reply: aiMessage, conversation_id: convId });
  } catch (error) {
    console.error("Fejl i /api/chat:", error);
    return NextResponse.json({ error: "Noget gik galt." }, { status: 500 });
  }
}
