"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Link } from "@/i18n/routing";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import {
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  X,
  MapPin,
  Tag,
  DollarSign,
  Calendar,
  User as UserIcon,
  Mail,
  Phone,
  Image as ImageIcon,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

type ServiceStatus = "pending" | "approved" | "rejected" | "suspended";

interface StatusCounts {
  pending: number;
  approved: number;
  rejected: number;
  suspended: number;
  all: number;
}

const STATUS_BADGE_MAP: Record<ServiceStatus, { variant: "warning" | "success" | "danger" | "neutral"; label: string }> = {
  pending: { variant: "warning", label: "Pending Review" },
  approved: { variant: "success", label: "Approved" },
  rejected: { variant: "danger", label: "Rejected" },
  suspended: { variant: "neutral", label: "Suspended" },
};

export default function AdminServicesPage() {
  const toast = useToast();
  const [user, setUser] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [counts, setCounts] = useState<StatusCounts>({ pending: 0, approved: 0, rejected: 0, suspended: 0, all: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("pending");

  // Modals
  const [previewService, setPreviewService] = useState<any>(null);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; serviceId: string; serviceTitle: string }>({
    open: false,
    serviceId: "",
    serviceTitle: "",
  });
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchServices = useCallback(() => {
    setLoading(true);
    const statusParam = activeTab === "all" ? "" : `&status=${activeTab}`;
    const searchParam = search ? `&q=${encodeURIComponent(search)}` : "";

    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch(`/api/admin/services?limit=100${statusParam}${searchParam}`).then((r) => r.json()),
    ])
      .then(([userData, svcData]) => {
        if (userData.success) setUser(userData.user);
        if (svcData.success) {
          setServices(svcData.services);
          setCounts(svcData.counts);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [activeTab, search]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleApprove = async (serviceId: string) => {
    setActionLoading(serviceId);
    try {
      const res = await fetch(`/api/admin/services/${serviceId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Service approved and published to marketplace");
        fetchServices();
      } else {
        toast.error(data.error || "Failed to approve service");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setActionLoading(rejectModal.serviceId);
    try {
      const res = await fetch(`/api/admin/services/${rejectModal.serviceId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected", reason: rejectReason }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Service rejected. Provider has been notified.");
        setRejectModal({ open: false, serviceId: "", serviceTitle: "" });
        setRejectReason("");
        fetchServices();
      } else {
        toast.error(data.error || "Failed to reject service");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (serviceId: string) => {
    const reason = window.prompt("Enter suspension reason:");
    if (!reason) return;
    setActionLoading(serviceId);
    try {
      const res = await fetch(`/api/admin/services/${serviceId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "suspended", reason }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Service suspended");
        fetchServices();
      } else {
        toast.error(data.error || "Failed to suspend service");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setActionLoading(null);
    }
  };

  const tabs = [
    { key: "pending", label: "Pending Approval", count: counts.pending, icon: Clock },
    { key: "approved", label: "Approved / Active", count: counts.approved, icon: CheckCircle2 },
    { key: "rejected", label: "Rejected", count: counts.rejected, icon: XCircle },
    { key: "suspended", label: "Suspended", count: counts.suspended, icon: AlertTriangle },
    { key: "all", label: "All Services", count: counts.all, icon: null },
  ];

  return (
    <DashboardLayout
      user={user || { id: "", name: "Admin", email: "", role: "admin" }}
      title="Service Moderation & Approvals"
      subtitle="Review, approve, reject, or suspend service listings submitted by providers"
    >
      <div className="space-y-6">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all border ${
                activeTab === tab.key
                  ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              {tab.icon && <tab.icon className="h-3.5 w-3.5" />}
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === tab.key
                      ? "bg-white/20 text-white"
                      : tab.key === "pending"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, provider, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
            />
          </div>
          <p className="text-xs text-slate-500">
            Showing {services.length} services
          </p>
        </div>

        {/* Data Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12">
              <LoadingSpinner message="Loading services for moderation..." />
            </div>
          ) : services.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-700">No services found</p>
              <p className="text-xs text-slate-500 mt-1">
                {activeTab === "pending"
                  ? "No services are awaiting approval at this time."
                  : `No services with "${activeTab}" status.`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Service</th>
                    <th className="px-5 py-3.5">Provider</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Price</th>
                    <th className="px-5 py-3.5">Created</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {services.map((s) => {
                    const statusInfo = STATUS_BADGE_MAP[s.status as ServiceStatus] || STATUS_BADGE_MAP.pending;
                    const isProcessing = actionLoading === s._id;

                    return (
                      <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {s.images?.[0] && (
                              <img
                                src={s.images[0]}
                                alt={s.title}
                                className="h-10 w-10 rounded-lg object-cover border border-slate-200 shrink-0"
                              />
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate max-w-[200px]">{s.title}</p>
                              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3" />
                                {s.area || s.city}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-slate-800">{s.provider?.name}</p>
                          <p className="text-[11px] text-slate-500">{s.provider?.email}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-[11px] text-tealbrand-700 bg-tealbrand-50 px-2 py-0.5 rounded font-medium">
                            {s.category?.name || "General"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                          PKR {s.price?.toLocaleString()}
                          <span className="text-[10px] font-normal text-slate-500 block">
                            {s.priceType === "hourly" ? "/hr" : s.priceType === "quote" ? "quote" : "fixed"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                          {new Date(s.createdAt).toLocaleDateString("en-PK", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge variant={statusInfo.variant} size="sm">
                            {statusInfo.label}
                          </Badge>
                          {s.rejectionReason && (
                            <p className="text-[10px] text-rose-600 mt-1 max-w-[120px] truncate" title={s.rejectionReason}>
                              {s.rejectionReason}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Preview */}
                            <button
                              onClick={() => setPreviewService(s)}
                              title="Preview Service"
                              className="rounded-lg p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            {/* Approve — show if not already approved */}
                            {s.status !== "approved" && (
                              <button
                                onClick={() => handleApprove(s._id)}
                                disabled={isProcessing}
                                title="Approve Service"
                                className="rounded-lg p-1.5 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                            )}

                            {/* Reject — show if pending or approved */}
                            {(s.status === "pending" || s.status === "approved") && (
                              <button
                                onClick={() =>
                                  setRejectModal({ open: true, serviceId: s._id, serviceTitle: s.title })
                                }
                                disabled={isProcessing}
                                title="Reject Service"
                                className="rounded-lg p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            )}

                            {/* Suspend — show if approved */}
                            {s.status === "approved" && (
                              <button
                                onClick={() => handleSuspend(s._id)}
                                disabled={isProcessing}
                                title="Suspend Service"
                                className="rounded-lg p-1.5 text-amber-500 hover:text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                              >
                                <AlertTriangle className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ========== PREVIEW MODAL ========== */}
      {previewService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setPreviewService(null)}>
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-900">Service Preview</h3>
              <button onClick={() => setPreviewService(null)} className="rounded-lg p-1.5 hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Images */}
              {previewService.images?.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {previewService.images.map((img: string, i: number) => (
                    <img
                      key={i}
                      src={img}
                      alt={`${previewService.title} ${i + 1}`}
                      className="h-40 w-auto rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                  ))}
                </div>
              )}

              {/* Title and Status */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-xl font-bold text-slate-900">{previewService.title}</h4>
                  <Badge
                    variant={STATUS_BADGE_MAP[previewService.status as ServiceStatus]?.variant || "neutral"}
                    size="sm"
                  >
                    {STATUS_BADGE_MAP[previewService.status as ServiceStatus]?.label || previewService.status}
                  </Badge>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Tag className="h-4 w-4 text-tealbrand-600" />
                  <span className="font-medium">{previewService.category?.name || "General"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  <span className="font-bold text-slate-900">
                    PKR {previewService.price?.toLocaleString()}{" "}
                    <span className="text-xs font-normal text-slate-500">
                      ({previewService.priceType})
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="h-4 w-4 text-brand-600" />
                  <span>{previewService.area}, {previewService.city}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>
                    Submitted{" "}
                    {new Date(previewService.createdAt).toLocaleDateString("en-PK", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h5 className="text-sm font-semibold text-slate-800 mb-1.5">Description</h5>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {previewService.description}
                </p>
              </div>

              {/* Service Areas */}
              {previewService.serviceAreas?.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-slate-800 mb-1.5">Service Areas</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {previewService.serviceAreas.map((area: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded-lg">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Provider Info */}
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                <h5 className="text-sm font-semibold text-slate-800 mb-2">Provider Information</h5>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-slate-700">
                    <UserIcon className="h-4 w-4 text-slate-400" />
                    <span className="font-medium">{previewService.provider?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span>{previewService.provider?.email}</span>
                  </div>
                  {previewService.provider?.phone && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span>{previewService.provider.phone}</span>
                    </div>
                  )}
                  {previewService.providerProfile && (
                    <div className="mt-1">
                      <Badge
                        variant={
                          previewService.providerProfile.verificationStatus === "verified"
                            ? "teal"
                            : previewService.providerProfile.verificationStatus === "pending"
                            ? "warning"
                            : "danger"
                        }
                        size="sm"
                      >
                        Provider: {previewService.providerProfile.verificationStatus}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Rejection Reason (if exists) */}
              {previewService.rejectionReason && (
                <div className="rounded-xl border border-rose-200 p-4 bg-rose-50">
                  <h5 className="text-sm font-semibold text-rose-800 mb-1">Rejection / Suspension Reason</h5>
                  <p className="text-sm text-rose-700">{previewService.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {previewService.status === "pending" && (
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    setPreviewService(null);
                    setRejectModal({
                      open: true,
                      serviceId: previewService._id,
                      serviceTitle: previewService.title,
                    });
                  }}
                >
                  <XCircle className="h-4 w-4 mr-1.5" />
                  Reject
                </Button>
                <Button
                  variant="teal"
                  size="sm"
                  onClick={() => {
                    handleApprove(previewService._id);
                    setPreviewService(null);
                  }}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Approve & Publish
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== REJECT MODAL ========== */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setRejectModal({ open: false, serviceId: "", serviceTitle: "" })}>
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-base font-bold text-slate-900">Reject Service</h3>
              <button
                onClick={() => setRejectModal({ open: false, serviceId: "", serviceTitle: "" })}
                className="rounded-lg p-1.5 hover:bg-slate-100"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Rejecting: <span className="font-semibold text-slate-900">{rejectModal.serviceTitle}</span>
              </p>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Rejection Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  placeholder="Explain why this service is being rejected..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setRejectModal({ open: false, serviceId: "", serviceTitle: "" });
                  setRejectReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={actionLoading === rejectModal.serviceId}
                onClick={handleReject}
              >
                <XCircle className="h-4 w-4 mr-1.5" />
                Reject Service
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
