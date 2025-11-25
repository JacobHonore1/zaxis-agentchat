import { NextResponse } from "next/server";
import { google } from "googleapis";
import pdfParse from "pdf-parse";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userMessage = body.message || "";
    const requestedFile = body.requestedFile || null;

    let fileText = "";

    // Hvis brugeren bad om en fil – hent den
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

        // Parse efter filtype
        if (requestedFile.mimeType.includes("pdf")) {
          const parsed = await pdfParse(buffer);
          fileText = parsed.text;
        } else if (
          requestedFile.mimeType.includes("msword") ||
          requestedFile.mimeType.includes("officedocument.wordprocessingml")
        ) {
          fileText = "Word-filer understøttes endnu ikke (step C)";
        } else if (requestedFile.mimeType.includes("csv")) {
          fileText = buffer.toString("utf-8");
        } else {
          fileText = "(Filtype ikke understøttet endnu)";
        }
      } catch (err: any) {
        fileText = "Fejl ved læsning af fil: " + err.message;
      }
    }

    // Nu genererer vi AI-svar
    const systemPrompt = `
Du er en hjælpsom AI-assistent. Hvis der medfølger tekst fra en fil,
skal du bruge den aktivt i dit svar.

Hvis der ikke er noget filindhold, svarer du som normalt.
    `;

    // Kald OpenAI Chat Completion
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
                content: `Her er tekst udtrukket fra den fil brugeren bad om:\n\n${fileText}`,
              }
            : null,
          { role: "user", content: userMessage },
        ].filter(Boolean),
      }),
    });

    const data = await openaiRes.json();

    return NextResponse.json({
      reply: data.choices?.[0]?.message?.content || "Intet svar modtaget fra modellen.",
    });
  } catch (err: any) {
    console.error("Chat fejl:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
