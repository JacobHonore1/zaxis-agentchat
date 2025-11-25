import { NextResponse } from "next/server";
import { google } from "googleapis";
import pdfParse from "pdf-parse";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("id");

    if (!fileId) {
      return NextResponse.json(
        { error: "Missing file id" },
        { status: 400 }
      );
    }

    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_KEY || "{}");

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({ version: "v3", auth });

    // Hent metadata
    const metaRes = await drive.files.get({
      fileId,
      fields: "id, name, mimeType, createdTime",
    });

    const mimeType = metaRes.data.mimeType || "";
    const createdTime = metaRes.data.createdTime || "";

    // Hent selve data
    const fileData = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "arraybuffer" }
    );

    let text = "";

    // PDF → parse tekst
    if (mimeType.includes("pdf")) {
      const buffer = Buffer.from(fileData.data as ArrayBuffer);
      const parsed = await pdfParse(buffer);
      text = parsed.text;
    }

    // TXT → plain text
    else if (mimeType.includes("text")) {
      text = Buffer.from(fileData.data as ArrayBuffer).toString("utf8");
    }

    // Ikke understøttet endnu
    else {
      text = "(Denne filtype kan endnu ikke læses som tekst)";
    }

    return NextResponse.json({
      id: metaRes.data.id,
      name: metaRes.data.name,
      mimeType,
      createdTime,
      text: text.slice(0, 15000),
    });
  } catch (err: any) {
    console.error("Drive file read error:", err);
    return NextResponse.json(
      { error: err.message || "Fejl ved filhentning" },
      { status: 500 }
    );
  }
}
