"use client";

import React, { useState, useEffect } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import {
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  MessageSquare,
  ArrowLeft,
  Share2,
  Wrench,
  User,
  Star,
  Check,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RatingStars } from "@/components/common/RatingStars";
import { VerifiedBadge } from "@/components/common/VerifiedBadge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/components/ui/toast";

export default function ServiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const serviceId = params.id as string;

  const [service, setService] = useState<any>(null);
  const [relatedServices, setRelatedServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("10:00 AM - 12:00 PM");
  const [bookingAddress, setBookingAddress] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");

  useEffect(() => {
    if (!serviceId) return;
    setLoading(true);

    fetch(`/api/services/${serviceId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setService(data.service);
          setRelatedServices(data.relatedServices || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [serviceId]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingBooking(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          requestedDate: bookingDate,
          requestedTime: bookingTime,
          description: bookingNotes,
          serviceAddress: bookingAddress,
          contactPhone: bookingPhone,
        }),
      });

      const data = await res.json();
      setIsSubmittingBooking(false);

      if (!res.ok || !data.success) {
        if (res.status === 401) {
          toast.error("Please sign in as a customer to submit a booking");
          router.push(`/login?callbackUrl=/services/${serviceId}`);
          return;
        }
        toast.error(data.error || "Failed to submit booking");
        return;
      }

      toast.success("Booking request sent successfully! Provider has been notified.");
      setIsBookingOpen(false);
      router.push("/dashboard/customer/bookings");
    } catch (err) {
      setIsSubmittingBooking(false);
      toast.error("Network error. Please try again.");
    }
  };

  const handleStartChat = async () => {
    if (!service?.provider?._id) return;

    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: service.provider._id,
          initialMessage: `Hello ${service.provider.name}, I am interested in your service "${service.title}".`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (res.status === 401) {
          toast.error("Please sign in to message this provider");
          router.push(`/login?callbackUrl=/services/${serviceId}`);
          return;
        }
        toast.error(data.error || "Could not open chat");
        return;
      }

      router.push("/dashboard/customer/messages");
    } catch (err) {
      toast.error("Network error opening conversation");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <LoadingSpinner message="Loading service details..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-xl font-bold text-slate-800">Service Not Found</h2>
          <p className="text-sm text-slate-500 mt-1 mb-4">
            The service you are looking for may have been removed or deactivated.
          </p>
          <Link href="/services">
            <Button variant="primary">Browse All Services</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          <span>/</span>
          <Link href="/services" className="hover:text-brand-600">Services</Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold truncate max-w-xs">{service.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Images, Description, Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image */}
            <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
              <img
                src={service.images?.[0] || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80"}
                alt={service.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-4 left-4 rounded-xl bg-slate-900/80 backdrop-blur-xs px-3 py-1.5 text-xs font-semibold text-white flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-tealbrand-400" />
                <span>{service.area || service.city}, Gilgit-Baltistan</span>
              </div>
            </div>

            {/* Title & Metadata */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="rounded-lg bg-tealbrand-50 px-3 py-1 text-xs font-bold text-tealbrand-800 border border-tealbrand-200/60">
                  {service.category?.name || "Service Category"}
                </span>
                <RatingStars
                  rating={service.providerProfile?.averageRating || 4.9}
                  totalReviews={service.providerProfile?.totalReviews || 12}
                  size="md"
                />
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {service.title}
              </h1>

              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span>Posted recently</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>{service.bookingsCount || 8} completed bookings</span>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-3">
                  Service Overview & Scope
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {service.description}
                </p>
              </div>

              {/* Coverage Areas */}
              {service.serviceAreas && service.serviceAreas.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-3">
                    Service Coverage Areas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {service.serviceAreas.map((area: string) => (
                      <span
                        key={area}
                        className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 border border-slate-200"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Related Services in Same Category */}
            {relatedServices.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 mb-4">
                  Related Services in {service.category?.name}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedServices.map((rel: any) => (
                    <Link
                      key={rel._id}
                      href={`/services/${rel._id}`}
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-brand-500 hover:shadow-2xs transition-all"
                    >
                      <img
                        src={rel.images?.[0] || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=200&q=80"}
                        alt={rel.title}
                        className="h-16 w-16 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 truncate">{rel.title}</p>
                        <p className="text-xs font-bold text-brand-600 mt-0.5">
                          PKR {rel.price.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{rel.city || "Gilgit"}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Pricing & Booking Action Card */}
          <div className="space-y-6">
            <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg space-y-6">
              {/* Pricing Box */}
              <div className="border-b border-slate-100 pb-5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Transparent Pricing
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900">
                    PKR {service.price.toLocaleString()}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {service.priceType === "fixed"
                      ? "Fixed Job Price"
                      : service.priceType === "hourly"
                      ? "per hour"
                      : "Base Quote"}
                  </span>
                </div>
              </div>

              {/* Provider Summary Card */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-700 text-white font-bold text-base shadow-2xs">
                    {service.provider?.name?.charAt(0) || "P"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {service.provider?.name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {service.providerProfile?.professionalTitle || "Service Specialist"}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <VerifiedBadge
                    status={service.providerProfile?.verificationStatus || "verified"}
                  />
                  <span className="text-slate-500 font-medium">
                    {service.providerProfile?.experienceYears || 5}+ yrs exp.
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full text-base font-bold shadow-md hover:shadow-lg"
                  onClick={() => setIsBookingOpen(true)}
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>Book This Service</span>
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  className="w-full"
                  onClick={handleStartChat}
                >
                  <MessageSquare className="h-4 w-4 mr-2 text-tealbrand-600" />
                  <span>Contact Provider</span>
                </Button>
              </div>

              {/* Trust Features */}
              <div className="border-t border-slate-100 pt-5 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Direct phone coordination with provider</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>No payment required until work completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Admin dispute assistance guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      <Modal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        title="Request Service Booking"
        description={`Booking "${service.title}" with ${service.provider?.name}`}
        size="md"
      >
        <form onSubmit={handleBookingSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Preferred Date"
              type="date"
              required
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Preferred Time Slot
              </label>
              <select
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
                aria-label="Select Time Slot"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none"
              >
                <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM (Morning)</option>
                <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM (Midday)</option>
                <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM (Afternoon)</option>
                <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM (Evening)</option>
              </select>
            </div>
          </div>

          <Input
            label="Your Exact Address / Location in GB"
            required
            value={bookingAddress}
            onChange={(e) => setBookingAddress(e.target.value)}
            placeholder="e.g. House 14, Street 2, Jutial, Gilgit"
          />

          <Input
            label="Your Contact Phone Number"
            type="tel"
            required
            value={bookingPhone}
            onChange={(e) => setBookingPhone(e.target.value)}
            placeholder="+92 344 1234567"
          />

          <Textarea
            label="Description of Required Work"
            required
            value={bookingNotes}
            onChange={(e) => setBookingNotes(e.target.value)}
            placeholder="Please detail your problem, materials available, or any specific requirements..."
            rows={3}
          />

          <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 flex items-center justify-between border border-slate-200">
            <span>Estimated Price:</span>
            <strong className="text-sm font-bold text-slate-900">
              PKR {service.price.toLocaleString()}
            </strong>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsBookingOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmittingBooking}
            >
              Confirm & Send Request
            </Button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  );
}

