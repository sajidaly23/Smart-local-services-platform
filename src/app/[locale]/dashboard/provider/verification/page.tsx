"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import {
  ShieldCheck,
  Clock,
  XCircle,
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function ProviderVerificationPage() {
  const toast = useToast();
  const [user, setUser] = useState<any>(null);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [documentType, setDocumentType] = useState<"cnic" | "license" | "certificate" | "utility_bill">("cnic");
  const [documentUrl, setDocumentUrl] = useState("https://res.cloudinary.com/demo/image/upload/sample.jpg");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchVerificationData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/providers/verification").then((r) => r.json()),
    ])
      .then(([userData, verifData]) => {
        if (userData.success) setUser(userData.user);
        if (verifData.success) setVerifications(verifData.verifications);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVerificationData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentUrl) {
      toast.error("Please supply a document image URL");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/providers/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType,
          documentUrls: [documentUrl],
          notes,
        }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to submit verification request");
        return;
      }

      toast.success("Verification documents submitted for admin screening!");
      setNotes("");
      fetchVerificationData();
    } catch (err) {
      setIsSubmitting(false);
      toast.error("Network error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner message="Checking verification records..." />
      </div>
    );
  }

  const currentStatus = user?.verificationStatus || "pending";

  return (
    <DashboardLayout
      user={user || { id: "", name: "Provider", email: "", role: "provider" }}
      title="Provider Identity Verification"
      subtitle="Administrative credential screening for trade specialist verification"
    >
      <div className="space-y-8 max-w-4xl">
        {/* Verification Status Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                  currentStatus === "verified"
                    ? "bg-tealbrand-100 text-tealbrand-700"
                    : currentStatus === "pending"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {currentStatus === "verified" ? (
                  <ShieldCheck className="h-8 w-8" />
                ) : currentStatus === "pending" ? (
                  <Clock className="h-8 w-8" />
                ) : (
                  <XCircle className="h-8 w-8" />
                )}
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Current Verification State
                </span>
                <h3 className="text-xl font-bold text-slate-900 capitalize mt-0.5">
                  {currentStatus === "verified"
                    ? "Verified Specialist"
                    : currentStatus === "pending"
                    ? "Under Admin Screening"
                    : "Verification Declined"}
                </h3>
              </div>
            </div>

            <Badge
              variant={
                currentStatus === "verified"
                  ? "teal"
                  : currentStatus === "pending"
                  ? "warning"
                  : "danger"
              }
              size="md"
            >
              {currentStatus.toUpperCase()}
            </Badge>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
            {currentStatus === "verified" ? (
              <p className="text-tealbrand-800 font-medium">
                ✓ Your professional credentials and identity have been approved by the platform administrator. Your public services are currently active and display the verified specialist badge.
              </p>
            ) : currentStatus === "pending" ? (
              <p className="text-amber-800">
                ⏳ Your submitted documents are currently under administrative review. Our team will verify your details within 24 hours. Services remain in draft until approved.
              </p>
            ) : (
              <p className="text-rose-800">
                ⚠ Your verification request was not approved. Please inspect the administrative notes below and submit revised documents.
              </p>
            )}
          </div>
        </div>

        {/* Submit or Update Documents Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">
              Submit Credential Documents
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload clear photos of your National ID (CNIC), vocational certification, or trade license.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Document Classification
              </label>
              <select
                value={documentType}
                onChange={(e: any) => setDocumentType(e.target.value)}
                aria-label="Select Document Classification"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
              >
                <option value="cnic">National Identity Card (CNIC Front & Back)</option>
                <option value="license">Trade License / Business Registration</option>
                <option value="certificate">Technical / Vocational Diploma</option>
                <option value="utility_bill">Proof of Address / Utility Bill</option>
              </select>
            </div>

            <Input
              label="Document Image URL (Cloudinary or Direct Link)"
              required
              value={documentUrl}
              onChange={(e) => setDocumentUrl(e.target.value)}
              placeholder="https://res.cloudinary.com/..."
              helperText="In production, uploads directly to Cloudinary with secure encrypted access."
            />

            <Textarea
              label="Additional Notes for Administrator (Optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 10 years experience serving Jutial and Gilgit City, license renewed in 2026..."
              rows={3}
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              <Upload className="h-4 w-4 mr-1.5" />
              <span>Submit Verification Documents</span>
            </Button>
          </form>
        </div>

        {/* Submission History */}
        {verifications.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Verification Submission History
            </h3>
            <div className="space-y-3">
              {verifications.map((v) => (
                <div
                  key={v._id}
                  className="rounded-xl border border-slate-200 p-4 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 uppercase">
                      {v.documentType}
                    </span>
                    <Badge
                      variant={
                        v.status === "approved"
                          ? "success"
                          : v.status === "pending"
                          ? "warning"
                          : "danger"
                      }
                      size="sm"
                    >
                      {v.status}
                    </Badge>
                  </div>
                  {v.adminNotes && (
                    <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <strong>Admin Feedback:</strong> {v.adminNotes}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400">
                    Submitted: {new Date(v.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

