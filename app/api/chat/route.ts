import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { DriveFile } from "../../../types/DriveFile";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message, agent, fileId } = await req.json();

    // Hent filer fra din egen /api/drive-files route
    const driveUrl = new URL("/api/drive-files", req.url);
    const driveRes = await fetch(driveUrl.toString());
    const driveData = await driveRes.json();
    const files: DriveFile[] = driveData.files || [];

    const fileListString =
      files.length > 0
        ? files.map((f) => `• ${f.name}`).join("\n")
        : "Ingen dokumenter fundet.";

    let fileContext = "";

    if (fileId) {
      const selected = files.find((f) => f.id === fileId);
      if (selected && selected.text) {
        const snippet =
          selected.text.length > 8000
            ? selected.text.slice(0, 8000)
            : selected.text;
        fileContext = `Uddrag fra dokumentet "${selected.name}":\n${snippet}`;
      }
    }

    const systemPrompt = `
Du er en hjælpsom dansk assistent for virksomheden Virtoo.

Du har adgang til følgende dokumenter i vidensbanken:
${fileListString}

Hvis brugeren nævner et af dokumenterne, eller der er sendt uddrag med, skal du bruge dem som kontekst i dine svar.
Hvis brugeren spørger "hvilke dokumenter har du" eller lignende, skal du svare ud fra listen ovenfor.
Svar altid kortfattet, professionelt og på dansk.
`;

    const userPrompt =
      fileContext.length > 0
        ? `${fileContext}\n\nBrugerens spørgsmål: ${message}`
        : message;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    return NextResponse.json({
      reply: completion.choices[0].message.content,
    });
  } catch (err: any) {
    console.error("Chat route error", err);
    return NextResponse.json(
      { error: err.message || "Ukendt fejl" },
      { status: 500 }
    );
  }
}
