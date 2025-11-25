"use client";

import { DriveFile } from "../types/DriveFile";

const getIconForMime = (mime?: string) => {
  const safe = mime?.toLowerCase() || "";

  if (safe.includes("pdf")) return "📕";
  if (safe.includes("word") || safe.includes("doc")) return "📘";
  if (safe.includes("sheet") || safe.includes("excel") || safe.includes("xls"))
    return "📗";

  return "📙";
};

export default function KnowledgeSidebar({
  files = [],
}: {
  files?: DriveFile[];
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "24px",
        boxSizing: "border-box",
        background: "rgba(0, 0, 0, 0.25)",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          fontSize: "18px",
          fontWeight: 600,
          color: "#fff",
          marginBottom: "16px",
        }}
      >
        Vidensbank
      </div>

      {files.map((file) => (
        <div
          key={file.id}
          style={{
            background: "rgba(255,255,255,0.07)",
            padding: "14px",
            marginBottom: "14px",
            borderRadius: "10px",
            color: "white",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <div style={{ fontSize: "20px" }}>
            {getIconForMime(file.mimeType)}
          </div>
          <div style={{ fontSize: "15px", fontWeight: 500 }}>{file.name}</div>
          <div style={{ fontSize: "12px", opacity: 0.8 }}>filtype</div>
        </div>
      ))}
    </div>
  );
}
