import React from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ToastProvider } from "@/components/ui/toast";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "ur")) {
    notFound();
  }

  const messages = await getMessages();
  const isUrdu = locale === "ur";

  return (
    <html lang={locale} dir={isUrdu ? "rtl" : "ltr"}>
      <body className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 selection:bg-brand-500 selection:text-white">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ToastProvider>{children}</ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

