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
    <>
      {/* Set lang and dir on the html element via script to avoid hydration mismatch */}
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang="${locale}";document.documentElement.dir="${isUrdu ? "rtl" : "ltr"}";`,
        }}
      />
      <NextIntlClientProvider messages={messages} locale={locale}>
        <ToastProvider>{children}</ToastProvider>
      </NextIntlClientProvider>
    </>
  );
}
