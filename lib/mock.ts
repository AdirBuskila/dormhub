// lib/mock.ts
import { randomUUID } from "crypto";
import type { Repos, TipsRepo, InfoRepo, TipFilter, InfoFilter } from "./repos";
import type { Tip, TextTip, ProductTip, InfoItem, Id, Pagination, Page, ISODateTime, Status, InfoCategory } from "./types";

// -------------------------
// Seed data
// -------------------------

const now = () => new Date().toISOString() as ISODateTime;
const daysAgo = (d: number) => {
  const dt = new Date();
  dt.setDate(dt.getDate() - d);
  return dt.toISOString() as ISODateTime;
};
const hoursAgo = (h: number) => {
  const dt = new Date();
  dt.setHours(dt.getHours() - h);
  return dt.toISOString() as ISODateTime;
};

const seedTips: Tip[] = [
  // TEXT — Internet/WiFi
  {
    id: randomUUID(),
    ownerId: "user_alex" as Id,
    type: "text",
    title: "Router placement that actually works",
    text: "Put the router near the hallway, not inside the bedroom closet. Signal is way better for both rooms.",
    tags: ["internet", "wifi"],
    images: [],
    helpfulCount: 4,
    flagCount: 0,
    status: "active",
    createdAt: daysAgo(9),
  } as TextTip,

  // PRODUCT — Curtains
  {
    id: randomUUID(),
    ownerId: "user_maya" as Id,
    type: "product",
    title: "Blackout curtain that fits Dorm C windows",
    text: "Blocks ~90% light. Needed 2 units for full width; length 220cm fits well.",
    tags: ["sleep", "curtains"],
    images: ["https://placehold.co/240x240?text=Curtains"],
    helpfulCount: 9,
    flagCount: 0,
    status: "active",
    productUrl: "https://example.com/blackout-curtain",
    approxPriceIls: 65,
    store: "AliExpress",
    apartmentFit: "Dorm C studio",
    createdAt: daysAgo(7),
  } as ProductTip,

  // TEXT — Laundry
  {
    id: randomUUID(),
    ownerId: "user_noa" as Id,
    type: "text",
    title: "Laundry tip: mornings are empty",
    text: "Machines are free 07:00–08:30 most weekdays. Bring your own detergent—campus one is pricey.",
    tags: ["laundry", "money"],
    images: [],
    helpfulCount: 6,
    flagCount: 0,
    status: "active",
    createdAt: daysAgo(6),
  } as TextTip,

  // PRODUCT — Shower caddy
  {
    id: randomUUID(),
    ownerId: "user_omer" as Id,
    type: "product",
    title: "Over-the-door shower caddy (doesn’t rust)",
    text: "Fits the dorm bathroom doors; no drilling needed.",
    tags: ["bathroom", "organize"],
    images: ["https://placehold.co/240x240?text=Caddy"],
    helpfulCount: 3,
    flagCount: 0,
    status: "active",
    productUrl: "https://example.com/shower-caddy",
    approxPriceIls: 49,
    store: "IKEA",
    apartmentFit: "Dorm A/B bathrooms",
    createdAt: daysAgo(5),
  } as ProductTip,

  // TEXT — Noise/Quiet hours
  {
    id: randomUUID(),
    ownerId: "user_yuval" as Id,
    type: "text",
    title: "Quietest study spots nearby",
    text: "Library 3rd floor (back corner) and the lounge of Dorm B after 21:00 are usually empty.",
    tags: ["study", "quiet"],
    images: [],
    helpfulCount: 5,
    flagCount: 0,
    status: "active",
    createdAt: daysAgo(4),
  } as TextTip,

  // PRODUCT — Power strip with long cord
  {
    id: randomUUID(),
    ownerId: "user_lior" as Id,
    type: "product",
    title: "5-socket power strip, 3m cable",
    text: "Outlets are awkward in Dorm A; this length reaches the desk easily.",
    tags: ["electronics", "desk"],
    images: ["https://placehold.co/240x240?text=Power+Strip"],
    helpfulCount: 2,
    flagCount: 0,
    status: "active",
    productUrl: "https://example.com/power-strip-3m",
    approxPriceIls: 35,
    store: "Local Hardware",
    apartmentFit: "Dorm A",
    createdAt: daysAgo(3),
  } as ProductTip,

  // TEXT — Kitchen
  {
    id: randomUUID(),
    ownerId: "user_dan" as Id,
    type: "text",
    title: "Shared kitchen etiquette that works",
    text: "Write your room number on containers. Friday noon is a good time to clean fridge—less crowded.",
    tags: ["kitchen", "community"],
    images: [],
    helpfulCount: 1,
    flagCount: 0,
    status: "active",
    createdAt: hoursAgo(26),
  } as TextTip,

  // PRODUCT — Door draft stopper
  {
    id: randomUUID(),
    ownerId: "user_rina" as Id,
    type: "product",
    title: "Draft stopper for hallway door",
    text: "Cuts hallway noise and cold air. Self-adhesive, easy install.",
    tags: ["noise", "comfort"],
    images: ["https://placehold.co/240x240?text=Draft+Stopper"],
    helpfulCount: 8,
    flagCount: 0,
    status: "active",
    productUrl: "https://example.com/draft-stopper",
    approxPriceIls: 28,
    store: "Amazon",
    apartmentFit: "Dorm C",
    createdAt: hoursAgo(20),
  } as ProductTip,

  // TEXT — Transport
  {
    id: randomUUID(),
    ownerId: "user_ilan" as Id,
    type: "text",
    title: "Bus tip to campus gate",
    text: "Bus 12 is faster before 8am; after that take 7A—less crowded and similar time.",
    tags: ["transport", "time"],
    images: [],
    helpfulCount: 0,
    flagCount: 0,
    status: "active",
    createdAt: hoursAgo(8),
  } as TextTip,

  // PRODUCT — Under-bed storage
  {
    id: randomUUID(),
    ownerId: "user_tal" as Id,
    type: "product",
    title: "Under-bed rolling storage (fits frame height)",
    text: "Two bins fit under the standard dorm bed; check height 18cm.",
    tags: ["storage", "organize"],
    images: ["https://placehold.co/240x240?text=Storage+Bin"],
    helpfulCount: 11,
    flagCount: 0,
    status: "active",
    productUrl: "https://example.com/underbed-storage",
    approxPriceIls: 79,
    store: "IKEA",
    apartmentFit: "Dorm A/B/C",
    createdAt: hoursAgo(3),
  } as ProductTip,

  // TEXT — Example of HIDDEN (moderation)
  {
    id: randomUUID(),
    ownerId: "user_hidden" as Id,
    type: "text",
    title: "Poster removal policy",
    text: "Posters are okay on cork strips only; tape on paint will be charged.",
    tags: ["maintenance", "rules"],
    images: [],
    helpfulCount: 0,
    flagCount: 3,
    status: "hidden",
    createdAt: daysAgo(2),
  } as TextTip,

  // TEXT — Example of ARCHIVED (older tip)
  {
    id: randomUUID(),
    ownerId: "user_old" as Id,
    type: "text",
    title: "Old exam bank link",
    text: "Moved to the new site last semester. Keeping this archived as reference.",
    tags: ["study", "link"],
    images: [],
    helpfulCount: 2,
    flagCount: 0,
    status: "archived",
    createdAt: daysAgo(120),
  } as TextTip,
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
