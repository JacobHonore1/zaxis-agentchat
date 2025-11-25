"use client";

import { useEffect, useState } from "react";
import { DriveFile } from "../types/DriveFile";

export default function KnowledgeSidebar({
  onSelectFile
}: {
  onSelectFile: (file: DriveFile) => void;
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
    if (lower.includes("text")) return "📗";
    if (lower.includes("sheet") || lower.includes("excel")) return "📙";
    return "📁";
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        color: "white",
        padding: "16px",
        background: "rgba(255,255,255,0.03)",
        overflowY: "auto",
        borderRadius: "16px"
      }}
    >
      <h3 style={{ marginBottom: 16 }}>Vidensbank</h3>

      {files.map((file) => (
        <div
          key={file.id}
          onClick={() => onSelectFile(file)}
          style={{
            padding: "10px",
            marginBottom: "8px",
            borderRadius: "10px",
            background: "rgba(255,255,255,0.06)",
            cursor: "pointer"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8
            }}
          >
            <span>{getIcon(file.mimeType)}</span>
            <strong style={{ fontSize: "0.9rem" }}>{file.name}</strong>
          </div>

          <div
            style={{
              fontSize: "0.75rem",
              opacity: 0.7,
              marginTop: 4
            }}
          >
            {file.mimeType ? file.mimeType.split("/")[1] : "ukendt"}
          </div>
        </div>
      ))}
    </div>
  );
}
