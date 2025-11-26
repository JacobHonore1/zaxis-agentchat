"use client";

import { useState } from "react";
import { DriveFile } from "../types/DriveFile";

export default function ChatPane({ files }: { files: DriveFile[] }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  function findRequestedFile(message: string, files: DriveFile[]) {
    const lowerMsg = message.toLowerCase();
    return files.find((f) => lowerMsg.includes(f.name.toLowerCase())) || null;
  }

  async function sendMessage() {
    if (!input.trim()) return;

    const requestedFile = findRequestedFile(input, files);

    const userMsgObj = { role: "user", text: input };
    setMessages((m) => [...m, userMsgObj]);

    setInput("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userMsgObj.text,
        requestedFile,
      }),
    });

    const data = await res.json();
    const botMsgObj = { role: "assistant", text: data.reply || "Intet svar." };

    setMessages((m) => [...m, botMsgObj]);
  }

  // 🔍 Debug-helper — gør filerne synlige i browserens konsol
  if (typeof window !== "undefined") {
    // du kan nu køre:  window.__files_debug  i devtools
    (window as any).__files_debug = files;
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
          padding: "24px",
          color: "#fff",
        }}
      >
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 16 }}>
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
          disabled={!input.trim()}
          onClick={sendMessage}
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
