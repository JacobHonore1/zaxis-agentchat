"use client";

type FileItem = {
  id: string;
  name: string;
  mimeType?: string | null;
};

type Props = {
  files?: FileItem[];
};

export default function KnowledgeSidebar({ files = [] }: Props) {
  function shortMime(mime?: string | null) {
    if (!mime) return "ukendt";

    if (mime.includes("pdf")) return "PDF";
    if (mime.includes("word")) return "DOCX";
    if (mime.includes("plain")) return "TXT";

    const simple = mime.split("/").pop();
    return simple ? simple.toUpperCase() : "FILE";
  }

  function getIcon(mime?: string | null) {
    if (!mime) return "📄";

    if (mime.includes("pdf")) return "📕";
    if (mime.includes("word")) return "📘";
    if (mime.includes("plain")) return "📄";

    return "📁";
  }

  return (
    <div
      style={{
        width: 260,
        background: "rgba(0,0,0,0.25)",
        padding: 20,
        borderRadius: 16,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "white", marginBottom: 8 }}>
        VIDENSBANK FILER
      </div>

      {files.map((f) => (
        <div
          key={f.id}
          style={{
            background: "rgba(255,255,255,0.05)",
            borderRadius: 12,
            padding: "10px 12px",
            color: "white",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <div style={{ fontSize: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "1.3rem" }}>{getIcon(f.mimeType)}</span>
            {f.name}
          </div>

          <div style={{ opacity: 0.6, fontSize: "0.85rem" }}>
            {shortMime(f.mimeType)}
          </div>
        </div>
      ))}
    </div>
  );
}
