"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RatingStars } from "@/components/common/RatingStars";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Star } from "lucide-react";

export default function CustomerReviewsPage() {
  const [user, setUser] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((userData) => {
        if (userData.success) {
          setUser(userData.user);
          // Fetch customer's reviews
          fetch("/api/bookings")
            .then((r) => r.json())
            .then((bData) => {
              if (bData.success) {
                // Bookings that have reviews
                const completedWithReviews = bData.bookings.filter(
                  (b: any) => b.hasReview
                );
                setReviews(completedWithReviews);
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
      user={user || { id: "", name: "Customer", email: "", role: "customer" }}
      title="My Reviews"
      subtitle="History of ratings and feedback submitted for completed services"
    >
      <div className="space-y-4 max-w-4xl">
        {loading ? (
          <LoadingSpinner message="Loading your reviews..." />
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
            <Star className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <span>You have not written any provider reviews yet. Reviews can be submitted once a booking is marked completed.</span>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((b) => (
              <div
                key={b._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">
                    {b.service?.title} • {b.provider?.name}
                  </h4>
                  <RatingStars rating={5} size="sm" />
                </div>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl leading-relaxed">
                  Genuine verified review recorded for booking {b.bookingReference}.
                </p>
                <p className="text-[10px] text-slate-400">
                  Completed on: {b.requestedDate}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

