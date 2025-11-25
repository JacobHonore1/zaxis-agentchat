"use client";

import { useState } from "react";
import AgentSidebar from "../components/AgentSidebar";
import KnowledgeSidebar from "../components/KnowledgeSidebar";
import { AgentId, defaultAgentId } from "../config/agents";
import type { DriveFile } from "../types/DriveFile";

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
          file: selectedFile,
        }),
      });

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.reply || "Intet svar modtaget",
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Der opstod en fejl i kommunikationen med serveren.",
        },
      ]);
    }

    setInputMessage("");
    setIsLoading(false);
  }

  function resetChat() {
    setMessages([]);
    setInputMessage("");
    setSelectedFile(null);
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#002233",
        display: "flex",
        justifyContent: "center",
        padding: 20,
        boxSizing: "border-box",
      }}
    >
      {/* Centeret arbejdsområde */}
      <div
        style={{
          width: "100%",
          maxWidth: 1400,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Topbar */}
        <div
          style={{
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "4px 4px",
          }}
        >
          <h2
            style={{
              fontSize: "1.4rem",
              margin: 0,
            }}
          >
            Virtoo Assistent MVP 0.13a
          </h2>

          <button
            onClick={resetChat}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: "#0af",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reset chat
          </button>
        </div>

        {/* Hovedlayout */}
        <div className="workspace">
          {/* Venstre panel med agenter */}
          <div className="sidebar-left app-panel">
            <div style={{ padding: 16, height: "100%" }}>
              <AgentSidebar
                currentAgentId={currentAgent}
                onSelectAgent={(id) => setCurrentAgent(id)}
              />
            </div>
          </div>

          {/* Chat midte */}
          <div className="chat-column app-panel">
            <div
              style={{
                height: "100%",
                padding: 20,
                display: "flex",
                flexDirection: "column",
                background: "linear-gradient(180deg,#012230,#013549)",
                borderRadius: 16,
              }}
            >
              {/* Beskeder */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  paddingRight: 10,
                }}
              >
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      marginBottom: 12,
                      padding: 12,
                      borderRadius: 10,
                      maxWidth: "70%",
                      background:
                        msg.role === "user"
                          ? "rgba(255,255,255,0.12)"
                          : "rgba(0,0,0,0.25)",
                      color: "white",
                    }}
                  >
                    <strong
                      style={{
                        fontSize: "0.8rem",
                        opacity: 0.7,
                      }}
                    >
                      {msg.role === "user" ? "Bruger" : "Assistent"}
                    </strong>
                    <div style={{ marginTop: 6 }}>{msg.content}</div>
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
                    Assistenten skriver …
                  </div>
                )}
              </div>

              {/* Input */}
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  paddingTop: 10,
                }}
              >
                <input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Skriv din besked"
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 8,
                    border: "none",
                    outline: "none",
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
          </div>

          {/* Højre panel vidensbank */}
          <div className="sidebar-right app-panel">
            <KnowledgeSidebar
              onSelectFile={(file) => setSelectedFile(file)}
              selectedFileId={selectedFile?.id || null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
