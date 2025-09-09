// ─────────────────────────────────────────────────────────────────────────────
// Shared primitives & helpers
// ─────────────────────────────────────────────────────────────────────────────

export type Role = "student" | "moderator" | "admin";
export type Id = string;
export type ISODateTime = string;
export type UrlString = string;
export type ImageUrl = string;
export type MoneyILS = number;

/** Hidden = moderation; Archived = lifecycle (sold/past/stale). */
export type Status = "active" | "hidden" | "archived";

/** Simple list helpers you’ll reuse in repos. */
export interface Pagination { page: number; pageSize: number }
export interface Page<T> { items: T[]; total: number }

// ─────────────────────────────────────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────────────────────────────────────

/** Read-only identity (normalized from Auth0). */
export interface User {
  id: Id;
  email: string;
  name: string;
  avatarUrl?: string;      // may be absent depending on IdP
  createdAt: ISODateTime;
}

/** App-specific profile fields. */
export interface UserProfile {
  userId: Id;
  role: Role;
  dormId?: Id;
  phone?: string;
  languages?: string[];
  bio?: string;
  updatedAt: ISODateTime;
}

// ─────────────────────────────────────────────────────────────────────────────
// Marketplace
// ─────────────────────────────────────────────────────────────────────────────

export interface MarketplaceItem {
  id: Id;
  ownerId: Id;
  title: string;           // validate: 2–80 chars
  priceIls: number;        // validate: >= 0
  condition: "new" | "like-new" | "good" | "used";
  description?: string;    // validate: <= 800 chars
  images: ImageUrl[];      // validate: length <= 5, http(s)
  status: Status;
  createdAt: ISODateTime;
  updatedAt?: ISODateTime;
}

// ─────────────────────────────────────────────────────────────────────────────
// StudyBuddy
// ─────────────────────────────────────────────────────────────────────────────

export interface StudyPost {
  id: Id;
  ownerId: Id;
  course: string;          // free text for MVP
  availability: string;    // free text for MVP
  level?: "beginner" | "intermediate" | "advanced";
  notes?: string;          // short description of needs/offers
  status: Status;
  createdAt: ISODateTime;
  updatedAt?: ISODateTime;
}

// ─────────────────────────────────────────────────────────────────────────────
// RideShare
// ─────────────────────────────────────────────────────────────────────────────

export interface RideOffer {
  id: Id;
  ownerId: Id;
  from: string;            // short text
  to: string;              // short text
  departAt: ISODateTime;   // validate: future
  seats: number;           // validate: >= 1
  pricePerSeatIls: number; // validate: >= 0
  notes?: string;          // validate: <= 300 chars
  status: Status;
  createdAt: ISODateTime;
  updatedAt?: ISODateTime;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tips & Recommendations
// ─────────────────────────────────────────────────────────────────────────────

/** Stable keys for admin-curated info categories (store keys, label in UI). */
export type InfoCategory =
  | "laundry"
  | "internet"
  | "garbage"
  | "quietHours"
  | "security"
  | "maintenance"
  | "mail"
  | "parking"
  | "transport"
  | "campusOffice"
  | "other";

export interface InfoItem {
  id: Id;
  ownerId: Id;             // who created/last edited
  title: string;           // validate: 2–80 chars
  body: string;            // validate: <= 1000 chars
  links?: UrlString[];     // validate: http(s)
  pinned?: boolean;
  category: InfoCategory;
  createdAt: ISODateTime;
  updatedAt?: ISODateTime;
}

/** Shared fields for both tip variants. */
interface TipBase {
  id: Id;
  ownerId: Id;
  type: "text" | "product";
  title: string;           // validate: 2–80 chars
  text: string;            // validate: <= 600 chars
  tags?: string[];
  images?: ImageUrl[];     // validate: length <= 5, http(s)
  helpfulCount: number;    // server-managed
  flagCount: number;       // server-managed (moderation)
  status: Status;          // "hidden" when flagged past threshold
  createdAt: ISODateTime;
  updatedAt?: ISODateTime;
}

/** Plain advice tip (no product fields). */
export interface TextTip extends TipBase {
  type: "text";
}

/** Product recommendation tip (requires a URL; price optional). */
export interface ProductTip extends TipBase {
  type: "product";
  productUrl: UrlString;   // validate: http(s)
  approxPriceIls?: MoneyILS; // validate: >= 0
  store?: string;          // e.g., "IKEA"
  apartmentFit?: string;   // e.g., "Building C studio"
}

/** Discriminated union—use `type` to narrow safely. */
export type Tip = TextTip | ProductTip;
