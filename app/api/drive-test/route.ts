import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  try {
    // Godkend servicekontoen med JSON-nøglen i miljøvariabel
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_KEY || "{}");

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({ version: "v3", auth });

    // Indsæt dit mappe-ID fra Google Drive
    const FOLDER_ID = "1ejPRZ-aFHmUf6wiwhZPABDXoIQ7PnG_q";

    const res = await drive.files.list({
      q: `'${FOLDER_ID}' in parents`,
      fields: "files(id, name)",
    });

    return NextResponse.json({ files: res.data.files });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
