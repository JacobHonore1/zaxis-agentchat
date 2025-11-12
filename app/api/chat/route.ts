import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

// === ENVIRONMENT CHECKS ===
console.log("🧠 OPENAI KEY LOADED:", !!process.env.OPENAI_API_KEY);
console.log("🔑 SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("🔑 SUPABASE_SERVICE_ROLE_KEY findes:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

// === Validate that all critical env vars exist ===
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Manglende Supabase environment variables!");
  throw new Error("SUPABASE_URL eller SUPABASE_SERVICE_ROLE_KEY mangler i Vercel environment.");
}

if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY mangler i environment!");
  throw new Error("OPENAI_API_KEY mangler i Vercel environment.");
}

// === Setup clients ===
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// === API route handler ===
export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      console.warn("⚠️ Ingen besked modtaget fra frontend");
      return NextResponse.json({ error: "Ingen besked modtaget" }, { status: 400 });
    }

    // Test Supabase connection first
    try {
      const { data: testData, error: testError } = await supabase.from("messages").select("*").limit(1);
      if (testError) throw testError;
      console.log("✅ Supabase forbindelse OK");
    } catch (dbTestErr) {
      console.error("❌ Supabase fetch test fejlede:", dbTestErr);
      return NextResponse.json({ error: "Fejl ved forbindelse til Supabase – tjek env vars" }, { status: 500 });
    }

    // Create a new conversation entry
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .insert([{ agent_type: "default" }])
      .select()
      .single();

    if (convError) {
      console.error("❌ Fejl ved oprettelse af samtale:", convError);
      return NextResponse.json({ error: "Kunne ikke oprette samtale i databasen" }, { status: 500 });
    }

    // Insert user message
    await supabase.from("messages").insert([
      {
        conversation_id: conversation.id,
        sender: "user",
        role: "user",
        content: message,
      },
    ]);

    console.log("📨 Brugerbesked gemt:", message);

    // Prepare messages for AI
    const messagesForAI = [
      { role: "system", content: "Du er en hjælpsom dansk assistent." },
      { role: "user", content: message },
    ];

    let reply: string | undefined;

    // Call OpenAI
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messagesForAI as any,
        temperature: 0.7,
      });

      reply = completion.choices?.[0]?.message?.content?.trim();
      console.log("🤖 AI svarer:", reply);
    } catch (apiError: any) {
      console.error("🚨 OpenAI fetch fejlede:", apiError);
      reply = "Beklager, jeg kunne ikke kontakte OpenAI lige nu.";
    }

    if (!reply) {
      reply = "Beklager, jeg fik ikke noget svar denne gang.";
    }

    // Save AI reply
    await supabase.from("messages").insert([
      {
        conversation_id: conversation.id,
        sender: "assistant",
        role: "assistant",
        content: reply,
      },
    ]);

    return NextResponse.json({ reply });
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
