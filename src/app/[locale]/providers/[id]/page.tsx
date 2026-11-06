"use client";

import React, { useState, useEffect } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import {
  MapPin,
  Star,
  ShieldCheck,
  CheckCircle2,
  Briefcase,
  Calendar,
  MessageSquare,
  Award,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/common/RatingStars";
import { VerifiedBadge } from "@/components/common/VerifiedBadge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/components/ui/toast";

export default function ProviderProfilePage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const providerId = params.id as string;

  const [provider, setProvider] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!providerId) return;
    setLoading(true);

    fetch(`/api/providers/${providerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProvider(data.provider);
          setServices(data.services || []);
          setReviews(data.reviews || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [providerId]);

  const handleStartChat = async () => {
    const targetUserId = provider?.user?._id || provider?.user;
    if (!targetUserId) return;

    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: targetUserId,
          initialMessage: `Hello ${provider?.user?.name || "there"}, I found your profile on LocalConnect.`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (res.status === 401) {
          toast.error("Please sign in to message this provider");
          router.push(`/login?callbackUrl=/providers/${providerId}`);
          return;
        }
        toast.error(data.error || "Could not open chat");
        return;
      }

      router.push("/dashboard/customer/messages");
    } catch (err) {
      toast.error("Network error opening conversation");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <LoadingSpinner message="Loading provider credentials..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-xl font-bold text-slate-800">Provider Not Found</h2>
          <p className="text-sm text-slate-500 mt-1 mb-4">
            The profile you are looking for does not exist.
          </p>
          <Link href="/services">
            <Button variant="primary">Browse All Services</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Provider Profile Header Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-700 text-white font-black text-3xl shadow-md shrink-0">
                {provider.user?.name?.charAt(0) || "P"}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {provider.user?.name}
                  </h1>
                  <VerifiedBadge status={provider.verificationStatus || "verified"} />
                </div>

                <p className="text-sm font-semibold text-slate-600">
                  {provider.professionalTitle || "Service Specialist"}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-tealbrand-600" />
                    <span>{provider.area || provider.city}, Gilgit-Baltistan</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="h-3.5 w-3.5 text-brand-600" />
                    <span>{provider.experienceYears || 5} Years Experience</span>
                  </div>
                  <RatingStars
                    rating={provider.averageRating || 4.9}
                    totalReviews={provider.totalReviews || reviews.length}
                    size="sm"
                  />
                </div>
              </div>
            </div>

            <Button
              variant="teal"
              size="md"
              className="w-full sm:w-auto"
              onClick={handleStartChat}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              <span>Message Provider</span>
            </Button>
          </div>

          {/* Bio & Skills */}
          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Professional Bio
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {provider.bio || "Registered trade specialist on LocalConnect."}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Skills & Capabilities
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(provider.skills || ["Certified Specialist", "Quality Execution"]).map(
                  (sk: string) => (
                    <span
                      key={sk}
                      className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 border border-brand-200/50"
                    >
                      {sk}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Services Offered by this Provider */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Services by {provider.user?.name} ({services.length})
          </h2>

          {services.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
              This provider has no active public services at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((svc: any) => (
                <div
                  key={svc._id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-brand-500 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="font-semibold text-tealbrand-700 bg-tealbrand-50 px-2 py-0.5 rounded">
                        {svc.category?.name || "Trade"}
                      </span>
                      <strong className="text-sm font-bold text-slate-900">
                        PKR {svc.price.toLocaleString()}
                      </strong>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-2">
                      {svc.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {svc.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {svc.area || svc.city}
                    </span>
                    <Link href={`/services/${svc._id}`}>
                      <Button variant="primary" size="sm">
                        <span>Book Service</span>
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Customer Reviews ({reviews.length})
          </h2>

          {reviews.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
              No customer reviews yet. Reviews are verified following completed bookings.
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev: any) => (
                <div
                  key={rev._id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                        {rev.customer?.name?.charAt(0) || "C"}
                      </div>
                      <span className="text-xs font-bold text-slate-800">
                        {rev.customer?.name}
                      </span>
                    </div>
                    <RatingStars rating={rev.rating} size="sm" />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-9">
                    {rev.comment}
                  </p>
                  <p className="text-[10px] text-slate-400 pl-9">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

