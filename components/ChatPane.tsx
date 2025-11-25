"use client";

import { useEffect, useRef, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPane() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || thinking) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setThinking(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await res.json();
      const replyText =
        data.reply || "Jeg modtog ikke noget brugbart svar fra serveren.";

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: replyText,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Der opstod en fejl i kommunikationen med serveren.",
        },
      ]);
    } finally {
      setThinking(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  }

  const canSend = input.trim().length > 0 && !thinking;

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Beskeder */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 20,
          paddingRight: 16,
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              marginBottom: 14,
              maxWidth: "75%",
            }}
          >
            <div
              style={{
                backgroundColor:
                  msg.role === "user"
                    ? "rgba(255,255,255,0.14)"
                    : "rgba(0,0,0,0.35)",
                padding: 12,
                borderRadius: 8,
                color: "#fff",
              }}
            >
              <strong
                style={{
                  fontSize: 12,
                  opacity: 0.7,
                  marginBottom: 4,
                  display: "block",
                }}
              >
                {msg.role === "user" ? "Bruger" : "Assistent"}
              </strong>
              <div style={{ fontSize: 14 }}>{msg.content}</div>
            </div>
          </div>
        ))}

        {thinking && (
          <div
            style={{
              marginTop: 8,
              fontStyle: "italic",
              fontSize: 13,
              color: "#fff",
              opacity: 0.75,
            }}
          >
            Assistenten skriver…
          </div>
        )}
      </div>

      {/* Inputlinje */}
      <div
        style={{
          padding: 16,
          paddingTop: 10,
          display: "flex",
          gap: 10,
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Skriv din besked…"
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 8,
            border: "none",
            outline: "none",
            fontSize: 14,
          }}
        />

        <button
          onClick={sendMessage}
          disabled={!canSend}
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            border: "none",
            fontWeight: 600,
            backgroundColor: canSend ? "#0096d6" : "#335766",
            color: "#fff",
            cursor: canSend ? "pointer" : "not-allowed",
            opacity: canSend ? 1 : 0.5,
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
