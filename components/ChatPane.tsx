"use client";

import { useState } from "react";

export default function ChatPane() {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, agent: "default" }),
      });

      const data = await res.json();
      const assistantMessage = {
        role: "assistant",
        text: data.reply || "Intet svar modtaget",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Fejl i kommunikationen med serveren." },
      ]);
    }

    setInput("");
    setIsLoading(false);
  }

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
          <div
            key={i}
            style={{
              marginBottom: "16px",
              color: msg.role === "user" ? "#fff" : "#aee4ff",
              fontWeight: msg.role === "assistant" ? 400 : 600,
            }}
          >
            {msg.text}
          </div>
        ))}

        {isLoading && (
          <div style={{ color: "#7ec8ff", opacity: 0.8, fontStyle: "italic" }}>
            Assistenten skriver…
          </div>
        )}
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
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button
          disabled={!input.trim()}
          onClick={sendMessage}
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
