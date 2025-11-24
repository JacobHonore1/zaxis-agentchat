'use client';

type FileItem = {
  name: string;
  type: string;
};

export default function KnowledgeSidebar() {
  const mockFiles: FileItem[] = [
    { name: "Amanda_Wahle GPT.pdf", type: "PDF" },
    { name: "Personas.pdf", type: "PDF" },
    { name: "JE-TRÆ Facadedøre.pdf", type: "PDF" }
  ];

  return (
    <div
      style={{
        height: "100%",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        color: "white",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          fontSize: "0.8rem",
          opacity: 0.7,
          letterSpacing: "0.07em",
          marginBottom: 12
        }}
      >
        Vidensbank
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingRight: 6 }}>
        {mockFiles.map((f, i) => (
          <div
            key={i}
            style={{
              padding: "10px 12px",
              background: "rgba(255,255,255,0.06)",
              borderRadius: 10,
              marginBottom: 10,
              display: "flex",
              gap: 10,
              alignItems: "center"
            }}
          >
            <span style={{ fontSize: 20 }}>📄</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{f.name}</div>
              <div style={{ opacity: 0.7, fontSize: "0.75rem" }}>
                {f.type}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
