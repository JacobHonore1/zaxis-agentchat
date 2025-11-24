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
    } catch (err) {
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
        position: "fixed",
        inset: 0,
        background: "linear-gradient(180deg, #012230, #013549)",
        display: "flex",
        overflow: "hidden",
      }}
    >
      {/* Indvendig wrapper med 10 procent margin og padding top/bund */}
      <div
        style={{
          display: "flex",
          flex: 1,
          margin: "0 10%",
          padding: "20px 0",
          overflow: "hidden",
        }}
      >
        {/* Agents i venstre side */}
        <AgentSidebar
          currentAgentId={currentAgent}
          onSelectAgent={(id) => setCurrentAgent(id)}
        />

        {/* Chat midtfor */}
        <div
          style={{
            flex: 1,
            margin: "0 20px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: "rgba(0,0,0,0.12)",
            borderRadius: 12,
            padding: 20,
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          }}
        >
          {/* Chat med scrollbar */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              paddingRight: 10,
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  marginBottom: 12,
                  display: "flex",
                  flexDirection: "column",
                  maxWidth: "70%",
                  background:
                    msg.role === "user"
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(0,0,0,0.25)",
                  padding: 12,
                  borderRadius: 10,
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

                <span style={{ fontSize: "1rem" }}>{msg.content}</span>
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

          {/* Inputfelt */}
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              padding: "12px",
              background: "rgba(0,0,0,0.25)",
              borderRadius: 12,
              marginTop: 10,
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
                background: "rgba(255,255,255,0.1)",
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

        {/* Vidensbank */}
        <KnowledgeSidebar />
      </div>
    </div>
  );
}
