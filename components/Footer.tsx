"use client";

import React from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Heart,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface FooterProps {
  onOpenBooking: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenBooking }) => {
  const coverageCities = [
    "Aurangabad",
    "Arwal",
    "Rohtas",
    "Gaya",
    "Jehanabad",
    "Patna",
  ];

  return (
    <footer id="coverage" className="bg-zinc-950 text-white pt-12 sm:pt-20 pb-8 sm:pb-12 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 pb-12 sm:pb-16 border-b border-zinc-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex flex-col group">
              <span className="text-2xl font-black tracking-tight text-white group-hover:opacity-90 transition-opacity">
                Celebrate <span className="text-blue-500 dark:text-blue-400">Bihar</span>
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 mt-1">
                Aapki Requirement, Hamari Zimmedari
              </span>
            </Link>

            <p className="text-sm text-zinc-400 max-w-sm leading-relaxed font-normal">
              &quot;Aap Requirement Batayein, Arrangement Hum Sambhalenge&quot; — Bihar&apos;s premier platform delivering standardized, dependable home and enterprise solutions with 100% service transparency and certified excellence.
            </p>

            <div className="pt-2 flex flex-col gap-2.5 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-zinc-400" />
                <span>24x7 Customer Support: <strong>+91 98765 43210</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-zinc-400" />
                <span>Email: <strong>support@celebratebihar.com</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-zinc-400" />
                <span>Central Ops: Patna, Bihar • Serving Aurangabad, Arwal, Rohtas, Gaya, Jehanabad &amp; Patna</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Our Services
            </h4>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              <li>
                <button
                  onClick={onOpenBooking}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  AC Service &amp; Repair
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenBooking}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Complete Office Setup
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenBooking}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Institution &amp; Lab Setup
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenBooking}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Commercial IT &amp; Networking
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenBooking}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Emergency Breakdown Fixes
                </button>
              </li>
            </ul>
          </div>

          {/* Company & Trust */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Why Celebrate Bihar
            </h4>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              <li>
                <a href="#why-us" className="hover:text-white transition-colors">
                  Background Checked Pros
                </a>
              </li>
              <li>
                <a href="#why-us" className="hover:text-white transition-colors">
                  Standardized Service Guarantee
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenBooking}
                  className="hover:text-white transition-colors inline-flex items-center gap-1 text-zinc-200 font-semibold cursor-pointer"
                >
                  <span>Book Instant Service</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="hover:text-white transition-colors inline-flex items-center gap-1.5 text-zinc-400 hover:text-blue-400 font-medium text-xs mt-2 pt-2 border-t border-zinc-800/80 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Admin Desk</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Districts Coverage */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Active Bihar Hubs
              </h4>
              <ThemeToggle variant="pill" className="scale-90" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {coverageCities.map((city) => (
                <span
                  key={city}
                  className="text-[11px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-1 rounded hover:text-white hover:border-zinc-700 transition-colors"
                >
                  {city}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex items-center justify-center text-center text-xs text-zinc-500">
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-zinc-400" />
            <span>Celebrate Bihar Pvt. Ltd. &copy; {new Date().getFullYear()}. All Rights Reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
