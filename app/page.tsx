'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Opret eller hent conversation_id
  useEffect(() => {
    let conversationId = localStorage.getItem('conversation_id');
    if (!conversationId) {
      conversationId = uuidv4();
      localStorage.setItem('conversation_id', conversationId);
    }

    // Fjerner kant og scrollbar fra body
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.backgroundColor = '#002233';
    document.body.style.overflow = 'hidden';
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const conversationId = localStorage.getItem('conversation_id');
    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

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
    setLoading(false);
  };

  const resetChat = () => {
    localStorage.removeItem('conversation_id');
    setMessages([]);
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(to bottom, #00334d, #001a26)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(to bottom, #004466, #002233)',
          color: 'white',
          padding: '20px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <h1 style={{ margin: 0 }}>Virtoo_internal_agent_demo</h1>
        <img src="/VITROO logo_Black.png" alt="Virtoo Logo" style={{ height: 60 }} />
      </div>

      {/* Chatfelt */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 40px',
          background: 'linear-gradient(to top, #002a3d, #00334d)',
          scrollbarWidth: 'thin',
          scrollbarColor: '#002233 #001a26',
        }}
      >
        <style jsx global>{`
          ::-webkit-scrollbar {
            width: 6px;
          }
          ::-webkit-scrollbar-track {
            background: #001a26;
          }
          ::-webkit-scrollbar-thumb {
            background-color: #002233;
            border-radius: 3px;
          }
        `}</style>

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              textAlign: msg.role === 'user' ? 'right' : 'left',
              marginBottom: 16,
            }}
          >
            <strong>{msg.role === 'user' ? 'Du:' : 'AI:'}</strong>
            <div
              style={{
                backgroundColor: msg.role === 'user' ? '#004466' : '#002a3d',
                display: 'inline-block',
                borderRadius: 12,
                padding: '12px 16px',
                marginTop: 4,
                maxWidth: '80%',
                wordWrap: 'break-word',
                textAlign: 'left',
                lineHeight: 1.6,
              }}
            >
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ color: '#ccc', marginTop: 8 }}>
            AI skriver<span className="dots">...</span>
          </div>
        )}
      </div>

      {/* Inputfelt */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          padding: '16px 24px',
          backgroundColor: '#001a26',
          flexShrink: 0,
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Spørg mig..."
          autoFocus
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 8,
            border: '1px solid #004466',
            backgroundColor: '#00334d',
            color: 'white',
            fontWeight: 'bold',
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '12px 20px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Send
        </button>
        <button
          onClick={resetChat}
          style={{
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '12px 20px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Nulstil
        </button>
      </div>
    </div>
  );
}
