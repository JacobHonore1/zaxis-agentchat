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
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPulse(false);

    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      if (!res.ok || data?.error)
        throw new Error(data?.error || `Server error (${res.status})`);

      const reply = (data?.reply ?? "").toString();
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);

      // Visuel “færdig”-indikator
      setTimeout(() => setPulse(true), 100);
      setTimeout(() => setPulse(false), 1600);
    } catch (err: any) {
      setError(err?.message || "Ukendt fejl fra serveren.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="shell">
      {/* Logo + glow */}
      <div className="logoWrap">
        <div className="logoGlow" />
        <Image
          src="/logo.png"
          alt="Logo"
          width={200}
          height={70}
          priority
          className="logo"
        />
      </div>

      <h2 className="tagline">assistenter der skaber værdi</h2>

      {/* Chat container */}
      <div className={`chat ${pulse ? "pulse" : ""}`}>
        <div className="scroll">
          {messages.length === 0 && (
            <div className="placeholder">Skriv en besked herunder for at starte.</div>
          )}

          {messages.map((m, i) => (
            <div
              key={`${m.role}-${i}`}
              className={`msg ${m.role === "user" ? "me" : "ai"}`}
            >
              <strong className="msgLabel">{m.role === "user" ? "Du" : "AI"}:</strong>{" "}
              <span className="msgText">{m.content}</span>
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
          <button
            type="submit"
            disabled={loading || input.trim().length === 0}
            className="btn"
          >
            {loading ? "Sender…" : "Send"}
          </button>
        </form>
      </div>

      <style>{`
        :root{
          --bg:#0b1020;
          --panel:#141b2d;
          --panelShadow:rgba(0,0,0,0.6);
          --blue:#2563eb;
          --blueDeep:#1d2951;
          --text:#ffffff;
          --muted:#9ca3af;
          --danger:#ef4444;
          --inputBg:#0f172a;
          --inputBorder:#1e293b;
          --radius:18px;
          --wMax:700px;
          --containerPad:20px;
          --vhChat:65vh;
          --scrollW:6px;
        }

        html, body {
          margin: 0;
          padding: 0;
          background-color: var(--bg);
          overflow: hidden; /* ingen browser-scroll */
          height: 100%;
        }

        .shell{
          background: var(--bg);
          width: 100vw;
          height: 100vh;
          overflow: hidden; /* låser siden */
          display: flex;
          flex-direction: column;
          align-items: center;
          color: var(--text);
          font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
        }

        .logoWrap{
          position: relative;
          margin-top: 60px;
          margin-bottom: 8px;
        }
        .logoGlow{
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 260px;
          height: 100px;
          background: radial-gradient(circle at center, rgba(37,99,235,0.25) 0%, rgba(11,16,32,0) 70%);
          filter: blur(25px);
          z-index: 0;
          pointer-events: none;
        }
        .logo{
          position: relative;
          z-index: 1;
          animation: fadeIn 1.2s ease-in-out;
          height: auto;
        }

        .tagline{
          font-size: 16px;
          opacity: 0.8;
          margin: 0 0 28px 0;
          animation: fadeIn 2s;
          text-align: center;
        }

        .chat{
          width: min(90vw, var(--wMax));
          background: var(--panel);
          border-radius: var(--radius);
          padding: var(--containerPad);
          box-shadow: 0 0 30px var(--panelShadow);
          display: flex;
          flex-direction: column;
          height: var(--vhChat);
          overflow: hidden; /* scroll styres inde i .scroll */
          animation: fadeInUp 1s ease;
          transition: box-shadow .5s ease-in-out;
        }
        .chat.pulse{
          animation: pulseGlow 1.5s ease-out;
        }

        .scroll{
          flex: 1;
          overflow-y: auto;         /* scroll kun her */
          padding-right: 8px;
          scrollbar-width: thin;    /* Firefox */
          scrollbar-color: var(--blue) var(--inputBg);
        }
        .scroll::-webkit-scrollbar{ width: var(--scrollW); }
        .scroll::-webkit-scrollbar-track{ background: var(--inputBg); }
        .scroll::-webkit-scrollbar-thumb{
          background: var(--blue);
          border-radius: 4px;
          box-shadow: 0 0 4px rgba(37,99,235,0.5);
        }

        .placeholder{
          color: var(--muted);
          text-align: center;
          margin-top: 40px;
        }

        .msg{
          border-radius: 10px;
          padding: 10px 14px;
          margin-bottom: 10px;
          animation: fadeIn .4s ease-in;
        }
        .msg.me{ background: var(--blueDeep); }
        .msg.ai{ background: rgba(255,255,255,0.05); }
        .msgLabel{ opacity: .85; margin-right: 4px; }
        .msgText{ white-space: pre-wrap; }

        .typing{
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
          color: var(--blue);
          font-size: 14px;
        }
        .dot{
          width: 6px; height: 6px; border-radius: 50%;
          background: #3b82f6;
          display: inline-block;
          animation: bounce 1s infinite ease-in-out;
          box-shadow: 0 0 6px rgba(59,130,246,0.7);
        }

        .error{ color: var(--danger); margin-top: 10px; }

        .inputRow{
          display: flex;
          gap: 10px;
          margin-top: 16px;
        }
        .input{
          flex: 1;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid var(--inputBorder);
          background: var(--inputBg);
          color: var(--text);
          outline: none;
          font-size: 16px;
        }
        .btn{
          background: var(--blue);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 12px 18px;
          font-weight: 600;
          cursor: pointer;
          transition: transform .06s ease, filter .2s ease;
        }
        .btn:disabled{ opacity: .6; cursor: not-allowed; }
        .btn:active{ transform: translateY(1px); }
        .btn:hover{ filter: brightness(1.05); }

        /* Animationer */
        @keyframes fadeIn { from{opacity:0; transform: translateY(5px);} to{opacity:1; transform:translateY(0);} }
        @keyframes fadeInUp { from{opacity:0; transform: translateY(20px);} to{opacity:1; transform:translateY(0);} }
        @keyframes bounce { 0%,80%,100%{ transform: translateY(0); opacity:.5;} 40%{ transform: translateY(-6px); opacity:1;} }
        @keyframes pulseGlow {
          0%{ box-shadow: 0 0 0 rgba(37,99,235,0); }
          40%{ box-shadow: 0 0 25px rgba(37,99,235,0.4); }
          100%{ box-shadow: 0 0 0 rgba(37,99,235,0); }
        }

        /* ————— RESPONSIVE ————— */

        /* Tablet */
        @media (max-width: 1024px){
          :root{
            --wMax: 720px;
            --vhChat: 62vh;
          }
          .logoWrap{ margin-top: 48px; }
          .input{ font-size: 16px; }
        }

        /* Mobile */
        @media (max-width: 768px){
          :root{
            --wMax: 100%;
            --containerPad: 16px;
            --vhChat: 60vh;
            --scrollW: 5px;
          }
          .logo{ width: 170px; height: auto; }
          .tagline{ font-size: 14px; margin-bottom: 20px; }
          .chat{ border-radius: 14px; }
          .msg{ font-size: 15px; }
          .input{ padding: 12px; font-size: 16px; }
          .btn{ padding: 12px 16px; }
        }

        /* Small mobile */
        @media (max-width: 380px){
          :root{ --vhChat: 58vh; }
          .logo{ width: 150px; }
          .inputRow{ gap: 8px; }
          .btn{ padding: 11px 14px; }
        }

        /* Bevar performance for brugere der ønsker mindre bevægelse */
        @media (prefers-reduced-motion: reduce){
          *{ animation: none !important; transition: none !important; }
        }
      `}</style>
    </div>
  );
}
