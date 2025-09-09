// lib/repos.ts
import { MarketplaceItem, RideOffer, StudyPost } from "./types";
import type { InfoItem, InfoCategory, Pagination, Page, Tip, TextTip, ProductTip, Id } from "./types";


export type TipFilter = {
  type?: "text" | "product";
  tag?: string;
  hasImage?: boolean;
  q?: string;                // plain text search in title/text
  sort?: "new" | "top";      // createdAt desc | helpfulCount desc
  sinceDays?: number;        // filter by recency
};

export interface TipsRepo {
  list(filter: TipFilter, pg: Pagination): Promise<Page<Tip>>;
  get(id: Id): Promise<Tip | null>;
  create(payload: Omit<TextTip, "id"|"helpfulCount"|"flagCount"|"createdAt"|"updatedAt"|"status"> | Omit<ProductTip, "id"|"helpfulCount"|"flagCount"|"createdAt"|"updatedAt"|"status">, actorId: Id): Promise<Tip>;
  update(id: Id, patch: Partial<TextTip & ProductTip>, actorId: Id): Promise<Tip>;
  remove(id: Id, actorId: Id): Promise<void>;
  toggleHelpful(id: Id, actorId: Id): Promise<{ helpfulCount: number }>;
  report(id: Id, actorId: Id): Promise<{ flagCount: number; status: "active"|"hidden"|"archived" }>;
}

export type InfoFilter = {
  category?: InfoCategory;
  q?: string;
  pinnedOnly?: boolean;
};

export interface InfoRepo {
  list(filter: InfoFilter, pg: Pagination): Promise<Page<InfoItem>>;
  get(id: Id): Promise<InfoItem | null>;
  create(payload: Omit<InfoItem, "id"|"createdAt"|"updatedAt">, actorId: Id): Promise<InfoItem>;
  update(id: Id, patch: Partial<InfoItem>, actorId: Id): Promise<InfoItem>;
  remove(id: Id, actorId: Id): Promise<void>;
  pin(id: Id, actorId: Id): Promise<InfoItem>;
  unpin(id: Id, actorId: Id): Promise<InfoItem>;
}

export interface Repos {
  tips: TipsRepo;
  info: InfoRepo;
}

let cached: Repos | null = null;
export async function getRepos(): Promise<Repos> {
  if (cached) return cached;
  const { createMockRepos } = await import("./mock");
  cached = createMockRepos();
  return cached;
}
