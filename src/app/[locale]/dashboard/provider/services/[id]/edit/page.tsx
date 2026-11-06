"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { Link } from "@/i18n/routing";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/components/ui/toast";

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const serviceId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState<"fixed" | "hourly" | "quote">("fixed");
  const [city, setCity] = useState("Gilgit");
  const [area, setArea] = useState("Gilgit City");
  const [serviceAreasStr, setServiceAreasStr] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!serviceId) return;
    setLoading(true);

    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
      fetch(`/api/services/${serviceId}`).then((r) => r.json()),
    ])
      .then(([userData, catData, svcData]) => {
        if (userData.success) setUser(userData.user);
        if (catData.success) setCategories(catData.categories);
        if (svcData.success && svcData.service) {
          const s = svcData.service;
          setTitle(s.title || "");
          setCategory(s.category?._id || s.category || "");
          setDescription(s.description || "");
          setPrice(s.price?.toString() || "");
          setPriceType(s.priceType || "fixed");
          setCity(s.city || "Gilgit");
          setArea(s.area || "Gilgit City");
          setServiceAreasStr((s.serviceAreas || []).join(", "));
          setImageUrl(s.images?.[0] || "");
          setIsActive(s.isActive ?? true);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [serviceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const areasArray = serviceAreasStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch(`/api/services/${serviceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          description,
          price: parseFloat(price) || 0,
          priceType,
          serviceAreas: areasArray,
          images: [imageUrl],
          city,
          area,
          isActive,
        }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to update service");
        return;
      }

      toast.success("Service updated successfully!");
      router.push("/dashboard/provider/services");
    } catch (err) {
      setIsSubmitting(false);
      toast.error("Network error updating service");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner message="Loading service data..." />
      </div>
    );
  }

  return (
    <DashboardLayout
      user={user || { id: "", name: "Provider", email: "", role: "provider" }}
      title="Edit Service"
      subtitle={`Modify details for "${title}"`}
    >
      <div className="max-w-3xl space-y-6">
        <Link
          href="/dashboard/provider/services"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Services List</span>
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Service Title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Service Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  aria-label="Select Service Category"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Pricing Model
                </label>
                <select
                  value={priceType}
                  onChange={(e: any) => setPriceType(e.target.value)}
                  aria-label="Select Pricing Model"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                >
                  <option value="fixed">Fixed Price</option>
                  <option value="hourly">Hourly Rate</option>
                  <option value="quote">Custom Quote Base</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Price (PKR)"
                type="number"
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Base City
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
                label="Base Area"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
            </div>

            <Input
              label="Service Coverage Areas"
              required
              value={serviceAreasStr}
              onChange={(e) => setServiceAreasStr(e.target.value)}
            />

            <Input
              label="Service Image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />

            <Textarea
              label="Description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActiveCheck"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="isActiveCheck" className="text-xs font-medium text-slate-700 cursor-pointer">
                Publish publicly active (subject to provider verification)
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Link href="/dashboard/provider/services">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                <Save className="h-4 w-4 mr-1.5" />
                <span>Save Changes</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

