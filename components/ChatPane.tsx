"use client";

import { useState } from "react";
import { DriveFile } from "../types/DriveFile";

export default function ChatPane({ files = [] }: { files?: DriveFile[] }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Find fil i tekst og match med vidensbanken
  const detectRequestedFile = () => {
    const match = input.match(/([A-Za-z0-9._-]+\.(pdf|docx|doc|csv|txt|xlsx|xls))/i);
    if (!match) return null;

    const fileName = match[1].toLowerCase();

    const found = files.find((f: any) =>
      f.name.toLowerCase() === fileName
    );

    return found || null;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    const requestedFile = detectRequestedFile();
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          requestedFile, // ← her sender vi filen korrekt
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.answer || "Intet svar." },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Der opstod en fejl i chatten." },
      ]);
    }

    setLoading(false);
    setInput("");
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
              color: msg.role === "assistant" ? "#fff" : "#aee2ff",
            }}
          >
            {msg.text}
          </div>
        ))}

        {loading && (
          <div style={{ color: "#fff", opacity: 0.6 }}>
            Assistenten skriver…
          </div>
        )}
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
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button
          disabled={!input.trim() || loading}
          onClick={sendMessage}
          style={{
            padding: "12px 18px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: input.trim() && !loading ? "#0077aa" : "gray",
            color: "#fff",
            cursor: input.trim() && !loading ? "pointer" : "not-allowed",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
