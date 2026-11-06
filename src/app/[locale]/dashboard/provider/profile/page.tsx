"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { VerifiedBadge } from "@/components/common/VerifiedBadge";
import { Save, User, MapPin } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function ProviderProfilePage() {
  const toast = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [experienceYears, setExperienceYears] = useState(5);
  const [bio, setBio] = useState("");
  const [skillsStr, setSkillsStr] = useState("");
  const [city, setCity] = useState("Gilgit");
  const [area, setArea] = useState("Gilgit City");
  const [serviceAreasStr, setServiceAreasStr] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    fetch("/api/providers/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.profile) {
          const p = data.profile;
          setUser(p.user);
          setName(p.user?.name || "");
          setPhone(p.user?.phone || "");
          setProfessionalTitle(p.professionalTitle || "");
          setExperienceYears(p.experienceYears || 1);
          setBio(p.bio || "");
          setSkillsStr((p.skills || []).join(", "));
          setCity(p.city || "Gilgit");
          setArea(p.area || "Gilgit City");
          setServiceAreasStr((p.serviceAreas || []).join(", "));
          setIsAvailable(p.isAvailable ?? true);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const skills = skillsStr.split(",").map((s) => s.trim()).filter(Boolean);
    const serviceAreas = serviceAreasStr.split(",").map((s) => s.trim()).filter(Boolean);

    try {
      const res = await fetch("/api/providers/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          professionalTitle,
          experienceYears: Number(experienceYears),
          bio,
          skills,
          city,
          area,
          serviceAreas,
          isAvailable,
        }),
      });

      const data = await res.json();
      setIsSaving(false);

      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to save profile");
        return;
      }

      toast.success("Professional profile updated successfully!");
    } catch (err) {
      setIsSaving(false);
      toast.error("Network error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner message="Loading provider credentials..." />
      </div>
    );
  }

  return (
    <DashboardLayout
      user={user || { id: "", name: "Provider", email: "", role: "provider" }}
      title="Provider Profile & Areas"
      subtitle="Public professional credentials, skills, and service radius"
    >
      <div className="max-w-3xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleSave} className="space-y-5 text-xs">
            {/* Header info */}
            <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-tealbrand-600 text-white font-black text-xl shadow-xs">
                {name?.charAt(0) || "P"}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{name}</h3>
                <p className="text-xs text-slate-500">{user?.email}</p>
                <div className="mt-1">
                  <VerifiedBadge status={user?.verificationStatus || "pending"} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <Input
                label="Direct Contact Phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Professional Title / Specialty"
                required
                value={professionalTitle}
                onChange={(e) => setProfessionalTitle(e.target.value)}
                placeholder="e.g. Master Solar Electrician"
              />

              <Input
                label="Years of Practical Experience"
                type="number"
                min="0"
                max="50"
                required
                value={experienceYears.toString()}
                onChange={(e) => setExperienceYears(parseInt(e.target.value, 10) || 0)}
              />
            </div>

            <Input
              label="Skills & Trade Certifications (Comma-separated)"
              required
              value={skillsStr}
              onChange={(e) => setSkillsStr(e.target.value)}
              placeholder="e.g. Solar Inverters, Home Wiring, Circuit Troubleshooting"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Base City in Gilgit-Baltistan
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  aria-label="Select Base City"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                >
                  <option value="Gilgit">Gilgit</option>
                  <option value="Skardu">Skardu</option>
                  <option value="Hunza">Hunza</option>
                  <option value="Ghizer">Ghizer</option>
                  <option value="Astore">Astore</option>
                  <option value="Diamer">Diamer</option>
                </select>
              </div>

              <Input
                label="Home Base Area / Neighborhood"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Jutial / Aliabad"
              />
            </div>

            <Input
              label="General Service Coverage Areas"
              required
              value={serviceAreasStr}
              onChange={(e) => setServiceAreasStr(e.target.value)}
              placeholder="e.g. Gilgit City, Jutial, Danyor, Konodas"
            />

            <Textarea
              label="Professional Bio"
              required
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Share your work experience, trade background, tools, and commitment to quality..."
              rows={4}
            />

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isAvailableCheck"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="h-4 w-4 rounded text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="isAvailableCheck" className="text-xs font-medium text-slate-700 cursor-pointer">
                I am currently available to accept new booking requests
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button type="submit" variant="primary" isLoading={isSaving}>
                <Save className="h-4 w-4 mr-1.5" />
                <span>Save Profile Changes</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

