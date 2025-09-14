"use server";

import { revalidatePath } from "next/cache";
import { auth0 } from "@/lib/auth0";
import { getRepos } from "@/lib/repos";
import { CreateTipInput } from "@/lib/validation/tips";

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

  // await repos.tips.create(data, session.user.sub as string);

  revalidatePath("/tips");
  return { ok: true };
}
