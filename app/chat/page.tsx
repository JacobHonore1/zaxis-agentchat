"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

type Msg = { role: "user" | "assistant"; content: string };
type Agent = "SoMe" | "Strategi" | "Firma Guidelines";

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agent, setAgent] = useState<Agent>("SoMe");

  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  const agentStyles: Record<Agent, { color: string; bubble: string }> = {
    SoMe: { color: "#2563eb", bubble: "#1e3a8a" },
    Strategi: { color: "#16a34a", bubble: "#065f46" },
    "Firma Guidelines": { color: "#7e22ce", bubble: "#4c1d95" },
  };

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const text = input.trim();
    setMessages((p) => [...p, { role: "user", content: `[${agent}] ${text}` }]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `${agent}: ${text}` }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fejl i serveren");

      setMessages((p) => [...p, { role: "assistant", content: data.reply || "..." }]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const currentColor = agentStyles[agent].color;
  const currentBubble = agentStyles[agent].bubble;

  return (
    <div className="shell">
      <div className="top">
        <Image src="/logo.png" alt="Logo" width={160} height={50} priority className="logo" />
        <h2 className="tagline">assistenter der skaber værdi</h2>
      </div>

      <div className="agent-select" style={{ borderColor: currentColor }}>
        <label>Vælg agent:</label>
        <select
          value={agent}
          onChange={(e) => setAgent(e.target.value as Agent)}
          style={{
            borderColor: currentColor,
            color: "#fff",
            background: "transparent",
          }}
        >
          <option value="SoMe">SoMe</option>
          <option value="Strategi">Strategi</option>
          <option value="Firma Guidelines">Firma Guidelines</option>
        </select>
      </div>

      <div className="chat" style={{ border: `2px solid ${currentColor}` }}>
        <div className="scroll">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`msg ${m.role === "user" ? "me" : "ai"}`}
              style={{
                background: m.role === "user" ? currentBubble : "rgba(255,255,255,0.08)",
              }}
            >
              <strong>{m.role === "user" ? "Du" : "AI"}:</strong> {m.content}
            </div>
          ))}

          {loading && (
            <div className="typing" style={{ color: currentColor }}>
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
            placeholder="Skriv din besked..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="input"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn"
            style={{ background: currentColor }}
          >
            Send
          </button>
        </form>
      </div>

      <style>{`
        :root {
          --bg: #0b1020;
          --panel: #141b2d;
          --text: #ffffff;
          --muted: #9ca3af;
          --radius: 16px;
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
        .logo { width: 160px; height: auto; }
        .tagline { font-size: 14px; opacity: 0.8; margin: 6px 0 18px; }

        .agent-select {
          margin-bottom: 12px;
          padding: 8px 16px;
          border: 2px solid;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #fff;
        }

        .agent-select select {
          border: 1px solid currentColor;
          border-radius: 6px;
          padding: 4px 8px;
          cursor: pointer;
        }

        .chat {
          width: 100%;
          max-width: 700px;
          background: var(--panel);
          border-radius: var(--radius);
          box-shadow: 0 0 25px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
        }

        .scroll {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          scrollbar-width: thin;
          scrollbar-color: currentColor transparent;
        }

        .msg {
          padding: 10px 14px;
          border-radius: 10px;
          margin-bottom: 8px;
          word-break: break-word;
        }

        .typing {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
        }

        .dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: currentColor;
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
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 12px 18px;
          font-weight: 600;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .chat { border-radius: 0; max-width: 100%; height: 100vh; }
          .inputRow { position: fixed; bottom: 0; left: 0; width: 100%; }
          .agent-select { width: 90%; text-align: center; }
        }
      `}</style>
    </div>
  );
}
