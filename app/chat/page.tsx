"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type Msg = { role: "user" | "assistant"; content: string };
type Agent = "SoMe" | "Strategi" | "Firma Guidelines";

const AGENTS: Agent[] = ["SoMe", "Strategi", "Firma Guidelines"];

// Afdæmpede farver + lys tone til rammer
const agentStyles: Record<
  Agent,
  { color: string; bubble: string; light: string; text: string }
> = {
  SoMe: {
    color: "#233a63",
    bubble: "#1a2740",
    light: "#3f6fd2",
    text: "#ffffff",
  },
  Strategi: {
    color: "#1e3a32",
    bubble: "#142621",
    light: "#29a36a",
    text: "#f5fff9",
  },
  "Firma Guidelines": {
    color: "#352a52",
    bubble: "#271f3c",
    light: "#8256d2",
    text: "#ffffff",
  },
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agent, setAgent] = useState<Agent>("SoMe");

  // custom dropdown state
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  // klik udenfor dropdown lukker den
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

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

  const { color, bubble, light, text } = agentStyles[agent];

  return (
    <div className="shell">
      <div className="top">
        <Image src="/logo.png" alt="Logo" width={160} height={50} priority className="logo" />
      </div>

      {/* Custom dropdown */}
      <div className="selectWrap" ref={dropdownRef}>
        <span className="label">Vælg agent:</span>
        <button
          type="button"
          className="selectBtn"
          style={{ background: color, borderColor: light, color: text }}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          {agent}
          <svg className={`chev ${open ? "up" : ""}`} width="16" height="16" viewBox="0 0 24 24">
            <path fill={text} d="M7 10l5 5 5-5z" />
          </svg>
        </button>

        <div
          className={`menu ${open ? "open" : ""}`}
          role="listbox"
          aria-activedescendant={agent}
          style={{ borderColor: light }}
        >
          {AGENTS.map((a) => (
            <div
              key={a}
              role="option"
              aria-selected={a === agent}
              className="item"
              style={{
                background: agentStyles[a].color,
                color: agentStyles[a].text,
                borderColor: agentStyles[a].light,
              }}
              onClick={() => {
                setAgent(a);
                setOpen(false);
              }}
            >
              {a}
            </div>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="chat" style={{ borderColor: light }}>
        <div className="scroll">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`msg ${m.role === "user" ? "me" : "ai"}`}
              style={{
                background: m.role === "user" ? bubble : "rgba(255,255,255,0.08)",
              }}
            >
              <strong>{m.role === "user" ? "Du" : "AI"}:</strong> {m.content}
            </div>
          ))}

          {loading && (
            <div className="typing" style={{ color: light }}>
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
            style={{ borderColor: light }}
          />
          <button type="submit" disabled={loading || !input.trim()} className="btn" style={{ background: color }}>
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

        html, body { margin: 0; padding: 0; background: var(--bg); height: 100%; overflow: hidden; }
        .shell { display: flex; flex-direction: column; align-items: center; min-height: 100vh; color: var(--text); font-family: Inter, system-ui, sans-serif; }
        .top { margin-top: 30px; }
        .logo { width: 160px; height: auto; }

        /* Custom dropdown */
        .selectWrap { position: relative; margin: 16px 0 10px; display: flex; align-items: center; gap: 10px; }
        .label { color: #e5e7eb; font-size: 14px; }
        .selectBtn {
          border: 2px solid;
          border-radius: 14px;
          padding: 10px 14px 10px 14px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-width: 180px;
          justify-content: space-between;
          box-shadow: 0 4px 14px rgba(0,0,0,0.25);
          transition: transform .15s ease, box-shadow .25s ease, filter .2s ease;
        }
        .selectBtn:hover { filter: brightness(1.07); }
        .chev { transition: transform .2s ease; }
        .chev.up { transform: rotate(180deg); }

        .menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 78px;   /* plads til label */
          width: 220px;
          background: rgba(10, 14, 28, 0.75);
          border: 2px solid;
          border-radius: 14px;
          backdrop-filter: blur(8px);
          box-shadow: 0 14px 28px rgba(0,0,0,.45);
          overflow: hidden;
          opacity: 0;
          transform: translateY(6px) scale(.98);
          pointer-events: none;
          transition: opacity .18s ease, transform .18s ease;
        }
        .menu.open {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }
        .item {
          padding: 10px 14px;
          border-bottom: 1px solid;
          cursor: pointer;
          transition: filter .15s ease, transform .08s ease;
        }
        .item:last-child { border-bottom: none; }
        .item:hover { filter: brightness(1.08); }
        .item:active { transform: scale(.99); }

        /* Chat */
        .chat {
          width: 100%;
          max-width: 700px;
          background: var(--panel);
          border: 2px solid;
          border-radius: var(--radius);
          box-shadow: 0 0 25px rgba(0,0,0,.5);
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
          transition: border-color .25s ease;
        }
        .scroll {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          scrollbar-width: thin;
        }
        .scroll::-webkit-scrollbar { width: 6px; }
        .scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,.15); border-radius: 3px; }

        .msg { padding: 10px 14px; border-radius: 10px; margin-bottom: 8px; word-break: break-word; }
        .msg.me { align-self: flex-end; }
        .msg.ai { background: rgba(255,255,255,.08); }

        .typing { display: flex; align-items: center; gap: 6px; margin-top: 4px; }
        .dot { width: 7px; height: 7px; border-radius: 50%; background: #ffffff66; display: inline-block; animation: dance 1s infinite ease-in-out; }
        @keyframes dance { 0%,60%,100%{transform:translateY(0);opacity:.5} 30%{transform:translateY(-6px);opacity:1} }

        .inputRow { display: flex; gap: 8px; padding: 10px; border-top: 1px solid rgba(255,255,255,.1); background: #0f172a; }
        .input {
          flex: 1; padding: 12px; border-radius: 10px;
          border: 2px solid; background: #0f172a; color: var(--text); font-size: 16px;
          transition: border-color .25s ease, box-shadow .25s ease;
        }
        .input:focus { outline: none; box-shadow: 0 0 0 3px rgba(255,255,255,.05); }
        .btn { color: #fff; border: none; border-radius: 10px; padding: 12px 18px; font-weight: 600; cursor: pointer; transition: filter .2s ease, transform .1s ease; }
        .btn:hover { filter: brightness(1.05); }
        .btn:active { transform: scale(.98); }

        @media (max-width: 768px) {
          .menu { left: 50%; transform: translate(-50%, 6px) scale(.98); }
          .menu.open { transform: translate(-50%, 0) scale(1); }
          .selectWrap { gap: 8px; }
          .label { display: none; }
          .selectBtn { min-width: 180px; }
          .chat { border-radius: 0; max-width: 100%; height: 100vh; }
          .inputRow { position: fixed; bottom: 0; left: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
