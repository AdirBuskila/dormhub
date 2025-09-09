// lib/mock.ts
import { randomUUID } from "crypto";
import type { Repos, TipsRepo, InfoRepo, TipFilter, InfoFilter } from "./repos";
import type { Tip, TextTip, ProductTip, InfoItem, Id, Pagination, Page, ISODateTime, Status, InfoCategory } from "./types";

const now = () => new Date().toISOString() as ISODateTime;

// -------------------------
// Seed data
// -------------------------
const seedTips: Tip[] = [
  {
    id: randomUUID(),
    ownerId: "user_alex" as Id,
    type: "text",
    title: "Router placement that actually works",
    text: "Put the router near the hallway, not inside the bedroom closet.",
    tags: ["internet", "wifi"],
    images: [],
    helpfulCount: 4,
    flagCount: 0,
    status: "active",
    createdAt: now(),
  } as TextTip,
  {
    id: randomUUID(),
    ownerId: "user_maya" as Id,
    type: "product",
    title: "Blackout curtain that fits Dorm C windows",
    text: "This one blocks 90% light. Needed 2 units for full width.",
    tags: ["sleep", "curtains"],
    images: [],
    helpfulCount: 9,
    flagCount: 0,
    status: "active",
    productUrl: "https://www.aliexpress.com/example-curtain",
    approxPriceIls: 65,
    createdAt: now(),
  } as ProductTip,
];

const seedInfo: InfoItem[] = [
  {
    id: randomUUID(),
    ownerId: "admin_1" as Id,
    title: "Laundry machines & hours",
    body: "Basement level. 3₪ per cycle. 07:00–23:00. Card top-up at Dorm A office.",
    links: [],
    pinned: true,
    category: "laundry",
    createdAt: now(),
  },
  {
    id: randomUUID(),
    ownerId: "admin_1" as Id,
    title: "Maintenance requests",
    body: "Submit ticket via the campus portal. Urgent issues: call the guard desk.",
    links: ["https://example.edu/maintenance"],
    category: "maintenance",
    createdAt: now(),
  },
];

// -------------------------
// Helpers
// -------------------------
function paginate<T>(items: T[], { page, pageSize }: Pagination): Page<T> {
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total: items.length };
}

function textMatch(hay: string, needle?: string) {
  if (!needle) return true;
  return hay.toLowerCase().includes(needle.toLowerCase());
}

