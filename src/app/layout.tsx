import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Mobile For You - מובייל פור יו",
  description: "Complete business management system for mobile device distribution company",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // This layout is only for the root redirect
  return <>{children}</>;
}