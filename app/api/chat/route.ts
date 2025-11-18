import { NextResponse } from "next/server";
import { google } from "googleapis";
import OpenAI from "openai";
import pdfParse from "pdf-parse";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Google Drive IDs
const KNOWLEDGE_FOLDER_ID = "1ejPRZ-aFHmUf6wiwhZPABDXoIQ7PnG_q";
const AGENT_INSTRUCTION_FOLDER_ID = "1ZHmI29Rt-qSK6eMIAnrwX4LcK2ltwpa1";

// ─────────────────────────────────────────────
// HENT GOOGLE CLIENT
// ─────────────────────────────────────────────
function getDriveClient() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_KEY || "{}");

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });

  return google.drive({ version: "v3", auth });
}

// ─────────────────────────────────────────────
// HENT VIDEN FRA DRIVE
// ─────────────────────────────────────────────
async function fetchDriveKnowledge(): Promise<string> {
  try {
    const drive = getDriveClient();

    const res = await drive.files.list({
      q: `'${KNOWLEDGE_FOLDER_ID}' in parents`,
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

          allText += `
---  
${file.name}:  
${parsed.text.slice(0, 5000)}
`;
        }
      } catch (err) {
        console.error(`Fejl ved læsning af ${file.name}:`, err);
      }
    }

    return allText || "Ingen data fundet.";
  } catch (error) {
    console.error("Fejl i fetchDriveKnowledge:", error);
    return "Kunne ikke hente viden fra Google Drive.";
  }
}

// ─────────────────────────────────────────────
// HENT AGENT INSTRUKTIONER
// ─────────────────────────────────────────────
async function fetchAgentInstructions(agentName: string): Promise<string> {
  try {
    const drive = getDriveClient();

    const res = await drive.files.list({
      q: `'${AGENT_INSTRUCTION_FOLDER_ID}' in parents`,
      fields: "files(id, name, mimeType)",
    });

    const files = res.data.files || [];

    // FIND FIL NAVNGIVET EFTER AGENT
    // Eksempel: "LinkedIn.txt" matcher agentName: "LinkedIn"
    const file = files.find((f) =>
      f.name.toLowerCase().includes(agentName.toLowerCase())
    );

    if (!file) {
      return `Instruktionsfil for agent '${agentName}' blev ikke fundet.`;
    }

    // HENT FILENS INDHOLD
    const response = await drive.files.get(
      { fileId: file.id!, alt: "media" },
      { responseType: "text" }
    );

    return response.data as string;
  } catch (error) {
    console.error("Fejl i fetchAgentInstructions:", error);
    return "Kunne ikke hente agentens instruktionssæt.";
  }
}

// ─────────────────────────────────────────────
// API ENDPOINT
// ─────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const { message, agent } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Ingen besked modtaget" }, { status: 400 });
    }

    if (!agent) {
      return NextResponse.json({ error: "Ingen agent specificeret" }, { status: 400 });
    }

    // HENT VIDEN + AGENT-PROMPT
    const [knowledge, agentInstructions] = await Promise.all([
      fetchDriveKnowledge(),
      fetchAgentInstructions(agent),
    ]);

    // SYSTEM-PROMPT
    const systemPrompt = `
Du er "${agent}" agenten.

Instruktionssæt for denne agent:
${agentInstructions}

Virksomhedsviden:
${knowledge}

Retningslinjer:
- Svar på dansk
- Professionelt virksomhedssprog
- Brug klare afsnit
- Brug fed skrift til nøgleord
- Svar kortfattet og præcist
`;

    // OPENAI REQUEST
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.7,
    });

    const reply =
      completion.choices[0].message?.content || "Intet svar fra modellen.";

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Fejl i /api/chat:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
