"use client";

import { DriveFile } from "../types/DriveFile";

type Props = {
  files?: DriveFile[];
  isLoading?: boolean;
};

function getIconForMime(mime?: string, name?: string) {
  const mimeLower = (mime || "").toLowerCase();
  const ext = (name || "").split(".").pop()?.toLowerCase() || "";
  const combined = `${mimeLower} ${ext}`;

  if (combined.includes("pdf")) return "📕";
  if (combined.includes("word") || combined.includes("doc")) return "📘";
  if (
    combined.includes("sheet") ||
    combined.includes("excel") ||
    combined.includes("xls") ||
    combined.includes("csv")
  )
    return "📗";

  return "📙";
}

export default function KnowledgeSidebar({
  files = [],
  isLoading = false,
}: Props) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Lokal scrollbar-styling kun for vidensbank-listen */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .kb-scroll-container::-webkit-scrollbar { width: 6px; }
            .kb-scroll-container::-webkit-scrollbar-thumb { background-color: #0b6fa4; border-radius: 4px; }
            .kb-scroll-container::-webkit-scrollbar-track { background: transparent; }
          `,
        }}
      />

      {/* Overskrift */}
      <div
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: "#ffffff",
          marginBottom: 16,
        }}
      >
        Vidensbank
      </div>

      {/* Liste med filer */}
      <div
        className="kb-scroll-container"
        style={{
          flex: 1,
          overflowY: "auto",
          paddingRight: 6,
        }}
      >
        {isLoading && (
          <div style={{ color: "#ffffff", opacity: 0.7, marginBottom: 8 }}>
            Indlæser filer…
          </div>
        )}

        {!isLoading && files.length === 0 && (
          <div style={{ color: "#ffffff", opacity: 0.7 }}>
            Ingen filer fundet i vidensbanken.
          </div>
        )}

        {files.map((file) => (
          <div
            key={file.id}
            style={{
              background: "rgba(255,255,255,0.07)",
              padding: 10,
              marginBottom: 10,
              borderRadius: 10,
              color: "white",
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 10,
              boxShadow: "0 0 6px rgba(0,0,0,0.4)",
              boxSizing: "border-box",
            }}
          >
            {/* Ikon til venstre */}
            <div
              style={{
                fontSize: 20,
                flexShrink: 0,
                marginTop: 2,
              }}
            >
              {getIconForMime(file.mimeType, file.name)}
            </div>

            {/* Tekstindhold */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={file.name}
              >
                {file.name}
              </div>
              <div
                style={{
                  fontSize: 12,
                  opacity: 0.8,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Uploadet:{" "}
                {file.uploadedAt
                  ? new Date(file.uploadedAt).toLocaleString("da-DK")
                  : "ukendt"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
