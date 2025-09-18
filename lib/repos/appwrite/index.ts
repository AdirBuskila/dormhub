import type { Repos, TipsRepo, InfoRepo, TipFilter } from "@/lib/repos";
import type { Tip, TextTip, ProductTip, Id, Page, Pagination, Status } from "@/lib/types";
import { getServerAppwrite } from "@/lib/appwrite/server";
import { ID, Query } from "node-appwrite";

const DB_ID = process.env.APPWRITE_DB_ID!;
const TIPS_COL = process.env.APPWRITE_TIPS_COLLECTION_ID!;

function toDomainTip(doc: any): Tip {
  const base = {
    id: doc.$id as Id,
    ownerId: doc.ownerId as Id,
    title: doc.title as string,
    text: doc.text as string,
    tags: (doc.tags ?? []) as string[],
    images: (doc.images ?? []) as string[],
    helpfulCount: (doc.helpfulCount ?? 0) as number,
    flagCount: (doc.flagCount ?? 0) as number,
    status: (doc.status ?? "active") as Status,
    createdAt: doc.$createdAt as string,
    updatedAt: doc.$updatedAt as string | undefined,
  };
  if (doc.type === "product") {
    return {
      ...base,
      type: "product",
      productUrl: doc.productUrl,
      approxPriceIls: doc.approxPriceIls ?? undefined,
      store: doc.store ?? undefined,
      apartmentFit: doc.apartmentFit ?? undefined,
    } as ProductTip;
  }
  return { ...base, type: "text" } as TextTip;
}

function buildQueries(filter: TipFilter, pg: Pagination) {
  const queries = [Query.orderDesc("$createdAt"), Query.limit(pg.pageSize)];
  if (pg.page > 1 && (filter as any).cursor) {
    queries.push(Query.cursorAfter((filter as any).cursor));
  }
  if (filter.type) queries.push(Query.equal("type", filter.type));
  if (filter.tag) queries.push(Query.search("tags", filter.tag));
  if (filter.hasImage) queries.push(Query.greaterThan("imagesSize", 0 as any));
  if (filter.q) queries.push(Query.search("search", filter.q));
  // sinceDays can be approximated by createdAt cutoff if you have that field or use $createdAt
  if (filter.sinceDays) {
    const cutoff = new Date(Date.now() - filter.sinceDays * 86400_000).toISOString();
    queries.push(Query.greaterThanEqual("$createdAt", cutoff));
  }
  if (filter.sort === "top") {
    // Appwrite doesn't support multi-order; switch to helpfulCount desc
    queries.splice(0, 1, Query.orderDesc("helpfulCount"));
  }
  return queries;
}

export async function createAppwriteRepos(): Promise<Repos> {
  const { databases } = getServerAppwrite();

  const tipsRepo: TipsRepo = {
    async list(filter, pg): Promise<Page<Tip>> {
      const queries = buildQueries(filter, pg);
      const res = await databases.listDocuments(DB_ID, TIPS_COL, queries);
      return {
        items: res.documents.map(toDomainTip),
        total: res.total,
      };
    },

    async get(id) {
      const doc = await databases.getDocument(DB_ID, TIPS_COL, id);
      return toDomainTip(doc);
    },

    async create(payload, actorId) {
      const base: any = {
        ownerId: actorId,
        type: (payload as any).type ?? "text",
        title: payload.title,
        text: payload.text,
        tags: payload.tags ?? [],
        images: payload.images ?? [],
        helpfulCount: 0,
        flagCount: 0,
        status: "active",
        search: `${payload.title ?? ''} ${payload.text ?? ''} ${(payload.tags ?? []).join(' ')}`.slice(0, 2048),
      };
      if (base.type === "product") {
        base.productUrl = (payload as any).productUrl;
        base.approxPriceIls = (payload as any).approxPriceIls;
        base.store = (payload as any).store;
        base.apartmentFit = (payload as any).apartmentFit;
      }
      const created = await databases.createDocument(DB_ID, TIPS_COL, ID.unique(), base);
      return toDomainTip(created);
    },

    async update(id, patch, actorId) {
      // Authorization check could be done via Appwrite permissions; keep simple
      const updated = await databases.updateDocument(DB_ID, TIPS_COL, id, patch as any);
      return toDomainTip(updated);
    },

    async remove(id) {
      await databases.deleteDocument(DB_ID, TIPS_COL, id);
    },

    async toggleHelpful(id, actorId) {
      const doc = await databases.getDocument(DB_ID, TIPS_COL, id);
      const next = (doc.helpfulCount ?? 0) + 1;
      const updated = await databases.updateDocument(DB_ID, TIPS_COL, id, { helpfulCount: next } as any);
      return { helpfulCount: updated.helpfulCount ?? next };
    },

    async report(id, actorId) {
      const doc = await databases.getDocument(DB_ID, TIPS_COL, id);
      const next = (doc.flagCount ?? 0) + 1;
      const nextStatus: Status = next >= 3 ? "hidden" : (doc.status ?? "active");
      const updated = await databases.updateDocument(DB_ID, TIPS_COL, id, { flagCount: next, status: nextStatus } as any);
      return { flagCount: updated.flagCount ?? next, status: (updated.status ?? nextStatus) as Status };
    },
  };

  const infoRepo: InfoRepo = {
    async list(filter, pg) {
      // For now, keep info in mock; simplest path forward
      const { createMockRepos } = await import("@/lib/mock");
      return createMockRepos().info.list(filter, pg);
    },
    async get(id) {
      const { createMockRepos } = await import("@/lib/mock");
      return createMockRepos().info.get(id);
    },
    async create(payload, actorId) {
      const { createMockRepos } = await import("@/lib/mock");
      return createMockRepos().info.create(payload, actorId);
    },
    async update(id, patch, actorId) {
      const { createMockRepos } = await import("@/lib/mock");
      return createMockRepos().info.update(id, patch, actorId);
    },
    async remove(id, actorId) {
      const { createMockRepos } = await import("@/lib/mock");
      return createMockRepos().info.remove(id, actorId);
    },
    async pin(id, actorId) {
      const { createMockRepos } = await import("@/lib/mock");
      return createMockRepos().info.pin(id, actorId);
    },
    async unpin(id, actorId) {
      const { createMockRepos } = await import("@/lib/mock");
      return createMockRepos().info.unpin(id, actorId);
    },
  };

  return { tips: tipsRepo, info: infoRepo } as Repos;
}



