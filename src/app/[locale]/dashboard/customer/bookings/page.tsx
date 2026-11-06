"use client";

import React, { useState, useEffect } from "react";
import { Link, useRouter } from "@/i18n/routing";
import {
  Calendar,
  MessageSquare,
  Star,
  XCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { RatingStars } from "@/components/common/RatingStars";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { useToast } from "@/components/ui/toast";

export default function CustomerBookingsPage() {
  const router = useRouter();
  const toast = useToast();

  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  // Review Modal State
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [activeBookingForReview, setActiveBookingForReview] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Cancel Confirmation Modal State
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [activeBookingForCancel, setActiveBookingForCancel] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchBookings = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/bookings").then((r) => r.json()),
    ])
      .then(([userData, bookingData]) => {
        if (userData.success) setUser(userData.user);
        if (bookingData.success) setBookings(bookingData.bookings);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async () => {
    if (!activeBookingForCancel) return;
    setIsCancelling(true);

    try {
      const res = await fetch(`/api/bookings/${activeBookingForCancel._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled", reason: cancelReason }),
      });

      const data = await res.json();
      setIsCancelling(false);

      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to cancel booking");
        return;
      }

      toast.success("Booking cancelled successfully");
      setIsCancelOpen(false);
      setActiveBookingForCancel(null);
      setCancelReason("");
      fetchBookings();
    } catch (err) {
      setIsCancelling(false);
      toast.error("Network error cancelling booking");
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBookingForReview) return;
    setIsSubmittingReview(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: activeBookingForReview._id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });

      const data = await res.json();
      setIsSubmittingReview(false);

      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to submit review");
        return;
      }

      toast.success("Thank you! Your review has been submitted.");
      setIsReviewOpen(false);
      setActiveBookingForReview(null);
      setReviewComment("");
      setReviewRating(5);
      fetchBookings();
    } catch (err) {
      setIsSubmittingReview(false);
      toast.error("Network error submitting review");
    }
  };

  const handleOpenChat = async (providerId: string, serviceTitle: string) => {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: providerId,
          initialMessage: `Hi, checking on my booking for "${serviceTitle}".`,
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

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === "all") return true;
    return b.status === filterStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="warning">Pending Provider</Badge>;
      case "accepted":
        return <Badge variant="primary">Accepted</Badge>;
      case "in_progress":
        return <Badge variant="teal">In Progress</Badge>;
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "cancelled":
        return <Badge variant="danger">Cancelled</Badge>;
      case "rejected":
        return <Badge variant="danger">Declined</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout
      user={user || { id: "", name: "Customer", email: "", role: "customer" }}
      title="My Bookings"
      subtitle="Manage your requested, ongoing, and completed trade service appointments"
    >
      <div className="space-y-6">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          {[
            { id: "all", label: "All Bookings" },
            { id: "pending", label: "Pending" },
            { id: "accepted", label: "Accepted" },
            { id: "in_progress", label: "In Progress" },
            { id: "completed", label: "Completed" },
            { id: "cancelled", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                filterStatus === tab.id
                  ? "bg-brand-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {loading ? (
          <LoadingSpinner message="Fetching your bookings..." />
        ) : filteredBookings.length === 0 ? (
          <EmptyState
            title="No Bookings Found"
            description="You do not have any bookings matching this status filter."
            actionLabel="Explore Available Services"
            onAction={() => router.push("/services")}
          />
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => (
              <div
                key={b._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                      {b.bookingReference}
                    </span>
                    {getStatusBadge(b.status)}
                    <span className="text-xs font-bold text-slate-900 ml-auto md:ml-0">
                      PKR {b.price?.toLocaleString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 truncate">
                    {b.service?.title || "Service Appointment"}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-1">
                    <strong>Instructions:</strong> {b.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span>
                      <strong>Provider:</strong> {b.provider?.name} ({b.provider?.phone})
                    </span>
                    <span>
                      <strong>Scheduled:</strong> {b.requestedDate} • {b.requestedTime}
                    </span>
                  </div>
                </div>

                {/* Contextual Actions */}
                <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
                  <Link href={`/dashboard/customer/bookings/${b._id}`}>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenChat(b.provider?._id, b.service?.title)}
                  >
                    <MessageSquare className="h-4 w-4 mr-1 text-tealbrand-600" />
                    <span>Chat</span>
                  </Button>

                  {/* If completed and not yet reviewed */}
                  {b.status === "completed" && !b.hasReview && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setActiveBookingForReview(b);
                        setIsReviewOpen(true);
                      }}
                    >
                      <Star className="h-4 w-4 mr-1 text-amber-300" />
                      <span>Write Review</span>
                    </Button>
                  )}

                  {/* If eligible to cancel */}
                  {["pending", "accepted"].includes(b.status) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      onClick={() => {
                        setActiveBookingForCancel(b);
                        setIsCancelOpen(true);
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      <span>Cancel</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Submission Modal */}
      <Modal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        title="Leave Genuine Review"
        description={`Rate your experience with ${activeBookingForReview?.provider?.name}`}
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div className="text-center py-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select Your Rating (1–5 Stars)
            </label>
            <div className="flex justify-center">
              <RatingStars
                rating={reviewRating}
                interactive={true}
                onRate={(r) => setReviewRating(r)}
                size="lg"
              />
            </div>
          </div>

          <Textarea
            label="Your Review Feedback"
            required
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Describe the quality of work, punctuality, and professionalism..."
            rows={4}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsReviewOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmittingReview}
            >
              Submit Review
            </Button>
          </div>
        </form>
      </Modal>

      {/* Cancel Booking Confirmation Modal */}
      <Modal
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        title="Cancel Service Booking"
        description={`Are you sure you want to cancel booking ${activeBookingForCancel?.bookingReference}?`}
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              The provider will be notified of this cancellation immediately.
            </span>
          </div>

          <Textarea
            label="Reason for cancellation (Optional)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="e.g. Plans changed, problem resolved, etc."
            rows={3}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCancelOpen(false)}
            >
              Keep Booking
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={isCancelling}
              onClick={handleCancelBooking}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

