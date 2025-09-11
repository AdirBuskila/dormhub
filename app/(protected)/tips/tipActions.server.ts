"use server";

import { revalidatePath } from "next/cache";
import { auth0 } from "@/lib/auth0";
import { getRepos } from "@/lib/repos";

export async function toggleHelpfulAction(tipId: string) {
  const session = await auth0.getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const repos = await getRepos();
  await repos.tips.toggleHelpful(tipId, session.user.sub as string);
  revalidatePath("/tips");
}

export async function reportTipAction(tipId: string) {
  const session = await auth0.getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const repos = await getRepos();
  await repos.tips.report(tipId, session.user.sub as string);
  revalidatePath("/tips");
}
