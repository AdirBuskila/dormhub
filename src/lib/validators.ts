// DormHub API Validators
// Zod schemas for validating API payloads

import { z } from 'zod';

// ============================================================================
// LISTING VALIDATORS
// ============================================================================

export const listingTypeSchema = z.enum(['sell', 'buy', 'swap', 'giveaway']);
export const listingConditionSchema = z.enum(['new', 'like_new', 'good', 'fair', 'poor']);
export const listingStatusSchema = z.enum(['active', 'reserved', 'sold', 'removed']);

export const createListingSchema = z.object({
  type: listingTypeSchema,
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(120, 'Title must be less than 120 characters')
    .trim(),
  description: z.string()
    .max(5000, 'Description must be less than 5000 characters')
    .trim()
    .optional(),
  price_ils: z.number()
    .positive('Price must be positive')
    .max(1_000_000, 'Price must be less than 1,000,000')
    .optional()
    .nullable(),
  condition: listingConditionSchema.optional().nullable(),
  category: z.string()
    .max(80, 'Category must be less than 80 characters')
    .trim()
    .optional()
    .nullable(),
  tags: z.array(
    z.string()
      .min(1, 'Tag cannot be empty')
      .max(24, 'Tag must be less than 24 characters')
      .trim()
  )
    .max(8, 'Maximum 8 tags allowed')
    .optional()
    .default([]),
  images: z.array(z.string().url('Must be a valid URL'))
    .max(10, 'Maximum 10 images allowed')
    .optional()
    .default([]),
  location: z.string()
    .max(200, 'Location must be less than 200 characters')
    .trim()
    .optional()
    .nullable(),
});

export const updateListingSchema = createListingSchema
  .partial()
  .extend({
    status: listingStatusSchema.optional(),
  });

export const listingFiltersSchema = z.object({
  type: listingTypeSchema.optional(),
  status: listingStatusSchema.optional(),
  category: z.string().optional(),
  min_price: z.number().positive().optional(),
  max_price: z.number().positive().optional(),
  condition: listingConditionSchema.optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().trim().optional(),
  owner_id: z.string().uuid().optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
});

// ============================================================================
// TIP VALIDATORS
// ============================================================================

export const tipStatusSchema = z.enum(['pending', 'approved', 'rejected']);

export const submitTipSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(120, 'Title must be less than 120 characters')
    .trim(),
  body: z.string()
    .min(20, 'Tip body must be at least 20 characters')
    .max(5000, 'Tip body must be less than 5000 characters')
    .trim(),
  tags: z.array(
    z.string()
      .min(1, 'Tag cannot be empty')
      .max(24, 'Tag must be less than 24 characters')
      .trim()
  )
    .max(8, 'Maximum 8 tags allowed')
    .optional()
    .default([]),
});

export const updateTipSchema = submitTipSchema.partial();

export const approveTipSchema = z.object({
  status: z.enum(['approved', 'rejected']),
});

export const tipFiltersSchema = z.object({
  status: tipStatusSchema.optional(),
  tags: z.array(z.string()).optional(),
  author_id: z.string().uuid().optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
});

// ============================================================================
// PROFILE VALIDATORS
// ============================================================================

export const updateProfileSchema = z.object({
  full_name: z.string()
    .max(100, 'Name must be less than 100 characters')
    .trim()
    .optional()
    .nullable(),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores')
    .trim()
    .optional()
    .nullable(),
  room: z.string()
    .max(20, 'Room must be less than 20 characters')
    .trim()
    .optional()
    .nullable(),
  phone: z.string()
    .regex(/^[+\d\s()-]+$/, 'Invalid phone number format')
    .max(20, 'Phone must be less than 20 characters')
    .trim()
    .optional()
    .nullable(),
  avatar_url: z.string()
    .url('Must be a valid URL')
    .optional()
    .nullable(),
});

// ============================================================================
// SEARCH VALIDATORS
// ============================================================================

export const searchQuerySchema = z.object({
  query: z.string()
    .min(1, 'Search query cannot be empty')
    .max(200, 'Search query must be less than 200 characters')
    .trim(),
  limit: z.number().int().positive().max(50).default(20),
});

// ============================================================================
// FAVORITE VALIDATORS
// ============================================================================

export const toggleFavoriteSchema = z.object({
  listing_id: z.string().uuid('Invalid listing ID'),
});

// ============================================================================
// INFO PAGE VALIDATORS (Admin)
// ============================================================================

export const createInfoPageSchema = z.object({
  slug: z.string()
    .min(1, 'Slug cannot be empty')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .trim(),
  title: z.string()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  body_md: z.string()
    .min(10, 'Content must be at least 10 characters')
    .max(50000, 'Content must be less than 50000 characters'),
  published: z.boolean().default(false),
});

export const updateInfoPageSchema = createInfoPageSchema.partial();

// ============================================================================
// HELPER TYPES (inferred from schemas)
// ============================================================================

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type ListingFiltersInput = z.infer<typeof listingFiltersSchema>;

export type SubmitTipInput = z.infer<typeof submitTipSchema>;
export type UpdateTipInput = z.infer<typeof updateTipSchema>;
export type ApproveTipInput = z.infer<typeof approveTipSchema>;
export type TipFiltersInput = z.infer<typeof tipFiltersSchema>;

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
export type ToggleFavoriteInput = z.infer<typeof toggleFavoriteSchema>;

export type CreateInfoPageInput = z.infer<typeof createInfoPageSchema>;
export type UpdateInfoPageInput = z.infer<typeof updateInfoPageSchema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    throw new Error(`Validation failed: ${errors}`);
  }
  return result.data;
}

export function validateAsync<T>(schema: z.ZodSchema<T>, data: unknown): Promise<T> {
  return schema.parseAsync(data);
}

