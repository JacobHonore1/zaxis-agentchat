'use client';

type KnowledgeFile = {
  name: string;
  mimeType: string;
};

export default function KnowledgeSidebar() {
  const mockFiles: KnowledgeFile[] = [
    { name: "Korrekturlæsning.pdf", mimeType: "application/pdf" },
    { name: "Personas.txt", mimeType: "text/plain" },
    { name: "Rammeaftale.docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
  ];

  function getIcon(mime: string) {
    if (mime === "application/pdf") return "📄";
    if (mime === "text/plain") return "📝";
    if (mime.includes("word")) return "📘";
    return "📁";
  }

  return (
    <div
      style={{
        width: 260,
        background: "rgba(0,0,0,0.35)",
        borderLeft: "1px solid rgba(255,255,255,0.08)",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        overflowY: "auto",
      }}
    >
      <div
        style={{
          fontSize: "0.85rem",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.75)",
          marginBottom: 6,
          letterSpacing: "0.08em",
        }}
      >
        Vidensbank filer
      </div>

      {mockFiles.map((file, idx) => (
        <div
          key={idx}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 10px",
            background: "rgba(255,255,255,0.06)",
            borderRadius: 8,
            color: "white",
            fontSize: "0.9rem",
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>{getIcon(file.mimeType)}</span>
          <div>
            <div style={{ fontWeight: 600 }}>{file.name}</div>
            <div
              style={{
                opacity: 0.65,
                fontSize: "0.75rem",
              }}
            >
              {file.mimeType}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
