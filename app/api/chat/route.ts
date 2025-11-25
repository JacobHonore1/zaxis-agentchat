import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { DriveFile } from "../../../types/DriveFile";
import { agents } from "../../../config/agents";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message, agent, fileId } = await req.json();

    const selectedAgent = agents[agent as keyof typeof agents];

    const baseSystemPrompt =
      selectedAgent?.systemPrompt ||
      "Du er en hjælpsom dansk assistent. Svar kort, klart og professionelt.";

    // Hent filer fra egen route
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
${baseSystemPrompt}

Du har adgang til følgende dokumenter i vidensbanken:
${fileListString}

Hvis brugeren spørger hvilke dokumenter du har, skal du svare ud fra listen ovenfor.
Hvis brugeren nævner et dokument ved navn eller der er sendt uddrag med, skal du bruge det aktivt i svaret.
`;

    const userContent =
      fileContext.length > 0
        ? `${fileContext}\n\nBrugerens spørgsmål: ${message}`
        : message;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    });

    return NextResponse.json({
      reply: completion.choices[0].message.content,
    });
  } catch (err: any) {
    console.error("Chat route error", err);
    return NextResponse.json(
      { error: err.message || "Ukendt fejl i chat endpoint" },
      { status: 500 }
    );
  }
}
