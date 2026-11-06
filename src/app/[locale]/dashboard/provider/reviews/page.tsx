"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RatingStars } from "@/components/common/RatingStars";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Star, Award } from "lucide-react";

export default function ProviderReviewsPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((userData) => {
        if (userData.success) {
          setUser(userData.user);
          // Fetch provider profile & reviews
          fetch(`/api/providers/${userData.user.id}`)
            .then((r) => r.json())
            .then((pData) => {
              if (pData.success) {
                setProfile(pData.provider);
                setReviews(pData.reviews || []);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout
      user={user || { id: "", name: "Provider", email: "", role: "provider" }}
      title="Client Reviews & Trust Rating"
      subtitle="Public feedback left by verified clients after completed bookings"
    >
      <div className="space-y-6 max-w-4xl">
        {/* Rating Metrics Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 font-black text-2xl border border-amber-200/60">
              {profile?.averageRating?.toFixed(1) || "5.0"}
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Overall Provider Rating
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <RatingStars rating={profile?.averageRating || 5.0} size="md" />
                <span className="text-xs text-slate-500 font-bold">
                  ({profile?.totalReviews || reviews.length} verified reviews)
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 max-w-sm">
            <p className="flex items-center gap-1.5 font-bold text-slate-800 mb-0.5">
              <Award className="h-4 w-4 text-brand-600" />
              Verified Community Feedback
            </p>
            <p>
              Only customers with verified completed bookings are permitted to submit reviews.
            </p>
          </div>
        </div>

        {/* Reviews List */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
            Customer Reviews ({reviews.length})
          </h3>

          {loading ? (
            <LoadingSpinner message="Loading client feedback..." />
          ) : reviews.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
              <Star className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <span>No customer reviews yet. Once you complete your first booking, clients will be invited to leave feedback.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div
                  key={r._id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 font-bold text-xs text-slate-700">
                        {r.customer?.name?.charAt(0) || "C"}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          {r.customer?.name}
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          Verified Completed Booking
                        </p>
                      </div>
                    </div>
                    <RatingStars rating={r.rating} size="sm" />
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    &quot;{r.comment}&quot;
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

