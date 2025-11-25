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

  function getIcon(mime?: string) {
    if (!mime) return "📁";
    const m = mime.toLowerCase();
    if (m.includes("pdf")) return "📕";
    if (m.includes("doc")) return "📘";
    if (m.includes("sheet") || m.includes("xls")) return "📗";
    if (m.includes("text") || m.includes("txt")) return "📄";
    return "📁";
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: 20,
        overflowY: "auto", // kun scroll inde i panelet
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
            <div style={{ fontSize: 20 }}>{getIcon(file.mimeType)}</div>
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
                {file.mimeType || "ukendt filtype"}
              </span>
            </div>
          </div>
        ))}
    </div>
  );
}
