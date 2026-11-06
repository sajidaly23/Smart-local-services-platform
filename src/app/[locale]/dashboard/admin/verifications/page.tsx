"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function AdminVerificationsPage() {
  const toast = useToast();
  const [user, setUser] = useState<any>(null);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // Inspection & Action Modal
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchVerifications = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/providers/verification").then((r) => r.json()),
    ])
      .then(([userData, verifData]) => {
        if (userData.success) setUser(userData.user);
        if (verifData.success) setVerifications(verifData.verifications);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleDecision = async (status: "approved" | "rejected") => {
    if (!selectedReq) return;
    setIsProcessing(true);

    try {
      const res = await fetch(`/api/admin/verifications/${selectedReq._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes }),
      });

      const data = await res.json();
      setIsProcessing(false);

      if (!res.ok || !data.success) {
        toast.error(data.error || "Action failed");
        return;
      }

      toast.success(`Provider verification request ${status}!`);
      setIsModalOpen(false);
      setSelectedReq(null);
      setAdminNotes("");
      fetchVerifications();
    } catch (err) {
      setIsProcessing(false);
      toast.error("Network error");
    }
  };

  const filtered = verifications.filter((v) => {
    if (filter === "all") return true;
    return v.status === filter;
  });

  return (
    <DashboardLayout
      user={user || { id: "", name: "Admin", email: "", role: "admin" }}
      title="Provider Verification Screening"
      subtitle="Examine submitted identity documents, trade licenses, and issue verified badges"
    >
      <div className="space-y-6">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          {[
            { id: "all", label: "All Requests" },
            { id: "pending", label: "Pending Review" },
            { id: "approved", label: "Approved" },
            { id: "rejected", label: "Rejected" },
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
          <LoadingSpinner message="Loading verification queue..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No Verification Requests"
            description="There are currently no provider identity documents in this filter view."
          />
        ) : (
          <div className="space-y-4">
            {filtered.map((v) => (
              <div
                key={v._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">
                      {v.provider?.name || "Provider"}
                    </h4>
                    <Badge
                      variant={
                        v.status === "approved"
                          ? "success"
                          : v.status === "pending"
                          ? "warning"
                          : "danger"
                      }
                      size="sm"
                    >
                      {v.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    {v.provider?.email} • {v.provider?.phone}
                  </p>
                  <p className="text-xs text-slate-700">
                    Document Type:{" "}
                    <strong className="uppercase">{v.documentType}</strong> ({v.documentUrls?.length || 0} file attached)
                  </p>
                  {v.adminNotes && (
                    <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-2">
                      Admin Notes: {v.adminNotes}
                    </p>
                  )}
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedReq(v);
                    setAdminNotes(v.adminNotes || "");
                    setIsModalOpen(true);
                  }}
                >
                  <Eye className="h-4 w-4 mr-1.5" />
                  <span>Inspect & Decide</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Decision Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Provider Verification Audit"
        description={`Applicant: ${selectedReq?.provider?.name}`}
        size="lg"
      >
        <div className="space-y-4 text-xs">
          <div>
            <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2">
              Submitted Document Image ({selectedReq?.documentType?.toUpperCase()})
            </h4>
            <div className="rounded-xl border border-slate-200 bg-slate-100 overflow-hidden max-h-72 flex items-center justify-center p-2">
              <img
                src={selectedReq?.documentUrls?.[0] || "https://res.cloudinary.com/demo/image/upload/sample.jpg"}
                alt="Verification Document"
                className="max-h-64 object-contain rounded-lg shadow-sm"
              />
            </div>
            <a
              href={selectedReq?.documentUrls?.[0] || "#"}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-brand-600 font-semibold mt-2 hover:underline"
            >
              <span>Open Full Resolution Document</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <Textarea
            label="Administrative Notes / Decision Rationale"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add notes for the provider explaining approval terms or missing document requirements..."
            rows={3}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="danger"
                isLoading={isProcessing}
                onClick={() => handleDecision("rejected")}
              >
                <XCircle className="h-4 w-4 mr-1" />
                <span>Reject Application</span>
              </Button>
              <Button
                type="button"
                variant="primary"
                className="bg-emerald-600 hover:bg-emerald-700"
                isLoading={isProcessing}
                onClick={() => handleDecision("approved")}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                <span>Approve & Verify</span>
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

