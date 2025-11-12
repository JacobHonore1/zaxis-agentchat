'use client';

import { useState, useEffect } from 'react';

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Hent tidligere conversation_id fra localStorage (hvis det findes)
  useEffect(() => {
    const storedId = localStorage.getItem('conversation_id');
    if (storedId) {
      setConversationId(storedId);
      console.log('💬 Fortsætter eksisterende samtale:', storedId);
    }
  }, []);

  // Funktion til at sende beskeder
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          message: input,
        }),
      });

      const data = await res.json();

      if (data.reply) {
        const botMessage = { role: 'assistant', content: data.reply };
        setMessages((prev) => [...prev, botMessage]);
      }

      // Gem nyt conversation_id hvis det er første besked
      if (data.conversation_id && !conversationId) {
        setConversationId(data.conversation_id);
        localStorage.setItem('conversation_id', data.conversation_id);
        console.log('🧠 Nyt conversation_id gemt:', data.conversation_id);
      }
    } catch (err) {
      console.error('🚨 Fejl ved afsendelse:', err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Der opstod en fejl ved forbindelsen.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Funktion til at nulstille samtalen
  const resetConversation = () => {
    localStorage.removeItem('conversation_id');
    setConversationId(null);
    setMessages([]);
    alert('🧹 Samtalen er nulstillet! AI starter forfra næste gang du sender en besked.');
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
        {messages.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center' }}>
            Start en samtale for at se beskeder her.
          </p>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              style={{
                textAlign: msg.role === 'user' ? 'right' : 'left',
                marginBottom: 8,
              }}
            >
              <strong>{msg.role === 'user' ? 'Du:' : 'AI:'}</strong> {msg.content}
            </div>
          ))
        )}
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
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            background: loading ? '#999' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            padding: '8px 16px',
            cursor: loading ? 'default' : 'pointer',
          }}
        >
          {loading ? 'Sender...' : 'Send'}
        </button>
      </div>

      {/* Nulstil-knap */}
      <div style={{ textAlign: 'center', marginTop: 12 }}>
        <button
          onClick={resetConversation}
          style={{
            background: '#ccc',
            color: '#000',
            border: 'none',
            borderRadius: 4,
            padding: '6px 12px',
            cursor: 'pointer',
          }}
        >
          🔄 Nulstil samtale
        </button>
      </div>
    </div>
  );
}
