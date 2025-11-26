export type DriveFile = {
  id: string;
  name: string;
  mimeType?: string;
  text?: string;      // valgfri – bruges til indhold fra Drive
  uploadedAt?: string; // ny – dato/tid for upload / createdTime fra Drive
};
