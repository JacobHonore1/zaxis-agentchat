"use client";

import { useState } from "react";

export default function ChatPane() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hvordan kan jeg hjælpe dig i dag?" },
  ]);
  const [input, setInput] = useState("");

  async function sendMessage() {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();

    setMessages([...newMessages, { role: "assistant", content: data.reply }]);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Message area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          color: "#fff",
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              marginBottom: "16px",
              padding: "16px",
              background:
                m.role === "assistant" ? "rgba(255,255,255,0.1)" : "#004c61",
              borderRadius: "10px",
            }}
          >
            <strong>
              {m.role === "assistant" ? "Assistent" : "Bruger"}
            </strong>
            <div>{m.content}</div>
          </div>
        ))}
      </div>

      {/* Input bar */}
      <div
        style={{
          padding: "12px",
          display: "flex",
          gap: "10px",
          background: "rgba(0,0,0,0.25)",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "8px",
            border: "none",
          }}
          placeholder="Skriv din besked"
        />

        <button
          onClick={sendMessage}
          style={{
            background: "#008cc7",
            color: "#fff",
            padding: "0 20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
