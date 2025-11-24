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

    const userMsg = { role: "user" as const, content: inputMessage };
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
      const assistantMsg = {
        role: "assistant" as const,
        content: data.reply || "Intet svar modtaget",
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Der opstod en serverfejl." },
      ]);
    }

    setInputMessage("");
    setIsLoading(false);
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#002233",
        overflow: "hidden"
      }}
    >
      <div className="main-area">
        
        {/* Agent menu */}
        <div style={{ width: 260 }} className="panel">
          <AgentSidebar
            currentAgentId={currentAgent}
            onSelectAgent={(id) => setCurrentAgent(id)}
          />
        </div>

        {/* Chat */}
        <div
          className="panel"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: 20
          }}
        >
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              paddingRight: 8
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 12,
                  padding: 12,
                  borderRadius: 10,
                  maxWidth: "60%",
                  background:
                    msg.role === "user"
                      ? "rgba(255,255,255,0.12)"
                      : "rgba(0,0,0,0.25)",
                  color: "white"
                }}
              >
                <strong style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                  {msg.role === "user" ? "Bruger" : "Assistent"}
                </strong>
                <div style={{ marginTop: 6 }}>{msg.content}</div>
              </div>
            ))}

            {isLoading && (
              <div style={{ color: "rgba(255,255,255,0.6)", marginTop: 10 }}>
                Assistenten skriver…
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              padding: 12,
              background: "rgba(0,0,0,0.25)",
              borderRadius: 12
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
                outline: "none"
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
                fontWeight: 600
              }}
            >
              Send
            </button>
          </div>
        </div>

        {/* Vidensbank */}
        <div style={{ width: 300 }} className="panel">
          <KnowledgeSidebar />
        </div>
      </div>
    </div>
  );
}
