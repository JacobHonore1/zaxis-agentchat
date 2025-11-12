'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let conversationId = localStorage.getItem('conversation_id');
    if (!conversationId) {
      conversationId = uuidv4();
      localStorage.setItem('conversation_id', conversationId);
    }

    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.background = '#002233';
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
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, sans-serif',
        background: 'linear-gradient(to bottom, #00334d, #001a26)',
      }}
    >
      {/* Topbjælke */}
      <div
        style={{
          background: 'linear-gradient(to bottom, #004466, #002233)',
          padding: '18px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          flexShrink: 0,
        }}
      >
        <h1 style={{ margin: 0, fontWeight: 600, fontSize: 20 }}>Virtoo_internal_agent_demo</h1>
        <img
          src="/VITROO logo_Black.png"
          alt="Virtoo Logo"
          style={{ height: 75, objectFit: 'contain' }}
        />
      </div>

      {/* Chatindhold */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 60px',
          background: 'linear-gradient(to top, #002a3d, #003b59)',
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

          @keyframes blink {
            0%,
            80%,
            100% {
              opacity: 0;
            }
            40% {
              opacity: 1;
            }
          }

          .dots::after {
            content: '…';
            animation: blink 1.2s infinite;
          }
        `}</style>

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              marginBottom: 20,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            <strong
              style={{
                color: msg.role === 'user' ? '#5bc0de' : '#9fe2bf',
                marginBottom: 4,
              }}
            >
              {msg.role === 'user' ? 'Bruger' : 'Assistent'}
            </strong>
            <div
              style={{
                backgroundColor: msg.role === 'user' ? '#004466' : '#002a3d',
                borderRadius: 12,
                padding: '14px 18px',
                lineHeight: 1.6,
                fontSize: '15px',
                maxWidth: '75%',
                color: 'white',
              }}
            >
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}

        {loading && (
          <div
            style={{
              color: '#9fe2bf',
              fontStyle: 'italic',
              marginTop: 10,
              marginLeft: 4,
            }}
          >
            Assistent skriver<span className="dots"></span>
          </div>
        )}
      </div>

      {/* Inputfelt */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          padding: '18px 60px 30px 60px',
          backgroundColor: '#002233',
          borderTop: '1px solid rgba(255,255,255,0.1)',
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
            padding: 14,
            borderRadius: 8,
            border: '1px solid #004466',
            backgroundColor: '#00334d',
            color: 'white',
            fontWeight: 'bold',
            outline: 'none',
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '14px 24px',
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
            padding: '14px 24px',
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
