'use client';

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { v4 as uuidv4 } from 'uuid';

type DriveFile = {
  id?: string;
  name: string;
  mimeType?: string;
  modifiedTime?: string;
};

function FileSidebar() {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function refreshFiles() {
    try {
      const res = await fetch('/api/drive-test');
      if (!res.ok) throw new Error();
      const data = await res.json();
      const list = Array.isArray(data.files) ? data.files : data;
      setFiles(list);
      setLastUpdated(new Date().toLocaleTimeString('da-DK'));
    } catch {
      setError('Fejl ved opdatering af filer');
    }
  }

  async function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    try {
      setUploadError(null);
      const file = e.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      setUploading(true);

      const res = await fetch('/api/upload-file-to-drive', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        setUploadError('Upload fejlede');
      } else {
        await refreshFiles();
      }
    } catch {
      setUploadError('Upload fejl');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  useEffect(() => {
    async function loadFiles() {
      try {
        setLoading(true);
        const res = await fetch('/api/drive-test');
        if (!res.ok) throw new Error();
        const data = await res.json();
        const list = Array.isArray(data.files) ? data.files : data;
        setFiles(list);
        setLastUpdated(new Date().toLocaleTimeString('da-DK'));
      } catch {
        setError('Kunne ikke hente filer');
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
        background: 'linear-gradient(180deg, rgba(0,34,51,0.95), rgba(0,71,92,0.95))',
        display: 'flex',
        flexDirection: 'column',
        padding: '12px 10px',
        boxSizing: 'border-box',
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#ffffff',
            }}
          >
            Google Drive filer
          </div>

          <button
            type="button"
            onClick={() => {
              const input = document.getElementById('fileUploadInput') as HTMLInputElement;
              input.click();
            }}
            style={{
              background: 'rgba(255,255,255,0.12)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 6,
              width: 24,
              height: 24,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            +
          </button>

          <input id="fileUploadInput" type="file" style={{ display: 'none' }} onChange={handleFileUpload} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading && <div style={{ color: 'rgba(255,255,255,0.6)' }}>Indlæser filer</div>}
        {error && <div style={{ color: '#ffb3b3' }}>{error}</div>}
        {!loading && !error && files.length === 0 && (
          <div style={{ color: 'rgba(255,255,255,0.6)' }}>Ingen filer registreret</div>
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
        {uploading && <div>Uploader fil</div>}
        {uploadError && <div style={{ color: '#ffb3b3' }}>Upload fejl</div>}
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
        body: JSON.stringify({ conversation_id: conversationId, message: input }),
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
          height: 100percent;
          width: 100percent;
          overflow: hidden;
          background-color: #002233;
        }
      `}</style>

      <div
        style={{
          width: '100percent',
          maxWidth: 800,
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
          <h1 style={{ margin: 0, color: '#fff', fontSize: '1.3rem' }}>
            Virtoo_internal_agent_demo
          </h1>

          <Image
            src="/VITROO logo_Black.png"
            width={135}
            height={135}
            alt="logo"
            style={{ objectFit: 'contain', filter: 'invert(1)' }}
          />
        </div>

        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <FileSidebar />

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
              <p style={{ marginTop: 60, textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
                Start en samtale for at komme i gang
              </p>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} style={{ marginBottom: 12 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      marginBottom: 6,
                      color: msg.role === 'user' ? '#5bc0de' : '#9fe2bf',
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
                          ? 'rgba(255,255,255,0.15)'
                          : 'rgba(0,0,0,0.25)',
                      maxWidth: '80%',
                    }}
                  >
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              ))
            )}

            {loading && <div style={{ marginTop: 10 }}>Assistenten skriver</div>}

            <div ref={chatEndRef} />
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            padding: '12px',
            background: '#003355',
            display: 'flex',
            gap: 8,
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Spørg mig"
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 12,
            }}
          />

          <button
            onClick={sendMessage}
            disabled={loading}
            style={{
              padding: '10px 14px',
              borderRadius: 12,
            }}
          >
            {loading ? '...' : 'Send'}
          </button>

          <button onClick={resetConversation} style={{ borderRadius: 12 }}>
            🔄
          </button>
        </div>
      </div>
    </div>
  );
}
