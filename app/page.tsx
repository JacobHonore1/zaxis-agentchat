'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { v4 as uuidv4 } from 'uuid';

// Type til filer fra /api/drive-test
type DriveFile = {
  id?: string;
  name: string;
  mimeType?: string;
  modifiedTime?: string;
};

// Simpel sidebar der henter filer fra /api/drive-test
function FileSidebar() {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFiles() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/drive-test');
        if (!res.ok) {
          throw new Error('Svar fra server var ikke ok');
        }

        const data = await res.json();
        const list = Array.isArray(data.files) ? data.files : Array.isArray(data) ? data : [];

        setFiles(list);
      } catch (err) {
        console.error('Fejl ved hentning af filer', err);
        setError('Kunne ikke hente filer fra vidensbanken');
      } finally {
        setLoading(false);
      }
    }

    loadFiles();
  }, []);

  return (
    <div
      style={{
        width: '240px',
        borderRight: '1px solid rgba(255,255,255,0.12)',
        background: 'linear-gradient(180deg, rgba(0, 34, 51, 0.95) 0%, rgba(0, 71, 92, 0.95) 100%)',
        display: 'flex',
        flexDirection: 'column',
        padding: '12px 10px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          marginBottom: 10,
          paddingBottom: 8,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div
          style={{
            fontSize: '0.7rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.5)',
            marginBottom: 4,
          }}
        >
          Vidensbank
        </div>
        <div
          style={{
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#ffffff',
          }}
        >
          Google Drive filer
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
        }}
      >
        {loading && (
          <div
            style={{
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            Indlæser filer
          </div>
        )}

        {error && !loading && (
          <div
            style={{
              fontSize: '0.8rem',
              color: '#ffb3b3',
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && files.length === 0 && (
          <div
            style={{
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            Ingen filer registreret i vidensbanken
          </div>
        )}

        {!loading && !error && files.length > 0 && (
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
            }}
          >
            {files.map((file) => (
              <li
                key={file.id ?? file.name}
                style={{
                  padding: '6px 4px',
                  marginBottom: 2,
                  borderRadius: 6,
                  cursor: 'default',
                  transition: 'background 0.15s ease',
                }}
              >
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: '#ffffff',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    marginBottom: 2,
                  }}
                  title={file.name}
                >
                  {file.name}
                </div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    color: 'rgba(255,255,255,0.55)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 6,
                  }}
                >
                  <span>
                    {file.mimeType
                      ? file.mimeType.split('/')[1] ?? file.mimeType
                      : 'ukendt type'}
                  </span>
                  {file.modifiedTime && (
                    <span>
                      {new Date(file.modifiedTime).toLocaleDateString('da-DK')}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [loading]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    let storedId = localStorage.getItem('conversation_id');
    if (!storedId) {
      storedId = uuidv4();
      localStorage.setItem('conversation_id', storedId);
    }
    setConversationId(storedId);
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

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#002233',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
          background-color: #002233;
        }
        .chat-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .chat-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-scroll::-webkit-scrollbar-thumb {
          background-color: #002233;
          border-radius: 10px;
        }
        .chat-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #003355;
        }
      `}</style>

      <div
        style={{
          width: '100%',
          maxWidth: 800,
          height: '92vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 20,
          boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #002b44 0%, #004d66 100%)',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #002b44 0%, #4e9fe3 100%)',
            padding: '8px 24px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h1
            style={{
              fontSize: '1.3rem',
              fontWeight: 600,
              color: '#ffffff',
              margin: 0,
            }}
          >
            Virtoo_internal_agent_demo
          </h1>

          <Image
            src="/VITROO logo_Black.png"
            alt="Virtoo logo"
            width={135}
            height={135}
            style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
          />
        </div>

        {/* Midtersektion med sidebar og chat i to kolonner */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            minHeight: 0,
          }}
        >
          {/* Ny sidebar til venstre */}
          <FileSidebar />

          {/* Chatvindue til højre, uændret styling */}
          <div
            className="chat-scroll"
            style={{
              flex: 1,
              padding: '20px',
              overflowY: 'auto',
              background: 'linear-gradient(to bottom, #003355 0%, #00475c 100%)',
              color: '#ffffff',
            }}
          >
            {messages.length === 0 ? (
              <p
                style={{
                  color: 'rgba(255,255,255,0.7)',
                  textAlign: 'center',
                  marginTop: 60,
                  fontSize: '1.1rem',
                }}
              >
                Start en samtale for at komme i gang.
              </p>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    textAlign: 'left',
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      color: msg.role === 'user' ? '#5bc0de' : '#9fe2bf',
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    {msg.role === 'user' ? 'Bruger' : 'Assistent'}
                  </div>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '12px 16px',
                      borderRadius: 16,
                      background:
                        msg.role === 'user'
                          ? 'rgba(255, 255, 255, 0.15)'
                          : 'rgba(0, 0, 0, 0.25)',
                      color: msg.role === 'user' ? '#fff' : '#e6f3ff',
                      maxWidth: '80%',
                      wordBreak: 'break-word',
                      textAlign: 'left',
                      lineHeight: '1.6',
                      fontSize: '1rem',
                    }}
                  >
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div style={{ textAlign: 'left', margin: '10px 0 0 10px' }}>
                <div className="dot-flashing" />
                <style>
                  {`
                .dot-flashing {
                  position: relative;
                  width: 6px;
                  height: 6px;
                  border-radius: 50%;
                  background-color: #ffffff;
                  animation: dot-flashing 1s infinite linear alternate;
                }
                .dot-flashing::before, .dot-flashing::after {
                  content: '';
                  position: absolute;
                  top: 0;
                  width: 6px;
                  height: 6px;
                  border-radius: 50%;
                  background-color: #ffffff;
                }
                .dot-flashing::before { left: -10px; animation: dot-flashing 1s infinite alternate; }
                .dot-flashing::after { left: 10px; animation: dot-flashing 1s infinite alternate; }
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
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            background: '#003355',
            padding: '12px',
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
            placeholder="Spørg mig"
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 12,
              border: 'none',
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#002233',
              background: '#ffffff',
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
