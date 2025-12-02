"use client";

import { useState, useRef, useEffect } from "react";
import { DriveFile } from "../types/DriveFile";
import ReactMarkdown from "react-markdown";

export default function ChatPane({ files }: { files: DriveFile[] }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  function scrollToBottom() {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  function findRequestedFile(message: string, files: DriveFile[]) {
    const lowerMsg = message.toLowerCase();
    return files.find((f) => lowerMsg.includes(f.name.toLowerCase())) || null;
  }

  async function sendMessage() {
    if (!input.trim() || isLoading) return;

    const requestedFile = findRequestedFile(input, files);

    const userMsgObj = { role: "user", text: input };
    setMessages((m) => [...m, userMsgObj]);
    setInput("");
    setIsLoading(true);

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
      const botMsgObj = { role: "assistant", text: data.reply || "Intet svar." };
      setMessages((m) => [...m, botMsgObj]);
    } catch (error) {
      const errorMsg = {
        role: "assistant",
        text: "Der opstod en fejl ved hentning af svar.",
      };
      setMessages((m) => [...m, errorMsg]);
      console.error("Chat error", error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const markdownStyles = `
    p { margin: 1px 0; line-height: 1.15; }
    ul { margin: 0 0 0 14px; }
    li { margin: 1px 0; }
    strong { font-weight: 700; }
  `;

  const typingStyles = `
    .typing-indicator {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .typing-indicator span {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #ffffff;
      opacity: 0.4;
      animation: typingBounce 1s infinite ease-in-out;
    }
    .typing-indicator span:nth-child(2) {
      animation-delay: 0.2s;
    }
    .typing-indicator span:nth-child(3) {
      animation-delay: 0.4s;
    }
    @keyframes typingBounce {
      0%, 80%, 100% {
        transform: translateY(0);
        opacity: 0.3;
      }
      40% {
        transform: translateY(-3px);
        opacity: 1;
      }
    }
  `;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <style>{markdownStyles}</style>
      <style>{typingStyles}</style>

      <style>
        {`
          .chat-scroll::-webkit-scrollbar { width: 6px; }
          .chat-scroll::-webkit-scrollbar-thumb { background-color: #0b6fa4; border-radius: 4px; }
          .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        `}
      </style>

      {/* Chat messages */}
      <div
        className="chat-scroll"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          gap: "3px",
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              maxWidth: "75%",
              padding: "4px 8px",
              borderRadius: "8px",
              whiteSpace: "pre-line",
              border: msg.role === "user" ? "2px solid #1b7cc4" : "2px solid #083b66",
              background: msg.role === "user" ? "#3ba4e0" : "#0b5185",
              alignSelf: msg.role === "user" ? "flex-start" : "flex-end",
              fontSize: "14px",
              lineHeight: "1.2",
            }}
          >
            <ReactMarkdown>{msg.text}</ReactMarkdown>
          </div>
        ))}

        {isLoading && (
          <div
            style={{
              maxWidth: "75%",
              padding: "4px 8px",
              borderRadius: "8px",
              border: "2px solid #083b66",
              background: "#0b5185",
              alignSelf: "flex-end",
              fontSize: "14px",
              lineHeight: "1.2",
            }}
          >
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          padding: "10px",
          paddingBottom: "14px",
          background: "rgba(0,0,0,0.15)",
        }}
      >
        <input
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "8px",
            border: "none",
            outline: "none",
            fontSize: "14px",
          }}
          placeholder="Skriv din besked..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button
          disabled={!input.trim() || isLoading}
          onClick={sendMessage}
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: input.trim() && !isLoading ? "#0077aa" : "gray",
            color: "#fff",
            cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
            fontSize: "14px",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
