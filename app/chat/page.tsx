"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pulse, setPulse] = useState(false);

  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setMessages((p) => [...p, { role: "user", content: input.trim() }]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fejl i serveren");

      setMessages((p) => [...p, { role: "assistant", content: data.reply || "..." }]);
      setPulse(true);
      setTimeout(() => setPulse(false), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="shell">
      <div className="top">
        <Image src="/logo.png" alt="Logo" width={180} height={60} priority className="logo" />
        <h2 className="tagline">assistenter der skaber værdi</h2>
      </div>

      <div className={`chat ${pulse ? "pulse" : ""}`}>
        <div className="scroll">
          {messages.length === 0 && (
            <div className="placeholder">Skriv en besked herunder for at starte.</div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role === "user" ? "me" : "ai"}`}>
              <strong>{m.role === "user" ? "Du" : "AI"}:</strong> {m.content}
            </div>
          ))}

          {loading && (
            <div className="typing">
              <span>AI arbejder</span>
              <span className="dot" />
              <span className="dot" style={{ animationDelay: "0.15s" }} />
              <span className="dot" style={{ animationDelay: "0.3s" }} />
            </div>
          )}
          <div ref={endRef} />
        </div>

        {error && <div className="error">Fejl: {error}</div>}

        <form onSubmit={onSend} className="inputRow">
          <input
            type="text"
            placeholder="Skriv din besked…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="input"
          />
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "..." : "Send"}
          </button>
        </form>
      </div>

      <style>{`
        :root {
          --bg: #0b1020;
          --panel: #141b2d;
          --blue: #2563eb;
          --text: #ffffff;
          --muted: #9ca3af;
          --radius: 18px;
        }

        html, body {
          margin: 0;
          padding: 0;
          background: var(--bg);
          height: 100%;
          overflow: hidden;
        }

        .shell {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          font-family: Inter, sans-serif;
        }

        .top {
          text-align: center;
          margin-top: 30px;
        }
        .logo {
          width: 180px;
          height: auto;
        }
        .tagline {
          margin-top: 4px;
          font-size: 14px;
          opacity: 0.8;
        }

        .chat {
          width: 100%;
          max-width: 700px;
          background: var(--panel);
          border-radius: var(--radius);
          box-shadow: 0 0 25px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          margin-top: 20px;
          flex: 1;
          overflow: hidden;
        }

        .scroll {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          scrollbar-width: thin;
          scrollbar-color: var(--blue) transparent;
        }

        .scroll::-webkit-scrollbar {
          width: 6px;
        }
        .scroll::-webkit-scrollbar-thumb {
          background: var(--blue);
          border-radius: 3px;
        }

        .msg {
          padding: 10px 14px;
          border-radius: 10px;
          margin-bottom: 8px;
          word-break: break-word;
          animation: fadeIn 0.3s ease-in;
        }
        .msg.me {
          background: #1e3a8a;
          align-self: flex-end;
        }
        .msg.ai {
          background: rgba(255, 255, 255, 0.08);
        }

        .typing {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--blue);
          margin: 4px 0;
        }
        .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--blue);
          display: inline-block;
          animation: dance 1s infinite ease-in-out;
        }
        @keyframes dance {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-6px); opacity: 1; }
        }

        .inputRow {
          display: flex;
          gap: 8px;
          padding: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          background: #0f172a;
          position: sticky;
          bottom: 0;
        }
        .input {
          flex: 1;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #1e293b;
          background: #0f172a;
          color: var(--text);
          font-size: 16px;
        }
        .btn {
          background: var(--blue);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 12px 18px;
          font-weight: 600;
          cursor: pointer;
        }

        /* Responsiv styling */
        @media (max-width: 768px) {
          .shell { padding: 0 10px; }
          .logo { width: 140px; }
          .tagline { font-size: 13px; }
          .chat {
            border-radius: 12px;
            height: calc(100vh - 160px);
            margin-top: 10px;
          }
          .inputRow { padding: 8px; }
          .input { font-size: 15px; padding: 10px; }
          .btn { padding: 10px 14px; font-size: 15px; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
