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
  MapPin,
  Search,
  Users,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VerifiedBadge } from "@/components/common/VerifiedBadge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default function CustomerDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/bookings").then((r) => r.json()),
      fetch("/api/services?limit=50").then((r) => r.json()),
      fetch("/api/providers?verification=verified").then((r) => r.json()),
    ])
      .then(([userData, bookingData, svcData, provData]) => {
        if (userData.success) setUser(userData.user);
        if (bookingData.success) setBookings(bookingData.bookings);
        if (svcData.success) setServices(svcData.services);
        if (provData.success) setProviders(provData.providers);
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

        {/* All Verified Providers Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-brand-600" />
                <span>Trusted Service Providers ({providers.length})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                All verified professionals available across Gilgit-Baltistan
              </p>
            </div>
            <Link href="/services">
              <Button variant="outline" size="sm">
                <span>Browse Full Directory</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          {providers.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
              No verified providers available yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {providers.map((p: any) => (
                <Link
                  key={p._id}
                  href={`/providers/${p.user?._id}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-brand-300 hover:shadow-md transition-all flex items-start gap-3.5"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-tealbrand-500 text-white font-bold text-sm">
                    {p.user?.name?.charAt(0) || "P"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-brand-600">
                        {p.user?.name}
                      </h4>
                      <VerifiedBadge status={p.verificationStatus} showText={false} />
                    </div>
                    <p className="text-xs text-slate-600 truncate">{p.professionalTitle}</p>
                    <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                        {p.area ? `${p.area}, ${p.city}` : p.city}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-amber-600 shrink-0">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {p.averageRating?.toFixed(1) || "5.0"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* All Available Services Marketplace Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="h-4 w-4 text-tealbrand-600" />
                <span>Available Services ({services.length})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Book any approved local service directly
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services or providers..."
                className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services
              .filter((s: any) => {
                if (!searchQuery.trim()) return true;
                const q = searchQuery.toLowerCase();
                return (
                  s.title?.toLowerCase().includes(q) ||
                  s.provider?.name?.toLowerCase().includes(q) ||
                  s.category?.name?.toLowerCase().includes(q) ||
                  s.city?.toLowerCase().includes(q)
                );
              })
              .map((s: any) => (
                <div
                  key={s._id}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                >
                  <div className="h-36 bg-slate-100 relative overflow-hidden">
                    <img
                      src={s.images?.[0] || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80"}
                      alt={s.title}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute top-2.5 left-2.5 rounded-lg bg-white/95 px-2 py-0.5 text-[10px] font-bold text-brand-700 shadow-xs">
                      {s.category?.name || "Service"}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{s.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{s.description}</p>
                      <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-700 font-medium">
                        <span>{s.provider?.name}</span>
                        <VerifiedBadge status={s.providerProfile?.verificationStatus || "verified"} showText={false} />
                      </div>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {s.area ? `${s.area}, ${s.city}` : s.city}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div>
                        <span className="text-sm font-black text-slate-900">
                          PKR {s.price?.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">
                          {s.priceType === "hourly" ? "/hr" : s.priceType === "quote" ? "(est.)" : ""}
                        </span>
                      </div>
                      <Link href={`/services/${s._id}`}>
                        <Button variant="primary" size="sm">
                          View & Book
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

