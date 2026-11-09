"use client";

import React, { useState, useEffect } from "react";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import {
  Menu,
  X,
  MapPin,
  Bell,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Briefcase,
  ChevronDown,
} from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  currentUser?: {
    id: string;
    name: string;
    email: string;
    role: "customer" | "provider" | "admin";
    profileImage?: string;
  } | null;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser: initialUser }) => {
  const t = useTranslations("nav");
  const locale = useLocale();
  const isUrdu = locale === "ur";
  const pathname = usePathname();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(initialUser || null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Sync session client-side
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data?.user) {
          setCurrentUser(data.user);
          // Fetch notifications count
          fetch("/api/notifications")
            .then((r) => (r.ok ? r.json() : null))
            .then((nData) => {
              if (nData?.unreadCount !== undefined) {
                setUnreadCount(nData.unreadCount);
              }
            })
            .catch(() => {});
        } else {
          setCurrentUser(null);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
      setUserDropdownOpen(false);
      // Use hard redirect to force full page reload and clear cookie state
      window.location.href = "/login";
    } catch (e) {
      console.error(e);
      window.location.href = "/login";
    }
  };

  const getDashboardLink = () => {
    if (!currentUser) return "/login";
    if (currentUser.role === "admin") return "/dashboard/admin";
    if (currentUser.role === "provider") return "/dashboard/provider";
    return "/dashboard/customer";
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-tealbrand-500 shadow-md">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Local<span className="text-brand-600">Connect</span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-tealbrand-700">
              Gilgit-Baltistan
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/services"
            className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
          >
            {t("exploreServices")}
          </Link>
          <Link
            href="/services?view=categories"
            className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
          >
            {t("categories")}
          </Link>
          <Link
            href="/#how-it-works"
            className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
          >
            {t("howItWorks")}
          </Link>
          <Link
            href="/#safety"
            className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
          >
            {t("safety")}
          </Link>
        </nav>

        {/* Right Action Icons & Auth */}
        <div className="hidden md:flex items-center gap-3.5">
          <LanguageSwitcher />

          {currentUser ? (
            <div className="flex items-center gap-3">
              {/* Notification icon */}
              <Link
                href={
                  currentUser.role === "admin"
                    ? "/dashboard/admin/complaints"
                    : currentUser.role === "provider"
                    ? "/dashboard/provider/notifications"
                    : "/dashboard/customer/notifications"
                }
                className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 font-semibold text-white text-xs">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] capitalize text-slate-500">
                      {currentUser.role}
                    </p>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-semibold text-slate-800">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                    </div>

                    <Link
                      href={getDashboardLink()}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      <LayoutDashboard className="h-4 w-4 text-brand-600" />
                      {t("dashboard")}
                    </Link>

                    {currentUser.role === "customer" && (
                      <Link
                        href="/dashboard/customer/bookings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        <Briefcase className="h-4 w-4 text-tealbrand-600" />
                        {t("myBookings")}
                      </Link>
                    )}

                    {currentUser.role === "admin" && (
                      <Link
                        href="/dashboard/admin/verifications"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        <ShieldCheck className="h-4 w-4 text-amber-600" />
                        Verifications
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="h-4 w-4" />
                      {t("logout")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  {t("login")}
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  {t("register")}
                </Button>
              </Link>
              <Link href="/register?role=provider" className="hidden lg:block">
                <Button variant="teal" size="sm">
                  {t("becomeProvider")}
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSwitcher />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-4 pt-3 pb-6 md:hidden">
          <div className="flex flex-col space-y-3">
            <Link
              href="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {t("exploreServices")}
            </Link>
            <Link
              href="/services?view=categories"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {t("categories")}
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {t("howItWorks")}
            </Link>
            <Link
              href="/#safety"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {t("safety")}
            </Link>

            <div className="border-t border-slate-100 pt-3">
              {currentUser ? (
                <div className="space-y-2">
                  <div className="px-3 py-1 text-xs text-slate-500">
                    Signed in as <strong className="text-slate-800">{currentUser.name}</strong> ({currentUser.role})
                  </div>
                  <Link
                    href={getDashboardLink()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-lg bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700"
                  >
                    {t("dashboard")}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
                  >
                    {t("logout")}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      {t("login")}
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" size="sm" className="w-full">
                      {t("register")}
                    </Button>
                  </Link>
                  <Link
                    href="/register?role=provider"
                    onClick={() => setMobileMenuOpen(false)}
                    className="col-span-2 mt-1"
                  >
                    <Button variant="teal" size="sm" className="w-full">
                      {t("becomeProvider")}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

