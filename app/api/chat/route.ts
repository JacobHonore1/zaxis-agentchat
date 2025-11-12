import { NextResponse } from "next/server";
import { google } from "googleapis";
import OpenAI from "openai";
import pdfParse from "pdf-parse";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Din Google Drive mappe ID
const FOLDER_ID = "1ejPRZ-aFHmUf6wiwhZPABDXoIQ7PnG_q";

// Funktion til at hente tekst fra Google Drive
async function fetchDriveKnowledge(): Promise<string> {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_KEY || "{}");

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({ version: "v3", auth });

    const res = await drive.files.list({
      q: `'${FOLDER_ID}' in parents`,
      fields: "files(id, name, mimeType)",
    });

    const files = res.data.files || [];
    let allText = "";

    for (const file of files) {
      try {
        if (file.mimeType === "application/pdf") {
          const fileData = await drive.files.get(
            { fileId: file.id!, alt: "media" },
            { responseType: "arraybuffer" }
          );

          const buffer = Buffer.from(fileData.data as ArrayBuffer);
          const parsed = await pdfParse(buffer);
          allText += `\n---\n${file.name}:\n${parsed.text.slice(0, 5000)}`;
        }
      } catch (err) {
        console.error(`Fejl ved læsning af ${file.name}:`, err);
      }
    }

    return allText || "Ingen data fundet i Drive-filerne.";
  } catch (error) {
    console.error("Fejl i fetchDriveKnowledge:", error);
    return "Kunne ikke hente viden fra Google Drive.";
  }
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Ingen besked modtaget" }, { status: 400 });
    }

    // Hent viden fra Google Drive
    const knowledge = await fetchDriveKnowledge();

    // Sammensæt systemprompt
    const systemPrompt = `
Du er en intern AI-assistent hos Virtoo.ai.
Brug nedenstående virksomhedsviden fra Google Drive, når du svarer på spørgsmål.

VIDEN FRA DOKUMENTER:
${knowledge}
---

Svar altid tydeligt, med afsnit, overskrifter og evt. punktlister.
Brug fed skrift til nøgleord og skriv på dansk, med professionel tone.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.7,
    });

    const reply = completion.choices[0].message?.content || "Intet svar fra modellen.";

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Fejl i /api/chat:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
