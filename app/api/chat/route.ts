import { NextResponse } from "next/server";
import { google } from "googleapis";
import { OpenAI } from "openai";

async function getFileContent(fileId: string) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });

  const drive = google.drive({ version: "v3", auth });

  const file = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "text" }
  );

  return file.data;
}

export async function POST(req: Request) {
  const body = await req.json();
  const { message, agent, fileId } = body;

  let fileText = "";
  if (fileId) {
    try {
      fileText = await getFileContent(fileId);
    } catch (err) {
      console.error("Drive fejl:", err);
    }
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt =
    (fileText
      ? `Relevant dokument:\n${fileText}\n\n`
      : "Ingen dokument valgt.\n\n") +
    `Brugerens besked: ${message}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return NextResponse.json({ reply: completion.choices[0].message.content });
}
