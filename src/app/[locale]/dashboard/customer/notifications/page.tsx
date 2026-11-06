"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Bell, CheckCheck, CheckCircle2, Clock } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function CustomerNotificationsPage() {
  const toast = useToast();
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/notifications").then((r) => r.json()),
    ])
      .then(([userData, notifData]) => {
        if (userData.success) setUser(userData.user);
        if (notifData.success) setNotifications(notifData.notifications);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "PATCH" });
      toast.success("All notifications marked as read");
      fetchNotifications();
    } catch (err) {
      toast.error("Failed to update notifications");
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {}
  };

  return (
    <DashboardLayout
      user={user || { id: "", name: "Customer", email: "", role: "customer" }}
      title="Notifications"
      subtitle="Important platform alerts, booking milestones, and messages"
    >
      <div className="space-y-4 max-w-4xl">
        <div className="flex items-center justify-between pb-2">
          <span className="text-xs font-semibold text-slate-500">
            {notifications.filter((n) => !n.isRead).length} Unread Notifications
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={notifications.length === 0}
          >
            <CheckCheck className="h-4 w-4 mr-1 text-slate-500" />
            <span>Mark All as Read</span>
          </Button>
        </div>

        {loading ? (
          <LoadingSpinner message="Fetching notifications..." />
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
            <Bell className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <span>You have no notifications at this time.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleMarkSingleRead(n._id)}
                className={`rounded-2xl border p-4 transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  !n.isRead
                    ? "border-brand-300 bg-brand-50/40 shadow-xs"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {!n.isRead && (
                      <span className="h-2 w-2 rounded-full bg-brand-600 shrink-0" />
                    )}
                    <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

