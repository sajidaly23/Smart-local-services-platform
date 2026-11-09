"use client";

import React, { useState } from "react";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import {
  LayoutDashboard,
  Calendar,
  Wrench,
  MessageSquare,
  Bell,
  Star,
  AlertCircle,
  User,
  Settings,
  ShieldCheck,
  Users,
  Layers,
  PackageCheck,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { VerifiedBadge } from "@/components/common/VerifiedBadge";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: {
    id: string;
    name: string;
    email: string;
    role: "customer" | "provider" | "admin";
    verificationStatus?: "pending" | "verified" | "rejected";
  };
  title?: string;
  subtitle?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  user,
  title,
  subtitle,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (e) {
      console.error(e);
    }
  };

  // Build navigation items based on role
  const getNavLinks = () => {
    if (user.role === "admin") {
      return [
        { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
        { label: "Service Moderation", href: "/dashboard/admin/services", icon: PackageCheck },
        { label: "Verifications", href: "/dashboard/admin/verifications", icon: ShieldCheck },
        { label: "Users & Customers", href: "/dashboard/admin/users", icon: Users },
        { label: "Service Providers", href: "/dashboard/admin/providers", icon: Wrench },
        { label: "Categories", href: "/dashboard/admin/categories", icon: Layers },
        { label: "All Bookings", href: "/dashboard/admin/bookings", icon: Calendar },
        { label: "Complaints & Reports", href: "/dashboard/admin/complaints", icon: AlertCircle },
        { label: "Platform Analytics", href: "/dashboard/admin/analytics", icon: BarChart3 },
      ];
    }

    if (user.role === "provider") {
      return [
        { label: "Dashboard", href: "/dashboard/provider", icon: LayoutDashboard },
        { label: "My Services", href: "/dashboard/provider/services", icon: Wrench },
        { label: "Booking Requests", href: "/dashboard/provider/bookings", icon: Calendar },
        { label: "Live Messages", href: "/dashboard/provider/messages", icon: MessageSquare },
        { label: "Verification Documents", href: "/dashboard/provider/verification", icon: ShieldCheck },
        { label: "Customer Reviews", href: "/dashboard/provider/reviews", icon: Star },
        { label: "Profile & Areas", href: "/dashboard/provider/profile", icon: User },
      ];
    }

    // Customer links
    return [
      { label: "Dashboard", href: "/dashboard/customer", icon: LayoutDashboard },
      { label: "My Bookings", href: "/dashboard/customer/bookings", icon: Calendar },
      { label: "Live Messages", href: "/dashboard/customer/messages", icon: MessageSquare },
      { label: "Notifications", href: "/dashboard/customer/notifications", icon: Bell },
      { label: "My Reviews", href: "/dashboard/customer/reviews", icon: Star },
      { label: "Complaints & Support", href: "/dashboard/customer/complaints", icon: AlertCircle },
      { label: "My Profile", href: "/dashboard/customer/profile", icon: User },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white font-bold text-sm">
              LC
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-slate-900">
                Local<span className="text-brand-600">Connect</span>
              </span>
              <span className="text-[10px] uppercase font-bold text-tealbrand-700">
                {user.role} Hub
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden rounded-lg p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Card in Sidebar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-700 text-white font-bold text-sm shadow-2xs">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-800">{user.name}</p>
              <p className="truncate text-[11px] text-slate-500 capitalize">{user.role}</p>
              {user.role === "provider" && user.verificationStatus && (
                <div className="mt-1">
                  <VerifiedBadge status={user.verificationStatus} showText={false} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-brand-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-100 p-3 space-y-1">
          <Link
            href="/services"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <ExternalLink className="h-4 w-4 text-slate-400" />
            <span>Public Marketplace</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-900 sm:text-lg">
                {title || "Dashboard Overview"}
              </h1>
              {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            <Link
              href={
                user.role === "admin"
                  ? "/dashboard/admin/complaints"
                  : user.role === "provider"
                  ? "/dashboard/provider/notifications"
                  : "/dashboard/customer/notifications"
              }
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 relative"
            >
              <Bell className="h-4 w-4" />
            </Link>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

