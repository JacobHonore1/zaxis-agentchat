"use client";
import { useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();
      const reply = (data?.reply?.content as string) ?? "Tomt svar.";
      setMessages([...nextMessages, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages([
        ...nextMessages,
        { role: "assistant", content: "Der skete en fejl. Prøv igen." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, marginBottom: 16 }}>Zaxis Agent Chat</h1>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 12,
          minHeight: 320,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          background: "#fafafa",
        }}
      >
        {messages.length === 0 && (
          <div style={{ color: "#666" }}>
            Skriv en besked nedenfor for at starte en samtale.
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              background: m.role === "user" ? "#2B6CB0" : "#E2E8F0",
              color: m.role === "user" ? "#fff" : "#111",
              padding: "8px 12px",
              borderRadius: 12,
              maxWidth: "80%",
              whiteSpace: "pre-wrap",
            }}
          >
            {m.content}
          </div>
        ))}

        {loading && (
          <div
            style={{
              alignSelf: "flex-start",
              background: "#E2E8F0",
              color: "#111",
              padding: "8px 12px",
              borderRadius: 12,
              maxWidth: "80%",
            }}
          >
            Tænker…
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Skriv din besked…"
          style={{
            flex: 1,
            padding: "10px 12px",
            border: "1px solid #ddd",
            borderRadius: 8,
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            background: "#2B6CB0",
            color: "#fff",
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
          }}
        >
          Send
        </button>
      </form>
    </main>
  );
}
