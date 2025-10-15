'use client';

import { useState } from 'react';

type Msg = { role: 'user' | 'assistant'; content: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setError(null);
    const nextMessages: Msg[] = [...messages, { role: 'user', content: input }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: nextMessages[nextMessages.length - 1].content }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data = await res.json(); // expect { reply: string }
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply ?? '' }]);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
      <h1>Zaxis Agent Chat</h1>

      <div style={{ border: '1px solid #e5e5e5', borderRadius: 8, padding: 12, minHeight: 260, background: '#fafafa', marginBottom: 16 }}>
        {messages.length === 0 && <p style={{ color: '#888' }}>Skriv en besked for at starte…</p>}
        {messages.map((m, i) => (
          <div key={i} style={{ background: m.role === 'user' ? '#e6f2ff' : '#f3f3f3', borderRadius: 6, padding: '8px 10px', margin: '8px 0', whiteSpace: 'pre-wrap' }}>
            <strong style={{ marginRight: 8 }}>{m.role === 'user' ? 'Du' : 'Assistant'}:</strong>
            {m.content}
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Skriv besked…"
          style={{ flex: 1, padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6 }}
        />
        <button type="submit" disabled={loading || !input.trim()} style={{ padding: '10px 16px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 6, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Sender…' : 'Send'}
        </button>
      </form>

      {error && <p style={{ color: 'crimson', marginTop: 12 }}>Fejl: {error}</p>}
    </main>
  );
}
