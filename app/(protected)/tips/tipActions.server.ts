"use server";

import { revalidatePath } from "next/cache";
import { auth0 } from "@/lib/auth0";
import { getRepos } from "@/lib/repos";
import { CreateTipInput, UpdateTipInput } from "@/lib/validation/tips";

type CreateTipResult =
  | { ok: true }
  | { ok: false; error: string; details?: Record<string, string[]>; form?: string[] };

export async function createTipAction(raw: unknown): Promise<CreateTipResult> {
  const session = await auth0.getSession();
  if (!session?.user) return { ok: false, error: "Unauthorized" };

  const result = CreateTipInput.safeParse(raw);
  if (!result.success) {
    const { fieldErrors, formErrors } = result.error.flatten();
    return { ok: false, error: "Validation failed", details: fieldErrors, form: formErrors };
  }

  const data = result.data; // ← fully typed & validated
  const repos = await getRepos();
  await repos.tips.create(data as any, session.user.sub as string);

  revalidatePath("/tips");
  return { ok: true };
}

type UpdateTipResult = { ok: true } | { ok: false; error: string; details?: Record<string, string[]> };

export async function updateTipAction(id: string, raw: unknown): Promise<UpdateTipResult> {
  const session = await auth0.getSession();
  if (!session?.user) return { ok: false, error: "Unauthorized" };

  const result = UpdateTipInput.safeParse(raw);
  if (!result.success) {
    const { fieldErrors } = result.error.flatten();
    return { ok: false, error: "Validation failed", details: fieldErrors };
  }

  const repos = await getRepos();
  await repos.tips.update(id, result.data as any, session.user.sub as string);
  revalidatePath("/tips");
  return { ok: true };
}

export async function deleteTipAction(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth0.getSession();
  if (!session?.user) return { ok: false, error: "Unauthorized" };
  const repos = await getRepos();
  await repos.tips.remove(id, session.user.sub as string);
  revalidatePath("/tips");
  return { ok: true };
}

export async function toggleHelpfulAction(id: string) {
  const session = await auth0.getSession();
  if (!session?.user) throw new Error("Unauthorized");
  const repos = await getRepos();
  const res = await repos.tips.toggleHelpful(id, session.user.sub as string);
  revalidatePath("/tips");
  return res;
}

export async function reportTipAction(id: string) {
  const session = await auth0.getSession();
  if (!session?.user) throw new Error("Unauthorized");
  const repos = await getRepos();
  const res = await repos.tips.report(id, session.user.sub as string);
  revalidatePath("/tips");
  return res;
}
