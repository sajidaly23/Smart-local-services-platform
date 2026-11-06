"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Wrench,
  ArrowRight,
  TrendingUp,
  Star,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default function CustomerDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/bookings").then((r) => r.json()),
    ])
      .then(([userData, bookingData]) => {
        if (userData.success) setUser(userData.user);
        if (bookingData.success) setBookings(bookingData.bookings);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner message="Loading customer dashboard..." />
      </div>
    );
  }

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const activeBookings = bookings.filter((b) =>
    ["accepted", "in_progress"].includes(b.status)
  ).length;
  const completedBookings = bookings.filter((b) => b.status === "completed").length;

  const recentBookings = bookings.slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="warning">Pending Review</Badge>;
      case "accepted":
        return <Badge variant="primary">Accepted</Badge>;
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
      user={user || { id: "", name: "Customer", email: "", role: "customer" }}
      title="Customer Portal"
      subtitle="Track your local service appointments, messages, and trade requests"
    >
      <div className="space-y-8">
        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Bookings
                </p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{totalBookings}</h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <Calendar className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Pending Provider
                </p>
                <h3 className="text-2xl font-black text-amber-600 mt-1">{pendingBookings}</h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <Clock className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Active / In Progress
                </p>
                <h3 className="text-2xl font-black text-tealbrand-600 mt-1">{activeBookings}</h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-tealbrand-50 text-tealbrand-600">
                <Wrench className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Completed Jobs
                </p>
                <h3 className="text-2xl font-black text-emerald-600 mt-1">{completedBookings}</h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Service Bookings</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Appointments requested with local specialists
              </p>
            </div>
            <Link href="/dashboard/customer/bookings">
              <Button variant="outline" size="sm">
                <span>View All Bookings</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              You haven&apos;t booked any services yet.{" "}
              <Link href="/services" className="text-brand-600 font-semibold underline">
                Browse local services now &rarr;
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Reference & Service</th>
                    <th className="px-5 py-3.5">Provider</th>
                    <th className="px-5 py-3.5">Date & Time</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {recentBookings.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/dashboard/customer/bookings/${b._id}`}
                          className="font-bold text-brand-600 hover:underline block"
                        >
                          {b.bookingReference}
                        </Link>
                        <span className="text-[11px] text-slate-500">
                          {b.service?.title || "Service"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-800">
                        {b.provider?.name}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {b.requestedDate} <br />
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

        {/* Quick Discovery Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-brand-700 to-indigo-800 p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div>
            <h3 className="text-lg sm:text-xl font-bold">
              Looking for trusted help in Gilgit-Baltistan?
            </h3>
            <p className="text-xs sm:text-sm text-indigo-100 mt-1 max-w-xl">
              Browse electricians, plumbers, carpenters, computer specialists, and web developers verified by our platform administrators.
            </p>
          </div>
          <Link href="/services">
            <Button variant="teal" size="md" className="shrink-0 font-bold">
              Explore Services Directory
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}

