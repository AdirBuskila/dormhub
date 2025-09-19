import { ID, Query } from "node-appwrite";
import { getServerAppwrite } from "@/lib/appwrite/server";
import type { User } from "@/lib/types";

const DB_ID = process.env.APPWRITE_DB_ID!;
const USERS = process.env.APPWRITE_USERS_COLLECTION_ID!;

function toDomainUser(doc: any): User {
  return {
    id: doc.$id,
    email: doc.email,
    name: doc.name,
    avatarUrl: doc.avatarUrl ?? undefined,
    createdAt: doc.$createdAt,
  } as User;
}

export async function upsertUser(user: Pick<User, "id" | "email" | "name" | "avatarUrl">): Promise<User> {
  const { databases } = getServerAppwrite();
  try {
    const existing = await databases.getDocument(DB_ID, USERS, user.id);
    const updated = await databases.updateDocument(DB_ID, USERS, user.id, {
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl ?? null,
    } as any);
    return toDomainUser(updated);
  } catch (e: any) {
    // create if not found
    const created = await databases.createDocument(DB_ID, USERS, user.id, {
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl ?? null,
    } as any);
    return toDomainUser(created);
  }
}


