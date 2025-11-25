"use client";

import { useState } from "react";

export default function ChatPane() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Chat messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px",
        }}
      >
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: "16px", color: "#fff" }}>
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input area */}
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
          value = {input}
          onChange = {(e) => setInput(e.target.value)}
        />

        <button
          disabled={!input.trim()}
          style={{
            padding: "12px 18px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: input.trim() ? "#0077aa" : "gray",
            color: "#fff",
            cursor: input.trim() ? "pointer" : "not-allowed",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
