"use client";

import { useState, KeyboardEvent } from "react";
import { DriveFile } from "../types/DriveFile";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

export default function ChatPane({ files }: { files: DriveFile[] }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  function findRequestedFile(message: string, files: DriveFile[]) {
    const lowerMsg = message.toLowerCase();
    return files.find((f) => lowerMsg.includes(f.name.toLowerCase())) || null;
  }

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed) return;

    const requestedFile = findRequestedFile(trimmed, files);

    const userMsgObj: ChatMessage = { role: "user", text: trimmed };
    setMessages((m) => [...m, userMsgObj]);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsgObj.text,
          requestedFile,
        }),
      });

      const data = await res.json();
      const replyText =
        data?.reply && typeof data.reply === "string"
          ? data.reply
          : "Intet svar modtaget.";

      const botMsgObj: ChatMessage = {
        role: "assistant",
        text: replyText,
      };

      setMessages((m) => [...m, botMsgObj]);
    } catch (err) {
      console.error("Fejl i chat-kald:", err);
      const botMsgObj: ChatMessage = {
        role: "assistant",
        text: "Der opstod en fejl, da jeg forsøgte at hente svar. Prøv venligst igen.",
      };
      setMessages((m) => [...m, botMsgObj]);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        void sendMessage();
      }
    }
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Chat messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 24,
        }}
      >
        {messages.length === 0 && (
          <div style={{ color: "#ffffff", opacity: 0.7 }}>
            Intet svar modtaget.
          </div>
        )}

        {messages.map((msg, i) => {
          const isUser = msg.role === "user";

          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: isUser ? "flex-start" : "flex-end",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  maxWidth: "70%",
                  backgroundColor: isUser
                    ? "rgba(0, 140, 190, 0.6)"
                    : "rgba(0, 22, 40, 0.9)",
                  borderRadius: 16,
                  padding: "10px 14px",
                  color: "#ffffff",
                  fontSize: 14,
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                  boxShadow: "0 0 8px rgba(0,0,0,0.5)",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    opacity: 0.8,
                    marginBottom: 4,
                  }}
                >
                  {isUser ? "Bruger" : "Assistent"}
                </div>
                <div>{msg.text}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input area */}
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "12px 16px 18px 16px",
          background: "rgba(0,0,0,0.18)",
        }}
      >
        <input
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 8,
            border: "none",
            outline: "none",
            fontSize: 14,
          }}
          placeholder="Skriv din besked..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button
          disabled={!input.trim()}
          onClick={sendMessage}
          style={{
            padding: "12px 18px",
            borderRadius: 8,
            border: "none",
            backgroundColor: input.trim() ? "#0077aa" : "gray",
            color: "#fff",
            cursor: input.trim() ? "pointer" : "not-allowed",
            minWidth: 70,
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
