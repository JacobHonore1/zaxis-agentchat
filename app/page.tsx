"use client";

import { useEffect, useState } from "react";
import AgentSidebar from "../components/AgentSidebar";
import KnowledgeSidebar from "../components/KnowledgeSidebar";
import ChatPane from "../components/ChatPane";
import { DriveFile } from "../types/DriveFile";

export default function Page() {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);

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
        Virtoo Assistent MVP 0.25b

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

      {/* Layout */}
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
        {/* Agent sidebar */}
        <div
          style={{
            width: "320px",
            height: "100%",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ flex: 1, overflow: "hidden", borderRadius: "14px" }}>
            <AgentSidebar />
          </div>
        </div>

        {/* Chat */}
        <div
          style={{
            flex: 1,
            height: "100%",
            borderRadius: "14px",
            overflow: "hidden",
            background: "rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <ChatPane selectedFile={selectedFile} />
        </div>

        {/* Knowledge Sidebar */}
        <div
          style={{
            width: "360px",
            height: "100%",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ flex: 1, overflow: "hidden", borderRadius: "14px" }}>
            <KnowledgeSidebar
              files={files}
              onSelectFile={(file) => setSelectedFile(file)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
