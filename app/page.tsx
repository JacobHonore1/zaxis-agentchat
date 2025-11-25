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
  const [selectedFile, setSelectedFile] = useState(null);

  async function sendMessage() {
    if (!inputMessage.trim()) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: inputMessage,
    };

    setMessages((prev: ChatMessage[]) => [...prev, userMsg]);
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

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.reply || "Intet svar modtaget",
      };

      setMessages((prev: ChatMessage[]) => [...prev, assistantMsg]);
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

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#002233",
        overflow: "hidden",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      {/* Scrollbar styling injiceret direkte */}
      <style>
        {`
          .scroll-area::-webkit-scrollbar {
            width: 6px;
          }

          .scroll-area::-webkit-scrollbar-thumb {
            background: rgba(0, 150, 200, 0.35);
            border-radius: 10px;
          }

          .scroll-area::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 180, 255, 0.5);
          }

          .scroll-area::-webkit-scrollbar-track {
            background: transparent;
          }
        `}
      </style>

      {/* Øverste linje med titel og reset */}
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
          onClick={() => {
            setMessages([]);
            setInputMessage("");
          }}
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

      {/* 3-kolonne layout */}
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "calc(100% - 60px)",
          gap: "20px",
        }}
      >
        {/* Venstre kolonne */}
        <div style={{ width: "260px", height: "100%" }}>
          <AgentSidebar
            currentAgentId={currentAgent}
            onSelectAgent={(id) => setCurrentAgent(id)}
          />
        </div>

        {/* Chat midte */}
        <div
          style={{
            flex: 1,
            background: "linear-gradient(180deg, #012230, #013549)",
            padding: "20px",
            borderRadius: 16,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Chat scroll */}
          <div className="scroll-area" style={{ flex: 1, overflowY: "auto", paddingRight: 10 }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  marginBottom: 12,
                  padding: 12,
                  borderRadius: 10,
                  maxWidth: "65%",
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
                    opacity: 0.8,
                    marginBottom: 6,
                    display: "block",
                  }}
                >
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

          {/* Inputfelt */}
          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
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
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>

        {/* Vidensbank højre kolonne */}
        <div style={{ width: "300px", height: "100%" }}>
          <KnowledgeSidebar
            onSelectFile={(file) => setSelectedFile(file.id)}
            selectedFileId={selectedFile}
          />
        </div>
      </div>
    </div>
  );
}