// -------------------------
// Repo implementations
// -------------------------
export function createMockRepos(): Repos {
  // module-scope “DB”
  const tips = [...seedTips];
  const info = [...seedInfo];

  // for helpful/report uniqueness (very simple)
  const tipHelpfulByUser = new Map<string, Set<Id>>(); // tipId -> set(userId)
  const tipReportsByUser = new Map<string, Set<Id>>(); // tipId -> set(userId)
  const HIDE_THRESHOLD = 3;

  const tipsRepo: TipsRepo = {
    async list(filter, pg) {
      let rows = tips.slice();

      // filter
      if (filter.type) rows = rows.filter(t => t.type === filter.type);
      if (filter.tag) rows = rows.filter(t => (t.tags || []).includes(filter.tag!));
      if (filter.hasImage) rows = rows.filter(t => (t.images?.length || 0) > 0);
      if (filter.q) rows = rows.filter(t => textMatch(`${t.title} ${t.text}`, filter.q));
      if (filter.sinceDays) {
        const cutoff = Date.now() - filter.sinceDays * 86400_000;
        rows = rows.filter(t => new Date(t.createdAt).getTime() >= cutoff);
      }

      // sort
      if (filter.sort === "top") {
        rows.sort((a, b) => (b.helpfulCount ?? 0) - (a.helpfulCount ?? 0));
      } else {
        rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      return paginate(rows, pg);
    },

    async get(id) {
      return tips.find(t => t.id === id) ?? null;
    },

    async create(payload, actorId) {
      const base = {
        id: randomUUID() as Id,
        ownerId: actorId,
        title: payload.title,
        text: payload.text,
        tags: payload.tags ?? [],
        images: payload.images ?? [],
        helpfulCount: 0,
        flagCount: 0,
        status: "active" as Status,
        createdAt: now(),
      };

      const doc: Tip =
        (payload as any).type === "product"
          ? {
            ...base,
            type: "product",
            productUrl: (payload as any).productUrl,
            approxPriceIls: (payload as any).approxPriceIls,
            store: (payload as any).store,
            apartmentFit: (payload as any).apartmentFit,
          } as ProductTip
          : ({ ...base, type: "text" } as TextTip);

      tips.unshift(doc);
      return doc;
    },

    async update(id: Id, patch: object, actorId: Id): Promise<Tip> {
      const i = tips.findIndex(t => t.id === id);
      if (i < 0) throw new Error("Tip not found");

      const doc = tips[i];
      if (doc.ownerId !== actorId) throw new Error("Forbidden");

      // merge patch safely
      const updated: Tip = { ...doc, ...patch, updatedAt: now() };

      tips[i] = updated;
      return updated;
    },

    async remove(id, actorId) {
      const i = tips.findIndex(t => t.id === id);
      if (i < 0) return;
      if (tips[i].ownerId !== actorId) throw new Error("Forbidden");
      tips.splice(i, 1);
    },

    async toggleHelpful(id, actorId) {
      const set = tipHelpfulByUser.get(id) ?? new Set<Id>();
      if (set.has(actorId)) {
        set.delete(actorId);
        const t = tips.find(x => x.id === id)!;
        t.helpfulCount = Math.max(0, (t.helpfulCount ?? 0) - 1);
      } else {
        set.add(actorId);
        const t = tips.find(x => x.id === id)!;
        t.helpfulCount = (t.helpfulCount ?? 0) + 1;
      }
      tipHelpfulByUser.set(id, set);
      return { helpfulCount: tips.find(x => x.id === id)!.helpfulCount ?? 0 };
    },

    async report(id, actorId) {
      const set = tipReportsByUser.get(id) ?? new Set<Id>();
      if (!set.has(actorId)) {
        set.add(actorId);
        const t = tips.find(x => x.id === id)!;
        t.flagCount = (t.flagCount ?? 0) + 1;
        if ((t.flagCount ?? 0) >= HIDE_THRESHOLD) t.status = "hidden";
        tipReportsByUser.set(id, set);
      }
      const t = tips.find(x => x.id === id)!;
      return { flagCount: t.flagCount ?? 0, status: t.status };
    },
  };

  const infoRepo: InfoRepo = {
    async list(filter, pg) {
      let rows = info.slice();
      if (filter.category) rows = rows.filter(i => i.category === filter.category);
      if (filter.pinnedOnly) rows = rows.filter(i => i.pinned);
      if (filter.q) rows = rows.filter(i => textMatch(`${i.title} ${i.body}`, filter.q));
      rows.sort((a, b) => {
        // pinned first, then updatedAt/createdAt desc
        if ((b.pinned ? 1 : 0) !== (a.pinned ? 1 : 0)) return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
        const ab = new Date(b.updatedAt ?? b.createdAt).getTime();
        const aa = new Date(a.updatedAt ?? a.createdAt).getTime();
        return ab - aa;
      });
      return paginate(rows, pg);
    },

    async get(id) {
      return info.find(i => i.id === id) ?? null;
    },

    async create(payload, actorId) {
      const doc: InfoItem = {
        ...payload,
        id: randomUUID() as Id,
        ownerId: actorId,
        createdAt: now(),
      };
      info.unshift(doc);
      return doc;
    },

    async update(id, patch, actorId) {
      const i = info.findIndex(x => x.id === id);
      if (i < 0) throw new Error("Info not found");
      // assume only admins will call this in the UI; keep simple here
      info[i] = { ...info[i], ...patch, updatedAt: now() };
      return info[i];
    },

    async remove(id) {
      const i = info.findIndex(x => x.id === id);
      if (i < 0) return;
      info.splice(i, 1);
    },

    async pin(id) {
      const it = info.find(x => x.id === id);
      if (!it) throw new Error("Info not found");
      it.pinned = true;
      it.updatedAt = now();
      return it;
    },

    async unpin(id) {
      const it = info.find(x => x.id === id);
      if (!it) throw new Error("Info not found");
      it.pinned = false;
      it.updatedAt = now();
      return it;
    },
  };

  return { tips: tipsRepo, info: infoRepo };
}
