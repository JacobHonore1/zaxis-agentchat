import { NextResponse } from "next/server";
import { google } from "googleapis";
import OpenAI from "openai";
import pdfParse from "pdf-parse";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Mappestruktur
const KNOWLEDGE_FOLDER_ID = "1ejPRZ-aFHmUf6wiwhZPABDXoIQ7PnG_q";
const AGENT_INSTRUCTION_FOLDER_ID = "1ZHmI29Rt-qSK6eMIAnrwX4LcK2ltwpa1";

// Google Drive klient
function getDriveClient() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_KEY || "{}");

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });

  return google.drive({ version: "v3", auth });
}

// ===============
// Hjælpefunktion: hent ren tekst fra en fil
// ===============
async function getFileContent(fileId: string, mimeType?: string): Promise<string> {
  const drive = getDriveClient();

  // PDF → tekst
  if (mimeType === "application/pdf") {
    const pdfBuffer = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "arraybuffer" }
    );

    const parsed = await pdfParse(Buffer.from(pdfBuffer.data as ArrayBuffer));

    return parsed.text || "";
  }

  // Google Docs → tekst
  if (mimeType?.startsWith("application/vnd.google-apps")) {
    const exported = await drive.files.export(
      { fileId, mimeType: "text/plain" },
      { responseType: "arraybuffer" }
    );

    return Buffer.from(exported.data as ArrayBuffer).toString("utf8");
  }

  // Almindelig tekstfil
  const fileData = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "arraybuffer" }
  );

  return Buffer.from(fileData.data as ArrayBuffer).toString("utf8");
}

// ===============
// Hent vidensbank (PDF)
// ===============
async function fetchDriveKnowledge(): Promise<string> {
  try {
    const drive = getDriveClient();

    const res = await drive.files.list({
      q: `'${KNOWLEDGE_FOLDER_ID}' in parents`,
      fields: "files(id, name, mimeType)",
    });

    const files = res.data.files || [];
    let allText = "";

    for (const f of files) {
      try {
        const text = await getFileContent(f.id!, f.mimeType);
        allText += `\n---\n${f.name}:\n${text.slice(0, 5000)}\n`;
      } catch (err) {
        allText += `\n---\n${f.name}: FEJL VED INDLÆSNING\n`;
      }
    }

    return allText || "Ingen data fundet.";
  } catch (e) {
    console.error("VIDENSBANK FEJL:", e);
    return "Kunne ikke hente vidensbank.";
  }
}

// ===============
// Hent agent-instruktioner (.txt eller Google Docs)
// ===============
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
      return `Ingen instruktionsfil fundet for agent '${agentName}'.`;
    }

    return await getFileContent(file.id!, file.mimeType);
  } catch (e) {
    console.error("AGENT INSTRUKTION FEJL:", e);
    return "Kunne ikke hente instruktionsfil.";
  }
}

// ===============
// Hoved-endpoint
// ===============
export async function POST(req: Request) {
  try {
    const { message, agent } = await req.json();

    const [knowledge, agentInstructions] = await Promise.all([
      fetchDriveKnowledge(),
      fetchAgentInstructions(agent),
    ]);

    const systemPrompt = `
Du er agenten "${agent}".

AGENT INSTRUKTION:
${agentInstructions}

VIDENSBANK:
${knowledge}

Svar altid på dansk og brug professionelt virksomhedssprog.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.7,
    });

    return NextResponse.json({
      reply: completion.choices[0].message?.content || "",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
