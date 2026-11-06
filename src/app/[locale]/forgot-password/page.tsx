"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/routing";
import { MapPin, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [demoToken, setDemoToken] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setIsLoading(false);
      setSubmitted(true);
      if (data.demoResetToken) {
        setDemoToken(data.demoResetToken);
      }
      toast.success("Instructions generated!");
    } catch (err) {
      setIsLoading(false);
      toast.error("Failed to process request");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="w-full max-w-md space-y-6">
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
            Forgot Password
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Enter your account email to receive reset instructions
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
                <span>Send Reset Link</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">Check Your Email</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                If an account exists with <strong className="text-slate-800">{email}</strong>, you will receive password reset instructions.
              </p>

              {demoToken && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-left">
                  <p className="text-xs font-bold text-amber-900 mb-1">
                    Demo Token (FYP Showcase Simulation):
                  </p>
                  <p className="text-[11px] font-mono break-all text-amber-800 bg-white p-2 rounded border border-amber-200">
                    {demoToken}
                  </p>
                  <Link
                    href={`/reset-password?token=${demoToken}`}
                    className="inline-block mt-2 text-xs font-semibold text-brand-600 underline"
                  >
                    Click to proceed directly to Reset Password &rarr;
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 text-center text-xs text-slate-500">
            Remember your password?{" "}
            <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

