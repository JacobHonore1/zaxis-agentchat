'use client';

import { useEffect, useState } from 'react';

type FileItem = {
  id: string;
  name: string;
  mimeType: string;
};

export default function KnowledgeSidebar() {
  const [files, setFiles] = useState<FileItem[]>([]);

  // Kort MIME-type konvertering
  function getShortType(mime: string): string {
    if (!mime) return '';

    if (mime.includes('pdf')) return 'PDF';
    if (mime.includes('plain')) return 'TXT';
    if (mime.includes('word')) return 'DOCX';
    if (mime.includes('spreadsheet') || mime.includes('excel')) return 'XLSX';
    if (mime.includes('image')) return 'Billede';

    return mime.split('/')[1] || mime;
  }

  useEffect(() => {
    async function loadFiles() {
      try {
        const res = await fetch('/api/drive-files');
        const data = await res.json();
        setFiles(data.files || []);
      } catch (e) {
        console.error('Fejl ved hentning af filer:', e);
      }
    }

    loadFiles();
  }, []);

  return (
    <div
      style={{
        width: '300px',
        background: 'rgba(0,0,0,0.25)',
        padding: '16px',
        overflowY: 'auto',
        overflowX: 'hidden',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <h3
        style={{
          color: 'white',
          fontSize: '1rem',
          marginBottom: '12px',
          opacity: 0.8,
        }}
      >
        VIDENSBANK FILER
      </h3>

      {files.map((file) => (
        <div
          key={file.id}
          style={{
            background: 'rgba(255,255,255,0.07)',
            padding: '12px',
            borderRadius: '10px',
            marginBottom: '12px',
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start',
            cursor: 'pointer',
          }}
        >
          {/* Ikon baseret på Type */}
          <div style={{ fontSize: '1.3rem' }}>
            {file.mimeType.includes('pdf') && '📕'}
            {file.mimeType.includes('plain') && '📄'}
            {file.mimeType.includes('word') && '📝'}
            {file.mimeType.includes('spreadsheet') && '📊'}
            {file.mimeType.includes('image') && '🖼️'}
            {!file.mimeType && '📁'}
          </div>

          <div style={{ color: 'white', overflow: 'hidden' }}>
            <div
              style={{
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '210px',
              }}
            >
              {file.name}
            </div>

            <div
              style={{
                fontSize: '0.75rem',
                opacity: 0.7,
                marginTop: '2px',
              }}
            >
              {getShortType(file.mimeType)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
