"use client";

import { useState } from "react";
import AgentSidebar from "../components/AgentSidebar";
import KnowledgeSidebar from "../components/KnowledgeSidebar";
import ChatPane from "../components/ChatPane";

export default function Page() {
  const [chatInstance, setChatInstance] = useState(0);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #002233, #003b4d)",
        overflow: "hidden",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          padding: "20px 40px",
          fontSize: "24px",
          fontWeight: 600,
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        Virtuo Assistent MVP 0.13a

        <button
          onClick={() => setChatInstance((n) => n + 1)} // reset ved remount
          style={{
            padding: "8px 18px",
            backgroundColor: "#005f8a",
            color: "#fff",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
          }}
        >
          Reset chat
        </button>
      </div>

      {/* Tre paneler med samme højde og runding */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "320px 1fr 360px",
          gap: 24,
          padding: "0 40px 40px 40px",
          overflow: "hidden",
          alignItems: "stretch",
        }}
      >
        {/* Assistenter */}
        <div
          style={{
            height: "100%",
            borderRadius: 12,
            background: "rgba(0,0,0,0.25)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <AgentSidebar />
        </div>

        {/* Chat */}
        <div
          style={{
            height: "100%",
            borderRadius: 12,
            background: "rgba(0,0,0,0.25)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <ChatPane key={chatInstance} />
        </div>

        {/* Vidensbank */}
        <div
          style={{
            height: "100%",
            borderRadius: 12,
            background: "rgba(0,0,0,0.25)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <KnowledgeSidebar />
        </div>
      </div>
    </div>
  );
}
