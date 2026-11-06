"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { User, ShieldCheck } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function CustomerProfilePage() {
  const toast = useToast();
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
          setName(data.user.name || "");
          setPhone(data.user.phone || "");
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });

      const data = await res.json();
      setIsSaving(false);

      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to update profile");
        return;
      }

      toast.success("Profile updated successfully");
      setUser((prev: any) => ({ ...prev, name, phone }));
    } catch (err) {
      setIsSaving(false);
      toast.error("Network error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner message="Loading profile..." />
      </div>
    );
  }

  return (
    <DashboardLayout
      user={user || { id: "", name: "Customer", email: "", role: "customer" }}
      title="My Profile & Settings"
      subtitle="Manage your personal contact info and security settings"
    >
      <div className="max-w-2xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-5 mb-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-700 text-white font-black text-xl shadow-xs">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{user?.name}</h3>
              <p className="text-xs text-slate-500 capitalize">{user?.role} Account</p>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Verified Community Member</span>
              </span>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Full Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address (Permanent Identifier)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ""}
                className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs text-slate-500 cursor-not-allowed"
              />
            </div>

            <Input
              label="Contact Phone Number"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <div className="pt-2">
              <Button type="submit" variant="primary" isLoading={isSaving}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

