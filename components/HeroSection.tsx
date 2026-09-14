"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Building2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  MapPin,
  ShieldCheck,
  Snowflake,
  Tv,
  Zap,
  ChevronRight,
} from "lucide-react";

interface HeroSectionProps {
  onOpenBooking: (serviceName?: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenBooking }) => {
  // Stagger animation container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const floatingBadgeVariants = {
    initial: { y: 0 },
    animate: {
      y: [-4, 4, -4],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const floatingBadgeReverse = {
    initial: { y: 0 },
    animate: {
      y: [4, -4, 4],
      transition: {
        duration: 4.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-white dark:bg-zinc-950 transition-colors">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-500/10 dark:bg-blue-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-indigo-500/10 dark:bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* Subtle Monochrome Grid */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center"
        >
          {/* Left Column: Copy & High-Conversion CTAs */}
          <div className="lg:col-span-7 text-center lg:text-left">
            {/* Trust Pill / Live Urgency District Coverage */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-red-50/80 dark:bg-blue-950/50 border border-red-200/80 dark:border-blue-900/60 shadow-2xs mb-6 backdrop-blur-sm max-w-full"
            >
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600 dark:bg-blue-400" />
              </span>
              <span className="text-[11px] sm:text-xs font-semibold tracking-wide text-red-700 dark:text-red-300 flex items-center gap-1.5 flex-wrap">
                <MapPin className="w-3.5 h-3.5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <span>Aurangabad • Arwal • Rohtas • Gaya • Jehanabad • Patna</span>
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-[1.15] sm:leading-[1.15] break-words"
            >
              Aap Requirement Batayein,{" "}
              <span className="block mt-1 sm:mt-2 text-blue-600 dark:text-blue-400">
                Arrangement Hum Sambhalenge.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={itemVariants}
              className="mt-6 text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
            >
              Your one-stop solution for reliable appliance repairs and complete office, school, and institutional setups across Bihar. Verified professionals, genuine parts, and quality assurance.
            </motion.p>

            {/* Primary Action Buttons */}
            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <button
                onClick={() => onOpenBooking()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full font-bold text-base text-white dark:text-zinc-950 bg-zinc-950 dark:bg-white hover:bg-blue-600 dark:hover:bg-blue-500 dark:hover:text-white shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer group"
              >
                <span>Book a Service Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href="#services"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-semibold text-base text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/90 transition-all"
              >
                <span>View All Services</span>
              </a>
            </motion.div>
          </div>

          {/* Right Column: Interactive Visual Showcase */}
          <div className="lg:col-span-5 relative">
            {/* Decorative Floating Badges */}
            <motion.div
              variants={floatingBadgeVariants}
              initial="initial"
              animate="animate"
              className="hidden sm:flex absolute -top-4 -right-2 z-20 items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-zinc-900/90 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700/80 shadow-lg backdrop-blur-md text-xs font-semibold"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Genuine Spares Warranty</span>
            </motion.div>

            <motion.div
              variants={floatingBadgeReverse}
              initial="initial"
              animate="animate"
              className="hidden sm:flex absolute -bottom-4 -left-3 z-20 items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-zinc-900/90 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700/80 shadow-lg backdrop-blur-md text-xs font-semibold"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Express Doorstep Service</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative mx-auto max-w-md lg:max-w-none"
            >
              {/* Main Visual Card Container */}
              <div className="relative rounded-3xl bg-white/90 dark:bg-zinc-900/90 p-6 sm:p-7 border border-zinc-200 dark:border-zinc-800 shadow-xl backdrop-blur-xl">
                {/* Header of Preview Card */}
                <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-zinc-950 dark:text-white">Active Service Hub</h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Available across Bihar today</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live &amp; Ready
                  </span>
                </div>

                {/* Service Highlights Stack */}
                <div className="mt-4 space-y-3">
                  {/* Item 1: AC & HVAC Service */}
                  <div
                    onClick={() => onOpenBooking("Air Conditioner (AC) Repair, Service & Installation")}
                    className="group cursor-pointer p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-blue-500 dark:hover:border-blue-500/80 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all flex items-center justify-between shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform flex-shrink-0">
                        <Snowflake className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          AC Repair, Gas Refill &amp; Installation
                        </h3>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Jet foam wash, leak fix &amp; PCB repair</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0">
                      <span className="hidden sm:inline">Book</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Item 2: Appliances & Smart Devices */}
                  <div
                    onClick={() => onOpenBooking("Refrigerator Repair & Maintenance")}
                    className="group cursor-pointer p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-indigo-500 dark:hover:border-indigo-500/80 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all flex items-center justify-between shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform flex-shrink-0">
                        <Tv className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          Refrigerator, TV &amp; Washing Machine
                        </h3>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Display panel, motor &amp; thermostat repair</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0">
                      <span className="hidden sm:inline">Book</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Item 3: Bank & Institutional Setup */}
                  <div
                    onClick={() => onOpenBooking("Complete Turnkey Branch & Office Setup")}
                    className="group cursor-pointer p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-purple-500 dark:hover:border-purple-500/80 hover:bg-purple-50/30 dark:hover:bg-purple-950/20 transition-all flex items-center justify-between shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform flex-shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          Bank, Office &amp; Turnkey Facility Setup
                        </h3>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Workstations, networking, CCTV &amp; power</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0">
                      <span className="hidden sm:inline">Consult</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Micro Guarantee Banner */}
                <div className="mt-4 p-3 rounded-2xl bg-zinc-950 dark:bg-zinc-950 text-white border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-xs font-medium text-zinc-300">
                      Verified Technicians • 100% Genuine Spare Parts
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-white bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-700 flex-shrink-0">
                    Bihar Verified
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
