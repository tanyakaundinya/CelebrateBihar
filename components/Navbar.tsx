"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Phone, Menu, X, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenConsultation?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBooking,
  onOpenConsultation,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled
        ? "bg-gradient-to-b from-white/95 via-sky-50/75 to-blue-100/60 dark:from-zinc-950/95 dark:via-zinc-950/90 dark:to-blue-950/40 backdrop-blur-md border-b border-blue-200/70 dark:border-blue-900/50 shadow-[0_4px_24px_-4px_rgba(59,130,246,0.12)] dark:shadow-[0_4px_24px_-4px_rgba(30,58,138,0.25)] py-3"
        : "bg-gradient-to-b from-white/90 via-sky-50/50 to-blue-50/80 dark:from-zinc-950/90 dark:via-zinc-950/85 dark:to-blue-950/30 backdrop-blur-md border-b border-blue-100/80 dark:border-blue-950/60 shadow-[0_4px_20px_-6px_rgba(59,130,246,0.08)] py-4"
        }`}
    >
      {/* Bottom Light Bluish Ambient Blend & Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-400/50 dark:via-blue-500/40 to-transparent pointer-events-none" />
      <div className="absolute -bottom-3 left-0 right-0 h-3 bg-gradient-to-b from-blue-400/10 via-blue-400/5 to-transparent dark:from-blue-500/10 dark:via-blue-500/5 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-11">
          {/* Left Group: Brand Logo & Navigation Links Closer Together */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-zinc-950 dark:text-white group-hover:opacity-90 transition-opacity">
                Celebrate <span className="text-blue-600 dark:text-blue-400">Bihar</span>
              </span>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-5 lg:gap-6">
              <a
                href="#services"
                className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
              >
                Services
              </a>
              <a
                href="#why-us"
                className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
              >
                Why Celebrate Bihar
              </a>
              <a
                href="#coverage"
                className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
              >
                Coverage Areas
              </a>
            </nav>
          </div>

          {/* Right Action Group: Free Consultation, Book Now & Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Free Consultation Button (matching Book Now styling) */}
            <button
              onClick={onOpenConsultation || onOpenBooking}
              className="hidden sm:inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 rounded-full font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 shadow-2xs hover:shadow hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer group flex-shrink-0"
            >
              <span>Free Consultation</span>
            </button>

            {/* Book Now Primary Button */}
            <button
              onClick={onOpenBooking}
              className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 rounded-full font-bold text-xs sm:text-sm text-white dark:text-zinc-950 bg-zinc-950 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer group flex-shrink-0"
            >
              <span>Book Now</span>
            </button>

            {/* Theme Toggle */}
            {/* <ThemeToggle /> */}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-gradient-to-b from-white/95 to-sky-50/90 dark:from-zinc-900/95 dark:to-blue-950/40 backdrop-blur-xl border-b border-blue-200/60 dark:border-blue-900/40 px-5 pt-3 pb-6 shadow-xl"
          >
            <div className="flex flex-col gap-3">
              <a
                href="#services"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 py-1.5"
              >
                Services
              </a>
              <a
                href="#why-us"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 py-1.5"
              >
                Why Celebrate Bihar
              </a>
              <a
                href="#coverage"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 py-1.5"
              >
                Coverage Areas
              </a>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-2.5">
                {/* Mobile Consultation Button */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenConsultation) onOpenConsultation();
                    else onOpenBooking();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 transition-colors"
                >

                  <span>Schedule Free Consultation</span>
                </button>

                {/* Mobile Book Now */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenBooking();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs text-white dark:text-zinc-950 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm"
                >
                  <span>Book a Service Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center justify-between pt-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <a
                    href="tel:+919876543210"
                    className="flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-white font-medium"
                  >
                    <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>+91 98765 43210</span>
                  </a>
                  <ThemeToggle variant="pill" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
