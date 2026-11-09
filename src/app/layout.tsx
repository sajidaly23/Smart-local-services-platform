import "@/app/globals.css";
import React from "react";
import { getLocale } from "next-intl/server";

export const metadata = {
  title: "LocalConnect — Smart Local Community & Service Marketplace",
  description:
    "Smart local services platform connecting customers and verified trade professionals across Gilgit-Baltistan.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const isUrdu = locale === "ur";

  return (
    <html lang={locale} dir={isUrdu ? "rtl" : "ltr"} suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 selection:bg-brand-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
