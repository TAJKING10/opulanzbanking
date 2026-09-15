export type IatUploadedFile = {
  filename: string;
  url: string;
  blobName?: string;
  size?: number;
  mimeType?: string;
  type: string;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function uploadIatDocument(file: File, type: string): Promise<IatUploadedFile> {
  const form = new FormData();
  form.append("file", file);
  form.append("type", type);

  const res = await fetch(`${API}/api/upload`, {
    method: "POST",
    body: form,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json?.success || !json.data) {
    throw new Error(json?.error || `Upload failed (${res.status})`);
  }

  return {
    filename: json.data.fileName || file.name,
    url: json.data.fileUrl || json.data.url,
    blobName: json.data.blobName || json.data.fileId,
    size: json.data.fileSize || file.size,
    mimeType: json.data.mimeType || file.type,
    type,
  };
}

export async function linkIatDocumentToApplication(
  applicationId: number,
  file: Pick<IatUploadedFile, "filename" | "url" | "blobName" | "size" | "type">
) {
  if (!applicationId || !file.url) return;
  await fetch(`${API}/api/admin/link-document`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      applicationId,
      fileName: file.filename,
      fileUrl: file.url,
      blobName: file.blobName || null,
      type: file.type || "other",
      size: file.size || null,
    }),
  }).catch(() => {});
}
