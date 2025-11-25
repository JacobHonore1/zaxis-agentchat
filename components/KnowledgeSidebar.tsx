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
    if (lower.includes("text")) return "📗";
    return "📁";
  }

  return (
    <div
      className="scroll-area"
      style={{
        width: "100%",
        height: "100%",
        paddingRight: 4,
      }}
    >
      {/* MATCHER ASSISTENTER-STIL */}
      <h3
        style={{
          fontSize: "1rem",
          fontWeight: 600,
          marginBottom: 16,
          color: "white",
          opacity: 0.9,
        }}
      >
        Vidensbank
      </h3>

      {files.map((file) => {
        const isSelected = file.id === selectedFileId;

        return (
          <div
            key={file.id}
            onClick={() => onSelectFile(file)}
            style={{
              padding: 12,
              marginBottom: 10,
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>{getIcon(file.mimeType)}</span>

              {/* FILNAVNE – HVID TEXT SAMME STØRRELSE SOM ASSISTENTER */}
              <strong
                style={{
                  fontSize: "1rem",
                  fontWeight: 500,
                  color: "white",
                }}
              >
                {file.name}
              </strong>
            </div>

            <div
              style={{
                fontSize: "0.75rem",
                opacity: 0.5,
                marginTop: 4,
                color: "white",
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
