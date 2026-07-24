import { writeFile, mkdir } from "fs/promises";
import path from "path";

/**
 * Uploads evidence files (screenshots or consent-based audio recordings).
 * Currently saves files locally to `/public/uploads/`.
 *
 * TODO: Integrate Google Drive API for cloud storage once Google Drive API credentials are configured.
 */
export async function uploadEvidence(
  file: File,
  folderType: "image" | "audio" = "image"
): Promise<string | null> {
  if (!file || file.size === 0) {
    return null;
  }

  console.log(`[TODO - Google Drive API]: Uploading ${folderType} evidence (${file.name}). Storing locally for MVP.`);

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const fileExtension = path.extname(file.name) || (folderType === "image" ? ".jpg" : ".mp3");
    const filename = `${folderType}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${fileExtension}`;
    const filePath = path.join(uploadsDir, filename);

    await writeFile(filePath, buffer);

    return `/uploads/${filename}`;
  } catch (error) {
    console.error("Error saving evidence file locally:", error);
    return null;
  }
}
