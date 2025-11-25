export type DriveFile = {
  id: string;
  name: string;
  mimeType?: string;
  text?: string; // valgfri, hvis /api/drive-files også sender tekst
};
