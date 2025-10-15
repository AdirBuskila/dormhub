import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Mobile For You - מובייל פור יו",
  description: "הזמן מוצרים לחנות הסלולר שלך בקלות – מחירים מעולים, משלוח מהיר ושירות אמין ⚡ כל מה שאתה צריך במקום אחד לניהול חכם ופשוט של העסק שלך.",
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