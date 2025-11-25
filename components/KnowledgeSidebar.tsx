"use client";

import React, { useEffect, useState } from "react";

export default function KnowledgeSidebar() {
  const [files, setFiles] = useState([]);

  async function loadFiles() {
    try {
      const res = await fetch("/api/drive-files");
      const data = await res.json();
      setFiles(data.files || []);
    } catch (e) {
      console.error("Kunne ikke hente filer");
    }
  }

  useEffect(() => {
    loadFiles();
  }, []);

  return (
    <div
      style={{
        padding: "20px",
        background: "rgba(255,255,255,0.06)",
        height: "100%",
        borderRadius: "12px",
        overflowY: "auto",
      }}
    >
      <h3 style={{ color: "#fff", marginBottom: "16px" }}>Vidensbank</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {files.map((f: any) => (
          <div
            key={f.id}
            style={{
              background: "rgba(255,255,255,0.1)",
              padding: "12px",
              borderRadius: "10px",
              color: "#fff",
              display: "flex",
              gap: "12px",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: "18px" }}>📁</div>
            <div>{f.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
