import { Client, Databases, Storage } from "node-appwrite";

export function getServerAppwrite() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
  const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
  const apiKey = process.env.APPWRITE_API_KEY!;
  if (!endpoint || !project || !apiKey) {
    throw new Error("Missing Appwrite server env vars");
  }

  const client = new Client().setEndpoint(endpoint).setProject(project).setKey(apiKey);
  return {
    databases: new Databases(client),
    storage: new Storage(client),
  };
}
