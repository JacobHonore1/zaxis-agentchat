import { NextResponse } from "next/server";
import { google } from "googleapis";
import OpenAI from "openai";
import pdfParse from "pdf-parse";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Mappe til vidensbank
const KNOWLEDGE_FOLDER_ID = "1ejPRZ-aFHmUf6wiwhZPABDXoIQ7PnG_q";
// Mappe til agent instruktionssæt
const AGENT_INSTRUCTION_FOLDER_ID = "1ZHmI29Rt-qSK6eMIAnrwX4LcK2ltwpa1";

// Fælles Drive klient
function getDriveClient() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_KEY || "{}");

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });

  return google.drive({ version: "v3", auth });
}

// Hent vidensbank fra Drive (pdf)
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

    return allText || "Ingen data fundet i vidensbanken.";
  } catch (error) {
    console.error("Fejl i fetchDriveKnowledge:", error);
    return "Kunne ikke hente viden fra Google Drive.";
  }
}

// Hent instruktionssæt for given agent fra Drive
async function fetchAgentInstructions(agentName: string): Promise<string> {
  try {
    const drive = getDriveClient();

    const res = await drive.files.list({
      q: `'${AGENT_INSTRUCTION_FOLDER_ID}' in parents`,
      fields: "files(id, name, mimeType)",
    });

    const files = res.data.files || [];

    const file = files.find((f) =>
      f.name.toLowerCase().includes(agentName.toLowerCase())
    );

    if (!file) {
      console.warn(`Ingen instruktionsfil fundet for agent: ${agentName}`);
      return `Instruktionsfil for agent '${agentName}' blev ikke fundet. Brug standardadfærd.`;
    }

    let buffer: Buffer;

    // Rigtige filer som .txt osv
    if (file.mimeType === "text/plain" || file.mimeType === "application/octet-stream") {
      const resp = await drive.files.get(
        { fileId: file.id!, alt: "media" },
        { responseType: "arraybuffer" }
      );
      buffer = Buffer.from(resp.data as ArrayBuffer);
    }
    // Hvis du senere bruger Google Docs
    else if (file.mimeType?.startsWith("application/vnd.google-apps")) {
      const resp = await drive.files.export(
        { fileId: file.id!, mimeType: "text/plain" },
        { responseType: "arraybuffer" }
      );
      buffer = Buffer.from(resp.data as ArrayBuffer);
    } else {
      console.warn(`Ukendt mimetype for instruktionsfil: ${file.mimeType}`);
      return `Instruktionsfil for agent '${agentName}' kunne ikke læses pga. filtype.`;
    }

    const text = buffer.toString("utf8").trim();
    console.info(`Instruktionsfil for agent '${agentName}' indlæst: ${file.name}`);

    return text || `Instruktionsfil for agent '${agentName}' var tom.`;
  } catch (error) {
    console.error("Fejl i fetchAgentInstructions:", error);
    return "Kunne ikke hente agentens instruktionssæt.";
  }
}

// API endpoint
export async function POST(req: Request) {
  try {
    const { message, agent } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Ingen besked modtaget" }, { status: 400 });
    }

    if (!agent) {
      return NextResponse.json({ error: "Ingen agent specificeret" }, { status: 400 });
    }

    const [knowledge, agentInstructions] = await Promise.all([
      fetchDriveKnowledge(),
      fetchAgentInstructions(agent),
    ]);

    const systemPrompt = `
Du er agenten "${agent}".

Instruktionssæt for denne agent:
${agentInstructions}

Virksomhedsviden (til kontekst):
${knowledge}

Retningslinjer:
- Svar altid på dansk
- Brug professionelt virksomhedssprog
- Svar struktureret med korte afsnit
- Brug fed skrift til nøglebegreber
`;

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
