"use client";

import React, { useState, useEffect } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { MapPin, User, Wrench, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const [role, setRole] = useState<"customer" | "provider">("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "provider") {
      setRole("provider");
    }
  }, [searchParams]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone, role }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Registration failed");
        toast.error(data.error || "Failed to create account");
        setIsLoading(false);
        return;
      }

      toast.success("Account created successfully!");

      if (role === "provider") {
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

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="w-full max-w-lg space-y-6">
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
            {t("registerTitle")}
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">{t("registerSubtitle")}</p>
        </div>

        {/* Card Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          {errorMsg && (
            <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                {t("role")}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("customer")}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3.5 transition-all text-center ${
                    role === "customer"
                      ? "border-brand-600 bg-brand-50 text-brand-900 shadow-xs ring-2 ring-brand-500/20"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <User className={`h-5 w-5 ${role === "customer" ? "text-brand-600" : "text-slate-400"}`} />
                  <span className="text-xs font-bold">Customer</span>
                  <span className="text-[10px] text-slate-500">Book services</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("provider")}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3.5 transition-all text-center ${
                    role === "provider"
                      ? "border-tealbrand-600 bg-tealbrand-50 text-tealbrand-900 shadow-xs ring-2 ring-tealbrand-500/20"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <Wrench className={`h-5 w-5 ${role === "provider" ? "text-tealbrand-600" : "text-slate-400"}`} />
                  <span className="text-xs font-bold">Service Provider</span>
                  <span className="text-[10px] text-slate-500">Offer trades/skills</span>
                </button>
              </div>
            </div>

            <Input
              label={t("name")}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ali Raza Khan"
            />

            <Input
              label={t("email")}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />

            <Input
              label={t("phone")}
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+92 344 1234567"
            />

            <Input
              label={t("password")}
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
            />

            {role === "provider" && (
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-tealbrand-600 shrink-0 mt-0.5" />
                <span>
                  Provider accounts undergo administrative verification before public services are shown. You can set up your profile and services right after signup.
                </span>
              </div>
            )}

            <Button
              type="submit"
              variant={role === "provider" ? "teal" : "primary"}
              className="w-full mt-2"
              isLoading={isLoading}
            >
              <span>{t("registerButton")}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            {t("alreadyHaveAccount")}{" "}
            <Link
              href="/login"
              className="font-semibold text-brand-600 hover:text-brand-700"
            >
              {t("loginButton")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

