"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type Msg = { role: "user" | "assistant"; content: string };
type Agent = "SoMe" | "Strategi" | "Firma Guidelines";

const agentStyles: Record<
  Agent,
  { color: string; bubble: string; light: string; text: string }
> = {
  SoMe: { color: "#2a4fff", bubble: "#1b2a5a", light: "#4b6efc", text: "#ffffff" },
  Strategi: { color: "#12846e", bubble: "#0b473d", light: "#2fd2b0", text: "#f5fff9" },
  "Firma Guidelines": { color: "#7441d9", bubble: "#3d206e", light: "#a78bfa", text: "#ffffff" },
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [agent, setAgent] = useState<Agent>("SoMe");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const text = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: text }]);
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

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: formatted || "..." },
      ]);
      inputRef.current?.focus();
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Der opstod en fejl." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const { color, bubble, light, text } = agentStyles[agent];

  return (
    <div className="page" style={{ background: "#0b1020" }}>
      <header>
        <Image src="/logo.png" alt="Logo" width={150} height={50} priority />
      </header>

      <div className="selector">
        <label htmlFor="agent">Vælg agent:</label>
        <select
          id="agent"
          value={agent}
          onChange={(e) => setAgent(e.target.value as Agent)}
          style={{
            backgroundColor: color,
            color: text,
            borderColor: light,
          }}
        >
          <option value="SoMe" style={{ backgroundColor: agentStyles.SoMe.color }}>
            SoMe
          </option>
          <option
            value="Strategi"
            style={{ backgroundColor: agentStyles.Strategi.color }}
          >
            Strategi
          </option>
          <option
            value="Firma Guidelines"
            style={{ backgroundColor: agentStyles["Firma Guidelines"].color }}
          >
            Firma Guidelines
          </option>
        </select>
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

        <form onSubmit={onSend} className="inputRow" style={{ borderColor: light }}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Skriv din besked..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            ←
          </button>
        </form>
      </div>

      <style>{`
        html, body {
          margin: 0;
          height: 100%;
          overflow: hidden;
          font-family: Inter, sans-serif;
          color: white;
          background: #0b1020;
        }

        .page {
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100vh;
          overflow: hidden;
        }

        header {
          margin-top: 20px;
        }

        .selector {
          margin: 10px 0 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .selector label {
          font-size: 15px;
          color: #cbd5e1;
        }

        .selector select {
          padding: 8px 12px;
          border-radius: 8px;
          border: 2px solid;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          outline: none;
          appearance: auto;
        }

        .chat {
          display: flex;
          flex-direction: column;
          width: 90%;
          max-width: 700px;
          flex-grow: 1;
          border: 2px solid;
          border-radius: 16px;
          background: #141b2d;
          box-shadow: 0 0 25px rgba(0,0,0,0.4);
          overflow: hidden;
          padding-bottom: 16px;
          margin-bottom: 30px; /* Luft under */
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

        .inputRow {
          display: flex;
          align-items: center;
          gap: 8px;
          border-top: 1px solid rgba(255,255,255,0.1);
          padding: 10px;
          background: #0f172a;
          border-radius: 0 0 16px 16px;
          margin-top: auto;
          position: sticky;
          bottom: 0;
        }

        .inputRow input {
          flex: 1;
          padding: 12px;
          border-radius: 8px;
          border: 2px solid;
          background: #1e2638;
          color: white;
          font-size: 15px;
          outline: none;
          box-shadow: inset 0 0 4px rgba(0,0,0,0.3);
        }

        .inputRow button {
          background: none;
          border: none;
          color: white;
          font-size: 22px;
          font-weight: bold;
          cursor: pointer;
          padding: 4px 10px;
          border-radius: 8px;
          transition: background 0.2s ease;
        }

        .inputRow button:hover {
          background: rgba(255,255,255,0.1);
        }

        @keyframes fadeIn {
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .chat {
            width: 95%;
            margin-bottom: 40px;
          }
          .inputRow {
            padding: 8px;
          }
          .inputRow input {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}
