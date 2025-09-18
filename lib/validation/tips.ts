import { z } from "zod";

/** ─────────────────────────────────────────────────────────────
 * Shared atoms
 * ────────────────────────────────────────────────────────────*/
export const TagSlug = z
  .string()
  .trim()
  .min(2, "Tag min 2")
  .max(20, "Tag max 20")
  .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, dashes only");

export const Tags = z.array(TagSlug).max(5, "Up to 5 tags");

export const ImageUrl = z
  .string()
  .url("Invalid URL")
  .refine(u => /^https?:\/\//i.test(u), "Must be http(s)");

export const Images = z.array(ImageUrl).max(5, "Up to 5 images");

/** Title & body */
export const Title = z.string().trim().min(4, "4–80 chars").max(80, "4–80 chars");
export const Body = z.string().trim().min(20, "20–1000 chars").max(1000, "20–1000 chars");

/** Optional enums you already use on tips */
export const TipStatus = z.enum(["active", "hidden", "archived"]).default("active");
export const TipType = z.enum(["text", "product"]);

/** ─────────────────────────────────────────────────────────────
 * Product-only fields
 * ────────────────────────────────────────────────────────────*/
export const ProductUrl = z
  .string()
  .trim()
  .url("Valid http(s) URL")
  .refine(u => /^https?:\/\//i.test(u), "Valid http(s) URL");

export const ApproxPriceIls = z.coerce
  .number()
  .min(0, "0–2000 ₪")
  .max(2000, "0–2000 ₪");

export const Store = z.string().trim().min(1, "1–60 chars").max(60, "1–60 chars");
export const ApartmentFit = z.string().trim().max(60, "Max 60 chars").optional();

/** ─────────────────────────────────────────────────────────────
 * Create Tip input (discriminated union on type)
 * ────────────────────────────────────────────────────────────*/
const BaseTip = z.object({
  type: TipType,
  title: Title,
  text: Body,
  tags: Tags,
  images: Images, // Appwrite preview URLs
});

const TextTipInput = BaseTip.extend({
  type: z.literal("text"),
});

const ProductTipInput = BaseTip.extend({
  type: z.literal("product"),
  productUrl: ProductUrl,
  approxPriceIls: ApproxPriceIls,
  store: Store,
  apartmentFit: ApartmentFit,
});

/** Exported schema for create payload */
export const CreateTipInput = z.discriminatedUnion("type", [TextTipInput, ProductTipInput]);

/** Types for TS inference */
export type CreateTipInput = z.infer<typeof CreateTipInput>;

/** ─────────────────────────────────────────────────────────────
 * Query/filter schema (server-side parsing of searchParams)
 * ────────────────────────────────────────────────────────────*/
export const ListTipsFilter = z.object({
  type: TipType.optional(),
  q: z.string().trim().min(1).max(80).optional(),
  sort: z.enum(["new", "top"]).default("new"),
  tag: TagSlug.optional(),
  hasImage: z.coerce.boolean().optional(),
  sinceDays: z.coerce.number().int().positive().optional(),
});
export type ListTipsFilter = z.infer<typeof ListTipsFilter>;

/** ─────────────────────────────────────────────────────────────
 * Update Tip input (all fields optional; server enforces shape)
 * ────────────────────────────────────────────────────────────*/
export const UpdateTipInput = z
  .object({
    // common
    title: Title.optional(),
    text: Body.optional(),
    tags: Tags.optional(),
    images: Images.optional(),
    // product-only; harmless if updating a text tip (ignored downstream)
    productUrl: ProductUrl.optional(),
    approxPriceIls: ApproxPriceIls.optional(),
    store: Store.optional(),
    apartmentFit: ApartmentFit.optional(),
    status: TipStatus.optional(),
  })
  .strict();
export type UpdateTipInput = z.infer<typeof UpdateTipInput>;