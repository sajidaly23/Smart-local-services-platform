"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Search, Eye, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function AdminServicesPage() {
  const toast = useToast();
  const [user, setUser] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchServices = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/services?limit=100").then((r) => r.json()),
    ])
      .then(([userData, svcData]) => {
        if (userData.success) setUser(userData.user);
        if (svcData.success) setServices(svcData.services);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Service marked as ${!currentActive ? "active" : "inactive"}`);
        fetchServices();
      } else {
        toast.error(data.error || "Update failed");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this service?")) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Service removed from platform");
        fetchServices();
      } else {
        toast.error(data.error || "Delete failed");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const filtered = services.filter((s) => {
    if (search) {
      const q = search.toLowerCase();
      return (
        s.title?.toLowerCase().includes(q) ||
        s.provider?.name?.toLowerCase().includes(q) ||
        s.city?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <DashboardLayout
      user={user || { id: "", name: "Admin", email: "", role: "admin" }}
      title="Platform Services Directory"
      subtitle="Audit all trade listings posted by verified and pending providers"
    >
      <div className="space-y-6">
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
            Showing {filtered.length} of {services.length} services
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12">
              <LoadingSpinner message="Auditing platform services..." />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No services match your query.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Service Title & Category</th>
                    <th className="px-5 py-3.5">Provider</th>
                    <th className="px-5 py-3.5">Location</th>
                    <th className="px-5 py-3.5">Price</th>
                    <th className="px-5 py-3.5">State</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filtered.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/services/${s._id}`}
                          className="font-bold text-slate-900 hover:text-brand-600 block"
                        >
                          {s.title}
                        </Link>
                        <span className="text-[11px] text-tealbrand-700 bg-tealbrand-50 px-2 py-0.5 rounded">
                          {s.category?.name || "General"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-800">
                        {s.provider?.name}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {s.area || s.city}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        PKR {s.price?.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={s.isActive ? "success" : "neutral"} size="sm">
                          {s.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/services/${s._id}`}>
                            <button className="rounded-lg p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100">
                              <Eye className="h-4 w-4" />
                            </button>
                          </Link>

                          <button
                            onClick={() => handleToggleActive(s._id, s.isActive)}
                            title={s.isActive ? "Deactivate" : "Activate"}
                            className="rounded-lg p-1.5 text-slate-400 hover:text-tealbrand-600 hover:bg-slate-100"
                          >
                            {s.isActive ? (
                              <XCircle className="h-4 w-4 text-amber-500" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            )}
                          </button>

                          <button
                            onClick={() => handleDelete(s._id)}
                            title="Delete Service"
                            className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4 text-rose-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

