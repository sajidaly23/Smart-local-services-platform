"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import {
  Wrench,
  Calendar,
  CheckCircle2,
  Clock,
  Star,
  ShieldCheck,
  Plus,
  ArrowRight,
  TrendingUp,
  MessageSquare,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VerifiedBadge } from "@/components/common/VerifiedBadge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default function ProviderDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/services").then((r) => r.json()),
      fetch("/api/bookings").then((r) => r.json()),
    ])
      .then(([userData, svcData, bookingData]) => {
        if (userData.success) setUser(userData.user);
        if (svcData.success && userData.user) {
          const myServices = svcData.services.filter(
            (s: any) => s.provider?._id === userData.user.id
          );
          setServices(myServices);
        }
        if (bookingData.success) {
          setBookings(bookingData.bookings);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner message="Loading provider control hub..." />
      </div>
    );
  }

  const totalServices = services.length;
  const totalBookings = bookings.length;
  const pendingRequests = bookings.filter((b) => b.status === "pending").length;
  const activeJobs = bookings.filter((b) =>
    ["accepted", "in_progress"].includes(b.status)
  ).length;
  const completedJobs = bookings.filter((b) => b.status === "completed").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="warning">New Request</Badge>;
      case "accepted":
        return <Badge variant="primary">Scheduled</Badge>;
      case "in_progress":
        return <Badge variant="teal">In Progress</Badge>;
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "cancelled":
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout
      user={user || { id: "", name: "Provider", email: "", role: "provider" }}
      title="Provider Portal"
      subtitle="Manage your listed services, booking requests, and verification credentials"
    >
      <div className="space-y-8">
        {/* Verification Status Alert Banner if not verified */}
        {user?.verificationStatus !== "verified" && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  Verification Status:{" "}
                  {user?.verificationStatus === "pending"
                    ? "Pending Admin Review"
                    : "Action Required"}
                </h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  Submit or update your identity verification documents to receive a Verified Badge and enable public service listings across Gilgit-Baltistan.
                </p>
              </div>
            </div>
            <Link href="/dashboard/provider/verification">
              <Button variant="outline" size="sm" className="bg-white shrink-0">
                Manage Documents
              </Button>
            </Link>
          </div>
        )}

        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Active Services
                </p>
                <h3 className="text-xl font-black text-slate-900 mt-1">{totalServices}</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Wrench className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  New Requests
                </p>
                <h3 className="text-xl font-black text-amber-600 mt-1">{pendingRequests}</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Scheduled / Active
                </p>
                <h3 className="text-xl font-black text-tealbrand-600 mt-1">{activeJobs}</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tealbrand-50 text-tealbrand-600">
                <Calendar className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Completed Jobs
                </p>
                <h3 className="text-xl font-black text-emerald-600 mt-1">{completedJobs}</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Average Rating
                </p>
                <h3 className="text-xl font-black text-amber-500 mt-1">4.9 ★</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                <Star className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Provider Quick Actions</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Publish new services or respond to customer booking inquiries
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/provider/services/create">
              <Button variant="primary" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                <span>Create New Service</span>
              </Button>
            </Link>
            <Link href="/dashboard/provider/bookings">
              <Button variant="outline" size="sm">
                <span>View Bookings</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Booking Requests */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Booking Requests</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Incoming appointments from customers in your area
              </p>
            </div>
            <Link href="/dashboard/provider/bookings">
              <Button variant="outline" size="sm">
                <span>All Bookings ({totalBookings})</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No booking requests received yet. Ensure your services are published and verified.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Reference</th>
                    <th className="px-5 py-3.5">Customer & Phone</th>
                    <th className="px-5 py-3.5">Requested Date</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {bookings.slice(0, 5).map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-brand-600">
                        {b.bookingReference}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-900">
                        {b.customer?.name}
                        <br />
                        <span className="text-[10px] text-slate-400">{b.contactPhone}</span>
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

