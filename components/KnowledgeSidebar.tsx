"use client";

import { DriveFile } from "../types/DriveFile";

function getIconForMime(mime?: string, name?: string) {
  const mimeLower = (mime || "").toLowerCase();
  const ext = (name || "").split(".").pop()?.toLowerCase() || "";
  const combined = mimeLower + " " + ext;

  if (combined.includes("pdf")) return "📕";
  if (combined.includes("word") || combined.includes("doc")) return "📘";
  if (combined.includes("sheet") || combined.includes("excel") || combined.includes("xls"))
    return "📗";

  return "📙";
}

export default function KnowledgeSidebar({ files = [] }: { files?: DriveFile[] }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "24px",
        background: "rgba(0, 0, 0, 0.25)",
        display: "flex",
        flexDirection: "column",
        borderRadius: "14px",
      }}
    >
      {/* Sticky header */}
      <div
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: "#fff",
          marginBottom: 16,
          position: "sticky",
          top: 0,
          background: "rgba(0,0,0,0.25)",
          paddingBottom: 12,
          zIndex: 5,
        }}
      >
        Vidensbank
      </div>

      {/* Scroll container */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
        }}
      >
        {/* Local scrollbar styling */}
        <style>
          {`
            div::-webkit-scrollbar {
              width: 6px;
            }
            div::-webkit-scrollbar-thumb {
              background-color: #0b6fa4;
              border-radius: 4px;
            }
            div::-webkit-scrollbar-track {
              background: transparent;
            }
          `}
        </style>

        {files.length === 0 ? (
          <div style={{ color: "#fff", opacity: 0.7 }}>Indlæser filer…</div>
        ) : (
          files.map((file) => {
            const uploadDate =
              (file as any).createdTime
                ? new Date((file as any).createdTime).toLocaleDateString("da-DK")
                : "ukendt";

            return (
              <div
                key={file.id}
                style={{
                  background: "rgba(255,255,255,0.07)",
                  padding: 12,
                  marginBottom: 12,
                  borderRadius: 10,
                  color: "white",
                  display: "flex",
                  flexDirection: "row",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                {/* Ikon venstre */}
                <div style={{ fontSize: 22, flexShrink: 0 }}>
                  {getIconForMime(file.mimeType, file.name)}
                </div>

                {/* Tekst højre */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>{file.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Uploadet: {uploadDate}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
