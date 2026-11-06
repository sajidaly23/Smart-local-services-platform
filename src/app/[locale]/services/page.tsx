"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Link } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import {
  Search,
  MapPin,
  Filter,
  CheckCircle2,
  SlidersHorizontal,
  Map as MapIcon,
  Grid,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/common/RatingStars";
import { VerifiedBadge } from "@/components/common/VerifiedBadge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("@/components/common/LeafletMap"), {
  ssr: false,
  loading: () => <LoadingSpinner message="Loading map..." />,
});

export default function ServicesPage() {
  const searchParams = useSearchParams();

  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  // Filters
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [selectedCity, setSelectedCity] = useState(searchParams.get("city") || "all");
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get("verified") === "true");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch Categories & Locations on mount
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setCategories(d.categories);
      })
      .catch(() => {});

    fetch("/api/locations")
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setLocations(d.locations);
      })
      .catch(() => {});
  }, []);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      if (selectedCity !== "all") params.set("city", selectedCity);
      if (verifiedOnly) params.set("verifiedOnly", "true");
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (sortBy) params.set("sort", sortBy);
      params.set("page", page.toString());
      params.set("limit", "12");

      const res = await fetch(`/api/services?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setServices(data.services);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedCity, verifiedOnly, minPrice, maxPrice, sortBy, page]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedCity("all");
    setVerifiedOnly(false);
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
    setPage(1);
  };

  const mapMarkers = services
    .filter((s: any) => s.location?.coordinates && s.location.coordinates.length === 2)
    .map((s: any) => ({
      id: s._id,
      title: s.title,
      subtitle: `${s.area || s.city} • ${s.category?.name || "Service"}`,
      coordinates: s.location.coordinates as [number, number],
      price: s.price,
      url: `/services/${s._id}`,
    }));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header Title & Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/" className="hover:text-brand-600">Home</Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Services</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Browse Local Services
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Found {totalCount} local trade & professional services across Gilgit-Baltistan
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-2xs self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewMode === "grid"
                    ? "bg-brand-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Grid className="h-4 w-4" />
                <span>Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewMode === "map"
                    ? "bg-brand-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <MapIcon className="h-4 w-4" />
                <span>Map View</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs mb-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search services or skills..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              aria-label="Select Category"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:border-brand-500 focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* City Select */}
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setPage(1);
              }}
              aria-label="Select City"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:border-brand-500 focus:outline-none cursor-pointer"
            >
              <option value="all">All Gilgit-Baltistan</option>
              <option value="Gilgit">Gilgit City</option>
              <option value="Skardu">Skardu</option>
              <option value="Hunza">Hunza Valley</option>
              <option value="Ghizer">Ghizer (Gupis)</option>
              <option value="Nagar">Nagar</option>
              <option value="Diamer">Diamer (Chilas)</option>
              <option value="Astore">Astore</option>
            </select>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              aria-label="Sort By"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:border-brand-500 focus:outline-none cursor-pointer"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most Booked</option>
            </select>
          </div>

          {/* Secondary Filters: Verified checkbox & Reset */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 select-none">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => {
                  setVerifiedOnly(e.target.checked);
                  setPage(1);
                }}
                className="h-4 w-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
              />
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-tealbrand-600" />
                Verified Specialists Only
              </span>
            </label>

            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 text-slate-500 hover:text-rose-600 font-medium transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        {/* Content Section: Grid or Map */}
        {loading ? (
          <LoadingSpinner message="Searching services across Gilgit-Baltistan..." />
        ) : viewMode === "map" ? (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-3 shadow-sm border border-slate-200">
              <LeafletMap markers={mapMarkers} height="520px" zoom={11} />
            </div>
            <p className="text-xs text-slate-500 text-center">
              Click on any pin to view service details, price, and booking link.
            </p>
          </div>
        ) : services.length === 0 ? (
          <EmptyState
            title="No Services Found"
            description="We couldn't find any services matching your search filters. Try clearing your filters or selecting a different location."
            actionLabel="Reset All Filters"
            onAction={handleResetFilters}
          />
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {services.map((svc: any) => (
                <div
                  key={svc._id}
                  className="group flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:border-slate-300 hover:shadow-lg transition-all duration-200"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <img
                      src={
                        svc.images?.[0] ||
                        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80"
                      }
                      alt={svc.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 right-2.5 rounded-lg bg-white/95 backdrop-blur-xs px-2.5 py-1 text-xs font-bold text-brand-700 shadow-2xs">
                      PKR {svc.price.toLocaleString()} {svc.priceType === "hourly" ? "/ hr" : ""}
                    </div>
                    <div className="absolute top-2.5 left-2.5 rounded-lg bg-slate-900/75 backdrop-blur-xs px-2 py-0.5 text-[10px] font-medium text-white flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-tealbrand-400" />
                      <span>{svc.area || svc.city}</span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                      <span className="font-semibold text-tealbrand-800 bg-tealbrand-50 px-2 py-0.5 rounded">
                        {svc.category?.name || "Service"}
                      </span>
                      <RatingStars
                        rating={svc.providerProfile?.averageRating || 4.9}
                        totalReviews={svc.providerProfile?.totalReviews || 10}
                        size="sm"
                      />
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
                      {svc.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed flex-1">
                      {svc.description}
                    </p>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-[10px]">
                          {svc.provider?.name?.charAt(0) || "P"}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[90px]">
                            {svc.provider?.name}
                          </span>
                        </div>
                      </div>

                      <Link href={`/services/${svc._id}`}>
                        <Button variant="primary" size="sm">
                          Book Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-xs font-semibold text-slate-600 px-3">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

