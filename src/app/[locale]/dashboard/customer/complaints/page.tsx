"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { AlertCircle, ShieldAlert, CheckCircle2, Clock } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useSearchParams } from "next/navigation";

export default function CustomerComplaintsPage() {
  const toast = useToast();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [category, setCategory] = useState("booking_problem");
  const [description, setDescription] = useState("");
  const [bookingId, setBookingId] = useState(searchParams.get("bookingId") || "");
  const [providerId, setProviderId] = useState(searchParams.get("providerId") || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComplaints = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/complaints").then((r) => r.json()),
    ])
      .then(([userData, complaintData]) => {
        if (userData.success) setUser(userData.user);
        if (complaintData.success) setComplaints(complaintData.complaints);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          description,
          bookingId: bookingId || undefined,
          providerId: providerId || undefined,
        }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to submit complaint");
        return;
      }

      toast.success("Complaint submitted! An administrator will investigate.");
      setDescription("");
      fetchComplaints();
    } catch (err) {
      setIsSubmitting(false);
      toast.error("Network error submitting complaint");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="warning">Open</Badge>;
      case "under_review":
        return <Badge variant="primary">Under Review</Badge>;
      case "resolved":
        return <Badge variant="success">Resolved</Badge>;
      case "rejected":
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout
      user={user || { id: "", name: "Customer", email: "", role: "customer" }}
      title="Complaints & Resolution Center"
      subtitle="Report provider conduct, service quality discrepancies, or booking issues"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Submit Complaint Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldAlert className="h-5 w-5 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900">Log a Dispute / Complaint</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Issue Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-label="Select Issue Category"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
              >
                <option value="booking_problem">Booking Scheduling or Cancellation Issue</option>
                <option value="poor_service_quality">Poor Workmanship / Service Quality</option>
                <option value="provider_behavior">Unprofessional Provider Behavior</option>
                <option value="misleading_information">Misleading Pricing or Description</option>
                <option value="payment_issue">Payment or Overcharging Issue</option>
                <option value="other">Other Dispute</option>
              </select>
            </div>

            <Textarea
              label="Describe the Incident / Problem"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide specific details, dates, or what went wrong..."
              rows={4}
            />

            <Button
              type="submit"
              variant="danger"
              className="w-full"
              isLoading={isSubmitting}
            >
              Submit Complaint for Admin Review
            </Button>
          </form>
        </div>

        {/* Complaints History */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            My Submitted Complaints ({complaints.length})
          </h3>

          {loading ? (
            <LoadingSpinner message="Loading records..." />
          ) : complaints.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
              You have no active or historical complaints on file.
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((c) => (
                <div
                  key={c._id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-700 capitalize">
                      {c.category.replace(/_/g, " ")}
                    </span>
                    {getStatusBadge(c.status)}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl">
                    {c.description}
                  </p>

                  {/* Admin Response if available */}
                  {c.adminResponse && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs text-emerald-900">
                      <p className="font-bold flex items-center gap-1.5 mb-1 text-emerald-800">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        Admin Investigation Response:
                      </p>
                      <p className="leading-relaxed">{c.adminResponse}</p>
                    </div>
                  )}

                  <p className="text-[10px] text-slate-400">
                    Logged: {new Date(c.createdAt).toLocaleDateString()}
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

