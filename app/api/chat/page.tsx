// app/chat/page.tsx
"use client";

import { useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    if (!input.trim()) return;
    const next = [...messages, { role: "user", content: input } as Msg];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setMessages((cur) => [...cur, { role: "assistant", content: data.reply }]);
    } catch (e: any) {
      setError(e?.message ?? "Noget gik galt.");
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <main style={{ maxWidth: 760, margin: "40px auto", padding: "0 16px" }}>
      <h1>Zaxis Agent Chat</h1>
      <p style={{ color: "#666" }}>
        Skriv en besked herunder – svar kommer fra din server-side /api/chat, der bruger <code>OPENAI_API_KEY</code>.
      </p>

      <div
        style={{
          border: "1px solid #e5e5e5",
          borderRadius: 12,
          padding: 16,
          minHeight: 300,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          background: "#fff",
        }}
      >
        {messages.length === 0 && (
          <div style={{ color: "#999" }}>Start med at skrive noget…</div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              background: m.role === "user" ? "#eef6ff" : "#f6f6f6",
              border: "1px solid #e5e5e5",
              padding: "8px 12px",
              borderRadius: 12,
              maxWidth: "85%",
              whiteSpace: "pre-wrap",
            }}
          >
            <strong style={{ fontSize: 12, color: "#777" }}>
              {m.role === "user" ? "Du" : "Assistent"}
            </strong>
            <div>{m.content}</div>
          </div>
        ))}
      </div>

      {error && (
        <div style={{ marginTop: 12, color: "#c00" }}>
          Fejl: {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Skriv en besked og tryk Enter…"
          style={{
            flex: 1,
            height: 44,
            borderRadius: 12,
            border: "1px solid #e5e5e5",
            padding: "0 12px",
          }}
        />
        <button
          onClick={send}
          disabled={loading}
          style={{
            height: 44,
            padding: "0 16px",
            borderRadius: 12,
            background: "#111",
            color: "#fff",
            border: "none",
          }}
        >
          {loading ? "Sender…" : "Send"}
        </button>
      </div>
    </main>
  );
}
