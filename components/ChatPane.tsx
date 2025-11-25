"use client";

import { useState, useRef, useEffect } from "react";

export default function ChatPane() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setIsThinking(true);

    // Simulerer assistentsvar (din API kommer her normalt)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Tak for din besked. Hvordan kan jeg hjælpe?" },
      ]);
      setIsThinking(false);
    }, 1600);
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        ref={chatRef}
        style={{
          flex: 1,
          overflowY: "auto",
          paddingRight: "8px",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              backgroundColor:
                msg.role === "assistant"
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(255,255,255,0.12)",
              color: "#fff",
              borderRadius: "12px",
              padding: "12px 16px",
              marginBottom: "12px",
              maxWidth: "80%",
            }}
          >
            <strong style={{ opacity: 0.8 }}>
              {msg.role === "assistant" ? "Assistent" : "Bruger"}
            </strong>
            <div style={{ marginTop: "4px" }}>{msg.content}</div>
          </div>
        ))}

        {isThinking && (
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.08)",
              color: "#fff",
              borderRadius: "12px",
              padding: "12px 16px",
              marginBottom: "12px",
              width: "120px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <strong style={{ opacity: 0.8 }}>Assistenten skriver</strong>

            {/* Tre animerede prikker */}
            <div
              style={{
                display: "flex",
                gap: "6px",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#fff",
                    opacity: 0.7,
                    animation: `dotPulse 1.4s infinite ease-in-out`,
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>

            {/* Animation keyframes */}
            <style jsx>{`
              @keyframes dotPulse {
                0% { opacity: 0.2; transform: translateY(0); }
                50% { opacity: 1; transform: translateY(-3px); }
                100% { opacity: 0.2; transform: translateY(0); }
              }
            `}</style>
          </div>
        )}
      </div>

      {/* Input række */}
      <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Skriv din besked..."
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: "10px",
            border: "none",
          }}
        />

        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          style={{
            backgroundColor: input.trim() ? "#0077aa" : "#4b6b7a",
            color: "#fff",
            padding: "10px 22px",
            borderRadius: "10px",
            border: "none",
            cursor: input.trim() ? "pointer" : "default",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
