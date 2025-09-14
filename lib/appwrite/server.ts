import { Client, Databases, Storage } from "node-appwrite";

const serverClient = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

export const db = new Databases(serverClient);
export const storage = new Storage(serverClient);

// Use these only in server actions / repo layer.
