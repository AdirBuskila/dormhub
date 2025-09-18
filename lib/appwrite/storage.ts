import { ID, Permission, Role } from "node-appwrite";
import { getServerAppwrite } from "@/lib/appwrite/server";
import { InputFile } from "node-appwrite/file";

 const BUCKET_ID = process.env.APPWRITE_TIPS_BUCKET_ID!;
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;

export type UploadedImage = { fileId: string; url: string };

export function getPublicFileUrl(fileId: string): string {
  // Public view URL; ensure your bucket has read permissions for role:all or appropriate.
  return `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${PROJECT}`;
}

export async function uploadWebFile(file: File): Promise<UploadedImage> {
  const { storage } = getServerAppwrite();
  // In Node.js (route handlers), wrap the Web File into an Appwrite InputFile
  const buffer = Buffer.from(await file.arrayBuffer());
  const input = InputFile.fromBuffer(buffer, file.name);
  const created = await storage.createFile(
    BUCKET_ID,
    ID.unique(),
    input as any,
    [Permission.read(Role.any())] as any
  );
  return { fileId: created.$id, url: getPublicFileUrl(created.$id) };
}

export async function deleteImage(fileId: string): Promise<void> {
  const { storage } = getServerAppwrite();
  await storage.deleteFile(BUCKET_ID, fileId);
}

export async function makeImagePublic(fileId: string): Promise<void> {
  const { storage } = getServerAppwrite();
  // Update file permissions to be publicly readable
  await storage.updateFile(BUCKET_ID, fileId, undefined as any, [Permission.read(Role.any())] as any);
}


