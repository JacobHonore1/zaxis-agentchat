'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');

  // Sørg for, at hver bruger får et conversation_id som gemmes i browseren
  useEffect(() => {
    let conversationId = localStorage.getItem('conversation_id');
    if (!conversationId) {
      conversationId = uuidv4();
      localStorage.setItem('conversation_id', conversationId);
    }
  }, []);

  // Funktion til at sende beskeder til API'en
  const sendMessage = async () => {
    if (!input.trim()) return;

    const conversationId = localStorage.getItem('conversation_id');
    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_id: conversationId,
        message: input,
      }),
    });

    const data = await response.json();
    const botMessage = { role: 'assistant', content: data.reply };

    setMessages((prev) => [...prev, botMessage]);
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>Zaxis AgentChat</h1>

      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: 8,
          padding: 16,
          height: 400,
          overflowY: 'auto',
          background: '#fafafa',
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              textAlign: msg.role === 'user' ? 'right' : 'left',
              marginBottom: 8,
            }}
          >
            <strong>{msg.role === 'user' ? 'Du:' : 'AI:'}</strong> {msg.content}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Skriv en besked..."
          style={{
            flex: 1,
            padding: 8,
            borderRadius: 4,
            border: '1px solid #ccc',
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            background: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            padding: '8px 16px',
            cursor: 'pointer',
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
