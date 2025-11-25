"use client";

import { useState } from "react";
import type React from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPane() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSend() {
    if (!input.trim() || isLoading) return;

    const text = input.trim();
    setInput("");

    // tilføj brugerbesked
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          agent: "linkedin",
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || "Ingen besked fra assistenten.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Der opstod en fejl i kommunikationen med serveren.",
        },
      ]);
    }

    setIsLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Chat messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px",
          scrollbarWidth: "thin",
          scrollbarColor: "#0b6fa4 transparent",
        }}
      >
        {/* Chrome scrollbar */}
        <style>
          {`
            div::-webkit-scrollbar { width: 6px; }
            div::-webkit-scrollbar-thumb { background-color: #0b6fa4; border-radius: 4px; }
            div::-webkit-scrollbar-track { background: transparent; }
          `}
        </style>

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              marginBottom: 12,
              display: "flex",
              flexDirection: "column",
              maxWidth: "70%",
              background: msg.role === "user" ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.35)",
              padding: 12,
              borderRadius: 10,
              color: "#fff",
            }}
          >
            <strong style={{ fontSize: "0.8rem", opacity: 0.85, marginBottom: 4 }}>
              {msg.role === "user" ? "Bruger" : "Assistent"}
            </strong>
            <span style={{ fontSize: "0.95rem" }}>{msg.content}</span>
          </div>
        ))}

        {isLoading && (
          <div style={{ marginTop: 8, fontStyle: "italic", color: "rgba(255,255,255,0.7)" }}>
            Assistenten skriver…
          </div>
        )}
      </div>

      {/* Input */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          padding: "12px",
          paddingBottom: "18px",
          background: "rgba(0,0,0,0.15)",
        }}
      >
        <input
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            outline: "none",
          }}
          placeholder="Skriv din besked..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          style={{
            padding: "12px 18px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: !input.trim() || isLoading ? "gray" : "#0077aa",
            color: "#fff",
            cursor: !input.trim() || isLoading ? "not-allowed" : "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
