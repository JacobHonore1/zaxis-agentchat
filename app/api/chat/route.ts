import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body.message || "";
    const requestedFile = body.requestedFile || null;

    let fileInput = null;

    // Hvis brugeren bad om en fil → hent binary data
    if (requestedFile?.id) {
      try {
        const credentials = JSON.parse(process.env.GOOGLE_SERVICE_KEY || "{}");

        const auth = new google.auth.GoogleAuth({
          credentials,
          scopes: ["https://www.googleapis.com/auth/drive.readonly"],
        });

        const drive = google.drive({ version: "v3", auth });

        const fileData = await drive.files.get(
          { fileId: requestedFile.id, alt: "media" },
          { responseType: "arraybuffer" }
        );

        fileInput = {
          type: "input_file",
          name: requestedFile.name,
          mime_type: requestedFile.mimeType,
          data: Buffer.from(fileData.data).toString("base64"),
        };
      } catch (err: any) {
        console.error("Fejl ved filhentning:", err);
      }
    }

    // Byg messages til OpenAI
    const messages: any[] = [
      {
        role: "system",
        content:
          "Du er en hjælpsom AI. Hvis en fil er vedhæftet, så skal du bruge indholdet i dit svar.",
      },
    ];

    if (fileInput) {
      messages.push({
        role: "user",
        content: [
          {
            type: "input_text",
            text: `Her er filen "${requestedFile.name}". Læs den og brug indholdet i dit svar.`,
          },
          fileInput,
        ],
      });
    }

    messages.push({
      role: "user",
      content: message,
    });

    // Kald OpenAI Responses API (ny og korrekt metode)
    const openaiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        messages,
      }),
    });

    const data = await openaiRes.json();

    return NextResponse.json({
      reply: data.output_text || "Intet svar modtaget.",
    });
  } catch (err: any) {
    console.error("Chat fejl:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
