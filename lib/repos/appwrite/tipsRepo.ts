// lib/repos/appwrite/tipsRepo.ts
import { ID, Query } from "node-appwrite";
import { getServerAppwrite } from "@/lib/appwrite/server";

const DB_ID = process.env.APPWRITE_DB_ID!;
const TIPS = process.env.APPWRITE_TIPS_COLLECTION_ID!;

export type CreateTextTipArgs = {
  ownerId: string;   // use Auth0 user.sub
  title: string;
  text: string;
  tags?: string[];
  images?: any[];    // your shape
};

export async function listTips(opts?: { limit?: number; cursor?: string; tag?: string }) {
  const { databases } = getServerAppwrite();
  const queries = [Query.orderDesc("createdAt"), Query.limit(opts?.limit ?? 20)];
  if (opts?.cursor) queries.push(Query.cursorAfter(opts.cursor));
  if (opts?.tag) queries.push(Query.search("tags", opts.tag));
  return databases.listDocuments(DB_ID, TIPS, queries);
}

export async function createTextTip(args: CreateTextTipArgs) {
  const { databases } = getServerAppwrite();
  const doc = {
    ownerId: args.ownerId,
    type: "text",
    title: args.title,
    text: args.text,
    tags: args.tags ?? [],
    images: args.images ?? [],
    helpfulCount: 0,
    flagCount: 0,
    status: "active",
    createdAt: new Date().toISOString(),
  };
  return databases.createDocument(DB_ID, TIPS, ID.unique(), doc);
}

export async function createProductTip(args: CreateTextTipArgs & {
  product: {
    name: string;
    whereToBuy?: string;
    estPriceILS?: number;
    link?: string;
    notes?: string;
  };
}) {
  const { databases } = getServerAppwrite();
  const doc = {
    ownerId: args.ownerId,
    type: "product",
    title: args.title,
    text: args.text,
    tags: args.tags ?? ["product"],
    images: args.images ?? [],
    helpfulCount: 0,
    flagCount: 0,
    status: "active",
    createdAt: new Date().toISOString(),
    product: args.product,
  };
  return databases.createDocument(DB_ID, TIPS, ID.unique(), doc);
}

export async function getTip(id: string) {
  const { databases } = getServerAppwrite();
  return databases.getDocument(DB_ID, TIPS, id);
}

export async function updateTip(id: string, patch: Record<string, any>) {
  const { databases } = getServerAppwrite();
  return databases.updateDocument(DB_ID, TIPS, id, patch);
}

export async function deleteTip(id: string) {
  const { databases } = getServerAppwrite();
  return databases.deleteDocument(DB_ID, TIPS, id);
}
