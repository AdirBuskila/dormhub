import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "DormHub - Your Dorm Community Platform",
  description: "Buy, sell, swap items and share tips with fellow dorm residents. The ultimate platform for student housing communities.",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // This layout is only for the root redirect
  return <>{children}</>;
}