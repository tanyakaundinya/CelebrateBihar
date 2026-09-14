"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Zap,
  CheckCircle2,
  HeartHandshake,
  Clock,
  BadgeCheck,
  Check,
} from "lucide-react";

interface WhyChooseUsProps {
  onOpenBooking: () => void;
  onOpenConsultation?: () => void;
}

export const WhyChooseUs: React.FC<WhyChooseUsProps> = ({
  onOpenBooking,
  onOpenConsultation,
}) => {
  const pillars = [
    {
      // icon: <ShieldCheck className="w-4 h-4" />,
      title: "100% Verified Local Experts",
      description:
        "Every technician and setup professional undergoes official background checks and skill verification.",
    },
    {
      // icon: <CheckCircle2 className="w-4 h-4" />,
      title: "Complete Scope Clarity",
      description:
        "Full upfront inspection and itemized scope approval before any work begins. Zero surprises, zero hassle.",
    },
    {
      // icon: <Clock className="w-4 h-4" />,
      title: "60-Minute Rapid Response",
      description:
        "Emergency AC or electrical breakdown? Rapid dispatch units reach locations in top Bihar cities in under 60 minutes.",
    },
    {
      // icon: <BadgeCheck className="w-4 h-4" />,
      title: "30-Day Re-work Warranty",
      description:
        "Complete peace of mind. If any repaired appliance encounters issues within 30 days, we fix it with zero hassle.",
    },
    {
      // icon: <HeartHandshake className="w-4 h-4" />,
      title: "Turnkey Setup Management",
      description:
        "From small startups to institutional spaces, our dedicated team handles furniture, wiring, HVAC, and decor.",
    },
    {
      // icon: <Zap className="w-4 h-4" />,
      title: "Authentic Spares Only",
      description:
        "We source genuine OEM spare parts with manufacturer serial numbers to ensure longevity, safety, and performance.",
    },
  ];

  return (
    <section id="why-us" className="py-12 md:py-16 bg-zinc-50 dark:bg-zinc-900/40 border-y border-zinc-200/80 dark:border-zinc-800/80 transition-colors relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          {/* <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 mb-2">
            <HeartHandshake className="w-3.5 h-3.5" />
            The Bihar Promise
          </div> */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            Why Bihar Trusts Celebrate Bihar
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-normal">
            Solving the reliability gap in local services with corporate-grade accountability and deep local understanding.
          </p>
        </div>

        {/* Compact Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-4.5">
          {pillars.map((pillar, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.06, duration: 0.35 }}
              whileHover={{ y: -3 }}
              className="bg-white dark:bg-zinc-950 rounded-2xl p-4 sm:p-5 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  {pillar.icon}
                </div> */}
                <h3 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white mb-1.5">
                  {pillar.title}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                  {pillar.description}
                </p>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-1.5 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span>Standardized Service Protocol</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Compact Banner CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-8 sm:mt-10 rounded-2xl bg-zinc-950 dark:bg-zinc-900 border border-zinc-800 p-5 sm:p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg"
        >
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Need a Custom Office Setup or Urgent Repair?
            </h3>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-lg">
              Talk to our Bihar district operations lead today. We provide upfront scope clarity and customized execution schedules.
            </p>
          </div>

          <button
            onClick={onOpenConsultation || onOpenBooking}
            className="px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm text-zinc-950 bg-white hover:bg-zinc-100 shadow-sm transition-all cursor-pointer flex-shrink-0"
          >
            Schedule Free Consultation
          </button>
        </motion.div>
      </div>
    </section>
  );
};

