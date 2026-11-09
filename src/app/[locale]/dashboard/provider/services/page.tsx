"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { Plus, Trash2, Edit, Eye, MapPin, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/toast";

const STATUS_BADGE_CONFIG: Record<string, { variant: "warning" | "success" | "danger" | "neutral"; label: string }> = {
  pending: { variant: "warning", label: "Pending Approval" },
  approved: { variant: "success", label: "Approved" },
  rejected: { variant: "danger", label: "Rejected" },
  suspended: { variant: "neutral", label: "Suspended" },
};

export default function ProviderServicesListPage() {
  const toast = useToast();
  const [user, setUser] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyServices = () => {
    setLoading(true);
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((userData) => {
        if (userData.success) {
          setUser(userData.user);
          // Fetch provider's own services (includes all statuses)
          return fetch(`/api/services?providerId=${userData.user.id}&includeAll=true&limit=100`).then((r) => r.json());
        }
        return null;
      })
      .then((svcData) => {
        if (svcData?.success) {
          setServices(svcData.services);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMyServices();
  }, []);

  const handleToggleActive = async (serviceId: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/services/${serviceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Service marked as ${!currentActive ? "active" : "inactive"}`);
        fetchMyServices();
      } else {
        toast.error(data.error || "Failed to update service status");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;

    try {
      const res = await fetch(`/api/services/${serviceId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Service deleted");
        fetchMyServices();
      } else {
        toast.error(data.error || "Failed to delete service");
      }
    } catch {
      toast.error("Network error");
    }
  };

  return (
    <DashboardLayout
      user={user || { id: "", name: "Provider", email: "", role: "provider" }}
      title="My Services"
      subtitle="Manage your trade offerings, pricing packages, and service areas"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            Total {services.length} services configured
          </p>
          <Link href="/dashboard/provider/services/create">
            <Button variant="primary" size="sm">
              <Plus className="h-4 w-4 mr-1.5" />
              <span>Create New Service</span>
            </Button>
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading your services..." />
        ) : services.length === 0 ? (
          <EmptyState
            title="No Services Created Yet"
            description="You haven't added any trade services. Publish your first service to start receiving customer bookings."
            actionLabel="Add Service Now"
            onAction={() => (window.location.href = "/dashboard/provider/services/create")}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc) => {
              const statusConf = STATUS_BADGE_CONFIG[svc.status] || STATUS_BADGE_CONFIG.pending;

              return (
                <div
                  key={svc._id}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-40 w-full bg-slate-100">
                      <img
                        src={
                          svc.images?.[0] ||
                          "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80"
                        }
                        alt={svc.title}
                        className="h-full w-full object-cover"
                      />
                      {/* Moderation Status Badge */}
                      <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-end">
                        <Badge variant={statusConf.variant} size="sm">
                          {statusConf.label}
                        </Badge>
                        {svc.isActive && svc.status === "approved" && (
                          <Badge variant="success" size="sm">Active</Badge>
                        )}
                        {!svc.isActive && svc.status === "approved" && (
                          <Badge variant="neutral" size="sm">Inactive</Badge>
                        )}
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-semibold text-tealbrand-800 bg-tealbrand-50 px-2 py-0.5 rounded">
                          {svc.category?.name || "Trade"}
                        </span>
                        <strong className="text-sm font-bold text-slate-900">
                          PKR {svc.price?.toLocaleString()}
                        </strong>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                        {svc.title}
                      </h4>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {svc.description}
                      </p>

                      <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-1">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span>{svc.area || svc.city}</span>
                      </div>

                      {/* Show rejection reason if rejected */}
                      {svc.status === "rejected" && svc.rejectionReason && (
                        <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5">
                          <p className="text-[11px] font-semibold text-rose-800 mb-0.5">Rejection Reason:</p>
                          <p className="text-[11px] text-rose-700">{svc.rejectionReason}</p>
                        </div>
                      )}

                      {/* Info banner for pending */}
                      {svc.status === "pending" && (
                        <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 flex items-start gap-2">
                          <Clock className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
                          <p className="text-[11px] text-amber-700">
                            This service is under review by the admin. It will become visible on the marketplace once approved.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Link href={`/services/${svc._id}`}>
                        <button
                          title="View Public Service Page"
                          className="rounded-lg p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </Link>

                      {svc.status === "approved" && (
                        <button
                          onClick={() => handleToggleActive(svc._id, svc.isActive)}
                          title={svc.isActive ? "Deactivate" : "Activate"}
                          className="rounded-lg p-1.5 text-slate-400 hover:text-tealbrand-600 hover:bg-slate-100 transition-colors"
                        >
                          {svc.isActive ? (
                            <XCircle className="h-4 w-4 text-amber-500" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteService(svc._id)}
                        title="Delete Service"
                        className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-rose-500" />
                      </button>
                    </div>

                    <Link href={`/dashboard/provider/services/${svc._id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        <span>Edit</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
