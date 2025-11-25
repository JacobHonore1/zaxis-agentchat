"use client";

import { useEffect, useState } from "react";

export type DriveFile = {
  id: string;
  name: string;
  mimeType?: string;
};

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
      const res = await fetch("/api/drive-files");
      const data = await res.json();
      setFiles(data.files || []);
    }
    loadFiles();
  }, []);

  function getIcon(mime?: string) {
    if (!mime) return "📁";
    const lower = mime.toLowerCase();
    if (lower.includes("pdf")) return "📕";
    if (lower.includes("doc") || lower.includes("word")) return "📘";
    if (lower.includes("text")) return "📗";
    return "📁";
  }

  return (
    <div
      className="scroll-area"
      style={{
        width: "100%",
        height: "100%",
        padding: 20,
        background: "rgba(255,255,255,0.04)",
        borderRadius: 16,
        overflowY: "auto",
      }}
    >
      <h3
        style={{
          marginTop: 0,
          marginBottom: 20,
          fontSize: "1rem",
          fontWeight: 600,
          opacity: 0.9,
          color: "white",
        }}
      >
        Vidensbank
      </h3>

      {files.map((file) => {
        const selected = file.id === selectedFileId;

        return (
          <div
            key={file.id}
            onClick={() => onSelectFile(file)}
            style={{
              padding: 14,
              marginBottom: 12,
              borderRadius: 12,
              background: selected
                ? "rgba(56,189,248,0.25)"
                : "rgba(255,255,255,0.06)",
              cursor: "pointer",
              boxShadow: selected
                ? "0 0 8px rgba(56,189,248,0.3)"
                : "none",
              transition: "0.2s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "1.2rem" }}>{getIcon(file.mimeType)}</span>

              <div>
                <strong
                  style={{
                    fontSize: "0.95rem",
                    color: "white",
                    display: "block",
                  }}
                >
                  {file.name}
                </strong>

                <span
                  style={{
                    opacity: 0.6,
                    fontSize: "0.75rem",
                    marginTop: 2,
                    color: "white",
                    display: "block",
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
  );
}
