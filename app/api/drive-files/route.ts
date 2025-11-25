import { NextResponse } from "next/server";
import { google } from "googleapis";
import pdfParse from "pdf-parse";

export async function GET() {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_KEY || "{}");

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({ version: "v3", auth });

    const FOLDER_ID = "1ejPRZ-aFHmUf6wiwhZPABDXoIQ7PnG_q";

    const res = await drive.files.list({
      q: `'${FOLDER_ID}' in parents`,
      fields: "files(id, name, mimeType)",
    });

    const files = res.data.files || [];

    const results = [];

    for (const file of files) {
      results.push({
        id: file.id!,
        name: file.name!,
        mimeType: file.mimeType || "unknown",
        text: "(tekst udeladt her – bruges ikke i vidensbank)",
      });
    }

    return NextResponse.json({ files: results });
  } catch (err: any) {
    console.error("Drive fejl:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
