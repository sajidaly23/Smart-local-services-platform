"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { Calendar, Search } from "lucide-react";

export default function AdminBookingsPage() {
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
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
  }, []);

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "accepted":
        return <Badge variant="primary">Accepted</Badge>;
      case "in_progress":
        return <Badge variant="teal">In Progress</Badge>;
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "cancelled":
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{s}</Badge>;
    }
  };

  const filtered = bookings.filter((b) => {
    if (filter !== "all" && b.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchRef = b.bookingReference?.toLowerCase().includes(q);
      const matchCustomer = b.customer?.name?.toLowerCase().includes(q);
      const matchProvider = b.provider?.name?.toLowerCase().includes(q);
      const matchTitle = b.service?.title?.toLowerCase().includes(q);
      return matchRef || matchCustomer || matchProvider || matchTitle;
    }
    return true;
  });

  return (
    <DashboardLayout
      user={user || { id: "", name: "Admin", email: "", role: "admin" }}
      title="Platform Bookings Audit"
      subtitle="Complete ledger of all service requests, appointments, and fulfillment states"
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search reference, customer, or provider..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
            {["all", "pending", "accepted", "in_progress", "completed", "cancelled"].map(
              (f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition-all ${
                    filter === f
                      ? "bg-brand-600 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {f.replace("_", " ")}
                </button>
              )
            )}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12">
              <LoadingSpinner message="Auditing platform bookings..." />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No bookings found matching filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Reference & Service</th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Provider</th>
                    <th className="px-5 py-3.5">Date & Slot</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filtered.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-brand-600 font-mono block">
                          {b.bookingReference}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate max-w-xs block">
                          {b.service?.title}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-800">
                        {b.customer?.name}
                        <br />
                        <span className="text-[10px] text-slate-400">{b.customer?.phone}</span>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-800">
                        {b.provider?.name}
                        <br />
                        <span className="text-[10px] text-slate-400">{b.provider?.phone}</span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {b.requestedDate}
                        <br />
                        <span className="text-[10px] text-slate-400">{b.requestedTime}</span>
                      </td>
                      <td className="px-5 py-3.5">{getStatusBadge(b.status)}</td>
                      <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                        PKR {b.price?.toLocaleString()}
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

