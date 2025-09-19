import { z } from "zod";

export const UserUpsertInput = z.object({
  id: z.string().min(3),          // auth0 sub (e.g., google-oauth2|...)
  email: z.string().email(),
  name: z.string().min(1).max(100),
  avatarUrl: z.string().url().optional(),
});
export type UserUpsertInput = z.infer<typeof UserUpsertInput>;


