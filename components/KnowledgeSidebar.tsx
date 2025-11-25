"use client";

import { useEffect, useState } from "react";
import { DriveFile } from "../types/DriveFile";

export default function KnowledgeSidebar() {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFiles() {
      try {
        const res = await fetch("/api/drive-files");
        const data = await res.json();
        setFiles(data.files || []);
      } catch (err) {
        console.error("Fejl ved hentning af filer fra vidensbank", err);
      } finally {
        setLoading(false);
      }
    }

    loadFiles();
  }, []);

  // farvede ikoner
  function getColoredIcon(mime?: string) {
    if (!mime) return <span style={{ fontSize: 20, color: "#ffeb3b" }}>📁</span>;

    const m = mime.toLowerCase();

    if (m.includes("pdf"))
      return <span style={{ fontSize: 20, color: "#ff4b4b" }}>📕</span>;

    if (m.includes("doc"))
      return <span style={{ fontSize: 20, color: "#4ba3ff" }}>📘</span>;

    if (m.includes("sheet") || m.includes("xls"))
      return <span style={{ fontSize: 20, color: "#4bff7b" }}>📗</span>;

    if (m.includes("text") || m.includes("txt"))
      return <span style={{ fontSize: 20, color: "#ffeb3b" }}>📄</span>;

    return <span style={{ fontSize: 20, color: "#ffeb3b" }}>📁</span>;
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: 20,
        overflowY: "auto",
      }}
    >
      <div
        style={{
          color: "#fff",
          fontSize: 16,
          marginBottom: 16,
          opacity: 0.9,
        }}
      >
        Vidensbank
      </div>

      {loading && (
        <div style={{ color: "#fff", opacity: 0.7, fontSize: 14 }}>
          Henter filer fra vidensbank…
        </div>
      )}

      {!loading && files.length === 0 && (
        <div style={{ color: "#fff", opacity: 0.7, fontSize: 14 }}>
          Ingen filer fundet i vidensbanken.
        </div>
      )}

      {!loading &&
        files.map((file) => (
          <div
            key={file.id}
            style={{
              padding: 12,
              borderRadius: 8,
              backgroundColor: "rgba(255,255,255,0.06)",
              marginBottom: 10,
              display: "flex",
              flexDirection: "row",
              gap: 10,
              alignItems: "flex-start",
            }}
          >
            {/* farvet ikon */}
            {getColoredIcon(file.mimeType)}

            <div style={{ display: "flex", flexDirection: "column" }}>
              <strong
                style={{
                  color: "#fff",
                  fontSize: 14,
                  marginBottom: 4,
                  wordBreak: "break-word",
                }}
              >
                {file.name}
              </strong>

              <span
                style={{
                  color: "#c7d4dd",
                  fontSize: 12,
                  opacity: 0.8,
                }}
              >
                {file.mimeType || "filtype"}
              </span>
            </div>
          </div>
        ))}
    </div>
  );
}
