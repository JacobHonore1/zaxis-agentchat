"use client";

import { useEffect, useState } from "react";
import type { DriveFile } from "../types/DriveFile";

export default function KnowledgeSidebar({
  onSelectFile,
  selectedFileId,
}: {
  onSelectFile: (file: DriveFile) => void;
  selectedFileId: string | null;
}) {
  const [files, setFiles] = useState<DriveFile[]>([]);

  useEffect(() => {
    async function loadFiles() {
      try {
        const res = await fetch("/api/drive-files");
        const data = await res.json();
        setFiles(data.files || []);
      } catch (err) {
        console.error("Fejl ved hentning af filer", err);
      }
    }
    loadFiles();
  }, []);

  function getIcon(mime?: string) {
    if (!mime) return "📁";
    const lower = mime.toLowerCase();
    if (lower.includes("pdf")) return "📕";
    if (lower.includes("doc") || lower.includes("word")) return "📘";
    if (lower.includes("text") || lower.includes("plain")) return "📗";
    return "📁";
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "rgba(255,255,255,0.04)",
        borderRadius: 16,
        padding: 20,
        color: "white",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <h3
        style={{
          marginTop: 0,
          marginBottom: 20,
          fontSize: "1rem",
          fontWeight: 600,
          opacity: 0.9,
        }}
      >
        Vidensbank
      </h3>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingRight: 6,
        }}
      >
        {files.map((file) => {
          const selected = file.id === selectedFileId;

          return (
            <div
              key={file.id}
              onClick={() => onSelectFile(file)}
              style={{
                padding: 12,
                marginBottom: 10,
                borderRadius: 12,
                cursor: "pointer",
                background: selected
                  ? "rgba(56,189,248,0.25)"
                  : "rgba(255,255,255,0.07)",
                boxShadow: selected
                  ? "0 0 10px rgba(56,189,248,0.4)"
                  : "none",
                transition: "0.15s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1.1rem" }}>
                  {getIcon(file.mimeType)}
                </span>
                <div>
                  <strong
                    style={{
                      fontSize: "0.95rem",
                      display: "block",
                    }}
                  >
                    {file.name}
                  </strong>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      opacity: 0.6,
                      display: "block",
                      marginTop: 2,
                    }}
                  >
                    {file.mimeType || "ukendt"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
