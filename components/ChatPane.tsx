"use client";

import { useState } from "react";
import { DriveFile } from "../types/DriveFile";

export default function ChatPane({ files = [] }: { files?: DriveFile[] }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  // Find fil hvis brugeren nævner navnet
  const detectReferencedFile = (message: string) => {
    const lower = message.toLowerCase();

    return files.find((f) => lower.includes(f.name.toLowerCase())) || null;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    const referencedFile = detectReferencedFile(userMessage);

    // Tilføj brugerens besked til chatten
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInput("");

    // Byg request payload
    const payload: any = {
      message: userMessage,
    };

    if (referencedFile) {
      payload.requestedFile = referencedFile;
    }

    // Kald chat API
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    // Tilføj assistentens svar
    setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
  };

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
          padding: "24px",
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              marginBottom: "16px",
              color: msg.role === "assistant" ? "#dff" : "#fff",
            }}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input area */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          padding: "12px",
          paddingBottom: "18px",
          background: "rgba(0,0,0,0.15)",
        }}
      >
        <input
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            outline: "none",
          }}
          placeholder="Skriv din besked..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          style={{
            padding: "12px 18px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: input.trim() ? "#0077aa" : "gray",
            color: "#fff",
            cursor: input.trim() ? "pointer" : "not-allowed",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
