"use client";

import { DriveFile } from "../types";

export default function KnowledgeSidebar({
  files = [],
  onSelectFile,
}: {
  files?: DriveFile[];
  onSelectFile?: (file: DriveFile) => void;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflowY: "auto",
        paddingRight: "6px",
      }}
    >
      <h3
        style={{
          color: "white",
          fontSize: "16px",
          marginBottom: "12px",
          opacity: 0.85,
        }}
      >
        Vidensbank
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {files.map((file) => (
          <div
            key={file.id}
            onClick={() => onSelectFile && onSelectFile(file)}
            style={{
              padding: "14px",
              borderRadius: "12px",
              cursor: "pointer",
              background: "rgba(255,255,255,0.08)",
              boxShadow: "0 0 6px rgba(0,0,0,0.3)",
              border: "1px solid transparent",
            }}
          >
            <div style={{ fontSize: "18px" }}>📄</div>

            <strong style={{ color: "white", fontSize: "15px" }}>
              {file.name}
            </strong>

            <div style={{ color: "#cfd8dc", fontSize: "13px" }}>
              {file.mimeType || "ukendt"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
