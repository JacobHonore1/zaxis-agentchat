"use client";

import { useEffect, useState } from "react";

export default function KnowledgeSidebar() {
  const [files, setFiles] = useState<any[]>([]);

  useEffect(() => {
    async function loadFiles() {
      const r = await fetch("/api/drive-files");
      const d = await r.json();
      setFiles(d.files || []);
    }
    loadFiles();
  }, []);

  function getIcon(mime?: string) {
    if (!mime) return "📁";
    const m = mime.toLowerCase();
    if (m.includes("pdf")) return "📕";
    if (m.includes("doc")) return "📘";
    if (m.includes("sheet")) return "📗";
    return "📁";
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.35)",
        borderRadius: "12px",
        padding: "20px",
        color: "#fff",
        overflowY: "auto",
      }}
    >
      <div style={{ fontSize: "15px", marginBottom: 16, opacity: 0.8 }}>
        Vidensbank
      </div>

      {files.map((f) => (
        <div
          key={f.id}
          style={{
            padding: "12px",
            background: "rgba(255,255,255,0.07)",
            borderRadius: "10px",
            marginBottom: "12px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 18 }}>{getIcon(f.mimeType)}</span>
            <strong style={{ fontSize: "14px" }}>{f.name}</strong>
          </div>

          <div style={{ fontSize: "12px", opacity: 0.7, marginTop: 4 }}>
            ukendt
          </div>
        </div>
      ))}
    </div>
  );
}
