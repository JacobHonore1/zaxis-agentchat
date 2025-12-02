"use client";

import { useState, useRef, useEffect } from "react";
import { DriveFile } from "../types/DriveFile";
import ReactMarkdown from "react-markdown";

export default function ChatPane({ files }: { files: DriveFile[] }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  function scrollToBottom() {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const markdownStyles = `
    p { margin: 4px 0; line-height: 1.1; }
    strong { font-weight: 700; }
    ul { margin: 4px 0 4px 18px; }
    li { margin: 2px 0; }
  `;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <style>{markdownStyles}</style>

      <style>
        {`
          .chat-scroll::-webkit-scrollbar { width: 6px; }
          .chat-scroll::-webkit-scrollbar-thumb { background-color: #0b6fa4; border-radius: 4px; }
          .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        `}
      </style>

      <div
        className="chat-scroll"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          gap: "8px"
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              maxWidth: "75%",
              padding: "10px 12px",
              borderRadius: "10px",
              whiteSpace: "pre-line",
              border: msg.role === "user" ? "2px solid #1b7cc4" : "2px solid #083b66",
              background: msg.role === "user" ? "#3ba4e0" : "#0b5185",
              alignSelf: msg.role === "user" ? "flex-start" : "flex-end"
            }}
          >
            <ReactMarkdown>{msg.text}</ReactMarkdown>
          </div>
        ))}

        <div ref={chatEndRef} />
      </div>

      <div
        style={{
          display: "flex",
          gap: "8px",
          padding: "10px",
          paddingBottom: "16px",
          background: "rgba(0,0,0,0.15)"
        }}
      >
        <input
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            outline: "none"
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
            padding: "10px 16px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: input.trim() ? "#0077aa" : "gray",
            color: "#fff",
            cursor: input.trim() ? "pointer" : "not-allowed"
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
