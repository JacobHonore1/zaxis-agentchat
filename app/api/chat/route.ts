import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

// === Environment checks ===
console.log("🧠 OPENAI KEY LOADED:", !!process.env.OPENAI_API_KEY);
console.log("🔑 SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("🔑 SUPABASE_SERVICE_ROLE_KEY findes:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

// === Validate environment ===
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Manglende Supabase environment variables!");
  throw new Error("SUPABASE_URL eller SUPABASE_SERVICE_ROLE_KEY mangler i Vercel environment.");
}

if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY mangler!");
  throw new Error("OPENAI_API_KEY mangler i environment.");
}

// === Setup clients ===
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// === API handler ===
export async function POST(req: Request) {
  try {
    const { message, conversation_id } = await req.json();

    if (!message) {
      console.warn("⚠️ Ingen besked modtaget fra frontend");
      return NextResponse.json({ error: "Ingen besked modtaget" }, { status: 400 });
    }

    // === Hent eller opret samtale ===
    let convId = conversation_id;
    if (!convId) {
      const { data: newConv, error: convError } = await supabase
        .from("conversations")
        .insert([{ agent_type: "default" }])
        .select()
        .single();

      if (convError) {
        console.error("❌ Fejl ved oprettelse af samtale:", convError);
        return NextResponse.json({ error: "Kunne ikke oprette samtale" }, { status: 500 });
      }
      convId = newConv.id;
    }

    // === Gem brugerens besked ===
    const { error: insertError } = await supabase.from("messages").insert([
      {
        conversation_id: convId,
        sender: "user",
        role: "user",
        content: message,
      },
    ]);

    if (insertError) {
      console.error("❌ Fejl ved indsættelse af brugerbesked:", insertError);
      return NextResponse.json({ error: "Kunne ikke gemme besked" }, { status: 500 });
    }

    // === Hent tidligere beskeder for hukommelse ===
    const { data: pastMessages, error: fetchError } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", convId)
      .order("id", { ascending: true });

    if (fetchError) {
      console.error("⚠️ Kunne ikke hente tidligere beskeder:", fetchError);
    }

    // === Byg kontekst til OpenAI ===
    const history = (pastMessages || []).map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    }));

    // Tilføj systemprompt og ny besked
    const messagesForAI = [
      { role: "system", content: "Du er en hjælpsom dansk assistent, der husker konteksten af samtaler." },
      ...history,
      { role: "user", content: message },
    ];

    console.log(`🧩 Sender ${messagesForAI.length} beskeder til OpenAI (inkl. historik)`);

    // === Kald OpenAI ===
    let reply: string | undefined;
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messagesForAI as any,
        temperature: 0.7,
      });
      reply = completion.choices?.[0]?.message?.content?.trim();
      console.log("🤖 AI svarer:", reply);
    } catch (apiError: any) {
      console.error("🚨 OpenAI fejlede:", apiError);
      reply = "Beklager, jeg kunne ikke få svar fra OpenAI.";
    }

    if (!reply) reply = "Beklager, jeg har ikke noget svar denne gang.";

    // === Gem AI’s svar ===
    await supabase.from("messages").insert([
      {
        conversation_id: convId,
        sender: "assistant",
        role: "assistant",
        content: reply,
      },
    ]);

    return NextResponse.json({ reply, conversation_id: convId });
  } catch (error: any) {
    console.error("💥 Fejl i /api/chat route:", {
      message: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      { error: "Intern serverfejl – se logs for detaljer" },
      { status: 500 }
    );
  }
}
