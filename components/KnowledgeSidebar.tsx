"use client";

import { DriveFile } from "../types";
import { useEffect, useState } from "react";

export default function KnowledgeSidebar({ files = [] }: { files?: DriveFile[] }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Når filer ankommer → stop loading
    if (files.length > 0) {
      setIsLoading(false);
    }
  }, [files]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(255,255,255,0.04)",
        borderRadius: "12px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div style={{ color: "#fff", fontWeight: 600, marginBottom: "12px" }}>Vidensbank</div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingRight: "6px",
        }}
      >
        {isLoading && (
          <div
            style={{
              color: "#fff",
              opacity: 0.8,
              fontSize: "14px",
            }}
          >
            Henter filer…
          </div>
        )}

        {!isLoading &&
          files.map((file) => (
            <div
              key={file.id}
              style={{
                backgroundColor: "rgba(255,255,255,0.07)",
                borderRadius: "10px",
                padding: "14px",
                marginBottom: "10px",
                display: "flex",
                flexDirection: "column",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "18px" }}>📁</span>
                <strong>{file.name}</strong>
              </div>
              <span style={{ fontSize: "12px", opacity: 0.6 }}>filtype</span>
            </div>
          ))}
      </div>
    </div>
  );
}
