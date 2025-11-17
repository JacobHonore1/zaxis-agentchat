import { NextResponse } from "next/server";
import { google } from "googleapis";
import OpenAI from "openai";
import pdfParse from "pdf-parse";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Agent definitions
const agents = {
  linkedin: {
    name: "LinkedIn Tekstskriver",
    instructions: `
Du er en ekspert i at skrive danske LinkedIn opslag.
Fokus på kortfattethed, relevans, professionelle pointer og klar værdi.
Skriv i et let genkendeligt LinkedIn format med korte afsnit og korte linjeskift.
Sørg for at at sætningen men se altid giver mening inden der vises "Vis mere"
    `
  },
  business: {
    name: "Virksomhedsassistent",
    instructions: `
Du er en professionel virksomhedsassistent.
Du analyserer brugernes spørgsmål og leverer klare, strukturerede svar.
Du bruger tydelige overskrifter, punktopstilling og kortfattet professionel dansk.
    `
  }
};

const defaultAgent = "business";

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
    const { message, agent_id } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Ingen besked modtaget" }, { status: 400 });
    }

    // Agentvalg
    const agentKey = agent_id && agents[agent_id] ? agent_id : defaultAgent;
    const agent = agents[agentKey];

    // Hent viden fra Google Drive
    const knowledge = await fetchDriveKnowledge();

    // Systemprompt der kombinerer agent instruktioner og virksomhedens vidensdatabase
    const systemPrompt = `
Du fungerer som denne agent:
${agent.name}

Primære instruktioner:
${agent.instructions}

Virksomhedsviden fra Google Drive:
${knowledge}

Svar på dansk. Brug klare afsnit og en professionel tone.
    `.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.5,
    });

    const reply =
      completion.choices[0].message?.content || "Ingen respons fra modellen.";

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Fejl i /api/chat:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
