import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { conversation_id, sender, content, role } = body;

    if (!content) {
      return NextResponse.json({ error: "Missing content" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("messages")
      .insert([{ conversation_id, sender, content, role }]);

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("Error saving message:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save message" },
      { status: 500 }
    );
  }
}
