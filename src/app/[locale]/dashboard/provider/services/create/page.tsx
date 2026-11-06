"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useToast } from "@/components/ui/toast";

export default function CreateServicePage() {
  const router = useRouter();
  const toast = useToast();

  const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState<"fixed" | "hourly" | "quote">("fixed");
  const [city, setCity] = useState("Gilgit");
  const [area, setArea] = useState("Gilgit City");
  const [serviceAreasStr, setServiceAreasStr] = useState("Gilgit City, Jutial, Danyor");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80");

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ])
      .then(([userData, catData]) => {
        if (userData.success) setUser(userData.user);
        if (catData.success && catData.categories.length > 0) {
          setCategories(catData.categories);
          setCategory(catData.categories[0]._id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
      toast.error("Please select a category");
      return;
    }

    setIsSubmitting(true);

    const areasArray = serviceAreasStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          description,
          price: parseFloat(price) || 0,
          priceType,
          serviceAreas: areasArray.length > 0 ? areasArray : [city],
          images: [imageUrl],
          location: {
            city,
            area,
            coordinates: [74.3142, 35.9208], // Default coordinates
          },
          isActive: true,
        }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to create service");
        return;
      }

      toast.success(data.message || "Service created successfully!");
      router.push("/dashboard/provider/services");
    } catch (err) {
      setIsSubmitting(false);
      toast.error("Network error creating service");
    }
  };

  return (
    <DashboardLayout
      user={user || { id: "", name: "Provider", email: "", role: "provider" }}
      title="Create New Service"
      subtitle="Define title, pricing model, and coverage areas in Gilgit-Baltistan"
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
              placeholder="e.g. Master Solar Inverter Installation & Repair"
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
                placeholder="e.g. 2500"
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
                label="Primary Base Area"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Jutial / Aliabad"
              />
            </div>

            <Input
              label="Service Coverage Areas (Comma-separated)"
              required
              value={serviceAreasStr}
              onChange={(e) => setServiceAreasStr(e.target.value)}
              placeholder="e.g. Gilgit City, Jutial, Danyor, Konodas"
              helperText="List the towns or neighborhoods where you can travel to perform work."
            />

            <Input
              label="Portfolio / Service Image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              helperText="Paste direct image link or use Cloudinary photo link"
            />

            <Textarea
              label="Comprehensive Service Description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the work scope, tools provided, warranty, requirements, or materials..."
              rows={5}
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Link href="/dashboard/provider/services">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                <Plus className="h-4 w-4 mr-1.5" />
                <span>Publish Service</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

