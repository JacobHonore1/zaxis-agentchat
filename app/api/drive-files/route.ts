import { NextResponse } from "next/server";
import { google } from "googleapis";
import pdfParse from "pdf-parse"; // brugt til at læse PDF tekst

export async function GET() {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_KEY || "{}");

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({ version: "v3", auth });

    // ID på din Google Drive-mappe
    const FOLDER_ID = "1ejPRZ-aFHmUf6wiwhZPABDXoIQ7PnG_q";

    // Find filer i mappen
    const res = await drive.files.list({
      q: `'${FOLDER_ID}' in parents`,
      fields: "files(id, name, mimeType)",
    });

    const files = res.data.files || [];
    const results: { id: string; name: string; text: string }[] = [];

    for (const file of files) {
      try {
        // Kun PDF’er i første omgang
        if (file.mimeType === "application/pdf") {
          const fileData = await drive.files.get(
            { fileId: file.id!, alt: "media" },
            { responseType: "arraybuffer" }
          );

          // Udpak tekst med pdf-parse
          const buffer = Buffer.from(fileData.data as ArrayBuffer);
          const parsed = await pdfParse(buffer);

          results.push({
            id: file.id!,
            name: file.name!,
            text: parsed.text.slice(0, 5000), // afkortet for test
          });
        } else {
          results.push({
            id: file.id!,
            name: file.name!,
            text: "(Ikke-PDF, springes over i denne test)",
          });
        }
      } catch (innerErr: any) {
        results.push({
          id: file.id!,
          name: file.name!,
          text: `Fejl ved læsning: ${innerErr.message}`,
        });
      }
    }

    return NextResponse.json({ files: results });
  } catch (err: any) {
    console.error("Drive fejl:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
