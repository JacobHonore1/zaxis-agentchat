import { NextResponse } from "next/server";
import { google } from "googleapis";
import pdfParse from "pdf-parse";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userMessage = body.message || "";
    const requestedFile = body.requestedFile || null;

    let fileText = "";
    let fileName = "";

    // Hvis UI har fundet en fil …… så henter backend den rigtigt
    if (requestedFile?.id) {
      try {
        const credentials = JSON.parse(process.env.GOOGLE_SERVICE_KEY || "{}");

        const auth = new google.auth.GoogleAuth({
          credentials,
          scopes: ["https://www.googleapis.com/auth/drive.readonly"],
        });

        const drive = google.drive({ version: "v3", auth });

        // Hent binary data
        const fileData = await drive.files.get(
          { fileId: requestedFile.id, alt: "media" },
          { responseType: "arraybuffer" }
        );

        const buffer = Buffer.from(fileData.data as ArrayBuffer);

        fileName = requestedFile.name;

        // PDF
        if (requestedFile.mimeType === "application/pdf") {
          const parsed = await pdfParse(buffer);
          fileText = parsed.text || "";
        }

        // CSV
        else if (requestedFile.mimeType === "text/csv") {
          fileText = buffer.toString("utf-8");
        }

        // DOCX
        else if (
          requestedFile.mimeType.includes(
            "application/vnd.openxmlformats-officedocument.wordprocessingml"
          )
        ) {
          fileText = "(DOCX-udtræk kommer i STEP C)";
        }

        // DOC
        else if (requestedFile.mimeType.includes("application/msword")) {
          fileText = "(DOC understøttes ikke endnu)";
        }
      } catch (err: any) {
        fileText = "Fejl ved læsning af fil: " + err.message;
      }
    }

    // Systemprompt der tvinger brugen af filtekst
    const systemPrompt = `
Du er en AI-assistent. 
Hvis der medfølger tekst fra en fil, skal du bruge den aktivt i dit svar.
Svar aldrig at du ikke kan åbne filer – du får allerede indholdet server-side.

Hvis der ikke er noget filindhold, svarer du normalt.
    `;

    // OpenAI request
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          fileText
            ? {
                role: "system",
                content: `Filnavn: ${fileName}\n\nHer er filens tekst:\n\n${fileText}`,
              }
            : null,
          { role: "user", content: userMessage },
        ].filter(Boolean),
      }),
    });

    const data = await openaiRes.json();

    return NextResponse.json({
      reply: data.choices?.[0]?.message?.content || "Intet svar modtaget.",
    });
  } catch (err: any) {
    console.error("Chat fejl:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
