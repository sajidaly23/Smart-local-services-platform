"use client";

import React, { useState } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { MapPin, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Invalid credentials");
        toast.error(data.error || "Login failed");
        setIsLoading(false);
        return;
      }

      toast.success(`Welcome back, ${data.user.name}!`);

      // Route to role-specific dashboard
      if (data.user.role === "admin") {
        router.push("/dashboard/admin");
      } else if (data.user.role === "provider") {
        router.push("/dashboard/provider");
      } else {
        router.push("/dashboard/customer");
      }
    } catch (err: any) {
      setErrorMsg("An unexpected network error occurred");
      toast.error("Network error. Please try again.");
      setIsLoading(false);
    }
  };

  const handleQuickDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-tealbrand-500 shadow-md">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              Local<span className="text-brand-600">Connect</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {t("loginTitle")}
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">{t("loginSubtitle")}</p>
        </div>

        {/* Demo Credentials Helper Box for FYP Demonstrations */}
        <div className="rounded-xl border border-brand-200/80 bg-brand-50/60 p-4">
          <p className="text-xs font-bold text-brand-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-brand-600" />
            FYP Demo Quick Sign-In (1-Click Fill)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoFill("admin@localconnect.pk", "Admin@12345")}
              className="flex flex-col items-center justify-center rounded-lg border border-brand-200 bg-white p-2 text-center shadow-2xs hover:bg-brand-100/50 transition-colors"
            >
              <ShieldCheck className="h-4 w-4 text-brand-600 mb-0.5" />
              <span className="text-[11px] font-bold text-slate-800">Admin</span>
              <span className="text-[9px] text-slate-400">Full Access</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoFill("provider@localconnect.pk", "User@12345")}
              className="flex flex-col items-center justify-center rounded-lg border border-tealbrand-200 bg-white p-2 text-center shadow-2xs hover:bg-tealbrand-50 transition-colors"
            >
              <Wrench className="h-4 w-4 text-tealbrand-600 mb-0.5" />
              <span className="text-[11px] font-bold text-slate-800">Provider</span>
              <span className="text-[9px] text-slate-400">Verified Gilgit</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoFill("customer@localconnect.pk", "User@12345")}
              className="flex flex-col items-center justify-center rounded-lg border border-indigo-200 bg-white p-2 text-center shadow-2xs hover:bg-indigo-50 transition-colors"
            >
              <UserCheck className="h-4 w-4 text-indigo-600 mb-0.5" />
              <span className="text-[11px] font-bold text-slate-800">Customer</span>
              <span className="text-[9px] text-slate-400">Bookings Hub</span>
            </button>
          </div>
        </div>

        {/* Card Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          {errorMsg && (
            <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label={t("email")}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-slate-700">
                  {t("password")}
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              <span>{t("loginButton")}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            {t("dontHaveAccount")}{" "}
            <Link
              href="/register"
              className="font-semibold text-brand-600 hover:text-brand-700"
            >
              {t("registerButton")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

