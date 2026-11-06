"use client";

import React, { useState, useEffect } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Star,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { RatingStars } from "@/components/common/RatingStars";
import { useToast } from "@/components/ui/toast";

export default function CustomerBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const bookingId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [booking, setBooking] = useState<any>(null);
  const [review, setReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) return;
    setLoading(true);

    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch(`/api/bookings/${bookingId}`).then((r) => r.json()),
    ])
      .then(([userData, bookingData]) => {
        if (userData.success) setUser(userData.user);
        if (bookingData.success) {
          setBooking(bookingData.booking);
          setReview(bookingData.review);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handleStartChat = async () => {
    if (!booking?.provider?._id) return;
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: booking.provider._id,
          bookingId: booking._id,
          initialMessage: `Hello, inquiring regarding booking ${booking.bookingReference}.`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/dashboard/customer/messages");
      }
    } catch (err) {
      toast.error("Could not open chat");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner message="Loading booking details..." />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Booking not found.{" "}
        <Link href="/dashboard/customer/bookings" className="text-brand-600 underline">
          Return to bookings
        </Link>
      </div>
    );
  }

  return (
    <DashboardLayout
      user={user || { id: "", name: "Customer", email: "", role: "customer" }}
      title={`Booking ${booking.bookingReference}`}
      subtitle="Complete appointment details and provider coordination"
    >
      <div className="space-y-6 max-w-4xl">
        <Link
          href="/dashboard/customer/bookings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Bookings</span>
        </Link>

        {/* Status Banner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Current Booking Status
            </span>
            <div className="flex items-center gap-2.5 mt-1">
              <span className="text-xl font-extrabold text-slate-900 capitalize">
                {booking.status.replace("_", " ")}
              </span>
            </div>
            {booking.cancellationReason && (
              <p className="text-xs text-rose-600 mt-1">
                Reason: {booking.cancellationReason}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleStartChat}>
              <MessageSquare className="h-4 w-4 mr-1.5 text-tealbrand-600" />
              <span>Chat with Provider</span>
            </Button>
            <Link
              href={`/dashboard/customer/complaints?bookingId=${booking._id}&providerId=${booking.provider?._id}`}
            >
              <Button variant="ghost" size="sm" className="text-slate-500 hover:text-rose-600">
                <span>File Issue / Complaint</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Service & Work Info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              Service Information
            </h3>

            <div>
              <p className="text-xs text-slate-400">Requested Service</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {booking.service?.title}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Agreed Price</p>
              <p className="text-lg font-extrabold text-brand-600 mt-0.5">
                PKR {booking.price?.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Scheduled Date & Time Slot</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                {booking.requestedDate} • {booking.requestedTime}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Your Instructions & Notes</p>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {booking.description}
              </p>
            </div>
          </div>

          {/* Provider & Address Info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              Provider & Destination
            </h3>

            <div>
              <p className="text-xs text-slate-400">Assigned Provider</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-tealbrand-100 text-tealbrand-800 font-bold text-xs">
                  {booking.provider?.name?.charAt(0) || "P"}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {booking.provider?.name}
                  </p>
                  <p className="text-xs text-slate-500">{booking.provider?.email}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-400">Provider Phone</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-slate-400" />
                <span>{booking.provider?.phone || "Available in chat"}</span>
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Service Destination Address</p>
              <p className="text-xs text-slate-800 mt-0.5 flex items-start gap-1.5">
                <MapPin className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
                <span>{booking.serviceAddress}</span>
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Contact Phone Provided</p>
              <p className="text-xs font-semibold text-slate-800 mt-0.5">
                {booking.contactPhone}
              </p>
            </div>
          </div>
        </div>

        {/* Existing Review Display if reviewed */}
        {review && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Your Review for this Job
            </h3>
            <div className="flex items-center gap-2">
              <RatingStars rating={review.rating} size="sm" />
              <span className="text-xs text-slate-400">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl">
              &quot;{review.comment}&quot;
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

