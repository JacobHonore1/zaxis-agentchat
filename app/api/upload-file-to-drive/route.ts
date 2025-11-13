import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    // Hent multipart formdata med filen
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Ingen fil modtaget' }, { status: 400 });
    }

    // Læs filens bytes
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Godkend Google Service Account
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_KEY as string),
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Upload fil til den definerede mappe
    const uploaded = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID as string],
      },
      media: {
        mimeType: file.type || 'application/octet-stream',
        body: buffer,
      },
    });

    // Gør filen synlig i mappen
    await drive.permissions.create({
      fileId: uploaded.data.id!,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    return NextResponse.json({
      success: true,
      fileId: uploaded.data.id,
      fileName: file.name,
    });
  } catch (error) {
    console.error('Upload fejl:', error);
    return NextResponse.json({ error: 'Upload til Google Drive fejlede' }, { status: 500 });
  }
}
