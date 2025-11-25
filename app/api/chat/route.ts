import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body.message || "";
    const requestedFile = body.requestedFile || null;

    let fileInput: any = null;

    if (requestedFile?.id) {
      try {
        const credentials = JSON.parse(process.env.GOOGLE_SERVICE_KEY || "{}");

        const auth = new google.auth.GoogleAuth({
          credentials,
          scopes: ["https://www.googleapis.com/auth/drive.readonly"],
        });

        const drive = google.drive({ version: "v3", auth });

        // Hent rå binær fil – dette virker på Vercel
        const fileRes = await drive.files.get(
          { fileId: requestedFile.id, alt: "media" },
          { responseType: "arraybuffer" }
        );

        // Konverter binær data til base64
        const buffer = Buffer.from(fileRes.data as ArrayBuffer);

        fileInput = {
          type: "input_file",
          name: requestedFile.name,
          mime_type: requestedFile.mimeType,
          data: buffer.toString("base64"),
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
          "Du er en hjælpsom AI. Hvis en fil er vedhæftet, skal du bruge dens indhold.",
      },
    ];

    if (fileInput) {
      messages.push({
        role: "user",
        content: [
          { type: "input_text", text: `Læs venligst denne fil: ${requestedFile.name}` },
          fileInput,
        ],
      });
    }

    messages.push({
      role: "user",
      content: message,
    });

    // Send til OpenAI med Responses API
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
