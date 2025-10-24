"use client";

import { useState, useRef, useEffect } from "react";

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
      if (!res.ok || data?.error) throw new Error(data?.error || "Serverfejl");

      const reply = (data?.reply ?? "").toString();
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err: any) {
      setError(err?.message || "Ukendt serverfejl.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        fontFamily: "'Inter', sans-serif",
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 800,
          backgroundColor: "white",
          borderRadius: 20,
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          padding: 32,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#111827",
            textAlign: "center",
          }}
        >
          Zaxis Agent Chat
        </h1>

        <div
          style={{
            flexGrow: 1,
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 20,
            backgroundColor: "#fafafa",
            overflowY: "auto",
            height: 420,
          }}
        >
          {messages.length === 0 && (
            <p style={{ color: "#9ca3af", textAlign: "center" }}>
              Skriv en besked for at starte en samtale.
            </p>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent:
                  m.role === "user" ? "flex-end" : "flex-start",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  background:
                    m.role === "user" ? "#2563eb" : "#e5e7eb",
                  color: m.role === "user" ? "white" : "#111827",
                  padding: "10px 14px",
                  borderRadius: 16,
                  maxWidth: "80%",
                  lineHeight: 1.4,
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <p style={{ color: "#6b7280", textAlign: "center" }}>
              AI skriver…
            </p>
          )}
          <div ref={endRef} />
        </div>

        {error && (
          <p style={{ color: "#dc2626", textAlign: "center" }}>{error}</p>
        )}

        <form
          onSubmit={onSend}
          style={{
            display: "flex",
            gap: 10,
          }}
        >
          <input
            type="text"
            placeholder="Skriv besked…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px 14px",
              border: "1px solid #d1d5db",
              borderRadius: 12,
              outline: "none",
              fontSize: 16,
            }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={{
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: 12,
              padding: "12px 20px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background-color 0.2s ease",
            }}
          >
            {loading ? "Sender…" : "Send"}
          </button>
        </form>
      </div>
    </main>
  );
}
