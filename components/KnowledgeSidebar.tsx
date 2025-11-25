"use client";

import { DriveFile } from "../types/DriveFile";

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
        background: "rgba(0, 0, 0, 0.18)",
        borderRadius: "12px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        color: "white",
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: "16px",
          fontSize: "18px",
          fontWeight: 600,
          color: "white",
        }}
      >
        Vidensbank
      </div>

      {/* Scroll area */}
      <div
        style={{
          overflowY: "auto",
          paddingRight: "6px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {files.map((file) => (
          <div
            key={file.id}
            style={{
              background: "rgba(255,255,255,0.06)",
              padding: "12px",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: "18px" }}>📄</span>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <strong style={{ fontSize: "14px", color: "white" }}>
                {file.name}
              </strong>
              <span style={{ fontSize: "12px", opacity: 0.6 }}>ukendt</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
