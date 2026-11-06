"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Search, Ban, UserCheck } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function AdminCustomersPage() {
  const toast = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchCustomers = () => {
    setLoading(true);
    const params = new URLSearchParams({ role: "customer" });
    if (search) params.set("search", search);

    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch(`/api/users?${params.toString()}`).then((r) => r.json()),
    ])
      .then(([authData, userData]) => {
        if (authData.success) setCurrentUser(authData.user);
        if (userData.success) setCustomers(userData.users);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
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
        fetchCustomers();
      }
    } catch (err) {
      setUpdatingId(null);
    }
  };

  return (
    <DashboardLayout
      user={currentUser || { id: "", name: "Admin", email: "", role: "admin" }}
      title="Registered Customers"
      subtitle="Directory of service seekers and community household accounts"
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between">
          <div className="relative w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>
          <span className="text-xs text-slate-500">{customers.length} Customers registered</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12"><LoadingSpinner message="Loading customer directory..." /></div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Customer Name</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Phone</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/80">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{c.name}</td>
                    <td className="px-5 py-3.5 text-slate-500">{c.email}</td>
                    <td className="px-5 py-3.5">{c.phone || "—"}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={c.isActive ? "success" : "danger"} size="sm">
                        {c.isActive ? "Active" : "Suspended"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        variant={c.isActive ? "danger" : "primary"}
                        size="sm"
                        isLoading={updatingId === c._id}
                        onClick={() => handleToggleStatus(c._id, c.isActive)}
                      >
                        {c.isActive ? <Ban className="h-3.5 w-3.5 mr-1" /> : <UserCheck className="h-3.5 w-3.5 mr-1" />}
                        <span>{c.isActive ? "Suspend" : "Activate"}</span>
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

