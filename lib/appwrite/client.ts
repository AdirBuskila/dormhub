import { Client } from "appwrite";

export const appwriteClient = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

// Use this client with Storage in client components (image uploads, previews).
