"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Search, ShieldAlert, CheckCircle2, UserCheck, Ban } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function AdminUsersPage() {
  const toast = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (roleFilter !== "all") params.set("role", roleFilter);
    if (search) params.set("search", search);

    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch(`/api/users?${params.toString()}`).then((r) => r.json()),
    ])
      .then(([authData, userData]) => {
        if (authData.success) setCurrentUser(authData.user);
        if (userData.success) setUsers(userData.users);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, search]);

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

      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to update user status");
        return;
      }

      toast.success(data.message);
      fetchUsers();
    } catch (err) {
      setUpdatingId(null);
      toast.error("Network error");
    }
  };

  return (
    <DashboardLayout
      user={currentUser || { id: "", name: "Admin", email: "", role: "admin" }}
      title="User Lifecycle Management"
      subtitle="Oversee registered customers, service providers, and account access permissions"
    >
      <div className="space-y-6">
        {/* Filter Controls */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            {["all", "customer", "provider", "admin"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                  roleFilter === r
                    ? "bg-brand-600 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12">
              <LoadingSpinner message="Loading user directory..." />
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No registered users found matching the query.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">User Details</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Contact Phone</th>
                    <th className="px-5 py-3.5">Account State</th>
                    <th className="px-5 py-3.5">Joined Date</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 font-bold text-xs text-slate-700">
                            {u.name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{u.name}</p>
                            <p className="text-[11px] text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          variant={
                            u.role === "admin"
                              ? "danger"
                              : u.role === "provider"
                              ? "teal"
                              : "primary"
                          }
                          size="sm"
                        >
                          {u.role.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 font-medium">{u.phone || "—"}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={u.isActive ? "success" : "danger"} size="sm">
                          {u.isActive ? "Active" : "Suspended"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {u.role !== "admin" && (
                          <Button
                            variant={u.isActive ? "danger" : "primary"}
                            size="sm"
                            isLoading={updatingId === u._id}
                            onClick={() => handleToggleStatus(u._id, u.isActive)}
                          >
                            {u.isActive ? (
                              <>
                                <Ban className="h-3.5 w-3.5 mr-1" />
                                <span>Suspend</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-3.5 w-3.5 mr-1" />
                                <span>Reactivate</span>
                              </>
                            )}
                          </Button>
                        )}
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

