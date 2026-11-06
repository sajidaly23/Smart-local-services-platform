"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { VerifiedBadge } from "@/components/common/VerifiedBadge";
import { Search, Eye, ShieldCheck, Ban, UserCheck } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function AdminProvidersPage() {
  const toast = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchProviders = () => {
    setLoading(true);
    const params = new URLSearchParams({ role: "provider" });
    if (search) params.set("search", search);

    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch(`/api/users?${params.toString()}`).then((r) => r.json()),
    ])
      .then(([authData, userData]) => {
        if (authData.success) setCurrentUser(authData.user);
        if (userData.success) setProviders(userData.users);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProviders();
  }, [search]);

  const handleToggleStatus = async (userId: string, currentActive: boolean) => {
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      const data = await res.json();
      setUpdatingId(null);
      if (data.success) {
        toast.success(data.message);
        fetchProviders();
      }
    } catch (err) {
      setUpdatingId(null);
    }
  };

  return (
    <DashboardLayout
      user={currentUser || { id: "", name: "Admin", email: "", role: "admin" }}
      title="Registered Service Providers"
      subtitle="Directory of trade specialists, electricians, plumbers, and technicians"
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between">
          <div className="relative w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search providers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>
          <span className="text-xs text-slate-500">{providers.length} Providers registered</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12"><LoadingSpinner message="Loading provider directory..." /></div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Provider Name</th>
                  <th className="px-5 py-3.5">Verification Badge</th>
                  <th className="px-5 py-3.5">Contact Phone</th>
                  <th className="px-5 py-3.5">Account Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {providers.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/80">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <p className="text-[11px] text-slate-400">{p.email}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <VerifiedBadge
                        status={p.providerProfile?.verificationStatus || "pending"}
                      />
                    </td>
                    <td className="px-5 py-3.5">{p.phone || "—"}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={p.isActive ? "success" : "danger"} size="sm">
                        {p.isActive ? "Active" : "Suspended"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5">
                      <Link href={`/dashboard/admin/providers/${p._id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          <span>Audit</span>
                        </Button>
                      </Link>

                      <Button
                        variant={p.isActive ? "danger" : "primary"}
                        size="sm"
                        isLoading={updatingId === p._id}
                        onClick={() => handleToggleStatus(p._id, p.isActive)}
                      >
                        {p.isActive ? "Suspend" : "Activate"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

