import React from "react";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import {
  MapPin,
  Search,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Star,
  Users,
  Wrench,
  ArrowRight,
  Sparkles,
  Zap,
  Hammer,
  Laptop,
  Code,
  BookOpen,
  Camera,
  Paintbrush,
} from "lucide-react";
import connectToDatabase from "@/lib/mongodb";
import { Category, Service, ProviderProfile } from "@/models";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/common/RatingStars";
import { VerifiedBadge } from "@/components/common/VerifiedBadge";
import ClientMapWrapper from "@/components/common/ClientMapWrapper";

export default async function HomePage() {
  const t = await getTranslations("hero");
  const tHome = await getTranslations("home");

  await connectToDatabase();

  // Fetch real data from MongoDB
  const [categories, featuredServices, featuredProviders] = await Promise.all([
    Category.find({ isActive: true }).limit(8).lean(),
    Service.find({ isActive: true })
      .populate("category", "name slug icon")
      .populate("provider", "name profileImage")
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
    ProviderProfile.find({ verificationStatus: "verified" })
      .populate("user", "name profileImage")
      .populate("serviceCategories", "name")
      .sort({ averageRating: -1 })
      .limit(3)
      .lean(),
  ]);

  // Map markers for Leaflet map
  const mapMarkers = featuredServices
    .filter((s: any) => s.location?.coordinates && s.location.coordinates.length === 2)
    .map((s: any) => ({
      id: s._id.toString(),
      title: s.title,
      subtitle: `${s.area || s.city} • ${(s.category as any)?.name || "Service"}`,
      coordinates: s.location.coordinates as [number, number],
      price: s.price,
      url: `/services/${s._id}`,
    }));

  const iconComponents: Record<string, any> = {
    Zap,
    Wrench,
    Hammer,
    Laptop,
    Code,
    BookOpen,
    Camera,
    Paintbrush,
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-900 via-brand-800 to-indigo-950 text-white py-20 lg:py-28">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-brand-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-tealbrand-400/30 bg-tealbrand-950/60 px-4 py-1.5 text-xs font-semibold text-tealbrand-300 backdrop-blur-md mb-6 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-tealbrand-400" />
            <span>{t("badge")}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            {t("title")}
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>

          {/* Hero Interactive Search Form */}
          <div className="mt-10 mx-auto max-w-3xl rounded-2xl bg-white p-3 shadow-2xl">
            <form action="/services" method="GET" className="flex flex-col sm:flex-row items-center gap-2">
              <div className="flex flex-1 items-center gap-2.5 w-full px-3 py-2 border-b sm:border-b-0 sm:border-r border-slate-200">
                <Search className="h-5 w-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  name="q"
                  placeholder={t("searchPlaceholder")}
                  className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-48 px-3 py-2 border-b sm:border-b-0 sm:border-r border-slate-200">
                <MapPin className="h-4 w-4 text-brand-600 shrink-0" />
                <select
                  name="city"
                  defaultValue="all"
                  aria-label="Select City"
                  className="w-full bg-transparent text-sm text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">{t("allCities")}</option>
                  <option value="Gilgit">Gilgit</option>
                  <option value="Skardu">Skardu</option>
                  <option value="Hunza">Hunza</option>
                  <option value="Ghizer">Ghizer</option>
                  <option value="Astore">Astore</option>
                  <option value="Diamer">Diamer</option>
                </select>
              </div>

              <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto shrink-0">
                <span>{t("searchButton")}</span>
              </Button>
            </form>
          </div>

          {/* Quick Metrics */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto border-t border-indigo-800/60 pt-8 text-center">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-tealbrand-400">100%</span>
              <span className="text-xs text-slate-300 mt-1">{t("verifiedCount")}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-brand-300">98%</span>
              <span className="text-xs text-slate-300 mt-1">{t("satisfactionRate")}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-white">Gilgit-Baltistan</span>
              <span className="text-xs text-slate-300 mt-1">Multi-Valley Regional Coverage</span>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {tHome("popularCategories")}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {tHome("categoriesSubtitle")}
              </p>
            </div>
            <Link
              href="/services"
              className="mt-4 sm:mt-0 text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>{tHome("viewAllCategories")}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((cat: any) => {
              const Icon = iconComponents[cat.icon] || Wrench;
              return (
                <Link
                  key={cat._id.toString()}
                  href={`/services?category=${cat.slug}`}
                  className="group relative flex flex-col items-center text-center p-6 rounded-2xl border border-slate-200 bg-white hover:border-brand-500 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-200 mb-4 shadow-2xs">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 group-hover:text-brand-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                    {cat.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-slate-50 border-y border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Simple 3-Step Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-2">
              {tHome("howItWorksTitle")}
            </h2>
            <p className="mt-2 text-sm text-slate-500">{tHome("howItWorksSubtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative flex flex-col items-center p-8 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white font-black text-lg mb-4 shadow-sm">
                1
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">
                {tHome("step1Title")}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {tHome("step1Desc")}
              </p>
            </div>

            <div className="relative flex flex-col items-center p-8 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-tealbrand-600 text-white font-black text-lg mb-4 shadow-sm">
                2
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">
                {tHome("step2Title")}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {tHome("step2Desc")}
              </p>
            </div>

            <div className="relative flex flex-col items-center p-8 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-lg mb-4 shadow-sm">
                3
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">
                {tHome("step3Title")}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {tHome("step3Desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {tHome("recentServices")}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {tHome("recentServicesSubtitle")}
              </p>
            </div>
            <Link
              href="/services"
              className="mt-4 sm:mt-0 text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>{tHome("viewAllServices")}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredServices.map((svc: any) => (
              <div
                key={svc._id.toString()}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:border-slate-300 hover:shadow-lg transition-all duration-200"
              >
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={svc.images?.[0] || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80"}
                    alt={svc.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 rounded-lg bg-white/90 backdrop-blur-xs px-2.5 py-1 text-xs font-bold text-brand-700 shadow-2xs">
                    PKR {svc.price.toLocaleString()} {svc.priceType === "hourly" ? "/ hr" : ""}
                  </div>
                  <div className="absolute top-3 left-3 rounded-lg bg-slate-900/70 backdrop-blur-xs px-2.5 py-1 text-[11px] font-medium text-white flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-tealbrand-400" />
                    <span>{svc.area || svc.city}</span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-semibold text-tealbrand-700 bg-tealbrand-50 px-2 py-0.5 rounded-md">
                      {(svc.category as any)?.name}
                    </span>
                    <RatingStars rating={4.9} totalReviews={12} size="sm" />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
                    {svc.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed flex-1">
                    {svc.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-xs">
                        {(svc.provider as any)?.name?.charAt(0) || "P"}
                      </div>
                      <span className="text-xs font-medium text-slate-700 truncate max-w-[110px]">
                        {(svc.provider as any)?.name}
                      </span>
                    </div>

                    <Link href={`/services/${svc._id}`}>
                      <Button variant="primary" size="sm">
                        View Service
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Regional Service Map */}
      <section className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-tealbrand-700">
              Location-Based Discovery
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-2">
              Explore Active Services in Gilgit-Baltistan
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Interactive map visualizing verified trade specialists and active bookings across Gilgit, Skardu, and Hunza.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-3 shadow-md border border-slate-200">
            <ClientMapWrapper markers={mapMarkers} height="420px" zoom={11} />
          </div>
        </div>
      </section>

      {/* Safety & Verification Trust Banner */}
      <section id="safety" className="py-16 bg-white border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-indigo-950 p-8 sm:p-12 text-white">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-tealbrand-500/20 px-3.5 py-1 text-xs font-semibold text-tealbrand-300 mb-4">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Platform Verification Standards</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {tHome("why1Title")}
                </h3>
                <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                  {tHome("why1Desc")} We review trade experience, physical service areas, and identity records to protect households and customers across Gilgit-Baltistan.
                </p>
                <div className="mt-6 flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-tealbrand-400" />
                    <span>No fake customer reviews</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-tealbrand-400" />
                    <span>Admin dispute resolution</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-tealbrand-400" />
                    <span>Transparent upfront quotes</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 lg:justify-end">
                <Link href="/services">
                  <Button variant="teal" size="lg" className="w-full sm:w-auto">
                    {t("exploreCta")}
                  </Button>
                </Link>
                <Link href="/register?role=provider">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/10 text-white border-white/20 hover:bg-white/20">
                    {t("providerCta")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
