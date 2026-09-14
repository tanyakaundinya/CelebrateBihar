"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  ArrowRight,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Search,
  Wrench,
} from "lucide-react";
import { serviceData, ServiceItem, ServiceCategory } from "@/data/services";

interface ServiceGridProps {
  onSelectService: (serviceName: string) => void;
  onOpenConsultation?: (serviceName?: string) => void;
}

export const ServiceGrid: React.FC<ServiceGridProps> = ({
  onSelectService,
  onOpenConsultation,
}) => {
  const [categoriesData, setCategoriesData] = useState<ServiceCategory[]>(serviceData);
  const [activeMainTab, setActiveMainTab] = useState<string>("all");
  const [subFilter, setSubFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  React.useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategoriesData(data.categories);
        }
      })
      .catch(() => {});
  }, []);

  // Sub-filter tabs for granular browsing (Clean text pills)
  const subFilterOptions = [
    { id: "all", label: "All Types" },
    { id: "cooling", label: "Cooling & AC" },
    { id: "appliances", label: "TV & Appliances" },
    { id: "electrical", label: "Electrical & Wiring" },
    { id: "plumbing", label: "Plumbing & Sanitary" },
    { id: "furniture", label: "Furniture & Assembly" },
    { id: "turnkey", label: "Turnkey Setup" },
  ];

  // Filter categories and their services
  const getFilteredCategories = (): ServiceCategory[] => {
    return categoriesData
      .filter((category) => {
        if (activeMainTab === "all") return true;
        return category.id === activeMainTab;
      })
      .map((category) => {
        const filteredServices = category.services.filter((service) => {
          // Sub-filter match
          const matchesSubFilter =
            subFilter === "all" || service.group === subFilter;

          // Search query match
          const matchesSearch =
            !searchQuery.trim() ||
            service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.features.some((f) =>
              f.toLowerCase().includes(searchQuery.toLowerCase())
            );

          return matchesSubFilter && matchesSearch;
        });

        return {
          ...category,
          services: filteredServices,
        };
      })
      .filter((category) => category.services.length > 0);
  };

  const filteredCategories = getFilteredCategories();

  const handleServiceAction = (service: ServiceItem, categoryId: string) => {
    if (categoryId === "bank-office-setup") {
      if (onOpenConsultation) {
        onOpenConsultation(service.name);
      } else {
        onSelectService(service.name);
      }
    } else {
      onSelectService(service.name);
    }
  };

  return (
    <section
      id="services"
      className="py-16 md:py-24 bg-white dark:bg-zinc-950 transition-colors relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            Our Service Catalog
          </h2>

          <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
            From single-room doorstep appliance fixes to end-to-end commercial bank and office turnkey setups. Certified professionals, verified parts, and guaranteed satisfaction.
          </p>

          {/* Primary Track Tabs */}
          <div className="mt-6 inline-flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs max-w-full overflow-x-auto">
            <button
              onClick={() => {
                setActiveMainTab("all");
                setSubFilter("all");
              }}
              className={`px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${activeMainTab === "all"
                ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                }`}
            >
              All Offerings
            </button>

            <button
              onClick={() => {
                setActiveMainTab("repair-maintenance");
                setSubFilter("all");
              }}
              className={`px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${activeMainTab === "repair-maintenance"
                ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                }`}
            >
              A. Repair &amp; Maintenance (13)
            </button>

            <button
              onClick={() => {
                setActiveMainTab("bank-office-setup");
                setSubFilter("all");
              }}
              className={`px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${activeMainTab === "bank-office-setup"
                ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                }`}
            >
              B. Bank &amp; Institutional Setup (6)
            </button>
          </div>
        </div>

        {/* Dedicated Filter & Search Control Bar */}
        <div className="mb-8 p-2 sm:p-2.5 rounded-2xl bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-xs">
          {/* Sub-Filter Type Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {subFilterOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSubFilter(opt.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${subFilter === opt.id
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs"
                  : "bg-white/70 dark:bg-zinc-800/70 text-zinc-600 dark:text-zinc-400 border border-zinc-200/70 dark:border-zinc-700/70 hover:bg-white dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white"
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search service, part, or repair..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 px-1 py-0.5"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Institutional Facility Strip */}
        {(activeMainTab === "bank-office-setup" || activeMainTab === "all") && (
          <div className="mb-10 p-3.5 sm:p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
                Commercial &amp; Institutional Spaces Supported:
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  "Banks & Branches",
                  "Corporate Offices",
                  "Retail Shops & Showrooms",
                  "Educational Institutions",
                  "Govt & Private Establishments",
                ].map((space, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-blue-200 dark:border-blue-900/60 shadow-2xs"
                  >
                    <CheckCircle2 className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                    {space}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Categories & Compact Service Cards */}
        {filteredCategories.length > 0 ? (
          <div className="space-y-12">
            {filteredCategories.map((category) => (
              <div key={category.id} className="space-y-4">
                {/* Clean Category Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg sm:text-xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
                        {category.categoryName}
                      </h3>
                      <span className="text-[11px] px-2 py-0.5 rounded-md font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                        {category.services.length} Offerings
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                      {category.description}
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 self-start sm:self-auto">
                    <Shield className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    <span>{category.badge}</span>
                  </div>
                </div>

                {/* Compact Service Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {category.services.map((service) => (
                    <motion.div
                      key={service.id}
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => handleServiceAction(service, category.id)}
                      className="bg-white dark:bg-zinc-900/90 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-zinc-400 dark:hover:border-zinc-600 transition-all flex flex-col justify-between group relative cursor-pointer"
                    >
                      <div>
                        {/* Doorstep Service Tag placed within the block */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900/60">
                            <ShieldCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            {service.group === "turnkey" ? "Turnkey Setup" : "Doorstep Service"}
                          </span>
                        </div>

                        {/* Title & Short Description */}
                        <h4 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                          {service.name}
                        </h4>

                        <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal line-clamp-2">
                          {service.shortDesc}
                        </p>

                        {/* Included Scope Checkpoints */}
                        <div className="mt-3.5 space-y-1.5 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                            Included Service Scope:
                          </div>
                          {service.features.map((feature, fIdx) => (
                            <div
                              key={fIdx}
                              className="flex items-start gap-1.5 text-[11px] sm:text-xs text-zinc-700 dark:text-zinc-300 font-medium leading-tight"
                            >
                              <CheckCircle className="w-3 h-3 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleServiceAction(service, category.id);
                          }}
                          className={`w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer group/btn ${category.id === "bank-office-setup"
                            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-blue-600 dark:hover:bg-blue-500 dark:hover:text-white"
                            : "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-xs shadow-blue-600/20"
                            }`}
                        >
                          <span>
                            {category.id === "bank-office-setup"
                              ? "Request Free BOQ & Consultation"
                              : `Book ${service.name.split(" ")[0]} Service`}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State for Filters */
          <div className="text-center py-12 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <Wrench className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              No matching services found
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              We provide custom technical assistance for all unique requirements.
            </p>
            <button
              onClick={() => {
                setActiveMainTab("all");
                setSubFilter("all");
                setSearchQuery("");
              }}
              className="mt-3 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Scalability Notice & Custom Service Banner */}
        <div className="mt-16 p-6 sm:p-8 rounded-3xl bg-zinc-950 dark:bg-zinc-900 text-white border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              Have a Custom Appliance, Machine or Enterprise Requirement?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
              Celebrate Bihar acts as your dedicated service coordination partner. If your requirement is not listed above, our senior supervisor will arrange certified technicians for you.
            </p>
          </div>

          <button
            onClick={() =>
              onOpenConsultation
                ? onOpenConsultation("Custom Repair & Setup Requirement")
                : onSelectService("Other Custom Repair Requirements")
            }
            className="px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-zinc-950 bg-white hover:bg-zinc-100 shadow-md transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
          >
            Submit Custom Request
          </button>
        </div>
      </div>
    </section>
  );
};
