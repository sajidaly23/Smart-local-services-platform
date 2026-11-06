"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
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
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import { TrendingUp, BarChart3, Layers, Calendar } from "lucide-react";

export default function AdminAnalyticsPage() {
  const [user, setUser] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/admin/analytics").then((r) => r.json()),
    ])
      .then(([userData, aData]) => {
        if (userData.success) setUser(userData.user);
        if (aData.success) setAnalytics(aData.analytics);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner message="Calculating platform metrics..." />
      </div>
    );
  }

  const COLORS = ["#4f46e5", "#0d9488", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899"];

  return (
    <DashboardLayout
      user={user || { id: "", name: "Admin", email: "", role: "admin" }}
      title="Platform Visual Analytics"
      subtitle="Interactive graphical telemetry, funnels, and regional marketplace insights"
    >
      <div className="space-y-8">
        {/* Row 1: Line Chart & Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Registrations & Bookings Line Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-brand-600" />
              <span>Customer vs Provider Growth Velocity</span>
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              New user acquisitions over the last 6 months
            </p>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics?.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" fontSize={11} stroke="#94a3b8" />
                  <YAxis fontSize={11} stroke="#94a3b8" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="customers"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    name="Customers"
                  />
                  <Line
                    type="monotone"
                    dataKey="providers"
                    stroke="#0d9488"
                    strokeWidth={2.5}
                    name="Providers"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Booking Status Distribution */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-tealbrand-600" />
              <span>Booking Order Status Ratios</span>
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Proportion of appointments across active and completed funnels
            </p>
            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics?.bookingStatuses}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, percent }: any) =>
                      `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                    }
                    fontSize={11}
                  >
                    {analytics?.bookingStatuses?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Row 2: Category Distribution Bar Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-brand-600" />
            <span>Service Category Popularity in Gilgit-Baltistan</span>
          </h3>
          <p className="text-xs text-slate-500 mb-5">
            Active service listings cataloged per trade category
          </p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.categoryDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#4f46e5"
                  name="Active Services"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

