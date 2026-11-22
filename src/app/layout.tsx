import "@/app/globals.css";
import React from "react";

export const metadata = {
  title: "LocalConnect — Smart Local Community & Service Marketplace",
  description:
    "Smart local services platform connecting customers and verified trade professionals across Gilgit-Baltistan.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // lang/dir is handled by [locale]/layout.tsx via NextIntlClientProvider
  // Root layout just provides the HTML shell required by Next.js 15
  return (
    <html suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 selection:bg-brand-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
