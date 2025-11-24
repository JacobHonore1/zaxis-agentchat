import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const { message, agent } = await req.json();

    let systemPrompt = "Du er en hjælpsom assistent.";
    let fileContext = "";

    // Hvis brugeren nævner .pdf, .txt, .docx
    const fileRegex = /([\w\-.]+)\.(pdf|txt|docx?)/i;
    const match = message.match(fileRegex);

    if (match) {
      const filename = match[0];

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/drive-files`
        );
        const { files } = await res.json();

        const found = files.find((f: any) => f.name === filename);

        if (found) {
          const textRes = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/file-text?id=${found.id}`
          );
          const fileData = await textRes.json();

          if (fileData.text) {
            fileContext =
              `Følgende tekst kommer fra filen '${filename}':\n\n` +
              fileData.text.slice(0, 8000);
          }
        }
      } catch (err) {}
    }

    const prompt = fileContext
      ? fileContext + "\n\nBrugerens spørgsmål: " + message
      : message;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ]
    });

    return NextResponse.json({
      reply: completion.choices[0].message.content
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
