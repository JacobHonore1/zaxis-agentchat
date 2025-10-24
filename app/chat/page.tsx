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

    // Add the user's message locally
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }), // matches API contract
      });

      const data = await res.json();
      if (!res.ok || data?.error) {
        throw new Error(data?.error || `Server error (${res.status})`);
      }

      const reply = (data?.reply ?? "").toString();
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err: any) {
      setError(err?.message || "Unknown server error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 20 }}>
        Zaxis Agent Chat
      </h1>

      {/* Chat window */}
      <div
        style={{
          border: "2px solid #e5e7eb",
          borderRadius: 8,
          height: 420,
          overflowY: "auto",
          padding: 16,
          background: "#fff",
        }}
      >
        {messages.length === 0 && (
          <div style={{ color: "#6b7280" }}>
            Write a message below to start.
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={`${m.role}-${i}`}
            style={{
              marginBottom: 12,
              background: m.role === "user" ? "#eaf3ff" : "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: 6,
              padding: "8px 10px",
            }}
          >
            <strong>{m.role === "user" ? "You" : "AI"}:</strong>{" "}
            <span style={{ whiteSpace: "pre-wrap" }}>{m.content}</span>
          </div>
        ))}

        {loading && (
          <div style={{ color: "#6b7280" }}>AI is typing…</div>
        )}

        <div ref={endRef} />
      </div>

      {/* Error */}
      {error && (
        <div style={{ color: "#dc2626", marginTop: 10 }}>
          Error: {error}
        </div>
      )}

      {/* Input */}
      <form onSubmit={onSend} style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <input
          type="text"
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          style={{
            flex: 1,
            padding: "10px 12px",
            border: "1px solid #d1d5db",
            borderRadius: 6,
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={loading || input.trim().length === 0}
          style={{
            background: "#111827",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 14px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Sending…" : "Send"}
        </button>
      </form>
    </div>
  );
}
