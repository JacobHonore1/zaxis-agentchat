"use client";

import { useEffect, useState } from "react";
import AgentSidebar from "../components/AgentSidebar";
import KnowledgeSidebar from "../components/KnowledgeSidebar";
import ChatPane from "../components/ChatPane";
import { DriveFile } from "../types/DriveFile";

export default function Page() {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);

  useEffect(() => {
    const loadFiles = async () => {
      try {
        setIsLoadingFiles(true);
        const res = await fetch("/api/drive-files");
        const data = await res.json();
        setFiles(data.files || []);
      } catch (err) {
        console.error("Fejl ved hentning af filer:", err);
      } finally {
        setIsLoadingFiles(false);
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
        fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          padding: "20px 40px",
          fontSize: 24,
          fontWeight: 600,
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Virtoo Assistent MVP 0.26a

        <button
          style={{
            padding: "8px 18px",
            backgroundColor: "#005f8a",
            color: "#fff",
            borderRadius: 8,
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
          gap: 24,
          padding: "0 40px 40px 40px",
          overflow: "hidden",
        }}
      >
        {/* Agent Sidebar */}
        <div
          style={{
            width: 320,
            height: "100%",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 16,
              background: "rgba(0, 0, 0, 0.25)",
              boxShadow: "0 0 18px rgba(0,0,0,0.4)",
              padding: 20,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <AgentSidebar />
          </div>
        </div>

        {/* Chat Pane */}
        <div
          style={{
            flex: 1,
            height: "100%",
            borderRadius: 16,
            background: "rgba(0,0,0,0.22)",
            boxShadow: "0 0 18px rgba(0,0,0,0.4)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <ChatPane files={files} />
        </div>

        {/* Knowledge Sidebar */}
        <div
          style={{
            width: 360,
            height: "100%",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 16,
              background: "rgba(0, 0, 0, 0.25)",
              boxShadow: "0 0 18px rgba(0,0,0,0.4)",
              padding: 20,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <KnowledgeSidebar files={files} isLoading={isLoadingFiles} />
          </div>
        </div>
      </div>
    </div>
  );
}
