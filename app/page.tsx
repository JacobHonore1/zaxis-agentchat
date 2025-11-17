'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { v4 as uuidv4 } from 'uuid';

import AgentSidebar from '../components/AgentSidebar';
import { AgentId, defaultAgentId } from '../config/agents';

// typer for vidensbank
type DriveFile = {
  id?: string;
  name: string;
  mimeType?: string;
  modifiedTime?: string;
};

// panel til højre med Google Drive filer
function KnowledgePanel() {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  async function refreshFiles() {
    try {
      const res = await fetch('/api/drive-test');
      if (!res.ok) throw new Error();
      const data = await res.json();
      const list = Array.isArray(data.files) ? data.files : data;
      setFiles(list);
      setLastUpdated(new Date().toLocaleTimeString('da-DK'));
    } catch {
      setError('Fejl ved hentning af filer');
    }
  }

  useEffect(() => {
    async function loadFiles() {
      try {
        const res = await fetch('/api/drive-test');
        if (!res.ok) throw new Error();
        const data = await res.json();
        const list = Array.isArray(data.files) ? data.files : data;
        setFiles(list);
        setLastUpdated(new Date().toLocaleTimeString('da-DK'));
      } catch {
        setError('Fejl ved hentning af filer');
      } finally {
        setLoading(false);
      }
    }
    loadFiles();
  }, []);

  return (
    <div
      style={{
        width: 260,
        borderLeft: '1px solid rgba(255,255,255,0.12)',
        background: 'linear-gradient(180deg, rgba(0,34,51,0.95), rgba(0,71,92,0.95))',
        display: 'flex',
        flexDirection: 'column',
        padding: '12px 10px',
        overflow: 'hidden',
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
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.5)',
            marginBottom: 4,
            letterSpacing: '0.08em',
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

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading && <div style={{ color: 'rgba(255,255,255,0.6)' }}>Indlæser filer</div>}
        {error && <div style={{ color: '#ffb3b3' }}>{error}</div>}

        {!loading && !error && files.length === 0 && (
          <div style={{ color: 'rgba(255,255,255,0.6)' }}>Ingen filer fundet</div>
        )}

        {!loading && !error && files.length > 0 && (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {files.map((file) => (
              <li key={file.id ?? file.name} style={{ padding: '6px 4px' }}>
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: '#ffffff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {file.name}
                </div>

                <div
                  style={{
                    fontSize: '0.7rem',
                    color: 'rgba(255,255,255,0.55)',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{file.mimeType?.split('/')[1] ?? 'ukendt'}</span>
                  {file.modifiedTime && (
                    <span>{new Date(file.modifiedTime).toLocaleDateString('da-DK')}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div
        style={{
          marginTop: 10,
          paddingTop: 8,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.5)',
        }}
      >
        <div>Filer i alt: {files.length}</div>
        <div>Senest hentet: {lastUpdated ?? 'henter'}</div>
      </div>
    </div>
  );
}

// selve chat siden
export default function ChatPage() {
  const [currentAgentId, setCurrentAgentId] = useState<AgentId>(defaultAgentId);
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

  // send besked til API
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
          agent_id: currentAgentId,
        }),
      });

      const data = await res.json();

      if (data.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Der opstod en fejl ved forbindelsen.' },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  // nulstil samtale
  const resetConversation = () => {
    localStorage.removeItem('conversation_id');
    setConversationId(null);
    setMessages([]);
    inputRef.current?.focus();
  };

  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: '#002233',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
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

        @keyframes dots {
          0 percent { opacity: 0.2; }
          50 percent { opacity: 1; }
          100 percent { opacity: 0.2; }
        }
      `}</style>

      <div
        style={{
          width: '100%',
          maxWidth: 1400,
          height: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 20,
          boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
          background: 'linear-gradient(180deg, #002b44, #004d66)',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #002b44, #4e9fe3)',
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
            Virtoo Assistent MVP 0.13a
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={resetConversation}
              style={{
                padding: '6px 10px',
                borderRadius: 999,
                border: 'none',
                background: 'rgba(0,0,0,0.25)',
                color: 'white',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Reset chat
            </button>

            <Image
              src="/VITROO logo_Black.png"
              alt="Virtoo logo"
              width={120}
              height={120}
              style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
            />
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <AgentSidebar
            currentAgentId={currentAgentId}
            onSelectAgent={(id) => setCurrentAgentId(id)}
          />

          <div
            className="chat-scroll"
            style={{
              flex: 1,
              padding: 20,
              overflowY: 'auto',
              background: 'linear-gradient(to bottom, #003355, #00475c)',
              color: 'white',
            }}
          >
            {messages.length === 0 ? (
              <p
                style={{
                  marginTop: 60,
                  textAlign: 'center',
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                Start en samtale ved at vælge agent og skrive en besked.
              </p>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} style={{ marginBottom: 6 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      marginBottom: 4,
                      color: msg.role === 'user' ? '#5bc0de' : '#9fe2bf',
                    }}
                  >
                    {msg.role === 'user' ? 'Bruger' : 'Assistent'}
                  </div>

                  <div
                    style={{
                      display: 'inline-block',
                      padding: '6px 10px',
                      borderRadius: 12,
                      background:
                        msg.role === 'user'
                          ? 'rgba(255,255,255,0.15)'
                          : 'rgba(0,0,0,0.25)',
                      maxWidth: '80%',
                      wordBreak: 'break-word',
                    }}
                  >
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div
                style={{
                  marginTop: 10,
                  color: 'white',
                  display: 'flex',
                  gap: 6,
                  alignItems: 'center',
                }}
              >
                Assistenten tænker
                <span style={{ animation: 'dots 1s infinite 0ms' }}>.</span>
                <span style={{ animation: 'dots 1s infinite 200ms' }}>.</span>
                <span style={{ animation: 'dots 1s infinite 400ms' }}>.</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <KnowledgePanel />
        </div>

        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            padding: '12px',
            background: '#003355',
            display: 'flex',
            gap: 8,
            alignItems: 'center',
          }}
        >
          <button
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(255,255,255,0.15)',
              color: 'white',
              border: 'none',
              fontSize: 22,
              cursor: 'pointer',
            }}
          >
            +
          </button>

          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Skriv din besked"
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 12,
              border: 'none',
            }}
          />

          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: 'none',
              fontWeight: 600,
              color: 'white',
              cursor: !input.trim() ? 'not-allowed' : 'pointer',
              background: !input.trim()
                ? 'linear-gradient(135deg, #777, #999)'
                : 'linear-gradient(135deg, #6C63FF, #4ECDC4)',
              transition: '0.2s ease',
            }}
          >
            Send
          </button>

          <button
            onClick={resetConversation}
            style={{
              borderRadius: 12,
              padding: '10px 14px',
              background: 'linear-gradient(135deg, #6C63FF, #4ECDC4)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            🔄
          </button>
        </div>
      </div>
    </div>
  );
}
