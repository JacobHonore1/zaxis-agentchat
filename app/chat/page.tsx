"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type Msg = { role: "user" | "assistant"; content: string };
type Agent = "SoMe" | "Strategi" | "Firma Guidelines";

const AGENTS: Agent[] = ["SoMe", "Strategi", "Firma Guidelines"];

const agentStyles: Record<
  Agent,
  { color: string; bubble: string; light: string; text: string }
> = {
  SoMe: { color: "#1d4ed8", bubble: "#172554", light: "#3b82f6", text: "#ffffff" },
  Strategi: { color: "#0f766e", bubble: "#064e3b", light: "#14b8a6", text: "#f5fff9" },
  "Firma Guidelines": { color: "#6d28d9", bubble: "#3b0764", light: "#a78bfa", text: "#ffffff" },
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [agent, setAgent] = useState<Agent>("SoMe");
  const [open, setOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();

    setMessages((p) => [...p, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `${agent}: ${text}` }),
      });
      const data = await res.json();

      const formatted =
        (data.reply || "")
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/\n\s*\n/g, "<br/><br/>")
          .replace(/\n/g, "<br/>");

      setMessages((p) => [
        ...p,
        { role: "assistant", content: formatted || "..." },
      ]);

      inputRef.current?.focus();
    } catch {
      setMessages((p) => [
        ...p,
        { role: "assistant", content: "Der opstod en fejl." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const { color, bubble, light, text } = agentStyles[agent];

  return (
    <div className="page">
      <header>
        <Image src="/logo.png" alt="Logo" width={150} height={50} priority />
      </header>

      <div className="selectWrap" ref={dropdownRef}>
        <span className="label">Vælg agent:</span>
        <button
          className="selectBtn"
          style={{ background: color, borderColor: light, color: text }}
          onClick={() => setOpen((v) => !v)}
        >
          {agent}
          <svg
            className={`chev ${open ? "up" : ""}`}
            width="16"
            height="16"
            viewBox="0 0 24 24"
          >
            <path fill={text} d="M7 10l5 5 5-5z" />
          </svg>
        </button>

        <div className={`menu ${open ? "open" : ""}`} style={{ borderColor: light }}>
          {AGENTS.map((a) => (
            <div
              key={a}
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

      <div className="chat" style={{ borderColor: light }}>
        <div className="scroll" ref={scrollRef}>
          {messages.map((m, i) => (
            <div
              key={i}
              className={`msg ${m.role}`}
              style={{
                background: m.role === "user" ? bubble : "rgba(255,255,255,0.08)",
              }}
              dangerouslySetInnerHTML={{ __html: m.content }}
            />
          ))}
          {loading && (
            <div className="typing" style={{ color: light }}>
              <span>AI arbejder</span>
              <span className="dot" />
              <span className="dot" style={{ animationDelay: "0.15s" }} />
              <span className="dot" style={{ animationDelay: "0.3s" }} />
            </div>
          )}
        </div>

        <form onSubmit={onSend} className="inputRow">
          <input
            ref={inputRef}
            type="text"
            placeholder="Skriv din besked..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ borderColor: light }}
          />
          <button type="submit" style={{ background: color }}>
            Send
          </button>
        </form>
      </div>

      <style>{`
        html, body {
          margin: 0;
          height: 100%;
          overflow: hidden;
          background: #0b1020;
          color: #fff;
          font-family: Inter, sans-serif;
        }

        .page {
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100vh;
          padding-bottom: 10px; /* fast luft i bunden */
        }

        header {
          margin-top: 20px;
          text-align: center;
        }

        .selectWrap {
          position: relative;
          margin: 12px 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .selectBtn {
          border: 2px solid;
          border-radius: 14px;
          padding: 8px 14px;
          display: flex;
          align-items: center;
          gap: 6px;
          justify-content: space-between;
          min-width: 160px;
          transition: all 0.25s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .menu {
          position: absolute;
          top: calc(100% + 6px);
          left: 70px;
          width: 200px;
          border: 2px solid;
          border-radius: 14px;
          overflow: hidden;
          opacity: 0;
          transform: translateY(6px) scale(0.97);
          pointer-events: none;
          transition: all 0.25s ease;
        }

        .menu.open {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        }

        .chat {
          display: flex;
          flex-direction: column;
          width: 90%;
          max-width: 700px;
          max-height: calc(100vh - 170px);
          border: 2px solid;
          border-radius: 16px;
          background: #141b2d;
          box-shadow: 0 0 25px rgba(0,0,0,0.4);
          overflow: hidden;
          margin-bottom: 14px;
          position: relative;
        }

        .scroll {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.2) transparent;
        }

        .scroll::-webkit-scrollbar { width: 6px; }
        .scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.25);
          border-radius: 4px;
        }

        .msg {
          padding: 10px 14px;
          border-radius: 10px;
          margin-bottom: 10px;
          line-height: 1.6;
          opacity: 0;
          transform: translateY(6px);
          animation: fadeIn 0.4s ease forwards;
        }

        .msg strong { color: #fff; }

        .typing {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 4px;
        }

        .dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: rgba(255,255,255,0.4);
          animation: dance 1s infinite ease-in-out;
        }

        @keyframes dance {
          0%,60%,100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-6px); opacity: 1; }
        }

        .inputRow {
          display: flex;
          padding: 10px;
          background: #1e2638;
          gap: 8px;
          border-top: 1px solid rgba(255,255,255,0.1);
          position: sticky;
          bottom: 0;
        }

        .inputRow input {
          flex: 1;
          padding: 12px;
          border: 2px solid;
          border-radius: 10px;
          background: #0f172a;
          color: #fff;
          font-size: 16px;
          caret-color: #3b82f6;
          box-shadow: inset 0 0 4px rgba(0,0,0,0.3);
        }

        .inputRow button {
          border: none;
          color: #fff;
          border-radius: 10px;
          padding: 10px 18px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
        }

        @keyframes fadeIn {
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .chat { width: 95%; max-height: calc(100vh - 180px); }
          .inputRow input { font-size: 15px; }
          .inputRow button { padding: 8px 14px; }
        }
      `}</style>
    </div>
  );
}
