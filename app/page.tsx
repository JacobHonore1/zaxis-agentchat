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
          fileId: selectedFile?.id ?? null,
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
        overflow: "hidden",
        background: "#002233",
        padding: 20,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Global reset til html/body for at fjerne hvide kanter og browser-scrollbar */}
      <style>
        {`
          html, body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            background: #002233;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }
        `}
      </style>

      {/* Topbar */}
      <div
        style={{
          width: "100%",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h2 style={{ margin: 0, fontWeight: 600 }}>Virtoo Assistent MVP 0.13a</h2>

        <button
          onClick={resetChat}
          style={{
            padding: "6px 16px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            background: "#0af",
            color: "white",
            fontWeight: 600,
          }}
        >
          Reset chat
        </button>
      </div>

      {/* 3 kolonner */}
      <div
        style={{
          flex: 1,
          display: "flex",
          gap: 20,
          height: "100%",
        }}
      >
        {/* Venstre – assistenter */}
        <div style={{ width: 260, height: "100%" }}>
          <AgentSidebar
            currentAgentId={currentAgent}
            onSelectAgent={(id) => setCurrentAgent(id)}
          />
        </div>

        {/* Midten – chat */}
        <div
          style={{
            flex: 1,
            background: "linear-gradient(180deg, #012230, #013549)",
            padding: 20,
            borderRadius: 16,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Beskeder med intern scroll */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
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
                  maxWidth: "65%",
                  background:
                    msg.role === "user"
                      ? "rgba(255,255,255,0.12)"
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

          {/* Inputlinje */}
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
                fontSize: "0.95rem",
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

        {/* Højre – vidensbank */}
        <div style={{ width: 300, height: "100%" }}>
          <KnowledgeSidebar
            selectedFileId={selectedFile?.id ?? null}
            onSelectFile={(file) => setSelectedFile(file)}
          />
        </div>
      </div>
    </div>
  );
}
