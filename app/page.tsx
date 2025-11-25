"use client";

import { useState, useEffect } from "react";
import AgentSidebar from "../components/AgentSidebar";
import KnowledgeSidebar from "../components/KnowledgeSidebar";
import ChatPane from "../components/ChatPane";

export default function Page() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setIsThinking(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "Intet svar modtaget." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Fejl i serverkommunikation." },
      ]);
    }

    setIsThinking(false);
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #002233, #00394a)",
        overflow: "hidden",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          padding: "20px 40px",
          fontSize: "24px",
          fontWeight: 600,
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        Virtuo Assistent MVP 0.13a

        <button
          onClick={() => setMessages([])}
          style={{
            padding: "8px 18px",
            backgroundColor: "#005f8a",
            color: "#fff",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Reset chat
        </button>
      </div>

      {/* Main layout */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "row",
          gap: "24px",
          padding: "0 40px 40px 40px",
          overflow: "hidden",
        }}
      >
        {/* AGENT SIDEBAR */}
        <div
          style={{
            width: "300px",
            height: "100%",
            flexShrink: 0,
            boxSizing: "border-box",
            paddingBottom: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "14px",
              overflow: "hidden",
              boxShadow: "0 0 14px rgba(0,0,0,0.35)",
            }}
          >
            <AgentSidebar />
          </div>
        </div>

        {/* CHAT PANE */}
        <div
          style={{
            flex: 1,
            height: "100%",
            borderRadius: "14px",
            overflow: "hidden",
            background: "rgba(255,255,255,0.04)",
            boxShadow: "0 0 14px rgba(0,0,0,0.35)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  marginBottom: "14px",
                  padding: "12px",
                  maxWidth: "70%",
                  borderRadius: "10px",
                  background:
                    msg.role === "user"
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(0,0,0,0.25)",
                  color: "#fff",
                }}
              >
                <strong style={{ opacity: 0.7, fontSize: "0.8rem" }}>
                  {msg.role === "user" ? "Bruger" : "Assistent"}
                </strong>
                <div style={{ marginTop: 6 }}>{msg.content}</div>
              </div>
            ))}

            {/* Typing indicator */}
            {isThinking && (
              <div
                style={{
                  marginTop: "10px",
                  fontStyle: "italic",
                  opacity: 0.7,
                  color: "white",
                  display: "flex",
                  gap: "6px",
                }}
              >
                Assistenten skriver
                <span className="dots">...</span>
              </div>
            )}
          </div>

          {/* Input bar */}
          <div
            style={{
              padding: "16px",
              display: "flex",
              gap: "12px",
              borderTop: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Skriv din besked…"
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                outline: "none",
              }}
            />

            <button
              onClick={sendMessage}
              style={{
                padding: "10px 18px",
                backgroundColor: "#009bdf",
                borderRadius: "8px",
                color: "white",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>

        {/* KNOWLEDGE SIDEBAR */}
        <div
          style={{
            width: "340px",
            height: "100%",
            flexShrink: 0,
            boxSizing: "border-box",
            paddingBottom: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "14px",
              overflow: "hidden",
            }}
          >
            <KnowledgeSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
