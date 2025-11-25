import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message, agent } = await req.json();

    let systemPrompt = "Du er en hjælpsom assistent.";
    let fileContext = "";

    // 1) Finder filnavne i brugerens tekst
    const fileRegex = /([\w\-.]+\.(pdf|txt|docx?|xlsx?))/i;
    const match = message.match(fileRegex);

    if (match) {
      const filename = match[1];

      try {
        // 2) Hent fil-listen
        const listRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/drive-files`);
        const { files } = await listRes.json();

        // 3) Find den fil brugeren nævnte
        const found = files.find((f: any) => f.name.toLowerCase() === filename.toLowerCase());

        if (found) {
          // 4) Hent filens indhold via vores nye endpoint
          const textRes = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/drive-file?id=${found.id}`
          );

          const data = await textRes.json();

          if (data.text) {
            fileContext =
              `Følgende tekst er hentet fra filen '${filename}':\n\n` +
              data.text.slice(0, 12000);
          }
        }
      } catch (err) {
        console.error("Fejl ved filhentning:", err);
      }
    }

    // 5) Kombiner filtekst + bruger tekst
    const userPrompt = fileContext
      ? fileContext + `\n\nBrugerens besked: ${message}`
      : message;

    // 6) Send til OpenAI
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
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
