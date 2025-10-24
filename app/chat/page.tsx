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
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        color: "#ffffff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <Image
        src="/logo.png"
        alt="Logo"
        width={200}
        height={70}
        style={{
          marginTop: 60,
          marginBottom: 8,
          animation: "fadeIn 1.2s ease-in-out",
        }}
      />

      <h2 style={{ fontSize: 16, opacity: 0.8, marginBottom: 28, animation: "fadeIn 2s" }}>
        - assistenter der skaber værdi -
      </h2>

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
          minHeight: 450,
          animation: "fadeInUp 1s ease",
        }}
      >
        <div style={{ flex: 1, overflowY: "auto", paddingRight: 8 }}>
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
            <div style={{ color: "#3b82f6", display: "flex", gap: 4 }}>
              <span>AI skriver</span>
              <span className="dot" style={dotStyle}></span>
              <span className="dot" style={{ ...dotStyle, animationDelay: "0.2s" }}></span>
              <span className="dot" style={{ ...dotStyle, animationDelay: "0.4s" }}></span>
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
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes blink {
          0%, 80%, 100% { opacity: 0; }
          40% { opacity: 1; }
        }

        .dot {
          width: 6px;
          height: 6px;
          background-color: #3b82f6;
          border-radius: 50%;
          display: inline-block;
          animation: blink 1.2s infinite ease-in-out both;
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
  animation: "blink 1.2s infinite ease-in-out both",
};
