"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import {
  Users,
  ShieldCheck,
  Wrench,
  Layers,
  Calendar,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  BarChart3,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AdminDashboardOverviewPage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/admin/dashboard").then((r) => r.json()),
      fetch("/api/admin/analytics").then((r) => r.json()),
    ])
      .then(([userData, dashData, analyticsData]) => {
        if (userData.success) setUser(userData.user);
        if (dashData.success) {
          setStats(dashData.stats);
          setRecentActivity(dashData.recentActivity);
        }
        if (analyticsData.success) {
          setAnalytics(analyticsData.analytics);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner message="Loading administrator control center..." />
      </div>
    );
  }

  const COLORS = ["#4f46e5", "#0d9488", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

  return (
    <DashboardLayout
      user={user || { id: "", name: "Admin", email: "", role: "admin" }}
      title="Admin Command Center"
      subtitle="Complete oversight of users, verification requests, trade services, and platform activity"
    >
      <div className="space-y-8">
        {/* KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Users
                </p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  {stats?.totalUsers || 0}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {stats?.totalCustomers || 0} Customers • {stats?.totalProviders || 0} Providers
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <Users className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Pending Verifications
                </p>
                <h3 className="text-2xl font-black text-amber-600 mt-1">
                  {stats?.pendingVerifications || 0}
                </h3>
                <Link
                  href="/dashboard/admin/verifications"
                  className="text-[11px] font-semibold text-brand-600 hover:underline mt-0.5 inline-block"
                >
                  Review documents &rarr;
                </Link>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Bookings
                </p>
                <h3 className="text-2xl font-black text-tealbrand-700 mt-1">
                  {stats?.totalBookings || 0}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {stats?.completedBookings || 0} Completed jobs
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-tealbrand-50 text-tealbrand-600">
                <Calendar className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Open Complaints
                </p>
                <h3 className="text-2xl font-black text-rose-600 mt-1">
                  {stats?.pendingComplaints || 0}
                </h3>
                <Link
                  href="/dashboard/admin/complaints"
                  className="text-[11px] font-semibold text-rose-600 hover:underline mt-0.5 inline-block"
                >
                  Investigate disputes &rarr;
                </Link>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <AlertCircle className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row (Recharts) */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trend Bar Chart */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-brand-600" />
                <span>Monthly Registration & Booking Trends</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Platform growth and user acquisition telemetry
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.monthlyTrends}>
                    <XAxis dataKey="month" fontSize={11} stroke="#94a3b8" />
                    <YAxis fontSize={11} stroke="#94a3b8" />
                    <Tooltip />
                    <Bar dataKey="customers" fill="#4f46e5" name="Customers" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="bookings" fill="#0d9488" name="Bookings" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Status Breakdown Pie Chart */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-tealbrand-600" />
                <span>Booking Status Distribution</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Lifecycle progression of customer appointments
              </p>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.bookingStatuses}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }: any) =>
                        `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                      }
                      fontSize={11}
                    >
                      {analytics.bookingStatuses.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Verification Queue & Recent Complaints */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Verification Requests */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-amber-500" />
                <span>Pending Provider Verifications</span>
              </h3>
              <Link href="/dashboard/admin/verifications">
                <Button variant="ghost" size="sm" className="text-xs">
                  Review All
                </Button>
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {recentActivity?.verifications?.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No verification requests currently pending approval.
                </div>
              ) : (
                recentActivity?.verifications?.map((v: any) => (
                  <div key={v._id} className="p-4 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{v.provider?.name}</p>
                      <p className="text-[11px] text-slate-500">
                        Document: <span className="uppercase font-semibold">{v.documentType}</span>
                      </p>
                    </div>
                    <Link href={`/dashboard/admin/verifications`}>
                      <Button variant="outline" size="sm">
                        Inspect
                      </Button>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Disputes */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-rose-500" />
                <span>Open Disputes & Complaints</span>
              </h3>
              <Link href="/dashboard/admin/complaints">
                <Button variant="ghost" size="sm" className="text-xs">
                  Review All
                </Button>
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {recentActivity?.complaints?.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No open complaints requiring resolution.
                </div>
              ) : (
                recentActivity?.complaints?.map((c: any) => (
                  <div key={c._id} className="p-4 flex items-center justify-between text-xs">
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-bold text-slate-900 truncate">
                        {c.submittedBy?.name} • <span className="capitalize">{c.category.replace(/_/g, " ")}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{c.description}</p>
                    </div>
                    <Link href="/dashboard/admin/complaints">
                      <Button variant="danger" size="sm">
                        Resolve
                      </Button>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

