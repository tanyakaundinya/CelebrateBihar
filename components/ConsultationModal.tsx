"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Building2,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  MessageSquare,
  FileText,
  Layers,
  AlertCircle,
  Briefcase,
  Wrench,
  Check,
  Zap,
  Armchair,
  Snowflake,
  Droplets,
  Camera,
} from "lucide-react";

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: string;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  onClose,
  initialCategory = "",
}) => {
  // Focus Districts in Bihar
  const biharDistricts = [
    "Aurangabad",
    "Arwal",
    "Rohtas",
    "Gaya",
    "Jehanabad",
    "Patna",
  ];

  const requirementCategories = [
    {
      id: "turnkey-setup",
      label: "Complete Turnkey Bank & Office Setup",
      desc: "End-to-end setup: Furniture, electrical, AC, plumbing & CCTV infrastructure",
      icon: Building2,
    },
    {
      id: "furniture-workspace",
      label: "Furniture & Workspace Setup",
      desc: "Workstations, ergonomic chairs, reception desks, waiting area seating & storage",
      icon: Armchair,
    },
    {
      id: "electrical-lighting",
      label: "Electrical & Lighting Infrastructure",
      desc: "Conduit wiring, modular fittings, LED lighting layouts, DB panels & power backups",
      icon: Zap,
    },
    {
      id: "cooling-climate",
      label: "Cooling & Climate Solutions",
      desc: "Commercial AC setup, ductable/cassette units, air coolers & ventilation",
      icon: Snowflake,
    },
    {
      id: "plumbing-utility",
      label: "Plumbing & Sanitary Utilities",
      desc: "Water supply systems, commercial washroom fittings, drainage & water treatment",
      icon: Droplets,
    },
    {
      id: "cctv-networking",
      label: "CCTV, Networking & Signage",
      desc: "Branding signage, HD surveillance cameras, structured LAN cabling & Wi-Fi",
      icon: Camera,
    },
    {
      id: "commercial-maintenance",
      label: "Commercial Maintenance & Heavy Repairs",
      desc: "Multi-appliance overhaul, facility AMC & fast breakdown response",
      icon: Wrench,
    },
    {
      id: "custom-setup",
      label: "Other Custom Institutional Requirement",
      desc: "Custom project coordination, specialized equipment installation & fitouts",
      icon: Briefcase,
    },
  ];

  const targetFacilityOptions = [
    "Bank / Financial Branch",
    "Corporate Office / IT Workstation",
    "Retail Shop / Commercial Showroom",
    "Educational Institution / School / College / Lab",
    "Government / Private Establishment",
    "Clinic / Healthcare Facility",
    "Other Commercial Facility",
  ];

  const projectScales = [
    "Compact Setup (1 - 10 Workstations / 500 - 1,500 sq ft)",
    "Medium Setup (10 - 30 Workstations / 1,500 - 4,000 sq ft)",
    "Large Enterprise / Multi-Floor Facility (30+ Workstations / 4,000+ sq ft)",
    "Multi-Branch Expansion Setup across Bihar",
    "Emergency Repair / Specific Infrastructure Setup",
  ];

  const callbackSlots = [
    "Immediate Callback (Within 30 Mins)",
    "Today Evening (4:00 PM - 8:00 PM)",
    "Tomorrow Morning (9:00 AM - 1:00 PM)",
    "Tomorrow Afternoon (1:00 PM - 5:00 PM)",
    "Schedule On-Site Technical Inspection",
  ];

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [orgName, setOrgName] = useState("");
  const [facilityType, setFacilityType] = useState("Bank / Financial Branch");
  const [email, setEmail] = useState("");
  const [district, setDistrict] = useState("Patna");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("Complete Turnkey Bank & Office Setup");
  const [scale, setScale] = useState("Compact Setup (1 - 10 Workstations / 500 - 1,500 sq ft)");
  const [preferredSlot, setPreferredSlot] = useState("Immediate Callback (Within 30 Mins)");
  const [projectOverview, setProjectOverview] = useState("");

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [consultationId, setConsultationId] = useState("");

  // Match initialCategory if passed
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setFormError("");

      if (initialCategory) {
        const cleanCat = initialCategory.toLowerCase().trim();
        const match = requirementCategories.find((rc) => {
          const rcClean = rc.label.toLowerCase();
          return (
            rcClean.includes(cleanCat) ||
            cleanCat.includes(rcClean) ||
            (cleanCat.includes("turnkey") && rc.id === "turnkey-setup") ||
            (cleanCat.includes("furniture") && rc.id === "furniture-workspace") ||
            ((cleanCat.includes("electrical") || cleanCat.includes("lighting")) && rc.id === "electrical-lighting") ||
            ((cleanCat.includes("cooling") || cleanCat.includes("climate") || cleanCat.includes("ac")) && rc.id === "cooling-climate") ||
            ((cleanCat.includes("plumbing") || cleanCat.includes("sanitary") || cleanCat.includes("utility")) && rc.id === "plumbing-utility") ||
            ((cleanCat.includes("cctv") || cleanCat.includes("network") || cleanCat.includes("signage")) && rc.id === "cctv-networking") ||
            ((cleanCat.includes("maintenance") || cleanCat.includes("repair")) && rc.id === "commercial-maintenance")
          );
        });

        if (match) {
          setCategory(match.label);
        } else {
          setCategory("Other Custom Institutional Requirement");
          setProjectOverview((prev) =>
            prev ? prev : `Requirement inquiry for: ${initialCategory}`
          );
        }
      }
    }
  }, [initialCategory, isOpen]);

  // Lock scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        handleResetAndClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting]);

  const handleResetAndClose = () => {
    onClose();
    setTimeout(() => {
      setIsSuccess(false);
      setFormError("");
      setCustomerName("");
      setPhoneNumber("");
      setOrgName("");
      setFacilityType("Bank / Financial Branch");
      setEmail("");
      setDistrict("Patna");
      setAddress("");
      setCategory("Complete Turnkey Bank & Office Setup");
      setScale("Compact Setup (1 - 10 Workstations / 500 - 1,500 sq ft)");
      setPreferredSlot("Immediate Callback (Within 30 Mins)");
      setProjectOverview("");
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (!customerName.trim()) {
      setFormError("Please enter your name.");
      return;
    }
    if (cleanPhone.length !== 10) {
      setFormError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!address.trim()) {
      setFormError("Please enter your locality / site address.");
      return;
    }
    if (!projectOverview.trim()) {
      setFormError("Please provide a brief overview of your setup or repair scope.");
      return;
    }

    setIsSubmitting(true);

    try {
      const genId = `CB-CON-${Math.floor(100000 + Math.random() * 900000)}`;

      const payload = {
        consultationId: genId,
        bookingId: genId,
        customerName: customerName.trim(),
        phoneNumber: cleanPhone,
        orgName: orgName.trim() || undefined,
        facilityType,
        email: email.trim() || undefined,
        district: district.trim(),
        address: address.trim(),
        category,
        serviceCategory: "Bank, Office & Institutional Setup",
        serviceName: category,
        applianceDetail: `${facilityType} • ${scale}${orgName.trim() ? ` • Org: ${orgName.trim()}` : ""}`,
        unitCount: 1,
        slot: preferredSlot,
        scale,
        projectOverview: projectOverview.trim(),
        specialNotes: `[FACILITY]: ${facilityType} | [SCALE]: ${scale} | [OVERVIEW]: ${projectOverview.trim()}${orgName.trim() ? ` | Org: ${orgName.trim()}` : ""}`,
        advanceFee: 0,
        paymentStatus: "CONSULTATION_FREE",
        payeeUpi: "N/A (Free Consultation)",
        payeeName: "Celebrate Bihar Commercial Desk",
        payerName: customerName.trim(),
        paymentAppUsed: "Free Institutional Consultation (₹0)",
        utrNumber: "INSTITUTIONAL-INQUIRY",
        status: "NEW_PENDING_DISPATCH",
      };

      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setConsultationId(data.consultationId || genId);
        setIsSuccess(true);
      } else {
        setFormError(data.error || "Failed to submit consultation request. Please try again.");
      }
    } catch (err) {
      console.error("Consultation submit error:", err);
      setFormError("Network error. Please check your connection and retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const whatsappMessage = encodeURIComponent(
    `Namaste Celebrate Bihar Team! I have submitted a Free Setup & Consultation Request [${consultationId}].\n\nName: ${customerName}\nPhone: +91 ${phoneNumber}\n${orgName ? `Organization: ${orgName}\n` : ""}Facility Type: ${facilityType}\nDistrict: ${district} (${address})\nSetup Pillar: ${category}\nScale: ${scale}\nPreferred Timing: ${preferredSlot}\n\nProject Scope:\n${projectOverview}`
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleResetAndClose}
          className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md"
        />

        {/* Modal Dialog Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden my-auto z-10 max-h-[94vh] flex flex-col"
        >
          {/* Header */}
          <div className="relative px-4 py-4 sm:px-8 sm:py-6 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-900/90 backdrop-blur-sm flex items-start justify-between gap-3 flex-shrink-0">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 mb-1.5">
                <span>Consultation &amp; Transparent BOQ</span>
              </div>
              <h3 className="text-lg sm:text-2xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
                Bank, Office &amp; Institutional Setup Desk
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Single-point coordination for newly established, renovated, or expanding commercial spaces across Bihar. Get dedicated supervisor inspection and itemized BOQ estimates.
              </p>
            </div>

            <button
              onClick={handleResetAndClose}
              disabled={isSubmitting}
              className="p-1.5 sm:p-2 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer flex-shrink-0"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-6">
            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {formError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Section 1: Facility & Setup Pillar */}
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>1. Commercial Space &amp; Setup Pillars</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Commercial Facility Type <span className="text-blue-600">*</span>
                      </label>
                      <select
                        value={facilityType}
                        onChange={(e) => setFacilityType(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 cursor-pointer"
                      >
                        {targetFacilityOptions.map((fac) => (
                          <option key={fac} value={fac}>
                            {fac}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Enterprise / Organization Name <span className="text-zinc-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        placeholder="Your company or organization name"
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                      />
                    </div>
                  </div>

                  {/* Setup Pillar Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Primary Setup Solution Pillar <span className="text-blue-600">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {requirementCategories.map((rc) => {
                        const Icon = rc.icon;
                        const isSelected = category === rc.label;
                        return (
                          <button
                            type="button"
                            key={rc.id}
                            onClick={() => setCategory(rc.label)}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${isSelected
                                ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 dark:border-blue-500 ring-1 ring-blue-500"
                                : "bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                              }`}
                          >
                            <div
                              className={`p-2 rounded-xl flex-shrink-0 ${isSelected
                                  ? "bg-blue-600 text-white"
                                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                                }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-zinc-950 dark:text-white flex items-center gap-1.5">
                                <span>{rc.label}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                              </div>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                                {rc.desc}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Section 2: Contact Information */}
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>2. Contact &amp; District Location</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Contact Person Name <span className="text-blue-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Your full name (e.g. Anand Prakash)"
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Mobile Number (+91) <span className="text-blue-600">*</span>
                      </label>
                      <div className="relative flex items-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 focus-within:ring-2 focus-within:ring-blue-600 dark:focus-within:ring-blue-400 transition-all overflow-hidden">
                        <div className="pl-3.5 pr-2 py-2.5 flex items-center gap-1.5 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 select-none">
                          <Phone className="w-3.5 h-3.5 text-zinc-400" />
                          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 font-mono">+91</span>
                        </div>
                        <div className="relative flex-1 flex items-center">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-mono tracking-widest pointer-events-none select-none">
                            <span className="opacity-0">{phoneNumber}</span>
                            <span className="text-zinc-400 dark:text-zinc-600">
                              {"X".repeat(Math.max(0, 10 - phoneNumber.length))}
                            </span>
                          </div>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                            className="w-full pl-3.5 pr-3.5 py-2.5 text-xs sm:text-sm font-mono tracking-widest bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-hidden relative z-10 font-semibold"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Official Email <span className="text-zinc-400 font-normal">(For BOQ Estimation)</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="official.email@company.com"
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-3.5">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Bihar District <span className="text-blue-600">*</span>
                      </label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 cursor-pointer"
                      >
                        {biharDistricts.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Site Location / Locality Address <span className="text-blue-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Complete site address, complex / market name"
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Project Scope & Schedule */}
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>3. Project Scale &amp; Scope Overview</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Approximate Space / Scale
                      </label>
                      <select
                        value={scale}
                        onChange={(e) => setScale(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 cursor-pointer"
                      >
                        {projectScales.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Preferred Lead Callback / Visit Slot
                      </label>
                      <select
                        value={preferredSlot}
                        onChange={(e) => setPreferredSlot(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 cursor-pointer"
                      >
                        {callbackSlots.map((cs) => (
                          <option key={cs} value={cs}>
                            {cs}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Project Requirements &amp; Deliverables Overview <span className="text-blue-600">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={projectOverview}
                      onChange={(e) => setProjectOverview(e.target.value)}
                      placeholder="Describe your setup requirements, required workstations, ACs, electrical scope, timeline..."
                      className="w-full p-3.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                    />
                  </div>
                </div>

                {/* Trust Highlights */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-zinc-900 dark:text-zinc-200">100% Free Consultation</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Direct Supervisor Callback in 30 Mins</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Single-Point Coordination &amp; Itemized BOQ</span>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-extrabold text-sm sm:text-base text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-lg shadow-blue-600/20 hover:shadow-xl transition-all cursor-pointer disabled:opacity-75"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Connecting with Bihar Setup Desk...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Free Setup &amp; BOQ Consultation</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-center text-zinc-500 dark:text-zinc-400 mt-2">
                    Zero consultation fee. Our dedicated district setup lead will call you to discuss scope and schedule inspection.
                  </p>
                </div>
              </form>
            ) : (
              /* Success Screen */
              <div className="py-6 text-center space-y-5">
                {/* Animated Blue Tick Forming Badge */}
                <div className="relative mx-auto w-24 h-24 flex items-center justify-center my-2">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [0.8, 1.4, 1.15], opacity: [0, 0.45, 0.2] }}
                    transition={{ duration: 1.6, ease: "easeOut", repeat: Infinity, repeatType: "reverse" }}
                    className="absolute inset-0 rounded-full bg-blue-500/30 dark:bg-blue-400/25 blur-xl pointer-events-none"
                  />
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0.8 }}
                    animate={{ scale: 1.45, opacity: 0 }}
                    transition={{ duration: 1.8, ease: "easeOut", repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-2 border-blue-500/50 dark:border-blue-400/50 pointer-events-none"
                  />
                  <motion.div
                    initial={{ scale: 0, rotate: -25 }}
                    animate={{ scale: [0, 1.18, 1], rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.05 }}
                    className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 via-blue-500 to-sky-400 shadow-xl shadow-blue-500/35 flex items-center justify-center"
                  >
                    <svg className="w-12 h-12 text-white" viewBox="0 0 52 52" fill="none">
                      <motion.circle
                        cx="26"
                        cy="26"
                        r="23"
                        stroke="rgba(255, 255, 255, 0.4)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                      <motion.path
                        d="M15 27 L22.5 34.5 L37 19"
                        stroke="#ffffff"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.5, ease: "easeInOut", delay: 0.35 }}
                      />
                    </svg>
                  </motion.div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900/60">
                    Consultation Request Registered
                  </span>
                  <h3 className="text-2xl font-extrabold text-zinc-950 dark:text-white">
                    Setup Consultation Logged!
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                    Namaste <strong>{customerName}</strong>! Your setup inquiry for <strong>{district}</strong> has been assigned to our Bihar commercial operations supervisor.
                  </p>
                </div>

                {/* Consultation Details Summary Card */}
                <div className="max-w-lg mx-auto p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-left text-xs space-y-2.5">
                  <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                    <span className="text-zinc-500">Inquiry Ref ID:</span>
                    <span className="font-mono font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                      {consultationId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Commercial Facility:</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{facilityType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Setup Pillar:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Project Scale:</span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">{scale}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">District &amp; Location:</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {district} ({address})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Callback Slot:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{preferredSlot}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-2">
                    <span className="text-zinc-500">Consultation Fee:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">₹0.00 (100% Free)</span>
                  </div>
                </div>

                {/* Direct Connect Buttons */}
                <div className="max-w-md mx-auto space-y-3 pt-2">
                  <a
                    href={`https://wa.me/919876543210?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Chat with Bihar Operations Lead on WhatsApp</span>
                  </a>

                  <div className="flex items-center justify-center gap-3">
                    <a
                      href="tel:+919876543210"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Call Central Desk (+91 98765 43210)</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleResetAndClose}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold hover:opacity-90 cursor-pointer"
                    >
                      <span>Return to Website</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
