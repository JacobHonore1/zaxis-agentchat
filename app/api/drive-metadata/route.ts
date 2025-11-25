import { NextResponse } from "next/server";
import { google } from "googleapis";

// Simpel in memory cache i processens levetid
type MetaFile = {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
};

type CacheState = {
  timestamp: number;
  files: MetaFile[];
};

let metaCache: CacheState | null = null;

// Hvor længe metadata skal caches i millisekunder
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutter

export async function GET() {
  try {
    const now = Date.now();

    // Brug cache hvis den er frisk nok
    if (metaCache && now - metaCache.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({ fromCache: true, files: metaCache.files });
    }

    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_KEY || "{}");

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({ version: "v3", auth });

    const FOLDER_ID = "1ejPRZ-aFHmUf6wiwhZPABDXoIQ7PnG_q";

    // Hent kun metadata, ingen filindhold her
    const res = await drive.files.list({
      q: `'${FOLDER_ID}' in parents`,
      fields: "files(id,name,mimeType,modifiedTime)",
    });

    const files = res.data.files || [];

    const metaFiles: MetaFile[] = files.map((file) => ({
      id: file.id || "",
      name: file.name || "Ukendt fil",
      mimeType: file.mimeType || "application/octet-stream",
      modifiedTime: file.modifiedTime,
    }));

    // Opdater cache
    metaCache = {
      timestamp: now,
      files: metaFiles,
    };

    return NextResponse.json({ fromCache: false, files: metaFiles });
  } catch (err: any) {
    console.error("Drive metadata fejl:", err);
    return NextResponse.json(
      { error: err.message || "Ukendt fejl ved hentning af metadata" },
      { status: 500 }
    );
  }
}
