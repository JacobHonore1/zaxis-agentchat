"use client";

import { useState } from "react";
import AgentSidebar from "../components/AgentSidebar";
import KnowledgeSidebar from "../components/KnowledgeSidebar";
import ChatPane from "../components/ChatPane";

export default function Page() {
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
      {/* Top Bar */}
      <div
        style={{
          padding: "20px 40px",
          fontSize: "24px",
          fontWeight: 600,
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Virtuo Assistent MVP 0.13a

        <button
          style={{
            padding: "8px 18px",
            backgroundColor: "#005f8a",
            color: "#fff",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Reset chat
        </button>
      </div>

      {/* Main 3-column layout */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "row",
          gap: "24px",
          padding: "0 40px 40px 40px",
          overflow: "hidden",
        }}
      >
        {/* Agent Sidebar */}
        <div
          style={{
            width: "320px",
            height: "100%",
            flexShrink: 0,
          }}
        >
          <AgentSidebar />
        </div>

        {/* Chat window */}
        <div
          style={{
            flex: 1,
            height: "100%",
            borderRadius: "12px",
            overflow: "hidden",
            background: "rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <ChatPane />
        </div>

        {/* Knowledge Sidebar */}
        <div
          style={{
            width: "360px",
            height: "100%",
            flexShrink: 0,
          }}
        >
          <KnowledgeSidebar />
        </div>
      </div>
    </div>
  );
}
