"use client";

import { useState } from "react";
import AgentSidebar from "../components/AgentSidebar";
import KnowledgeSidebar from "../components/KnowledgeSidebar";
import { AgentId, defaultAgentId } from "../config/agents";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function HomePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [currentAgent, setCurrentAgent] = useState<AgentId>(defaultAgentId);
  const [isLoading, setIsLoading] = useState(false);

  async function sendMessage() {
    if (!inputMessage.trim()) return;

    const userMsg: { role: "user"; content: string } = {
      role: "user",
      content: inputMessage,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputMessage,
          agent: currentAgent,
        }),
      });

      const data = await res.json();

      const assistantMsg: { role: "assistant"; content: string } = {
        role: "assistant",
        content: data.reply || "Intet svar modtaget",
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const assistantErrorMsg: { role: "assistant"; content: string } = {
        role: "assistant",
        content: "Der opstod en fejl i kommunikationen med serveren.",
      };
      setMessages((prev) => [...prev, assistantErrorMsg]);
    }

    setInputMessage("");
    setIsLoading(false);
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(180deg, #012230, #013549)",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "3vh 3vw",
        boxSizing: "border-box",
      }}
    >
      {/* Wrapper med afrundet kant og let skygge */}
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          borderRadius: 20,
          boxShadow: "0 0 35px rgba(0,0,0,0.35)",
          overflow: "hidden",
          background: "rgba(0,0,0,0.20)",
          backdropFilter: "blur(4px)",
        }}
      >
        <AgentSidebar
          currentAgentId={currentAgent}
          onSelectAgent={(id) => setCurrentAgent(id)}
        />

        <div
          style={{
            flex: 1,
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              paddingRight: 6,
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  marginBottom: 14,
                  display: "flex",
                  flexDirection: "column",
                  maxWidth: "60%",
                  background:
                    msg.role === "user"
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(0,0,0,0.25)",
                  padding: 14,
                  borderRadius: 12,
                  color: "white",
                }}
              >
                <strong
                  style={{
                    fontSize: "0.8rem",
                    marginBottom: 6,
                    opacity: 0.8,
                  }}
                >
                  {msg.role === "user" ? "Bruger" : "Assistent"}
                </strong>

                <span style={{ fontSize: "1rem", lineHeight: 1.45 }}>
                  {msg.content}
                </span>
              </div>
            ))}

            {isLoading && (
              <div
                style={{
                  marginTop: 10,
                  fontStyle: "italic",
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                Assistenten skriver…
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              padding: "12px",
              background: "rgba(0,0,0,0.25)",
              borderRadius: 12,
            }}
          >
            <input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Skriv din besked"
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: 8,
                border: "none",
                outline: "none",
                background: "rgba(255,255,255,0.15)",
                color: "white",
              }}
            />

            <button
              onClick={sendMessage}
              disabled={isLoading}
              style={{
                padding: "10px 18px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                background: isLoading ? "gray" : "#0af",
                color: "white",
                fontWeight: 600,
              }}
            >
              Send
            </button>
          </div>
        </div>

        <KnowledgeSidebar />
      </div>
    </div>
  );
}
