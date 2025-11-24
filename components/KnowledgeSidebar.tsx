"use client";

import { useEffect, useState } from "react";

type DriveFile = {
  id: string;
  name: string;
  mimeType?: string;
};

export default function KnowledgeSidebar() {
  const [files, setFiles] = useState<DriveFile[]>([]);

  useEffect(() => {
    async function loadFiles() {
      try {
        const res = await fetch("/api/drive-files");
        const data = await res.json();
        setFiles(data.files || []);
      } catch (err) {
        console.error("Fejl ved hentning af vidensbank:", err);
      }
    }

    loadFiles();
  }, []);

  function extractExtension(fileName: string) {
    if (!fileName.includes(".")) return "fil";
    return fileName.split(".").pop()?.toLowerCase() || "fil";
  }

  return (
    <div
      style={{
        width: 260,
        background: "rgba(0,0,0,0.30)",
        borderLeft: "1px solid rgba(255,255,255,0.08)",
        padding: "20px 12px",
        overflowY: "auto",
        color: "white",
      }}
    >
      <h3
        style={{
          fontSize: "1.1rem",
          fontWeight: 600,
          marginBottom: 16,
          opacity: 0.9,
        }}
      >
        Google Drive filer
      </h3>

      {files.length === 0 && (
        <p style={{ opacity: 0.6 }}>Ingen filer fundet…</p>
      )}

      {files.map((file) => {
        const ext = extractExtension(file.name);

        return (
          <div
            key={file.id}
            style={{
              padding: "10px",
              marginBottom: 10,
              borderRadius: 8,
              background: "rgba(255,255,255,0.08)",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div style={{ fontSize: "0.95rem" }}>{file.name}</div>

            <div style={{ fontSize: "0.8rem", opacity: 0.65 }}>
              {ext.toUpperCase()}
            </div>
          </div>
        );
      })}
    </div>
  );
}
