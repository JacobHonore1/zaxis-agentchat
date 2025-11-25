"use client";

import { useState } from "react";
import AgentSidebar from "../components/AgentSidebar";
import KnowledgeSidebar from "../components/KnowledgeSidebar";
import { AgentId, defaultAgentId } from "../config/agents";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  text?: string;
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

    setMessages((prev: ChatMessage[]) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputMessage,
          agent: currentAgent,
          file: selectedFile, // hele filobjektet sendes med
        }),
      });

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.reply || "Intet svar modtaget",
      };

      setMessages((prev: ChatMessage[]) => [...prev, assistantMsg]);
    } catch (err) {
      const assistantErrorMsg: ChatMessage = {
        role: "assistant",
        content: "Der opstod en fejl i kommunikationen med serveren.",
      };
      setMessages((prev: ChatMessage[]) => [...prev, assistantErrorMsg]);
    }

    setInputMessage("");
    setIsLoading(false);
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#002233",            // mørk baggrund over hele skærmen
        display: "flex",
        padding: "20px",                  // padding i sider, top, bund
        boxSizing: "border-box",
        overflow: "hidden",               // ingen scroll på selve browseren
        gap: "20px",
      }}
    >
      {/* Venstre sidebar – AI agenter */}
      <div style={{ width: "260px", height: "100%" }}>
        <AgentSidebar
          currentAgentId={currentAgent}
          onSelectAgent={(id) => setCurrentAgent(id)}
        />
      </div>

      {/* Chat midten */}
      <div
        style={{
          flex: 1,
          background: "linear-gradient(180deg, #012230, #013549)",
          padding: "20px",
          borderRadius: "16px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",             // kun scroll inde i besked-listen
        }}
      >
        {/* Beskeder med scroll */}
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
                maxWidth: "60%",
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

      {/* Vidensbank kolonne */}
      <div style={{ width: "300px", height: "100%" }}>
        <KnowledgeSidebar onSelectFile={(file) => setSelectedFile(file)} />
      </div>
    </div>
  );
}
