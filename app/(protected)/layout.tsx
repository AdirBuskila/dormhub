import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import Auth0ProviderWrapper from "../components/Auth0Provider";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const session = await auth0.getSession();   // server-side auth check
  if (!session?.user) redirect("/auth/login?returnTo=/tips");

  return <Auth0ProviderWrapper>{children}</Auth0ProviderWrapper>;
}
