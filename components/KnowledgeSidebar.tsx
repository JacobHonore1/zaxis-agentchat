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
    <div style={{ width: "100%", height: "100%", overflowY: "auto" }}>
      <h3 style={{ marginBottom: 12 }}>Google Drive filer</h3>

      {files.map((file) => {
        const isSelected = file.id === selectedFileId;

        return (
          <div
            key={file.id}
            onClick={() => onSelectFile(file)}
            style={{
              padding: 10,
              marginBottom: 8,
              borderRadius: 12,
              cursor: "pointer",
              background: isSelected
                ? "rgba(56,189,248,0.25)"
                : "rgba(255,255,255,0.06)",
              boxShadow: isSelected
                ? "0 0 10px rgba(56,189,248,0.4)"
                : "none",
              transition: "0.15s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>{getIcon(file.mimeType)}</span>
              <strong>{file.name}</strong>
            </div>

            <div
              style={{
                fontSize: "0.75rem",
                opacity: 0.6,
                marginTop: 2,
              }}
            >
              {file.mimeType?.split("/")[1] || "ukendt"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
