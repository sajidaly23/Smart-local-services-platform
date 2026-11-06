"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function AdminComplaintsPage() {
  const toast = useToast();
  const [user, setUser] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // Resolution Modal
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState("under_review");
  const [adminResponse, setAdminResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComplaints = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/complaints").then((r) => r.json()),
    ])
      .then(([userData, cData]) => {
        if (userData.success) setUser(userData.user);
        if (cData.success) setComplaints(cData.complaints);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/complaints/${selectedComplaint._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminResponse }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to update complaint");
        return;
      }

      toast.success("Complaint status updated and client notified!");
      setIsModalOpen(false);
      setSelectedComplaint(null);
      setAdminResponse("");
      fetchComplaints();
    } catch (err) {
      setIsSubmitting(false);
      toast.error("Network error");
    }
  };

  const filtered = complaints.filter((c) => {
    if (filter === "all") return true;
    return c.status === filter;
  });

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "open":
        return <Badge variant="warning">Open</Badge>;
      case "under_review":
        return <Badge variant="primary">Under Review</Badge>;
      case "resolved":
        return <Badge variant="success">Resolved</Badge>;
      case "rejected":
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{s}</Badge>;
    }
  };

  return (
    <DashboardLayout
      user={user || { id: "", name: "Admin", email: "", role: "admin" }}
      title="Disputes & Complaints Oversight"
      subtitle="Investigate platform issues, mediate between clients and providers, and post resolutions"
    >
      <div className="space-y-6">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          {[
            { id: "all", label: "All Complaints" },
            { id: "open", label: "Open" },
            { id: "under_review", label: "Under Review" },
            { id: "resolved", label: "Resolved" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                filter === tab.id
                  ? "bg-brand-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner message="Loading disputes..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No Complaints in Queue"
            description="There are currently no customer disputes matching this filter view."
          />
        ) : (
          <div className="space-y-4">
            {filtered.map((c) => (
              <div
                key={c._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-xs text-slate-800 uppercase">
                      {c.category.replace(/_/g, " ")}
                    </span>
                    {getStatusBadge(c.status)}
                  </div>

                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                    {c.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
                    <span>
                      <strong>Submitted By:</strong> {c.submittedBy?.name} ({c.submittedBy?.email})
                    </span>
                    {c.relatedBooking && (
                      <span>
                        <strong>Booking Ref:</strong> {c.relatedBooking?.bookingReference}
                      </span>
                    )}
                    <span>
                      <strong>Logged:</strong> {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {c.adminResponse && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-2.5 text-xs text-emerald-900 mt-2">
                      <strong>Admin Resolution:</strong> {c.adminResponse}
                    </div>
                  )}
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedComplaint(c);
                    setStatus(c.status);
                    setAdminResponse(c.adminResponse || "");
                    setIsModalOpen(true);
                  }}
                >
                  <span>Resolve / Update</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolution Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Dispute Resolution & Status"
        description={`Investigating complaint from ${selectedComplaint?.submittedBy?.name}`}
      >
        <form onSubmit={handleUpdate} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Set Complaint Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              aria-label="Set Complaint Status"
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
            >
              <option value="open">Open (Awaiting Investigation)</option>
              <option value="under_review">Under Review (Engaging Parties)</option>
              <option value="resolved">Resolved (Resolution Approved)</option>
              <option value="rejected">Rejected (Invalid Claim)</option>
            </select>
          </div>

          <Textarea
            label="Administrative Resolution Note"
            required
            value={adminResponse}
            onChange={(e) => setAdminResponse(e.target.value)}
            placeholder="Document your findings, mediation outcome, or actions taken..."
            rows={4}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Save & Notify Customer
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

