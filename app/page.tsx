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

  function resetChat() {
    setMessages([]);
    setInputMessage("");
    setSelectedFile(null);
  }

  async function sendMessage() {
    if (!inputMessage.trim()) return;

    const userMsg: ChatMessage = { role: "user", content: inputMessage };
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

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "Intet svar modtaget" }
      ]);
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
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "10px",
        boxSizing: "border-box"
      }}
    >

      {/* Topbar */}
      <div
        className="topbar"
        style={{
          width: "1200px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 20px",
          marginBottom: "14px",
          background: "rgba(255,255,255,0.08)",
          borderRadius: "10px",
          color: "white",
          fontSize: "1.2rem",
          fontWeight: 600
        }}
      >
        <span>Virtoo Assistent MVP 0.13a</span>

        <button
          onClick={resetChat}
          style={{
            background: "rgba(255,255,255,0.15)",
            color: "white",
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: 600
          }}
        >
          Reset chat
        </button>
      </div>

      {/* Workspace */}
      <div
        className="workspace"
        style={{
          width: "1200px",
          height: "calc(100vh - 120px)",
          display: "flex",
          gap: "20px",
          overflow: "hidden"
        }}
      >

        {/* Venstre sidebar */}
        <div className="sidebar-left panel" style={{ width: "260px", height: "100%" }}>
          <AgentSidebar
            currentAgentId={currentAgent}
            onSelectAgent={(id) => setCurrentAgent(id)}
          />
        </div>

        {/* Chat panel */}
        <div
          className="chat-panel panel"
          style={{
            flex: 1,
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: "linear-gradient(180deg, #012230, #013549)"
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
                  maxWidth: "80%",
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
              <div
                style={{
                  marginTop: 10,
                  fontStyle: "italic",
                  color: "rgba(255,255,255,0.6)"
                }}
              >
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

        {/* Vidensbank */}
        <div className="sidebar-right panel" style={{ width: "300px", height: "100%" }}>
          <KnowledgeSidebar onSelectFile={(file) => setSelectedFile(file)} />
        </div>
      </div>
    </div>
  );
}
