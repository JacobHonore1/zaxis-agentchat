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
    if (lower.includes("word") || lower.includes("doc")) return "📘";
    if (lower.includes("text") || lower.includes("plain")) return "📗";
    if (lower.includes("sheet") || lower.includes("excel") || lower.includes("xls"))
      return "📊";
    return "📁";
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        color: "white",
        padding: 16,
        overflowY: "auto",
      }}
    >
      <h3 style={{ marginBottom: 16 }}>Vidensbank</h3>

      {files.map((file) => {
        const isSelected = file.id === selectedFileId;
        return (
          <div
            key={file.id}
            onClick={() => onSelectFile(file)}
            style={{
              padding: 10,
              marginBottom: 8,
              borderRadius: 10,
              cursor: "pointer",
              background: isSelected
                ? "rgba(56,189,248,0.25)"
                : "rgba(255,255,255,0.06)",
              boxShadow: isSelected
                ? "0 0 10px rgba(56,189,248,0.5)"
                : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>{getIcon(file.mimeType)}</span>
              <strong style={{ fontSize: "0.9rem" }}>{file.name}</strong>
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                opacity: 0.7,
                marginTop: 4,
              }}
            >
              {file.mimeType?.split("/")[1] || "fil"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
