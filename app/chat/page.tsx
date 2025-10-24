"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

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
      if (!res.ok || data?.error) throw new Error(data?.error || `Server error (${res.status})`);

      const reply = (data?.reply ?? "").toString();
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err: any) {
      setError(err?.message || "Ukendt fejl fra serveren.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        backgroundColor: "#0b1020",
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        color: "#ffffff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Logo + glow */}
      <div style={{ position: "relative", marginTop: 60, marginBottom: 8 }}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 260,
            height: 100,
            background:
              "radial-gradient(circle at center, rgba(37,99,235,0.25) 0%, rgba(11,16,32,0) 70%)",
            filter: "blur(25px)",
            zIndex: 0,
          }}
        />
        <Image
          src="/logo.png"
          alt="Logo"
          width={200}
          height={70}
          style={{
            position: "relative",
            zIndex: 1,
            animation: "fadeIn 1.2s ease-in-out",
          }}
        />
      </div>

      <h2
        style={{
          fontSize: 16,
          opacity: 0.8,
          marginBottom: 28,
          animation: "fadeIn 2s",
        }}
      >
        - assistenter der skaber værdi -
      </h2>

      {/* Chat container */}
      <div
        style={{
          width: "90%",
          maxWidth: 700,
          backgroundColor: "#141b2d",
          borderRadius: 18,
          padding: 20,
          boxShadow: "0 0 30px rgba(0,0,0,0.6)",
          display: "flex",
          flexDirection: "column",
          height: "65vh",
          overflow: "hidden",
          animation: "fadeInUp 1s ease",
        }}
      >
        {/* Scrollområde */}
        <div className="chat-scroll">
          {messages.length === 0 && (
            <div style={{ color: "#9ca3af", textAlign: "center", marginTop: 40 }}>
              Skriv en besked herunder for at starte.
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={`${m.role}-${i}`}
              style={{
                background: m.role === "user" ? "#1d2951" : "rgba(255,255,255,0.05)",
                borderRadius: 10,
                padding: "10px 14px",
                marginBottom: 10,
                animation: "fadeIn 0.4s ease-in",
              }}
            >
              <strong>{m.role === "user" ? "Du" : "AI"}:</strong>{" "}
              <span style={{ whiteSpace: "pre-wrap" }}>{m.content}</span>
            </div>
          ))}

          {loading && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginTop: 4,
                color: "#3b82f6",
                fontSize: 14,
              }}
            >
              <span>AI arbejder</span>
              <div className="dot" style={dotStyle}></div>
              <div className="dot" style={{ ...dotStyle, animationDelay: "0.15s" }}></div>
              <div className="dot" style={{ ...dotStyle, animationDelay: "0.3s" }}></div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {error && (
          <div style={{ color: "#ef4444", marginTop: 10 }}>Fejl: {error}</div>
        )}

        <form onSubmit={onSend} style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <input
            type="text"
            placeholder="Skriv din besked..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px 14px",
              borderRadius: 8,
              border: "1px solid #1e293b",
              backgroundColor: "#0f172a",
              color: "#fff",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={loading || input.trim().length === 0}
            style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px 18px",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s",
            }}
          >
            {loading ? "Sender…" : "Send"}
          </button>
        </form>
      </div>

      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          background-color: #0b1020;
          overflow: hidden;
          height: 100%;
        }

        .chat-scroll {
          flex: 1;
          overflow-y: auto;
          padding-right: 8px;
          scrollbar-width: thin;
          scrollbar-color: #2563eb #0f172a;
        }

        .chat-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .chat-scroll::-webkit-scrollbar-track {
          background: #0f172a;
        }
        .chat-scroll::-webkit-scrollbar-thumb {
          background-color: #2563eb;
          border-radius: 4px;
          box-shadow: 0 0 4px rgba(37,99,235,0.5);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* DANSENDE PRIKKER */
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-6px); opacity: 1; }
        }

        .dot {
          width: 6px;
          height: 6px;
          background-color: #3b82f6;
          border-radius: 50%;
          display: inline-block;
          animation: bounce 1s infinite ease-in-out;
          box-shadow: 0 0 6px rgba(59,130,246,0.7);
        }
      `}</style>
    </div>
  );
}

const dotStyle: React.CSSProperties = {
  width: "6px",
  height: "6px",
  backgroundColor: "#3b82f6",
  borderRadius: "50%",
  display: "inline-block",
  animation: "bounce 1s infinite ease-in-out",
  boxShadow: "0 0 6px rgba(59,130,246,0.7)",
};
