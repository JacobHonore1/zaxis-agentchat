"use client";

import { useEffect, useState } from "react";

// Vi definerer typen direkte her, så vi ikke længere importerer fra en fil der ikke eksisterer
export type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
};

export default function KnowledgeSidebar({
  files = [],
}: {
  files?: DriveFile[];
}) {
  const [loading, setLoading] = useState(false);
  const [internalFiles, setInternalFiles] = useState<DriveFile[]>(files);

  async function loadFiles() {
    try {
      setLoading(true);
      const res = await fetch("/api/knowledge");
      const data = await res.json();
      setInternalFiles(data.files || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFiles();
  }, []);

  function getIconColor(type: string) {
    type = type.toLowerCase();

    if (type.includes("pdf")) return "#ff4d4d"; // rød
    if (type.includes("doc") || type.includes("word")) return "#4da6ff"; // blå
    if (type.includes("xls") || type.includes("sheet") || type.includes("excel")) return "#33cc66"; // grøn
    return "#ffcc33"; // gul
  }

  function getIconForType(type: string) {
    type = type.toLowerCase();

    if (type.includes("pdf")) return "📕";
    if (type.includes("doc") || type.includes("word")) return "📘";
    if (type.includes("xls") || type.includes("excel") || type.includes("sheet")) return "📗";
    return "📙";
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "rgba(255,255,255,0.06)",
        borderRadius: "16px",
        padding: "20px",
        overflowY: "auto",
        color: "#fff",
        boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
      }}
    >
      <h3 style={{ marginBottom: "16px", fontSize: "1.1rem" }}>Vidensbank</h3>

      {loading && (
        <div style={{ opacity: 0.7, fontStyle: "italic", marginBottom: 20 }}>
          Henter filer…
        </div>
      )}

      {internalFiles.map((file) => {
        const type = file.mimeType || "fil";

        return (
          <div
            key={file.id}
            style={{
              background: "rgba(0,0,0,0.2)",
              padding: "12px",
              borderRadius: "12px",
              marginBottom: "12px",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <span
                style={{
                  fontSize: "1.6rem",
                  color: getIconColor(type),
                }}
              >
                {getIconForType(type)}
              </span>

              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "0.95rem",
                  }}
                >
                  {file.name}
                </div>

                <div
                  style={{
                    fontSize: "0.75rem",
                    opacity: 0.7,
                  }}
                >
                  {type.split("/")[1] || "filtype"}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
