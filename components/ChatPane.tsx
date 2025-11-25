"use client";

import { useEffect, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatPane() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim()) return;

    setMessages((m) => [...m, { role: "user", content: input }]);
    setInput("");
    setLoading(true);

    const r = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });

    const d = await r.json();
    setMessages((m) => [...m, { role: "assistant", content: d.reply }]);
    setLoading(false);
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 20,
          paddingRight: 12,
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              marginBottom: 12,
              background:
                msg.role === "user"
                  ? "rgba(255,255,255,0.15)"
                  : "rgba(0,0,0,0.25)",
              padding: 12,
              borderRadius: 10,
              color: "#fff",
              maxWidth: "70%",
            }}
          >
            <strong style={{ opacity: 0.7, fontSize: "12px" }}>
              {msg.role === "user" ? "Bruger" : "Assistent"}
            </strong>
            <div style={{ marginTop: 6 }}>{msg.content}</div>
          </div>
        ))}

        {loading && (
          <div
            style={{
              color: "#fff",
              opacity: 0.6,
              fontStyle: "italic",
              padding: "12px 0",
            }}
          >
            Assistenten tænker<span className="dotdotdot">...</span>
          </div>
        )}
      </div>

      {/* Input area */}
      <div style={{ display: "flex", gap: 12, padding: 20 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Skriv din besked"
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 8,
            border: "none",
          }}
        />
        <button
          onClick={send}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            background: "#0096d6",
            border: "none",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
