"use client";

import { useEffect, useState } from "react";
import { DriveFile } from "../types/DriveFile";

export default function KnowledgeSidebar({
  onSelectFile,
}: {
  onSelectFile?: (file: DriveFile) => void;
}) {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFiles() {
      try {
        const res = await fetch("/api/drive-files");
        const data = await res.json();
        setFiles(data.files || []);
      } catch (err) {
        console.error("Fejl ved hentning af filer", err);
      } finally {
        setLoading(false);
      }
    }

    loadFiles();
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.18)",
        borderRadius: "12px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        color: "white",
      }}
    >
      <div
        style={{
          marginBottom: "16px",
          fontSize: "18px",
          fontWeight: 600,
        }}
      >
        Vidensbank
      </div>

      <div
        style={{
          overflowY: "auto",
          paddingRight: "6px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {loading && <div style={{ opacity: 0.7 }}>Henter filer…</div>}

        {!loading &&
          files.map((file) => (
            <div
              key={file.id}
              onClick={() => onSelectFile?.(file)}
              style={{
                background: "rgba(255,255,255,0.06)",
                padding: "14px",
                borderRadius: "10px",
                cursor: "pointer",
                border: "1px solid transparent",
              }}
            >
              <strong>{file.name}</strong>
              <div style={{ opacity: 0.6, fontSize: "12px" }}>
                {file.mimeType || "ukendt"}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
