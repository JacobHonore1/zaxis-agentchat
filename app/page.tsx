"use client";

import { useState, useEffect, useRef } from "react";
import AgentSidebar from "../components/AgentSidebar";
import { AgentId, defaultAgentId } from "../config/agents";

export default function Home() {
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [inputMessage, setInputMessage] = useState("");
  const [currentAgentId, setCurrentAgentId] = useState<AgentId>(defaultAgentId);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send besked til backend
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
          agent: currentAgentId, // 👈 VIGTIGT! Agent sendes NU korrekt
        }),
      });

      const data = await res.json();

      const assistantMsg = {
        role: "assistant",
        content: data.reply || "Intet svar modtaget",
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Fejl ved sendMessage:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Der opstod en fejl ved forbindelsen til serveren.",
        },
      ]);
    }

    setInputMessage("");
    setIsLoading(false);
  }

  // Håndter Enter
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !isLoading) {
      sendMessage();
    }
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(180deg, #022038, #003047 70%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          background: "rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          fontSize: "1.1rem",
          fontWeight: 600,
          color: "white",
        }}
      >
        Virtoo Assistent MVP 0.13a
      </div>

      {/* MAIN LAYOUT */}
      <div style={{ flex: 1, display: "flex" }}>
        {/* SIDEBAR */}
        <AgentSidebar
          currentAgentId={currentAgentId}
          onSelectAgent={(id) => setCurrentAgentId(id)}
        />

        {/* CHAT */}
        <div
          style={{
            flex: 1,
            padding: 20,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                alignSelf: msg.role === "user" ? "flex-start" : "flex-start",
                background:
                  msg.role === "user"
                    ? "rgba(255,255,255,0.12)"
                    : "rgba(255,255,255,0.08)",
                padding: "10px 16px",
                borderRadius: 12,
                maxWidth: "50%",
                color: "white",
                fontSize: "0.9rem",
                lineHeight: 1.4,
              }}
            >
              {msg.content}
            </div>
          ))}

          {isLoading && (
            <div
              style={{
                background: "rgba(255,255,255,0.06)",
                padding: "10px 16px",
                borderRadius: 12,
                color: "white",
                width: 120,
                fontSize: "0.85rem",
                opacity: 0.8,
              }}
            >
              tænker…
            </div>
          )}

          <div ref={messagesEndRef}></div>
        </div>

        {/* VIDENSBANK (HIGH RIGHT PANEL) */}
        <div
          style={{
            width: 300,
            background: "rgba(0,0,0,0.28)",
            padding: 12,
            borderLeft: "1px solid rgba(255,255,255,0.08)",
            color: "white",
          }}
        >
          <div
            style={{
              fontSize: "0.9rem",
              opacity: 0.7,
              marginBottom: 8,
            }}
          >
            Google Drive filer
          </div>

          <DriveFilesPanel />
        </div>
      </div>

      {/* INPUT BAR */}
      <div
        style={{
          height: 60,
          display: "flex",
          alignItems: "center",
          padding: 12,
          gap: 8,
        }}
      >
        <button
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            background: "rgba(255,255,255,0.12)",
            border: "none",
            color: "white",
            cursor: "pointer",
            fontSize: 22,
          }}
        >
          +
        </button>

        <input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Skriv din besked"
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(255,255,255,0.1)",
            color: "white",
            outline: "none",
          }}
        />

        <button
          onClick={sendMessage}
          disabled={isLoading}
          style={{
            width: 70,
            height: 36,
            borderRadius: 8,
            border: "none",
            background: inputMessage.trim()
              ? "#3BA9FF"
              : "rgba(255,255,255,0.2)",
            color: "white",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   RIGHT SIDEBAR: DRIVE FILE LIST (dummy until backend exists)
---------------------------------------------------------*/
function DriveFilesPanel() {
  const dummy = [
    "Korrekturlæsning og forbedring af tekst",
    "Amanda_Vahle GPT.pdf",
    "JE-TRÆ FACADEDØRE.pdf",
    "PersonaMalgrupper2018.pdf",
    "Rammeaftale for erhvervshusene.pdf",
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {dummy.map((name, i) => (
        <div
          key={i}
          style={{
            background: "rgba(255,255,255,0.06)",
            padding: 8,
            borderRadius: 6,
            fontSize: "0.8rem",
            color: "white",
          }}
        >
          {name}
        </div>
      ))}
    </div>
  );
}
