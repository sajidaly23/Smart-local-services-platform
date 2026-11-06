import React from "react";
import { Link } from "@/i18n/routing";
import { MapPin, ShieldCheck, Heart, Mail, Phone } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-500 to-tealbrand-400">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Local<span className="text-tealbrand-400">Connect</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering local trade specialists, technical experts, and service seekers
              throughout Gilgit-Baltistan with transparent bookings and verified credentials.
            </p>
            <div className="flex items-center gap-2 text-xs text-tealbrand-300 bg-tealbrand-950/60 border border-tealbrand-800/40 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="h-4 w-4" />
              <span>Admin-Verified Identity Workflows</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Explore Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  All Services Directory
                </Link>
              </li>
              <li>
                <Link href="/services?category=home-repair" className="hover:text-white transition-colors">
                  Home Maintenance & Trades
                </Link>
              </li>
              <li>
                <Link href="/services?category=technical-it" className="hover:text-white transition-colors">
                  IT & Freelance Assistance
                </Link>
              </li>
              <li>
                <Link href="/register?role=provider" className="hover:text-white transition-colors">
                  Join as Service Provider
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-white transition-colors">
                  Verification Standards
                </Link>
              </li>
            </ul>
          </div>

          {/* Covered Regions */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Coverage Locations
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Gilgit City",
                "Skardu",
                "Hunza (Aliabad / Karimabad)",
                "Danyor",
                "Jutial",
                "Konodas",
                "Nagar",
                "Ghizer (Gupis)",
                "Astore",
                "Diamer (Chilas)",
              ].map((loc) => (
                <span
                  key={loc}
                  className="rounded-md bg-slate-800 px-2.5 py-1 text-xs text-slate-300 border border-slate-700/60"
                >
                  {loc}
                </span>
              ))}
            </div>
          </div>

          {/* Contact & FYP Info */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Project Information
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Developed as a University Final Year Project (FYP) for Smart Local Community &
              Marketplace development in Gilgit-Baltistan, Pakistan.
            </p>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-tealbrand-400" />
                <span>support@localconnect.pk</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-tealbrand-400" />
                <span>+92 (05811) 554433</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            &copy; {new Date().getFullYear()} LocalConnect — Smart Local Community & Service Marketplace. All rights reserved.
          </p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" /> for Gilgit-Baltistan
          </p>
        </div>
      </div>
    </footer>
  );
};

