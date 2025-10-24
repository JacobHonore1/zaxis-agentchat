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
      if (!res.ok || data?.error) {
        throw new Error(data?.error || `Server error (${res.status})`);
      }

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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: "60px",
        color: "#ffffff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Logo */}
      <Image
        src="/logo.png"
        alt="Logo"
        width={220}
        height={80}
        style={{ marginBottom: 12 }}
      />

      <h2 style={{ fontSize: 18, opacity: 0.8, marginBottom: 30 }}>
        - assistenter der skaber værdi -
      </h2>

      {/* Chat container */}
      <div
        style={{
          width: "90%",
          maxWidth: 700,
          backgroundColor: "#141b2d",
          borderRadius: 16,
          padding: 20,
          boxShadow: "0 0 20px rgba(0,0,0,0.4)",
          display: "flex",
          flexDirection: "column",
          minHeight: 450,
        }}
      >
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            paddingRight: 8,
          }}
        >
          {messages.length === 0 && (
            <div style={{ color: "#9ca3af", textAlign: "center", marginTop: 40 }}>
              Skriv en besked herunder for at starte.
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={`${m.role}-${i}`}
              style={{
                background:
                  m.role === "user" ? "#1d2951" : "rgba(255,255,255,0.05)",
                borderRadius: 10,
                padding: "10px 14px",
                marginBottom: 10,
              }}
            >
              <strong>{m.role === "user" ? "Du" : "AI"}:</strong>{" "}
              <span style={{ whiteSpace: "pre-wrap" }}>{m.content}</span>
            </div>
          ))}

          {loading && (
            <div style={{ color: "#3b82f6" }}>AI skriver…</div>
          )}

          <div ref={endRef} />
        </div>

        {error && (
          <div style={{ color: "#ef4444", marginTop: 10 }}>
            Fejl: {error}
          </div>
        )}

        {/* Input form */}
        <form
          onSubmit={onSend}
          style={{
            display: "flex",
            gap: 10,
            marginTop: 16,
          }}
        >
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
    </div>
  );
}
