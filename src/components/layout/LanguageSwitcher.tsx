"use client";

import React from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Globe } from "lucide-react";

export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className }) => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageToggle = (newLocale: "en" | "ur") => {
    if (newLocale === locale) return;
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className={`inline-flex items-center rounded-lg border border-slate-200 bg-white p-1 text-xs font-medium shadow-2xs ${className || ""}`}>
      <Globe className="h-3.5 w-3.5 text-slate-400 mx-1.5" />
      <button
        type="button"
        onClick={() => handleLanguageToggle("en")}
        className={`rounded px-2 py-1 transition-all ${
          locale === "en"
            ? "bg-brand-600 text-white font-semibold shadow-2xs"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => handleLanguageToggle("ur")}
        className={`rounded px-2 py-1 font-urdu transition-all ${
          locale === "ur"
            ? "bg-brand-600 text-white font-semibold shadow-2xs"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        اردو
      </button>
    </div>
  );
};

