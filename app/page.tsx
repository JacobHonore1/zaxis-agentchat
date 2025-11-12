'use client';

import { useState, useEffect, useRef } from 'react';

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Fokus på inputfeltet ved indlæsning
  useEffect(() => {
    inputRef.current?.focus();
  }, [loading]);

  // Scroll til bund når nye beskeder tilføjes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Hent tidligere conversation_id fra localStorage
  useEffect(() => {
    const storedId = localStorage.getItem('conversation_id');
    if (storedId) {
      setConversationId(storedId);
      console.log('💬 Fortsætter eksisterende samtale:', storedId);
    }
  }, []);

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
      inputRef.current?.focus();
    }
  };

  const resetConversation = () => {
    localStorage.removeItem('conversation_id');
    setConversationId(null);
    setMessages([]);
    inputRef.current?.focus();
  };

  // Enkel formattering af AI-svar med Markdown-lignende visning
  const renderFormattedContent = (text: string) => {
    const lines = text.split('\n').filter((l) => l.trim() !== '');
    return lines.map((line, i) => {
      if (line.startsWith('###')) return <h3 key={i}>{line.replace('###', '').trim()}</h3>;
      if (line.startsWith('**')) return <strong key={i}>{line.replace(/\*\*/g, '')}</strong>;
      if (line.startsWith('- ')) return <li key={i}>{line.replace('- ', '').trim()}</li>;
      return <p key={i}>{line}</p>;
    });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #7b61ff, #5ee7df)',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 720,
          height: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 20,
          backgroundColor: 'white',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(90deg, #6C63FF, #4ECDC4)',
            padding: '16px',
            textAlign: 'center',
            color: 'white',
            fontWeight: 600,
            fontSize: '1.2rem',
            letterSpacing: '0.5px',
          }}
        >
          Zaxis AgentChat
        </div>

        {/* Chatvindue */}
        <div
          style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            background: '#f9f9fb',
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
                    padding: '12px 16px',
                    borderRadius: 16,
                    background:
                      msg.role === 'user'
                        ? 'linear-gradient(135deg, #6C63FF, #4ECDC4)'
                        : '#ececff',
                    color: msg.role === 'user' ? 'white' : '#333',
                    maxWidth: '80%',
                    wordBreak: 'break-word',
                    textAlign: 'left',
                  }}
                >
                  {msg.role === 'assistant'
                    ? renderFormattedContent(msg.content)
                    : msg.content}
                </div>
              </div>
            ))
          )}

          {/* Tre dansende prikker ved loading */}
          {loading && (
            <div style={{ textAlign: 'left', margin: '10px 0 0 10px' }}>
              <div className="dot-flashing" />
              <style>
                {`
                .dot-flashing {
                  position: relative;
                  width: 12px;
                  height: 12px;
                  border-radius: 6px;
                  background-color: #6C63FF;
                  color: #6C63FF;
                  animation: dot-flashing 1s infinite linear alternate;
                  animation-delay: .5s;
                }
                .dot-flashing::before, .dot-flashing::after {
                  content: '';
                  display: inline-block;
                  position: absolute;
                  top: 0;
                  width: 12px;
                  height: 12px;
                  border-radius: 6px;
                  background-color: #6C63FF;
                  color: #6C63FF;
                }
                .dot-flashing::before {
                  left: -20px;
                  animation: dot-flashing 1s infinite alternate;
                  animation-delay: 0s;
                }
                .dot-flashing::after {
                  left: 20px;
                  animation: dot-flashing 1s infinite alternate;
                  animation-delay: 1s;
                }
                @keyframes dot-flashing {
                  0% { opacity: 0.2; }
                  50%, 100% { opacity: 1; }
                }
              `}
              </style>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Inputfelt + footer */}
        <div
          style={{
            borderTop: '1px solid #eee',
            background: '#fff',
            padding: '12px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <input
            ref={inputRef}
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
              padding: '10px 16px',
              fontWeight: 600,
              cursor: loading ? 'default' : 'pointer',
              transition: 'opacity 0.2s',
              flexShrink: 0,
            }}
          >
            {loading ? '...' : 'Send'}
          </button>
          <button
            onClick={resetConversation}
            title="Nulstil samtale"
            style={{
              background: 'linear-gradient(135deg, #6C63FF, #4ECDC4)',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              padding: '10px 14px',
              fontWeight: 600,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            🔄
          </button>
        </div>
      </div>
    </div>
  );
}
