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
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  async function sendMessage() {
    if (!inputMessage.trim()) return;

    const userMsg = { role: "user", content: inputMessage };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputMessage,
          agent: currentAgent,
          fileId: selectedFileId
        }),
      });

      const data = await res.json();

      const assistantMsg = {
        role: "assistant",
        content: data.reply || "Intet svar modtaget"
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Der opstod en fejl i kommunikationen." }
      ]);
    }

    setInputMessage("");
    setSelectedFileId(null);
    setIsLoading(false);
  }

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      display: "flex",
      background: "#002233",
      overflow: "hidden",
      padding: "20px"
    }}>
      <AgentSidebar
        currentAgentId={currentAgent}
        onSelectAgent={(id) => setCurrentAgent(id)}
      />

      <div
        style={{
          flex: 1,
          padding: "20px",
          margin: "0 20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          borderRadius: "16px",
          background: "rgba(255,255,255,0.03)",
          overflow: "hidden"
        }}
      >
        <div style={{ flex: 1, overflowY: "auto", paddingRight: 8 }}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                marginBottom: 12,
                display: "flex",
                flexDirection: "column",
                maxWidth: "60%",
                background:
                  msg.role === "user"
                    ? "rgba(255,255,255,0.12)"
                    : "rgba(0,0,0,0.25)",
                padding: 12,
                borderRadius: 10,
                color: "white"
              }}
            >
              <strong style={{ fontSize: "0.8rem", marginBottom: 6, opacity: 0.8 }}>
                {msg.role === "user" ? "Bruger" : "Assistent"}
              </strong>
              <span>{msg.content}</span>
            </div>
          ))}

          {isLoading && (
            <div style={{ color: "rgba(255,255,255,0.6)", fontStyle: "italic" }}>
              Assistenten skriver…
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            padding: "12px",
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
              background: isLoading ? "gray" : "#0af",
              color: "white",
              cursor: "pointer"
            }}
          >
            Send
          </button>
        </div>
      </div>

      <div style={{ width: "300px" }}>
        <KnowledgeSidebar onSelectFile={(id) => setSelectedFileId(id)} />
      </div>
    </div>
  );
}
