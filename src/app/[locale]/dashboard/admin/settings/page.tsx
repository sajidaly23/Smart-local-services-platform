"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Database, Server, Info, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function AdminSettingsPage() {
  const toast = useToast();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setUser(d.user);
      });
  }, []);

  return (
    <DashboardLayout
      user={user || { id: "", name: "Admin", email: "", role: "admin" }}
      title="Platform Settings & Governance"
      subtitle="System architecture policies, database state, and environment controls"
    >
      <div className="space-y-6 max-w-4xl">
        {/* Verification Policy Box */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="h-5 w-5 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Provider Verification Governance
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            In compliance with academic guidelines for this university Final Year Project, provider verification operates through an admin-led document audit workflow. National ID (CNIC) front and back images, vocational certificates, and trade licenses are reviewed directly by platform administrators before issuing a verified badge.
          </p>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-start gap-2">
            <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Note: This FYP implementation uses an administrative review panel and does not connect to an unauthorized or simulated NADRA government gateway without bilateral authorization.
            </span>
          </div>
        </div>

        {/* System Information */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Server className="h-5 w-5 text-tealbrand-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Infrastructure & Runtime Environment
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Application Framework</span>
              <strong className="text-slate-800 text-sm">Next.js 15 (App Router)</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Database Cluster</span>
              <strong className="text-slate-800 text-sm">MongoDB with Mongoose ODM</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Real-Time Messaging Protocol</span>
              <strong className="text-slate-800 text-sm">Socket.IO Server (Port 4001)</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Target Geography</span>
              <strong className="text-slate-800 text-sm">Gilgit-Baltistan, Pakistan</strong>
            </div>
          </div>
        </div>

        {/* Demo Data Reset Guide */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Database className="h-5 w-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Demo Data Seeding & Resetting
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            To reset or re-seed the complete evaluation dataset (Gilgit, Skardu, and Hunza trades, bookings, complaints, and verified providers), run the following command in terminal:
          </p>
          <pre className="p-3 bg-slate-900 text-tealbrand-300 rounded-xl font-mono text-xs overflow-x-auto">
            npm run seed
          </pre>
        </div>
      </div>
    </DashboardLayout>
  );
}

