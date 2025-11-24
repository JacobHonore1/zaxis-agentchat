import { NextResponse } from "next/server";
import { google } from "googleapis";
import OpenAI from "openai";
import pdfParse from "pdf-parse";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// IDs
const KNOWLEDGE_FOLDER_ID = "1ejPRZ-aFHmUf6wiwhZPABDXoIQ7PnG_q";
const AGENT_INSTRUCTION_FOLDER_ID = "1ZHmI29Rt-qSK6eMIAnrwX4LcK2ltwpa1";

// Drive klient
function getDriveClient() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_KEY || "{}");

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });

  return google.drive({ version: "v3", auth });
}

// Vidensbank
async function fetchDriveKnowledge(): Promise<string> {
  try {
    const drive = getDriveClient();

    const res = await drive.files.list({
      q: `'${KNOWLEDGE_FOLDER_ID}' in parents`,
      fields: "files(id, name, mimeType)",
    });

    console.log("VIDENSBANK filer:", res.data.files);

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

// Agent instruktioner
async function fetchAgentInstructions(agentName: string): Promise<string> {
  try {
    const drive = getDriveClient();

    const res = await drive.files.list({
      q: `'${AGENT_INSTRUCTION_FOLDER_ID}' in parents`,
      fields: "files(id, name, mimeType)",
    });

    console.log("AGENT FILER FUNDNE:", res.data.files);

    const files = res.data.files || [];

    const file = files.find((f) =>
      f.name.toLowerCase().includes(agentName.toLowerCase())
    );

    console.log("VALGT AGENTFIL:", file);

    if (!file) {
      return `Ingen instruktionsfil fundet for agent '${agentName}'.`;
    }

    let buffer: Buffer;

    if (file.mimeType === "text/plain" || file.mimeType === "application/octet-stream") {
      const resp = await drive.files.get(
        { fileId: file.id!, alt: "media" },
        { responseType: "arraybuffer" }
      );
      buffer = Buffer.from(resp.data as ArrayBuffer);
    } else if (file.mimeType?.startsWith("application/vnd.google-apps")) {
      const resp = await drive.files.export(
        { fileId: file.id!, mimeType: "text/plain" },
        { responseType: "arraybuffer" }
      );
      buffer = Buffer.from(resp.data as ArrayBuffer);
    } else {
      console.warn("UKENDT mimetype:", file.mimeType);
      return `Instruktionsfil '${file.name}' kunne ikke læses pga. filtype: ${file.mimeType}`;
    }

    const text = buffer.toString("utf8").trim();
    console.log("AGENT INSTRUKTION TEKST:", text);

    return text || "(Tom instruktionsfil)";
  } catch (error) {
    console.error("Fejl i fetchAgentInstructions:", error);
    return "Kunne ikke hente agent instruktioner.";
  }
}

// API endpoint
export async function POST(req: Request) {
  try {
    const { message, agent } = await req.json();

    console.log("=== API REQUEST ===");
    console.log("Agent:", agent);
    console.log("Message:", message);

    const [knowledge, agentInstructions] = await Promise.all([
      fetchDriveKnowledge(),
      fetchAgentInstructions(agent),
    ]);

    const systemPrompt = `
Du er agenten "${agent}".

AGENT SPECIFIKKE INSTRUKTIONER:
${agentInstructions}

VIDENSBANK:
${knowledge}
`;

    console.log("SYSTEM PROMPT SENDT TIL OPENAI:", systemPrompt);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.6,
    });

    const reply = completion.choices[0].message?.content || "(intet svar)";

    console.log("MODEL SVAR:", reply);

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Fejl i /api/chat:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
