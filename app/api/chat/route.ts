import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabaseServer } from '@/lib/supabaseClient';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { conversation_id, message } = await req.json();

  // Hent tidligere beskeder fra Supabase
  let { data: messages } = await supabaseServer
    .from('messages')
    .select('role, content')
    .eq('conversation_id', conversation_id)
    .order('created_at', { ascending: true });

  const history = messages?.map((m) => ({
    role: m.role,
    content: m.content,
  })) || [];

  // Tilføj brugerens besked
  history.push({ role: 'user', content: message });

  // Send hele historikken til OpenAI
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: history,
  });

  const reply = completion.choices[0].message.content;

  // Gem både brugerens besked og AI-svar i Supabase
  await supabaseServer.from('messages').insert([
    { conversation_id, role: 'user', content: message },
    { conversation_id, role: 'assistant', content: reply },
  ]);

  return NextResponse.json({ reply });
}
