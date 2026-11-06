"use client";

import React, { useState, useEffect } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Play,
  CheckCheck,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function ProviderBookingsPage() {
  const router = useRouter();
  const toast = useToast();

  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchBookings = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/bookings").then((r) => r.json()),
    ])
      .then(([userData, bData]) => {
        if (userData.success) setUser(userData.user);
        if (bData.success) setBookings(bData.bookings);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    setActionInProgress(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      setActionInProgress(null);

      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to update booking status");
        return;
      }

      toast.success(`Booking status transitioned to ${newStatus}`);
      fetchBookings();
    } catch (err) {
      setActionInProgress(null);
      toast.error("Network error");
    }
  };

  const handleOpenChat = async (customerId: string, serviceTitle: string) => {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: customerId,
          initialMessage: `Hello, reaching out regarding your booking request for "${serviceTitle}".`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/dashboard/provider/messages");
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
        return <Badge variant="warning">Pending Your Approval</Badge>;
      case "accepted":
        return <Badge variant="primary">Accepted & Scheduled</Badge>;
      case "in_progress":
        return <Badge variant="teal">Job in Progress</Badge>;
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
      user={user || { id: "", name: "Provider", email: "", role: "provider" }}
      title="Booking Requests"
      subtitle="Accept, manage progress, and complete client trade orders"
    >
      <div className="space-y-6">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          {[
            { id: "all", label: "All Requests" },
            { id: "pending", label: "Pending" },
            { id: "accepted", label: "Accepted" },
            { id: "in_progress", label: "In Progress" },
            { id: "completed", label: "Completed" },
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
          <LoadingSpinner message="Loading incoming requests..." />
        ) : filteredBookings.length === 0 ? (
          <EmptyState
            title="No Bookings in this Category"
            description="You do not have any requests matching this filter status."
          />
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => (
              <div
                key={b._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                      {b.bookingReference}
                    </span>
                    {getStatusBadge(b.status)}
                    <span className="text-xs font-bold text-slate-900 ml-auto md:ml-0">
                      PKR {b.price?.toLocaleString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {b.service?.title || "Service Request"}
                  </h3>

                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-xs text-slate-700 space-y-1">
                    <p>
                      <strong>Client Requirements:</strong> {b.description}
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-600">
                      <MapPin className="h-3.5 w-3.5 text-brand-600 shrink-0" />
                      <span>{b.serviceAddress}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span>
                      <strong>Customer:</strong> {b.customer?.name} ({b.contactPhone})
                    </span>
                    <span>
                      <strong>Slot:</strong> {b.requestedDate} • {b.requestedTime}
                    </span>
                  </div>
                </div>

                {/* Workflow Transition Buttons */}
                <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenChat(b.customer?._id, b.service?.title)}
                  >
                    <MessageSquare className="h-4 w-4 mr-1 text-tealbrand-600" />
                    <span>Chat</span>
                  </Button>

                  {/* Pending: Accept or Reject */}
                  {b.status === "pending" && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={actionInProgress === b._id}
                        onClick={() => handleStatusUpdate(b._id, "accepted")}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        <span>Accept Request</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        isLoading={actionInProgress === b._id}
                        onClick={() => handleStatusUpdate(b._id, "rejected")}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        <span>Decline</span>
                      </Button>
                    </>
                  )}

                  {/* Accepted: Start Job */}
                  {b.status === "accepted" && (
                    <Button
                      variant="teal"
                      size="sm"
                      isLoading={actionInProgress === b._id}
                      onClick={() => handleStatusUpdate(b._id, "in_progress")}
                    >
                      <Play className="h-3.5 w-3.5 mr-1" />
                      <span>Start Job</span>
                    </Button>
                  )}

                  {/* In Progress: Mark Complete */}
                  {b.status === "in_progress" && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      isLoading={actionInProgress === b._id}
                      onClick={() => handleStatusUpdate(b._id, "completed")}
                    >
                      <CheckCheck className="h-4 w-4 mr-1" />
                      <span>Mark as Completed</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

