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

  // Send besked til API
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

  // Nulstil samtale
  const resetConversation = () => {
    localStorage.removeItem('conversation_id');
    setConversationId(null);
    setMessages([]);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #7b61ff, #5ee7df)',
        fontFamily: 'Inter, sans-serif',
        color: '#1a1a1a',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 700,
          background: 'white',
          borderRadius: 20,
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(90deg, #6C63FF, #4ECDC4)',
            padding: '20px 24px',
            textAlign: 'center',
            color: 'white',
            fontWeight: 600,
            fontSize: '1.3rem',
            letterSpacing: '0.5px',
          }}
        >
          Zaxis AgentChat
        </div>

        {/* Chatvindue */}
        <div
          style={{
            flex: 1,
            padding: '24px',
            height: 450,
            overflowY: 'auto',
            backgroundColor: '#f9f9fb',
          }}
        >
          {messages.length === 0 ? (
            <p style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>
              Start en samtale for at komme i gang.
            </p>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  textAlign: msg.role === 'user' ? 'right' : 'left',
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    display: 'inline-block',
                    padding: '10px 14px',
                    borderRadius: 16,
                    background:
                      msg.role === 'user'
                        ? 'linear-gradient(135deg, #6C63FF, #4ECDC4)'
                        : '#ececff',
                    color: msg.role === 'user' ? 'white' : '#333',
                    maxWidth: '80%',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Inputfelt + footer */}
        <div
          style={{
            borderTop: '1px solid #eee',
            background: '#fff',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Skriv en besked..."
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 12,
              border: '1px solid #ccc',
              fontSize: '0.95rem',
            }}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            style={{
              background: loading
                ? 'linear-gradient(135deg, #999, #aaa)'
                : 'linear-gradient(135deg, #6C63FF, #4ECDC4)',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              padding: '10px 18px',
              fontWeight: 600,
              cursor: loading ? 'default' : 'pointer',
              transition: 'opacity 0.2s',
            }}
          >
            {loading ? 'Sender…' : 'Send'}
          </button>
          <button
            onClick={resetConversation}
            title="Nulstil samtale"
            style={{
              background: '#f4f4f4',
              color: '#333',
              border: '1px solid #ddd',
              borderRadius: 12,
              padding: '10px 14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            🔄
          </button>
        </div>
      </div>

      <p style={{ color: 'white', marginTop: 20, fontSize: '0.9rem', opacity: 0.8 }}>
        {conversationId ? `Samtale-ID: ${conversationId}` : 'Ny samtale starter ved næste besked'}
      </p>
    </div>
  );
}
