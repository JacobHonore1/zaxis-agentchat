"use client";

import { useState } from "react";
import AgentSidebar from "../components/AgentSidebar";
import KnowledgeSidebar from "../components/KnowledgeSidebar";
import { AgentId, defaultAgentId } from "../config/agents";
import { DriveFile } from "../types/DriveFile";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function HomePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [currentAgent, setCurrentAgent] = useState<AgentId>(defaultAgentId);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);

  async function sendMessage() {
    if (!inputMessage.trim()) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: inputMessage
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
          file: selectedFile
        })
      });

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.reply || "Intet svar modtaget"
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Der opstod en serverfejl." }
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
        background: "#002233",
        display: "flex",
        padding: "20px",
        boxSizing: "border-box",
        overflow: "hidden",
        gap: "20px"
      }}
    >
      <div style={{ width: "260px", height: "100%" }}>
        <AgentSidebar
          currentAgentId={currentAgent}
          onSelectAgent={(id) => setCurrentAgent(id)}
        />
      </div>

      <div
        style={{
          flex: 1,
          background: "linear-gradient(180deg, #012230, #013549)",
          padding: "20px",
          borderRadius: "16px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            paddingRight: 10
          }}
        >
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
              <strong
                style={{
                  fontSize: "0.8rem",
                  marginBottom: 6,
                  opacity: 0.8
                }}
              >
                {msg.role === "user" ? "Bruger" : "Assistent"}
              </strong>

              <span style={{ fontSize: "1rem" }}>{msg.content}</span>
            </div>
          ))}

          {isLoading && (
            <div style={{ marginTop: 10, fontStyle: "italic", color: "white" }}>
              Assistenten skriver…
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 12, paddingTop: 10 }}>
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

      <div style={{ width: "300px", height: "100%" }}>
        <KnowledgeSidebar onSelectFile={(file) => setSelectedFile(file)} />
      </div>
    </div>
  );
}
