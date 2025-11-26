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

    // Hent liste over filer i mappen
    const res = await drive.files.list({
      q: `'${FOLDER_ID}' in parents`,
      fields: "files(id, name, mimeType, createdTime)",
    });

    const files = res.data.files || [];
    const output: any[] = [];

    // Gennemgå hver fil og hent tekst efter filtype
    for (const file of files) {
      let textContent = "Ingen tekst udtrukket";
      let uploadedAt = file.createdTime || null;

      try {
        // Hent selve filens binary-data
        const fileData = await drive.files.get(
          { fileId: file.id!, alt: "media" },
          { responseType: "arraybuffer" }
        );

        const buffer = Buffer.from(fileData.data as ArrayBuffer);

        // PDF
        if (file.mimeType === "application/pdf") {
          const parsed = await pdfParse(buffer);
          textContent = parsed.text || "";
        }

        // CSV
        else if (file.mimeType === "text/csv") {
          textContent = buffer.toString("utf-8");
        }

        // Word (DOCX)
        else if (
          file.mimeType.includes(
            "application/vnd.openxmlformats-officedocument.wordprocessingml"
          )
        ) {
          textContent =
            "(DOCX understøttes i STEP C – endnu ikke tekstudtræk)";
        }

        // DOC (gammel Word)
        else if (file.mimeType.includes("application/msword")) {
          textContent =
            "(DOC filer understøttes i STEP C – endnu ikke tekstudtræk)";
        }

        // Andre filer
        else {
          textContent = "(Filtype ikke understøttet endnu)";
        }
      } catch (err: any) {
        textContent = "Fejl ved læsning: " + err.message;
      }

      // Push data retur
      output.push({
        id: file.id!,
        name: file.name!,
        mimeType: file.mimeType!,
        uploadedAt,
        text: textContent,
      });
    }

    return NextResponse.json({ files: output });
  } catch (err: any) {
    console.error("Drive fejl:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
