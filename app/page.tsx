"use client";

import { useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function Home() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    if (!input.trim()) return;

    // --- TypeScript fix: gør role til literal og sæt eksplicit arraytype ---
    const nextMessages: Msg[] = [
      ...messages,
      { role: "user" as const, content: input },
    ];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      if (!res.ok) throw new Error(await res.text());

      const data: { reply: string } = await res.json();

      // valgfrit: literal igen for konsistens (ikke strengt nødvendigt)
      setMessages((cur) => [
        ...cur,
        { role: "assistant" as const, content: data.reply },
      ]);
    } catch (e: any) {
      setError(e?.message ?? "Noget gik galt.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 760, margin: "40px auto", padding: "0 16px" }}>
      <h1>Zaxis Agent Chat</h1>
      <p>Din agent app kører. Du kan chatte her på forsiden.</p>

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

      {error && <div style={{ marginTop: 12, color: "#c00" }}>Fejl: {error}</div>}

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Skriv en besked…"
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
