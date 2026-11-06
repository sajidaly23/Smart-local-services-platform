"use client";

import React, { useState, useEffect } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { VerifiedBadge } from "@/components/common/VerifiedBadge";
import { RatingStars } from "@/components/common/RatingStars";
import { ArrowLeft, ShieldCheck, Mail, Phone, MapPin, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function AdminProviderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const providerId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [provider, setProvider] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!providerId) return;
    setLoading(true);

    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch(`/api/providers/${providerId}`).then((r) => r.json()),
    ])
      .then(([userData, pData]) => {
        if (userData.success) setUser(userData.user);
        if (pData.success) {
          setProvider(pData.provider);
          setServices(pData.services || []);
          setReviews(pData.reviews || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [providerId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner message="Loading provider credentials..." />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Provider not found.{" "}
        <Link href="/dashboard/admin/users" className="text-brand-600 underline">
          Return to user list
        </Link>
      </div>
    );
  }

  return (
    <DashboardLayout
      user={user || { id: "", name: "Admin", email: "", role: "admin" }}
      title={`Provider Audit: ${provider.user?.name}`}
      subtitle="Complete profile inspection and administrative verification status"
    >
      <div className="space-y-6 max-w-4xl">
        <Link
          href="/dashboard/admin/users"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Users Directory</span>
        </Link>

        {/* Header Profile Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-tealbrand-600 text-white font-black text-2xl shadow-xs">
              {provider.user?.name?.charAt(0) || "P"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900">{provider.user?.name}</h3>
                <VerifiedBadge status={provider.verificationStatus || "pending"} />
              </div>
              <p className="text-xs text-slate-500">{provider.professionalTitle}</p>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span>{provider.area || provider.city}, GB</span>
                <span>•</span>
                <RatingStars rating={provider.averageRating || 4.9} size="sm" />
              </div>
            </div>
          </div>

          <Link href="/dashboard/admin/verifications">
            <Button variant="outline" size="sm">
              <ShieldCheck className="h-4 w-4 mr-1.5 text-tealbrand-600" />
              <span>Inspect Documents</span>
            </Button>
          </Link>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Contact & Location
            </h4>
            <div className="space-y-2 text-xs text-slate-700">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <span>{provider.user?.email}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" />
                <span>{provider.user?.phone || "Not specified"}</span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span>Coverage: {(provider.serviceAreas || []).join(", ") || "City center"}</span>
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Bio & Trade Skills
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl">
              {provider.bio || "No bio registered."}
            </p>
            <div className="flex flex-wrap gap-1">
              {(provider.skills || []).map((s: string) => (
                <span
                  key={s}
                  className="rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 border border-brand-200/40"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-slate-900">
            Services Published by Provider ({services.length})
          </h4>
          <div className="divide-y divide-slate-100">
            {services.map((s) => (
              <div key={s._id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{s.title}</p>
                  <p className="text-[11px] text-slate-400">{s.area || s.city} • PKR {s.price?.toLocaleString()}</p>
                </div>
                <Badge variant={s.isActive ? "success" : "neutral"} size="sm">
                  {s.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

