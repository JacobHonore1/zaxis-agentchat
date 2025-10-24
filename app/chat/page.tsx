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
    setError(null);
    setPulse(false);

    const text = input.trim();
    if (!text || loading) return;

    setMessages((p) => [...p, { role: "user", content: text }]);
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
      setMessages((p) => [...p, { role: "assistant", content: reply }]);

      // Pulse når svaret er færdigt
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
      <div className="logoWrap">
        <div className="logoGlow" />
        <Image src="/logo.png" alt="Logo" width={200} height={70} priority className="logo" />
      </div>

      <h2 className="tagline">assistenter der skaber værdi</h2>

      <div className={`chat ${pulse ? "pulse" : ""}`}>
        <div className="scroll">
          {messages.length === 0 && (
            <div className="placeholder">Skriv en besked herunder for at starte.</div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role === "user" ? "me" : "ai"}`}>
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
          --blue:#2563eb;
          --text:#fff;
          --muted:#9ca3af;
          --radius:18px;
          --maxW:700px;
        }

        html,body{margin:0;padding:0;background:var(--bg);overflow:hidden;height:100%}
        .shell{width:100vw;height:100vh;display:flex;flex-direction:column;align-items:center;color:var(--text);font-family:Inter,sans-serif}
        .logoWrap{position:relative;margin-top:60px;margin-bottom:8px}
        .logoGlow{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:260px;height:100px;background:radial-gradient(circle,rgba(37,99,235,.25),rgba(11,16,32,0)70%);filter:blur(25px)}
        .tagline{text-align:center;opacity:.8;margin-bottom:28px}
        .chat{width:min(90vw,var(--maxW));background:var(--panel);border-radius:var(--radius);padding:20px;box-shadow:0 0 30px rgba(0,0,0,.6);display:flex;flex-direction:column;height:65vh;overflow:hidden;animation:fadeInUp 1s ease}
        .chat.pulse{animation:pulseGlow 1.5s ease-out}
        .scroll{flex:1;overflow-y:auto;padding-right:8px;scrollbar-width:thin;scrollbar-color:var(--blue,#0f172a)}
        .scroll::-webkit-scrollbar{width:6px}
        .scroll::-webkit-scrollbar-thumb{background:var(--blue);border-radius:4px;box-shadow:0 0 4px rgba(37,99,235,.5)}
        .placeholder{color:var(--muted);text-align:center;margin-top:40px}
        .msg{border-radius:10px;padding:10px 14px;margin-bottom:10px;animation:fadeIn .4s ease-in}
        .msg.me{background:#1d2951}
        .msg.ai{background:rgba(255,255,255,.05)}
        .msgLabel{opacity:.85;margin-right:4px}
        .typing{display:flex;align-items:center;gap:6px;margin-top:6px;color:var(--blue);font-size:14px}
        .dot{width:7px;height:7px;border-radius:50%;background:#3b82f6;display:inline-block;animation:wave 1s infinite ease-in-out;box-shadow:0 0 6px rgba(59,130,246,.7)}
        @keyframes wave{
          0%,60%,100%{transform:translateY(0);opacity:.6}
          30%{transform:translateY(-6px);opacity:1}
        }
        .error{color:#ef4444;margin-top:10px}
        .inputRow{display:flex;gap:10px;margin-top:16px}
        .input{flex:1;padding:12px 14px;border-radius:8px;border:1px solid #1e293b;background:#0f172a;color:#fff}
        .btn{background:var(--blue);color:#fff;border:none;border-radius:8px;padding:12px 18px;font-weight:600;cursor:pointer;transition:transform .06s}
        .btn:active{transform:translateY(1px)}
        @keyframes fadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulseGlow{0%{box-shadow:0 0 0 rgba(37,99,235,0)}40%{box-shadow:0 0 25px rgba(37,99,235,.4)}100%{box-shadow:0 0 0 rgba(37,99,235,0)}}

        /* RESPONSIVE */
        @media (max-width:768px){
          .logo{width:170px}
          .chat{height:60vh}
          .msg{font-size:15px}
        }
      `}</style>
    </div>
  );
}
