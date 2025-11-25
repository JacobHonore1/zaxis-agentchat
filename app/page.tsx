"use client";

import { useEffect, useState } from "react";
import AgentSidebar from "../components/AgentSidebar";
import KnowledgeSidebar from "../components/KnowledgeSidebar";
import ChatPane from "../components/ChatPane";
import { DriveFile } from "../types/DriveFile";

export default function Page() {
  const [files, setFiles] = useState<DriveFile[]>([]);

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const res = await fetch("/api/drive-files");
        const data = await res.json();
        setFiles(data.files || []);
      } catch (err) {
        console.error("Fejl ved hentning af filer", err);
      }
    };

    loadFiles();
  }, []);

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
          onClick={() => window.location.reload()}
        >
          Reset chat
        </button>
      </div>

      {/* 3-column layout */}
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
        <div style={{ width: "320px", flexShrink: 0 }}>
          <AgentSidebar />
        </div>

        {/* Chat Pane */}
        <div
          style={{
            flex: 1,
            borderRadius: "14px",
            overflow: "hidden",
            background: "rgba(0,0,0,0.20)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <ChatPane />
        </div>

        {/* Knowledge Sidebar */}
        <div style={{ width: "360px", flexShrink: 0 }}>
          <KnowledgeSidebar files={files} />
        </div>
      </div>
    </div>
  );
}
