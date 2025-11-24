'use client';

import { useState, useEffect } from 'react';

type DriveFile = {
  id: string;
  name: string;
  mimeType?: string;
  modifiedTime?: string;
};

export default function KnowledgeSidebar() {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  async function loadFiles() {
    try {
      setLoading(true);
      const res = await fetch('/api/drive-test');
      if (!res.ok) throw new Error();

      const data = await res.json();
      const list = Array.isArray(data.files) ? data.files : data;

      setFiles(list);
      setLastUpdated(new Date().toLocaleTimeString('da-DK'));
    } catch {
      setError('Kunne ikke hente filer.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFiles();
  }, []);

  return (
    <div
      style={{
        width: 260,
        background: 'linear-gradient(180deg, #022b3a, #04445c)',
        borderLeft: '1px solid rgba(255,255,255,0.1)',
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          fontSize: '0.8rem',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.6)',
          marginBottom: 8,
          letterSpacing: '0.08em',
        }}
      >
        Vidensbank
      </div>

      <div
        style={{
          fontSize: '0.9rem',
          fontWeight: 600,
          marginBottom: 12,
          color: '#fff',
        }}
      >
        Google Drive filer
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading && (
          <div style={{ color: 'rgba(255,255,255,0.5)' }}>Indlæser filer...</div>
        )}

        {error && <div style={{ color: '#ffb3b3' }}>{error}</div>}

        {!loading && !error && files.length === 0 && (
          <div style={{ color: 'rgba(255,255,255,0.6)' }}>Ingen filer fundet.</div>
        )}

        {!loading && !error && files.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {files.map((file) => (
              <li key={file.id} style={{ marginBottom: 10 }}>
                <div
                  style={{
                    fontSize: '0.85rem',
                    color: '#fff',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {file.name}
                </div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    color: 'rgba(255,255,255,0.6)',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{file.mimeType?.split('/')[1] || 'ukendt'}</span>
                  <span>
                    {file.modifiedTime
                      ? new Date(file.modifiedTime).toLocaleDateString('da-DK')
                      : 'ukendt'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.12)',
          paddingTop: 8,
          marginTop: 12,
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.5)',
        }}
      >
        <div>Filer i alt: {files.length}</div>
        <div>Senest hentet: {lastUpdated ?? 'henter...'}</div>
      </div>
    </div>
  );
}
