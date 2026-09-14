"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  CheckCircle2,
  MapPin,
  FileCheck2,
} from "lucide-react";

export const StatsSection: React.FC = () => {
  const commitments = [
    {
      icon: <CheckCircle2 className="w-5 h-5 text-blue-400" />,
      tag: "Service Guarantee",
      title: "30-Day Re-work Warranty",
      description:
        "Complete peace of mind. If any repaired appliance encounters issues within 30 days, we fix it with zero hassle.",
      highlight: "30-Day Post-Service Guarantee",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      tag: "Verified Workforce",
      title: "100% Background Checked",
      description:
        "Every technician and electrician undergoes official identity and trade skill verification.",
      highlight: "Official ID & Skill Verified",
    },
    {
      icon: <MapPin className="w-5 h-5 text-blue-400" />,
      tag: "Local Operations",
      title: "6 Dedicated District Hubs",
      description:
        "Direct local technician dispatch across Aurangabad, Arwal, Rohtas, Gaya, Jehanabad & Patna.",
      highlight: "Verified Local Experts",
    },
    {
      icon: <FileCheck2 className="w-5 h-5 text-amber-400" />,
      tag: "Scope Transparency",
      title: "Upfront Scope Approval",
      description:
        "Technicians inspect and explain the required fix before starting any work. No surprises, complete peace of mind.",
      highlight: "You Approve Before Work Begins",
    },
  ];

  return (
    <section className="py-16 bg-zinc-950 text-white border-y border-zinc-800/80 relative overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/20 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-10 pb-6 border-b border-zinc-800/80">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-950/60 text-blue-300 border border-blue-900 mb-2">
              <span>The Celebrate Bihar Service Protocol</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Customer Guarantees on Every Booking
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md">
            We operate with corporate-grade accountability, verified technicians, and transparent customer protections across Bihar.
          </p>
        </div>

        {/* 4 Feature Assurance Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {commitments.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.45 }}
              whileHover={{ y: -4 }}
              className="group relative rounded-2xl bg-zinc-900/90 border border-zinc-800 p-6 flex flex-col justify-between hover:border-zinc-700 transition-all shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 group-hover:border-zinc-700 transition-colors">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 bg-zinc-950 px-2.5 py-1 rounded-full border border-zinc-800">
                    {item.tag}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {item.highlight && (
                <div className="mt-5 pt-3.5 border-t border-zinc-800/80 text-[11px] font-bold text-zinc-300">
                  <span>{item.highlight}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
