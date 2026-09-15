"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Search,
  RefreshCw,
  Download,
  Phone,
  CheckCircle2,
  Clock,
  UserCheck,
  AlertTriangle,
  X,
  Copy,
  Check,
  Building2,
  MapPin,
  Send,
  Trash2,
  Unlock,
  Lock,
  Shield,
  ShieldAlert,
  KeyRound,
  Mail,
  ArrowLeft,
  Truck,
  User,
  Plus,
  FileText,
  Wrench,
  LogOut,
  Layers,
  BarChart3,
  TrendingUp,
  Radio,
  AlertCircle,
  Edit3,
  Sparkles,
  DollarSign,
  Compass,
  Eye,
  EyeOff,
  Filter,
  ArrowRight,
  ChevronRight,
  SlidersHorizontal,
  UserPlus,
} from "lucide-react";
import { BookingRecord, ConsultationRecord } from "@/lib/bookingsStore";
import { ServiceCategory, ServiceItem } from "@/data/services";
import { ThemeToggle } from "@/components/ThemeToggle";

export interface RealTechnician {
  id: string;
  name: string;
  phone: string;
  district: string;
  specialty: string;
  active?: boolean;
  createdAt?: string;
}

// All 38 Districts of Bihar
const ALL_BIHAR_DISTRICTS = [
  "ALL",
  "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar",
  "Darbhanga", "East Champaran (Motihari)", "Gaya", "Gopalganj", "Jamui", "Jehanabad",
  "Kaimur (Bhabua)", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura",
  "Madhubani", "Munger", "Muzaffarpur", "Nalanda (Bihar Sharif)", "Nawada", "Patna",
  "Purnia", "Rohtas (Sasaram)", "Saharsa", "Samastipur", "Saran (Chhapra)", "Sheikhpura",
  "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali (Hajipur)", "West Champaran (Bettiah)"
];

// Initial Bihar Active Hubs
const INITIAL_ACTIVE_HUBS = [
  "Patna", "Gaya", "Aurangabad", "Muzaffarpur", "Bhagalpur", "Rohtas (Sasaram)", "Arwal", "Jehanabad"
];

export default function AdminOperationsDashboard() {
  // Authentication & 2FA State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string>("");
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // 2-Factor Authentication Flow State
  const [is2FAPending, setIs2FAPending] = useState<boolean>(false);
  const [tempSessionId, setTempSessionId] = useState<string>("");
  const [otpInput, setOtpInput] = useState<string>("");
  const [maskedEmail, setMaskedEmail] = useState<string>("");
  const [devOtp, setDevOtp] = useState<string>("");
  const [otpCountdown, setOtpCountdown] = useState<number>(300);
  const [isResendingOtp, setIsResendingOtp] = useState<boolean>(false);

  // Active Admin Profile & Role
  const [currentUser, setCurrentUser] = useState<{
    username: string;
    role: "SUPER_ADMIN" | "OPERATIONS_DISPATCHER";
    displayName: string;
  } | null>(null);

  // Rate Limiting & Lockout Status
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  // Inactivity Auto-Lock Notice
  const [inactivityNotice, setInactivityNotice] = useState<boolean>(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"bookings" | "dispatch" | "services" | "consultations" | "analytics">("bookings");

  // Data State
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [consultations, setConsultations] = useState<ConsultationRecord[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [technicians, setTechnicians] = useState<RealTechnician[]>([]);
  const [activeHubs, setActiveHubs] = useState<string[]>(INITIAL_ACTIVE_HUBS);
  const [stats, setStats] = useState<{
    total: number;
    revenueAdvance: number;
    pendingVerification: number;
    assigned: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    consultationsCount?: number;
  }>({
    total: 0,
    revenueAdvance: 0,
    pendingVerification: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    consultationsCount: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [dbEngine, setDbEngine] = useState<string>("LOCAL_STORAGE");

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState<string>("");

  // Modals & Drawers
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<BookingRecord | null>(null);
  const [assignTechBooking, setAssignTechBooking] = useState<BookingRecord | null>(null);
  const [showNewBookingModal, setShowNewBookingModal] = useState<boolean>(false);
  const [showAddTechModal, setShowAddTechModal] = useState<boolean>(false);

  // Add / Edit Service Modal State
  const [showAddServiceModal, setShowAddServiceModal] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [serviceCategoryId, setServiceCategoryId] = useState<string>("repair-maintenance");
  const [serviceName, setServiceName] = useState<string>("");
  const [serviceShortDesc, setServiceShortDesc] = useState<string>("");
  const [serviceGroup, setServiceGroup] = useState<"cooling" | "appliances" | "electrical" | "plumbing" | "furniture" | "turnkey" | "custom">("appliances");
  const [serviceFeatures, setServiceFeatures] = useState<string>("Inspection & fault diagnostics\nVerified parts replacement\n30-day doorstep warranty");
  const [servicePopular, setServicePopular] = useState<boolean>(false);
  const [isSavingService, setIsSavingService] = useState<boolean>(false);

  // Add Technician Form State
  const [techNameInput, setTechNameInput] = useState<string>("");
  const [techPhoneInput, setTechPhoneInput] = useState<string>("");
  const [techDistrictInput, setTechDistrictInput] = useState<string>("Patna");
  const [techSpecialtyInput, setTechSpecialtyInput] = useState<string>("AC & Refrigeration Lead Technician");
  const [isSavingNewTech, setIsSavingNewTech] = useState<boolean>(false);

  // Technician Assignment Form
  const [selectedTechName, setSelectedTechName] = useState<string>("");
  const [selectedTechPhone, setSelectedTechPhone] = useState<string>("");
  const [arrivalWindow, setArrivalWindow] = useState<string>("Within 2 Hours");
  const [techNotes, setTechNotes] = useState<string>("");
  const [isSavingTech, setIsSavingTech] = useState<boolean>(false);

  // New Phone Booking Form State
  const [newCustName, setNewCustName] = useState<string>("");
  const [newCustPhone, setNewCustPhone] = useState<string>("");
  const [newCustEmail, setNewCustEmail] = useState<string>("");
  const [newCustDistrict, setNewCustDistrict] = useState<string>("Patna");
  const [newCustAddress, setNewCustAddress] = useState<string>("");
  const [newCustLandmark, setNewCustLandmark] = useState<string>("");
  const [newCustPincode, setNewCustPincode] = useState<string>("800001");
  const [newServiceName, setNewServiceName] = useState<string>("Air Conditioner (AC) Repair, Service & Installation");
  const [newApplianceDetail, setNewApplianceDetail] = useState<string>("Split AC (1.5 Ton) - Voltas");
  const [newUnitCount, setNewUnitCount] = useState<number>(1);
  const [newSlot, setNewSlot] = useState<string>("Tomorrow (9:00 AM - 12:00 PM)");
  const [newUtrNumber, setNewUtrNumber] = useState<string>("");
  const [newSpecialNotes, setNewSpecialNotes] = useState<string>("");
  const [isCreatingBooking, setIsCreatingBooking] = useState<boolean>(false);

  // Helper to obtain authenticated headers for admin operations
  const getAuthHeaders = useCallback(() => {
    const token = typeof window !== "undefined"
      ? (localStorage.getItem("cb_admin_token") || sessionStorage.getItem("cb_admin_token") || "")
      : "";
    return {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}`, "x-admin-token": token } : {}),
    };
  }, []);

  // Secure Logout function
  const handleLogout = useCallback((reason?: "inactivity" | "manual") => {
    localStorage.removeItem("cb_admin_token");
    localStorage.removeItem("cb_admin_user");
    localStorage.removeItem("cb_admin_auth");
    sessionStorage.removeItem("cb_admin_token");
    sessionStorage.removeItem("cb_admin_user");
    setIsAuthenticated(false);
    setCurrentUser(null);
    setIs2FAPending(false);
    setPasswordInput("");
    setOtpInput("");
    setDevOtp("");

    fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    }).catch(() => {});

    if (reason === "inactivity") {
      setInactivityNotice(true);
      setAuthError("Session timed out after 15 minutes of inactivity. Please re-authenticate.");
    }
  }, []);

  // Check saved session on mount and restore state
  useEffect(() => {
    const token = localStorage.getItem("cb_admin_token") || sessionStorage.getItem("cb_admin_token");
    const storedUser = localStorage.getItem("cb_admin_user") || sessionStorage.getItem("cb_admin_user");
    if (token) {
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch {}
      }
      setIsAuthenticated(true);
      // Validate session with server in background
      fetch("/api/admin/auth", {
        headers: { "Authorization": `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.authenticated && data.user) {
            setCurrentUser(data.user);
          } else if (data.authenticated === false) {
            handleLogout();
          }
        })
        .catch(() => {});
    }
  }, [handleLogout]);

  // 15-Minute Inactivity Auto-Lock Tracker
  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId: NodeJS.Timeout;
    const INACTIVITY_LIMIT_MS = 15 * 60 * 1000; // 15 minutes

    const resetInactivityTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleLogout("inactivity");
      }, INACTIVITY_LIMIT_MS);
    };

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
    events.forEach((evt) => window.addEventListener(evt, resetInactivityTimer, { passive: true }));
    resetInactivityTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((evt) => window.removeEventListener(evt, resetInactivityTimer));
    };
  }, [isAuthenticated, handleLogout]);

  // 2FA OTP Countdown Timer
  useEffect(() => {
    if (!is2FAPending || otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [is2FAPending, otpCountdown]);

  // Lockout Countdown Timer
  useEffect(() => {
    if (!isLocked || lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          setIsLocked(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isLocked, lockoutSeconds]);

  // Fetch all live data (Bookings, Consultations, Services Catalog, Technicians)
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Bookings & Real Metrics
      const res = await fetch("/api/admin/bookings", {
        headers: getAuthHeaders(),
        cache: "no-store",
      });
      if (res.status === 401) {
        handleLogout();
        setAuthError("Session expired. Please log in again.");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
        setConsultations(data.consultations || []);
        if (data.stats) setStats(data.stats);
        if (data.databaseEngine) setDbEngine(data.databaseEngine);
      }

      // 2. Fetch Services Catalog
      const servicesRes = await fetch("/api/services", { cache: "no-store" });
      if (servicesRes.ok) {
        const servData = await servicesRes.json();
        if (servData.categories) {
          setCategories(servData.categories);
        }
      }

      // 3. Fetch Technicians
      const techRes = await fetch("/api/technicians", {
        headers: getAuthHeaders(),
        cache: "no-store"
      });
      if (techRes.ok) {
        const techData = await techRes.json();
        if (techData.technicians) {
          setTechnicians(techData.technicians);
        }
      }
    } catch (err) {
      console.error("Admin data fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders, handleLogout]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  // Auto Refresh interval (15s)
  useEffect(() => {
    if (!isAuthenticated || !autoRefresh) return;
    const interval = setInterval(() => {
      fetchData();
    }, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated, autoRefresh, fetchData]);

  // Complete Authentication Helper
  const completeAuth = (token: string, user?: any) => {
    if (rememberMe) {
      localStorage.setItem("cb_admin_token", token);
      if (user) localStorage.setItem("cb_admin_user", JSON.stringify(user));
    } else {
      sessionStorage.setItem("cb_admin_token", token);
      if (user) sessionStorage.setItem("cb_admin_user", JSON.stringify(user));
    }
    if (user) setCurrentUser(user);
    setIsAuthenticated(true);
    setIs2FAPending(false);
    setOtpInput("");
    setPasswordInput("");
    setInactivityNotice(false);
    setAuthError("");
    setAuthSuccessMsg("");
  };

  // STEP 1: Handle Initial Username + Password Submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setAuthError("Please enter your administrative password / passkey.");
      return;
    }

    setIsAuthenticating(true);
    setAuthError("");
    setAuthSuccessMsg("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          username: usernameInput.trim(),
          password: passwordInput.trim(),
        }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setIsLocked(true);
        setLockoutSeconds(data.remainingLockSeconds || 900);
        setAuthError(data.error || "Too many failed attempts. Temporary security lockout activated.");
        return;
      }

      if (!res.ok || !data.success) {
        setAuthError(data.error || "Invalid credentials. Access Denied.");
        if (data.remainingAttempts !== undefined) {
          setRemainingAttempts(data.remainingAttempts);
        }
        return;
      }

      if (data.requires2FA) {
        setIs2FAPending(true);
        setTempSessionId(data.tempSessionId);
        setMaskedEmail(data.maskedEmail);
        if (data.devOtp) setDevOtp(data.devOtp);
        setOtpCountdown(300);
        setAuthSuccessMsg(
          data.emailSent
            ? `A 6-digit verification code has been dispatched to ${data.maskedEmail}.`
            : `Verification code generated. (SMTP Notice: Check credentials in .env.local)`
        );
        if (data.user) {
          setCurrentUser(data.user);
        }
      } else {
        completeAuth(data.token, data.user);
      }
    } catch (err: any) {
      setAuthError("Failed to reach authentication gateway. Please check connection.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  // STEP 2: Handle 2FA OTP Code Verification Submission
  const handleVerify2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput.trim() || otpInput.trim().length !== 6) {
      setAuthError("Please enter the 6-digit verification code from your email.");
      return;
    }

    setIsAuthenticating(true);
    setAuthError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify_2fa",
          tempSessionId,
          otp: otpInput.trim(),
        }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setIsLocked(true);
        setLockoutSeconds(data.remainingLockSeconds || 900);
        setAuthError(data.error || "Rate limit exceeded. Account temporarily locked.");
        return;
      }

      if (!res.ok || !data.success) {
        setAuthError(data.error || "Invalid verification code. Please try again.");
        if (data.remainingAttempts !== undefined) {
          setRemainingAttempts(data.remainingAttempts);
        }
        return;
      }

      completeAuth(data.token, data.user);
    } catch (err) {
      setAuthError("Failed to verify code. Please check connection.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Resend 2FA OTP Code
  const handleResend2FA = async () => {
    setIsResendingOtp(true);
    setAuthError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resend_2fa",
          username: usernameInput,
          role: currentUser?.role || "SUPER_ADMIN",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTempSessionId(data.tempSessionId);
        if (data.devOtp) setDevOtp(data.devOtp);
        setOtpCountdown(300);
        setAuthSuccessMsg(
          data.emailSent
            ? "A fresh 6-digit code has been dispatched to admin email."
            : "A fresh verification code has been generated."
        );
      } else {
        setAuthError(data.error || "Failed to resend code.");
      }
    } catch {
      setAuthError("Failed to resend code.");
    } finally {
      setIsResendingOtp(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 2000);
  };

  // Update Booking Status
  const handleUpdateStatus = async (bookingId: string, newStatus: BookingRecord["status"]) => {
    try {
      // Optimistic local update
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );
      if (selectedBookingDetail?.id === bookingId) {
        setSelectedBookingDetail((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ id: bookingId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.error || "Failed to update booking status.");
        fetchData();
      }
    } catch (err) {
      console.error("Status update error:", err);
      alert("Failed to update status. Please check your network.");
      fetchData();
    }
  };

  // Assign Technician Submit
  const handleSaveTechnician = async (e?: React.FormEvent, openWhatsApp: boolean = true) => {
    if (e) e.preventDefault();
    if (!assignTechBooking || !selectedTechName.trim() || !selectedTechPhone.trim()) {
      alert("Please specify Technician Name and Mobile Number.");
      return;
    }

    setIsSavingTech(true);
    try {
      const assignedTechnician = {
        name: selectedTechName.trim(),
        phone: selectedTechPhone.trim(),
        assignedAt: new Date().toISOString(),
        arrivalWindow: arrivalWindow.trim(),
      };

      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          id: assignTechBooking.id,
          status: "TECHNICIAN_ASSIGNED",
          assignedTechnician,
          adminNotes: techNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (openWhatsApp) {
          const waUrl = generateWhatsAppDispatchLink(
            assignTechBooking,
            selectedTechPhone.trim(),
            arrivalWindow
          );
          window.open(waUrl, "_blank", "noopener,noreferrer");
        }

        setAssignTechBooking(null);
        setSelectedTechName("");
        setSelectedTechPhone("");
        setTechNotes("");
        fetchData();
      } else {
        alert(data.error || "Failed to assign technician.");
      }
    } catch (err) {
      console.error("Tech assignment error:", err);
      alert("Failed to assign technician.");
    } finally {
      setIsSavingTech(false);
    }
  };

  // Add Real Technician to Roster
  const handleCreateTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!techNameInput.trim() || !techPhoneInput.trim()) {
      alert("Please provide technician name and contact number.");
      return;
    }
    setIsSavingNewTech(true);
    try {
      const res = await fetch("/api/technicians", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: techNameInput.trim(),
          phone: techPhoneInput.trim(),
          district: techDistrictInput,
          specialty: techSpecialtyInput.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddTechModal(false);
        setTechNameInput("");
        setTechPhoneInput("");
        fetchData();
      }
    } catch (err) {
      console.error("Failed to add technician:", err);
    } finally {
      setIsSavingNewTech(false);
    }
  };

  // Delete Real Technician from Roster
  const handleDeleteTechnician = async (id: string) => {
    if (!confirm("Remove this technician from active fleet roster?")) return;
    try {
      const res = await fetch(`/api/technicians?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error("Delete technician error:", err);
    }
  };

  // Delete Booking
  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm(`Are you sure you want to permanently delete booking ${bookingId}?`)) return;

    try {
      const res = await fetch(`/api/admin/bookings?id=${encodeURIComponent(bookingId)}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) => prev.filter((b) => b.id !== bookingId));
        if (selectedBookingDetail?.id === bookingId) setSelectedBookingDetail(null);
        fetchData();
      } else {
        alert(data.error || "Failed to delete booking.");
      }
    } catch (err) {
      console.error("Delete booking error:", err);
      alert("Failed to delete booking. Please check connection.");
    }
  };

  // Create Manual Phone Booking Submit
  const handleCreatePhoneBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim() || !newCustAddress.trim()) {
      alert("Please fill in Customer Name, Mobile Number, and Address.");
      return;
    }

    setIsCreatingBooking(true);
    try {
      const newId = `CB-${Math.floor(100000 + Math.random() * 900000)}`;
      const payload = {
        bookingId: newId,
        customerName: newCustName.trim(),
        phoneNumber: newCustPhone.trim(),
        email: newCustEmail.trim() || undefined,
        district: newCustDistrict,
        address: newCustAddress.trim(),
        landmark: newCustLandmark.trim() || undefined,
        pincode: newCustPincode.trim() || "800001",
        serviceCategory: "Doorstep Appliance Service",
        serviceName: newServiceName.trim(),
        applianceDetail: newApplianceDetail.trim(),
        unitCount: Number(newUnitCount) || 1,
        slot: newSlot.trim(),
        specialNotes: newSpecialNotes.trim() || undefined,
        advanceFee: 99,
        paymentStatus: newUtrNumber.trim() ? "PAID_ADVANCE_99" : "PENDING",
        payeeUpi: "2dhirajkumar4726@okhdfcbank",
        payeeName: "Dhiraj Kumar",
        payerName: newCustName.trim(),
        paymentAppUsed: "Phone Order / UPI",
        utrNumber: newUtrNumber.trim() || "PHONE-ORDER-PENDING",
        status: "NEW_PENDING_DISPATCH",
      };

      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setShowNewBookingModal(false);
        setNewCustName("");
        setNewCustPhone("");
        setNewCustAddress("");
        setNewCustEmail("");
        setNewUtrNumber("");
        fetchData();
      }
    } catch (err) {
      console.error("Phone booking creation error:", err);
      alert("Failed to register phone booking.");
    } finally {
      setIsCreatingBooking(false);
    }
  };

  // Add or Edit Service Item Submit
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim() || !serviceShortDesc.trim()) {
      alert("Please fill in Service Name and Description.");
      return;
    }

    setIsSavingService(true);
    try {
      const featuresList = serviceFeatures
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);

      if (editingService) {
        // Edit existing
        const res = await fetch("/api/services", {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            id: editingService.id,
            name: serviceName.trim(),
            shortDesc: serviceShortDesc.trim(),
            group: serviceGroup,
            features: featuresList,
            popular: servicePopular,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setShowAddServiceModal(false);
          setEditingService(null);
          fetchData();
        } else {
          alert(data.error || "Failed to update service. Super Admin permissions required.");
        }
      } else {
        // Add new service
        const res = await fetch("/api/services", {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            categoryId: serviceCategoryId,
            name: serviceName.trim(),
            shortDesc: serviceShortDesc.trim(),
            group: serviceGroup,
            features: featuresList,
            popular: servicePopular,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setShowAddServiceModal(false);
          fetchData();
        } else {
          alert(data.error || "Failed to add service. Super Admin permissions required.");
        }
      }
    } catch (err) {
      console.error("Save service error:", err);
      alert("Failed to save service.");
    } finally {
      setIsSavingService(false);
    }
  };

  // Delete Service Item
  const handleDeleteService = async (serviceId: string) => {
    if (!confirm("Are you sure you want to remove this service from the live website?")) return;
    try {
      const res = await fetch(`/api/services?id=${encodeURIComponent(serviceId)}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.error || "Failed to delete service. Super Admin permissions required.");
      }
    } catch (err) {
      console.error("Delete service error:", err);
    }
  };

  // Toggle Bihar District Active Hub
  const toggleDistrictHub = (dist: string) => {
    if (activeHubs.includes(dist)) {
      setActiveHubs(activeHubs.filter((h) => h !== dist));
    } else {
      setActiveHubs([...activeHubs, dist]);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (bookings.length === 0) {
      alert("No bookings available to export.");
      return;
    }

    const headers = [
      "Booking ID", "Created At", "Customer Name", "Phone", "District", "Address",
      "Service", "Appliance Specs", "Slot", "Advance Fee", "Payment Status", "UTR Number",
      "Assigned Technician", "Technician Phone", "Operational Status"
    ];

    const rows = filteredBookings.map((b) => [
      `"${b.id}"`,
      `"${new Date(b.createdAt).toLocaleString('en-IN')}"`,
      `"${b.customerName.replace(/"/g, '""')}"`,
      `"${b.phoneNumber}"`,
      `"${b.district}"`,
      `"${b.address.replace(/"/g, '""')}"`,
      `"${b.serviceName}"`,
      `"${b.applianceDetail.replace(/"/g, '""')}"`,
      `"${b.slot}"`,
      `"${b.advanceFee || 99}"`,
      `"${b.paymentStatus}"`,
      `"${b.utrNumber}"`,
      `"${b.assignedTechnician?.name || 'Unassigned'}"`,
      `"${b.assignedTechnician?.phone || ''}"`,
      `"${b.status}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CelebrateBihar_Bookings_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Bookings Logic (Robust status matching, district normalization, and comprehensive multi-field search)
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // 1. Status Filter
      if (selectedStatusFilter !== "ALL") {
        if (selectedStatusFilter === "NEEDS_VERIFICATION") {
          if (b.status !== "NEW_PENDING_DISPATCH" && b.status !== "PAYMENT_VERIFIED") return false;
        } else if (b.status !== selectedStatusFilter) {
          return false;
        }
      }

      // 2. District Filter (handles aliases like "Rohtas (Sasaram)" vs "Rohtas")
      if (selectedDistrictFilter !== "ALL") {
        const bd = (b.district || "").toLowerCase().trim();
        const fd = selectedDistrictFilter.toLowerCase().trim();
        const bdCore = bd.split("(")[0].trim();
        const fdCore = fd.split("(")[0].trim();
        const matchesDistrict =
          bd === fd ||
          bdCore === fdCore ||
          bd.includes(fdCore) ||
          fd.includes(bdCore);
        if (!matchesDistrict) return false;
      }

      // 3. Search query across all relevant customer, technician, and payment attributes
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const matchesSearch =
          (b.id && b.id.toLowerCase().includes(q)) ||
          (b.customerName && b.customerName.toLowerCase().includes(q)) ||
          (b.phoneNumber && b.phoneNumber.toLowerCase().includes(q)) ||
          (b.alternatePhone && b.alternatePhone.toLowerCase().includes(q)) ||
          (b.email && b.email.toLowerCase().includes(q)) ||
          (b.address && b.address.toLowerCase().includes(q)) ||
          (b.landmark && b.landmark.toLowerCase().includes(q)) ||
          (b.pincode && b.pincode.toLowerCase().includes(q)) ||
          (b.serviceName && b.serviceName.toLowerCase().includes(q)) ||
          (b.applianceDetail && b.applianceDetail.toLowerCase().includes(q)) ||
          (b.district && b.district.toLowerCase().includes(q)) ||
          (b.utrNumber && b.utrNumber.toLowerCase().includes(q)) ||
          (b.payerName && b.payerName.toLowerCase().includes(q)) ||
          (b.paymentAppUsed && b.paymentAppUsed.toLowerCase().includes(q)) ||
          (b.assignedTechnician?.name && b.assignedTechnician.name.toLowerCase().includes(q)) ||
          (b.assignedTechnician?.phone && b.assignedTechnician.phone.toLowerCase().includes(q)) ||
          (b.adminNotes && b.adminNotes.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [bookings, selectedStatusFilter, selectedDistrictFilter, searchTerm]);

  // Derive unique active technicians who have been assigned to bookings
  const activeAssignedTechs = useMemo(() => {
    const list: { name: string; phone: string; activeCount: number; district?: string }[] = [];
    bookings.forEach((b) => {
      if (b.assignedTechnician?.name) {
        const existing = list.find((t) => t.name.toLowerCase() === b.assignedTechnician!.name.toLowerCase());
        const isActive = b.status === "TECHNICIAN_ASSIGNED" || b.status === "IN_PROGRESS";
        if (existing) {
          if (isActive) existing.activeCount += 1;
        } else {
          list.push({
            name: b.assignedTechnician.name,
            phone: b.assignedTechnician.phone,
            activeCount: isActive ? 1 : 0,
            district: b.district,
          });
        }
      }
    });
    return list;
  }, [bookings]);

  // Helper Badge Color Mapping matching monochrome + blue accent
  const getStatusBadge = (status: BookingRecord["status"]) => {
    switch (status) {
      case "NEW_PENDING_DISPATCH":
        return {
          label: "Pending Dispatch",
          bg: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900/60",
          dot: "bg-blue-600 dark:bg-blue-400 animate-pulse",
        };
      case "PAYMENT_VERIFIED":
        return {
          label: "Payment Verified",
          bg: "bg-zinc-100 text-zinc-900 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700",
          dot: "bg-blue-600 dark:bg-blue-400",
        };
      case "TECHNICIAN_ASSIGNED":
        return {
          label: "Tech Assigned",
          bg: "bg-zinc-100 text-zinc-900 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700",
          dot: "bg-blue-600 dark:bg-blue-400",
        };
      case "IN_PROGRESS":
        return {
          label: "In Progress",
          bg: "bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-800",
          dot: "bg-blue-500 animate-pulse",
        };
      case "COMPLETED":
        return {
          label: "Completed",
          bg: "bg-zinc-950 text-white border-zinc-950 dark:bg-white dark:text-zinc-950 dark:border-white font-bold",
          dot: "bg-emerald-400",
        };
      case "CANCELLED":
        return {
          label: "Cancelled",
          bg: "bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-500 dark:border-zinc-800 line-through",
          dot: "bg-zinc-400",
        };
      default:
        return {
          label: status,
          bg: "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200",
          dot: "bg-zinc-400",
        };
    }
  };

  // Generate Comprehensive Job Card Text Forwarded to Technician
  const getDispatchMessageText = (booking: BookingRecord, arrivalTimeWindow?: string) => {
    const fullAddress = `${booking.address}, ${booking.district}${booking.pincode ? ` - ${booking.pincode}` : ""}, Bihar`;
    const mapsQuery = encodeURIComponent(`${booking.address}, ${booking.district}, Bihar`);
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
    const arrival = arrivalTimeWindow || booking.assignedTechnician?.arrivalWindow || "Within 2 Hours";

    return (
      `*CELEBRATE BIHAR • SERVICE DISPATCH ORDER*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `*Booking ID:* ${booking.id}\n` +
      `*Preferred Slot:* ${booking.slot}\n` +
      `*Arrival Window:* ${arrival}\n\n` +
      `*CUSTOMER INFORMATION:*\n` +
      `• *Name:* ${booking.customerName}\n` +
      `• *Primary Contact:* +91 ${booking.phoneNumber}\n` +
      `${booking.alternatePhone ? `• *Alternate Contact:* +91 ${booking.alternatePhone}\n` : ""}` +
      `${booking.email && booking.email !== "Not Provided" ? `• *Email:* ${booking.email}\n` : ""}\n` +
      `*SERVICE LOCATION & MAPS:*\n` +
      `• *Full Address:* ${booking.address}\n` +
      `${booking.landmark ? `• *Landmark:* ${booking.landmark}\n` : ""}` +
      `• *District:* ${booking.district} Hub\n` +
      `*Google Maps Navigation:* ${mapsLink}\n\n` +
      `*APPLIANCE & SERVICE SPECIFICATIONS:*\n` +
      `• *Service Name:* ${booking.serviceName}\n` +
      `• *Appliance Details:* ${booking.applianceDetail}\n` +
      `• *Quantity:* ${booking.unitCount || 1} Unit(s)\n` +
      `• *Advance Token Paid:* ₹${booking.advanceFee || 99} (UTR: ${booking.utrNumber})\n` +
      `${booking.specialNotes ? `• *Customer Special Notes:* ${booking.specialNotes}\n` : ""}\n` +
      `*INSTRUCTIONS FOR TECHNICIAN:*\n` +
      `1. Call customer (+91 ${booking.phoneNumber}) 15 minutes before arrival.\n` +
      `2. Carry verified Celebrate Bihar digital toolkit and diagnostic equipment.\n` +
      `3. Confirm diagnostic inspection with customer before parts replacement.\n` +
      `4. In case of any site issues, contact Operations Desk (+91 9142823616).\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `_Celebrate Bihar Central Operations Desk • Bihar_`
    );
  };

  // Generate WhatsApp Dispatch Link
  const generateWhatsAppDispatchLink = (
    booking: BookingRecord,
    techPhoneNum: string,
    arrivalTimeWindow?: string
  ) => {
    const rawDigits = techPhoneNum.replace(/\D/g, "");
    const cleanPhone =
      rawDigits.startsWith("91") && rawDigits.length === 12
        ? rawDigits
        : `91${rawDigits.slice(-10)}`;
    const text = encodeURIComponent(getDispatchMessageText(booking, arrivalTimeWindow));
    return `https://wa.me/${cleanPhone}?text=${text}`;
  };

  // ==========================================
  // UN-AUTHENTICATED: MULTI-ROLE 2FA LOGIN VIEW (Banking-Grade Security Theme)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between relative overflow-hidden transition-colors">
        {/* Ambient Glows & Grid Pattern identical to homepage Hero */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-500/10 dark:bg-blue-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-indigo-500/10 dark:bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />
        <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-50 -z-10" />

        {/* Top Header */}
        <header className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-5 flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-zinc-950 dark:text-white group-hover:opacity-90 transition-opacity">
              Celebrate <span className="text-blue-600 dark:text-blue-400">Bihar</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-all cursor-pointer"
            >
              <span>← Back to Public Website</span>
            </Link>
            <ThemeToggle />
          </div>
        </header>

        {/* Main Login Card */}
        <main className="max-w-lg w-full mx-auto px-4 py-10 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="p-7 sm:p-9 rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200/90 dark:border-zinc-800/90 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] space-y-6"
          >
            {/* Header Badge */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 text-[11px] font-bold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600 dark:bg-blue-400" />
                </span>
                <span>Central Command & 2FA Gate</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 dark:text-white">
                {is2FAPending ? "Two-Factor Verification" : "Admin Operations Console"}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-normal max-w-sm mx-auto">
                {is2FAPending
                  ? `Enter the 6-digit cryptographic security code dispatched to ${maskedEmail || "your registered admin email"}.`
                  : "Enterprise-grade operations portal for customer dispatches, live appliance bookings, and technician routing across Bihar."}
              </p>
            </div>

            {/* Inactivity Notification Banner */}
            {inactivityNotice && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Session locked due to 15 minutes of inactivity. Please re-authenticate.</span>
              </div>
            )}

            {/* Lockout Notification Banner */}
            {isLocked && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/70 text-xs text-rose-800 dark:text-rose-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-300">
                  <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 animate-bounce" />
                  <span>Security Lockout Activated</span>
                </div>
                <p className="text-[11px] leading-relaxed text-rose-600 dark:text-rose-300">
                  Multiple invalid authentication attempts detected. Automated security alert sent to system administrator.
                </p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-900/40 font-mono font-bold text-[11px] text-rose-700 dark:text-rose-300">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    Lockout expires in: {Math.floor(lockoutSeconds / 60)}m {(lockoutSeconds % 60).toString().padStart(2, "0")}s
                  </span>
                </div>
              </div>
            )}

            {/* General Auth Error */}
            {authError && !isLocked && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Success / Status Message */}
            {authSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{authSuccessMsg}</span>
              </div>
            )}

            {/* STEP 1: CREDENTIAL AUTHENTICATION */}
            {!is2FAPending ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Username Input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
                    Admin Username
                  </label>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Enter your administrative username"
                    className="w-full px-4 py-3 text-sm rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/80 dark:bg-zinc-950/80 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-mono transition-all disabled:opacity-50"
                    autoFocus
                  />
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      Administrative Password
                    </label>
                    {remainingAttempts !== null && remainingAttempts < 5 && (
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                        {remainingAttempts} attempts remaining
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      disabled={isLocked}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Enter administrative password"
                      className="w-full px-4 py-3 text-sm rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/80 dark:bg-zinc-950/80 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-mono transition-all disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-xs font-semibold cursor-pointer p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Options */}
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500 bg-zinc-50 dark:bg-zinc-950"
                    />
                    <span>Remember Session</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isAuthenticating || isLocked}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-full font-bold text-sm text-white dark:text-zinc-950 bg-zinc-950 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isAuthenticating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                      <span>Verifying Credentials & Dispatching 2FA...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-blue-500 dark:text-blue-600" />
                      <span>Authenticate & Request 2FA OTP</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* STEP 2: 2FA OTP VERIFICATION */
              <form onSubmit={handleVerify2FASubmit} className="space-y-4">
                {/* 2FA Visual Indicator */}
                <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-900 dark:text-white">
                        Admin Email 2FA
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                        {maskedEmail || "celebratebiharserviceprovider@gmail.com"}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                      Validity
                    </div>
                    <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                      {Math.floor(otpCountdown / 60)}:{(otpCountdown % 60).toString().padStart(2, "0")}
                    </div>
                  </div>
                </div>

                {/* Dev OTP Preview Helper */}
                {devOtp && (
                  <div className="p-3 rounded-2xl bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-xs flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                        Dev OTP Code: <strong className="font-mono text-blue-700 dark:text-blue-300 text-sm tracking-widest">{devOtp}</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpInput(devOtp);
                        setAuthError("");
                      }}
                      className="px-3 py-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-xs cursor-pointer transition-all hover:scale-105 active:scale-95"
                    >
                      Auto-Fill
                    </button>
                  </div>
                )}

                {/* 6-Digit OTP Input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block text-center">
                    Enter 6-Digit Security Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    disabled={isLocked}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="••••••"
                    className="w-full px-4 py-3.5 text-2xl text-center tracking-[0.5em] font-mono font-black rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/80 dark:bg-zinc-950/80 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all"
                    autoFocus
                  />
                  <p className="text-[11px] text-center text-zinc-500 dark:text-zinc-400">
                    Check your spam/junk folder if not received in primary inbox.
                  </p>
                </div>

                {/* Actions: Resend + Back */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIs2FAPending(false);
                      setOtpInput("");
                      setAuthError("");
                    }}
                    className="inline-flex items-center gap-1 font-bold text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Login</span>
                  </button>

                  <button
                    type="button"
                    disabled={isResendingOtp || otpCountdown > 240}
                    onClick={handleResend2FA}
                    className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
                  >
                    {isResendingOtp ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Mail className="w-3.5 h-3.5" />
                    )}
                    <span>{otpCountdown > 240 ? `Resend (${otpCountdown - 240}s)` : "Resend Code"}</span>
                  </button>
                </div>

                {/* Submit 2FA Button */}
                <button
                  type="submit"
                  disabled={isAuthenticating || isLocked || otpInput.length !== 6}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-full font-bold text-sm text-white dark:text-zinc-950 bg-zinc-950 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isAuthenticating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                      <span>Verifying Security Code...</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4 text-blue-500 dark:text-blue-600" />
                      <span>Verify Code & Unlock Console</span>
                    </>
                  )}
                </button>
              </form>
            )}


          </motion.div>
        </main>

        {/* Footer */}
        <footer className="max-w-6xl w-full mx-auto text-center text-xs text-zinc-400 dark:text-zinc-500 py-6 border-t border-zinc-200/80 dark:border-zinc-800/80">
          Celebrate Bihar • Central Command & Operational Security Framework • {new Date().getFullYear()}
        </footer>
      </div>
    );
  }

  // ==========================================
  // AUTHENTICATED: SMART ADMIN OPERATIONS PANEL (Matching Homepage Theme)
  // ==========================================
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col relative transition-colors">
      {/* Background Decorative Ambient Glows matching Homepage */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-500/8 dark:bg-blue-600/8 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-40 -z-10" />

      {/* Navbar with Exact Homepage Bluish Gradient Blend */}
      <header className="sticky top-0 z-40 bg-gradient-to-b from-white/95 via-sky-50/75 to-blue-100/60 dark:from-zinc-950/95 dark:via-zinc-950/90 dark:to-blue-950/40 backdrop-blur-md border-b border-blue-200/70 dark:border-blue-900/50 shadow-[0_4px_24px_-4px_rgba(59,130,246,0.12)] dark:shadow-[0_4px_24px_-4px_rgba(30,58,138,0.25)] py-3">
        {/* Bottom Light Bluish Ambient Blend & Accent Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-400/50 dark:via-blue-500/40 to-transparent pointer-events-none" />
        <div className="absolute -bottom-3 left-0 right-0 h-3 bg-gradient-to-b from-blue-400/10 via-blue-400/5 to-transparent dark:from-blue-500/10 dark:via-blue-500/5 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Left Brand & Live DB Indicator */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-zinc-950 dark:text-white group-hover:opacity-90 transition-opacity">
                Celebrate <span className="text-blue-600 dark:text-blue-400">Bihar</span>
              </span>
            </Link>

            {/* Role Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 text-xs font-bold shadow-2xs">
              {currentUser?.role === "SUPER_ADMIN" ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  <span>Super Admin</span>
                </>
              ) : (
                <>
                  <Truck className="w-3.5 h-3.5 text-blue-500" />
                  <span>Dispatcher</span>
                </>
              )}
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono hidden sm:inline">
                ({currentUser?.username || "admin"})
              </span>
            </div>

            {/* Live Dual-Cloud Sync Pill */}
            <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/60 text-xs font-bold shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600 dark:bg-blue-400" />
              </span>
              <span>
                {dbEngine === "HYBRID_DUAL_CLOUD"
                  ? "Dual-Cloud Sync"
                  : dbEngine === "SUPABASE"
                    ? "Supabase"
                    : dbEngine === "FIRESTORE"
                      ? "Firestore"
                      : "Local Store"}
              </span>
            </div>

            {/* 15-Minute Auto-Lock Indicator */}
            <div
              className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50"
              title="Session will automatically lock after 15 minutes of inactivity"
            >
              <Shield className="w-3 h-3" />
              <span>15m Auto-Lock</span>
            </div>
          </div>

          {/* Right Action Group */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Auto-Refresh Toggle */}
            <button
              type="button"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                autoRefresh
                  ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${autoRefresh ? "text-blue-600 dark:text-blue-400 animate-pulse" : ""}`} />
              <span>{autoRefresh ? "Auto-Sync 15s" : "Sync Paused"}</span>
            </button>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={fetchData}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200 shadow-2xs hover:shadow transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-blue-600" : "text-blue-600 dark:text-blue-400"}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* New Phone Order Button */}
            <button
              type="button"
              onClick={() => setShowNewBookingModal(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 rounded-full font-bold text-xs sm:text-sm text-white dark:text-zinc-950 bg-zinc-950 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Phone Order</span>
            </button>

            <ThemeToggle />

            {/* Logout */}
            <button
              type="button"
              onClick={() => handleLogout("manual")}
              className="p-2 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all cursor-pointer"
              title="Lock Admin Console"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
        {/* Top 5 KPI Metric Cards strictly calculated from real database records (Interactive Filter Controls) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Card 1: Total Volume */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("bookings");
              setSelectedStatusFilter("ALL");
              setSelectedDistrictFilter("ALL");
              setSearchTerm("");
            }}
            className={`group p-5 rounded-2xl sm:rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              activeTab === "bookings" && selectedStatusFilter === "ALL" && selectedDistrictFilter === "ALL" && !searchTerm
                ? "bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 shadow-md ring-2 ring-blue-500/20"
                : "bg-white dark:bg-zinc-900/90 border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs hover:shadow-md"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-blue-600 dark:text-blue-400">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-700">
                  All
                </span>
              </div>
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 dark:text-white block">
                {stats.total}
              </span>
              <p className="text-xs font-semibold text-zinc-500 mt-1">
                Customer Bookings
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
              <span>Advance:</span>
              <span className="text-blue-600 dark:text-blue-400 font-mono">₹{stats.revenueAdvance}</span>
            </div>
          </button>

          {/* Card 2: Action Required */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("bookings");
              setSelectedStatusFilter("NEEDS_VERIFICATION");
            }}
            className={`group p-5 rounded-2xl sm:rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              activeTab === "bookings" && selectedStatusFilter === "NEEDS_VERIFICATION"
                ? "bg-amber-50/70 dark:bg-amber-950/40 border-amber-500 shadow-md ring-2 ring-amber-500/20"
                : "bg-white dark:bg-zinc-900/90 border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs hover:shadow-md"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-900">
                  Action
                </span>
              </div>
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 dark:text-white block">
                {stats.pendingVerification}
              </span>
              <p className="text-xs font-semibold text-zinc-500 mt-1">
                Awaiting Dispatch
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
              <span>Status:</span>
              <span className="text-blue-600 dark:text-blue-400">
                {stats.pendingVerification > 0 ? "Dispatch Required" : "All Cleared"}
              </span>
            </div>
          </button>

          {/* Card 3: Active Field Jobs */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("bookings");
              setSelectedStatusFilter("TECHNICIAN_ASSIGNED");
            }}
            className={`group p-5 rounded-2xl sm:rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              activeTab === "bookings" && (selectedStatusFilter === "TECHNICIAN_ASSIGNED" || selectedStatusFilter === "IN_PROGRESS")
                ? "bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 shadow-md ring-2 ring-blue-500/20"
                : "bg-white dark:bg-zinc-900/90 border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs hover:shadow-md"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-blue-600 dark:text-blue-400">
                  <Wrench className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-950 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-900">
                  Active
                </span>
              </div>
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 dark:text-white block">
                {stats.assigned + stats.inProgress}
              </span>
              <p className="text-xs font-semibold text-zinc-500 mt-1">
                Field Operations
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
              <span>Deployed:</span>
              <span className="text-blue-600 dark:text-blue-400">{stats.assigned} Assigned</span>
            </div>
          </button>

          {/* Card 4: Completed Visits */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("bookings");
              setSelectedStatusFilter("COMPLETED");
            }}
            className={`group p-5 rounded-2xl sm:rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              activeTab === "bookings" && selectedStatusFilter === "COMPLETED"
                ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                : "bg-white dark:bg-zinc-900/90 border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs hover:shadow-md"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-900">
                  Fulfilled
                </span>
              </div>
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 dark:text-white block">
                {stats.completed}
              </span>
              <p className="text-xs font-semibold text-zinc-500 mt-1">
                Completed Visits
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
              <span>Success:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                {stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}%` : "0%"}
              </span>
            </div>
          </button>

          {/* Card 5: Service Catalog Count */}
          <button
            type="button"
            onClick={() => setActiveTab("services")}
            className={`col-span-2 sm:col-span-1 group p-5 rounded-2xl sm:rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              activeTab === "services"
                ? "bg-zinc-100 dark:bg-zinc-800 border-zinc-400 dark:border-zinc-600 shadow-md"
                : "bg-white dark:bg-zinc-900/90 border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs hover:shadow-md"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-blue-600 dark:text-blue-400">
                  <Compass className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-700">
                  Catalog
                </span>
              </div>
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 dark:text-white block">
                {categories.reduce((acc, c) => acc + c.services.length, 0)}
              </span>
              <p className="text-xs font-semibold text-zinc-500 mt-1">
                Editable Services
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
              <span>Coverage:</span>
              <span className="text-blue-600 dark:text-blue-400">{activeHubs.length} Active Hubs</span>
            </div>
          </button>
        </div>

        {/* Unified Monochrome + Blue Tab Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-4">
          <div className="p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 inline-flex items-center gap-1.5 overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setActiveTab("bookings")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === "bookings"
                  ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Customer Bookings</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-600 text-white font-bold">
                {filteredBookings.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("dispatch")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === "dispatch"
                  ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Technician Fleet</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                {technicians.length + activeAssignedTechs.filter(at => !technicians.some(t => t.name.toLowerCase() === at.name.toLowerCase())).length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("services")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === "services"
                  ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Service Catalog & Expansion</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-600 text-white font-bold">
                Editable
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("consultations")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === "consultations"
                  ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>B2B Inquiries</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                {consultations.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("analytics")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === "analytics"
                  ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Regional Insights</span>
            </button>
          </div>

          {/* Action Group */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowNewBookingModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Booking</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 shadow-2xs hover:shadow transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* TAB 1: CUSTOMER BOOKINGS DESK */}
        {/* =================================================================== */}
        {activeTab === "bookings" && (
          <div className="space-y-4">
            {/* Search & Multi-Filters Toolbar */}
            <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5 relative">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by Customer, Mobile, Booking ID, UTR, Address, Tech..."
                    className="w-full pl-10 pr-16 py-2.5 text-xs rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50/80 dark:bg-zinc-950/80 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={selectedStatusFilter}
                    onChange={(e) => setSelectedStatusFilter(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50/80 dark:bg-zinc-950/80 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-600 font-semibold cursor-pointer"
                  >
                    <option value="ALL">All Statuses ({bookings.length})</option>
                    <option value="NEEDS_VERIFICATION">Needs Dispatch ({stats.pendingVerification})</option>
                    <option value="NEW_PENDING_DISPATCH">Pending Dispatch</option>
                    <option value="PAYMENT_VERIFIED">Payment Verified</option>
                    <option value="TECHNICIAN_ASSIGNED">Technician Assigned ({stats.assigned})</option>
                    <option value="IN_PROGRESS">In Progress ({stats.inProgress})</option>
                    <option value="COMPLETED">Completed ({stats.completed})</option>
                    <option value="CANCELLED">Cancelled ({stats.cancelled})</option>
                  </select>
                </div>

                <div className="sm:col-span-4">
                  <select
                    value={selectedDistrictFilter}
                    onChange={(e) => setSelectedDistrictFilter(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50/80 dark:bg-zinc-950/80 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-600 font-semibold cursor-pointer"
                  >
                    <option value="ALL">All 38 Bihar Districts</option>
                    {ALL_BIHAR_DISTRICTS.filter((d) => d !== "ALL").map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Filter Indicators & Reset Action */}
              {(searchTerm || selectedStatusFilter !== "ALL" || selectedDistrictFilter !== "ALL") && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-500">
                    <span>Active Filters:</span>
                    {selectedStatusFilter !== "ALL" && (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-900">
                        Status: {selectedStatusFilter}
                      </span>
                    )}
                    {selectedDistrictFilter !== "ALL" && (
                      <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold border border-zinc-200 dark:border-zinc-700">
                        District: {selectedDistrictFilter}
                      </span>
                    )}
                    {searchTerm && (
                      <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold border border-zinc-200 dark:border-zinc-700">
                        Query: &quot;{searchTerm}&quot;
                      </span>
                    )}
                    <span className="text-zinc-400">({filteredBookings.length} results)</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStatusFilter("ALL");
                      setSelectedDistrictFilter("ALL");
                      setSearchTerm("");
                    }}
                    className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </div>

            {/* Bookings Table */}
            <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden">
              {filteredBookings.length === 0 ? (
                <div className="p-16 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    No customer bookings found
                  </h3>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    {searchTerm || selectedDistrictFilter !== "ALL" || selectedStatusFilter !== "ALL"
                      ? "Try resetting search query or filters."
                      : "New customer bookings from the website will appear here automatically in real-time."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3.5 px-4 sm:px-6">Booking ID</th>
                        <th className="py-3.5 px-4">Customer & Contact</th>
                        <th className="py-3.5 px-4">Service & Specs</th>
                        <th className="py-3.5 px-4">District</th>
                        <th className="py-3.5 px-4">Advance Fee</th>
                        <th className="py-3.5 px-4">Technician</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
                      {filteredBookings.map((booking) => {
                        const badge = getStatusBadge(booking.status);

                        return (
                          <tr
                            key={booking.id}
                            className="hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-colors"
                          >
                            <td className="py-3.5 px-4 sm:px-6 font-mono">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-blue-600 dark:text-blue-400">
                                  {booking.id}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(booking.id, `id-${booking.id}`)}
                                  className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                                  title="Copy Booking ID"
                                >
                                  {copiedId === `id-${booking.id}` ? (
                                    <Check className="w-3 h-3 text-blue-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                              <span className="text-[10px] text-zinc-400 block mt-0.5">
                                {new Date(booking.createdAt).toLocaleDateString("en-IN", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="font-bold text-zinc-900 dark:text-white block">
                                {booking.customerName}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <a
                                  href={`tel:${booking.phoneNumber}`}
                                  className="text-[11px] text-zinc-600 dark:text-zinc-300 hover:text-blue-600 flex items-center gap-1"
                                >
                                  <Phone className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                  <span>+91 {booking.phoneNumber}</span>
                                </a>
                                <a
                                  href={`https://wa.me/91${booking.phoneNumber}?text=${encodeURIComponent(
                                    `Hello ${booking.customerName}, Celebrate Bihar is confirming your service booking ${booking.id}.`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-zinc-400 hover:text-blue-600"
                                  title="Open WhatsApp chat with customer"
                                >
                                  <Send className="w-3 h-3" />
                                </a>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 max-w-xs">
                              <span className="font-bold text-zinc-900 dark:text-zinc-100 block truncate">
                                {booking.serviceName}
                              </span>
                              <span className="text-[11px] text-zinc-500 block truncate">
                                {booking.applianceDetail} (Qty: {booking.unitCount || 1})
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 inline-block border border-zinc-200 dark:border-zinc-700">
                                {booking.district}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="font-black text-zinc-900 dark:text-white block">
                                ₹{booking.advanceFee || 99}
                              </span>
                              <span className="text-[10px] text-zinc-500 font-mono block truncate max-w-[100px]">
                                {booking.utrNumber}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              {booking.assignedTechnician ? (
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-zinc-900 dark:text-white block">
                                      {booking.assignedTechnician.name}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedTechName(booking.assignedTechnician?.name || "");
                                        setSelectedTechPhone(booking.assignedTechnician?.phone || "");
                                        setArrivalWindow(booking.assignedTechnician?.arrivalWindow || "Within 2 Hours");
                                        setAssignTechBooking(booking);
                                      }}
                                      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                      title="Change / Reassign Technician"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </button>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                                    <a
                                      href={`tel:${booking.assignedTechnician.phone}`}
                                      className="text-zinc-500 hover:text-blue-600 flex items-center gap-1"
                                      title="Call Technician"
                                    >
                                      <Phone className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                      <span>+91 {booking.assignedTechnician.phone}</span>
                                    </a>

                                    <a
                                      href={generateWhatsAppDispatchLink(
                                        booking,
                                        booking.assignedTechnician.phone,
                                        booking.assignedTechnician.arrivalWindow
                                      )}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 hover:bg-blue-100 transition-colors"
                                      title="Forward Full Job Card on WhatsApp"
                                    >
                                      <Send className="w-2.5 h-2.5" />
                                      <span>WhatsApp Dispatch</span>
                                    </a>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedTechName("");
                                    setSelectedTechPhone("");
                                    setAssignTechBooking(booking);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 hover:bg-blue-100 dark:hover:bg-blue-900/80 transition-all cursor-pointer shadow-2xs"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>+ Dispatch Tech</span>
                                </button>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              <select
                                value={booking.status}
                                onChange={(e) =>
                                  handleUpdateStatus(booking.id, e.target.value as BookingRecord["status"])
                                }
                                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border focus:outline-none cursor-pointer ${badge.bg}`}
                              >
                                <option value="NEW_PENDING_DISPATCH">Pending Dispatch</option>
                                <option value="PAYMENT_VERIFIED">Payment Verified</option>
                                <option value="TECHNICIAN_ASSIGNED">Tech Assigned</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                              </select>
                            </td>

                            <td className="py-3.5 px-4 sm:px-6 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedBookingDetail(booking)}
                                  className="p-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer"
                                  title="View Full Details"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedTechName(booking.assignedTechnician?.name || "");
                                    setSelectedTechPhone(booking.assignedTechnician?.phone || "");
                                    setArrivalWindow(booking.assignedTechnician?.arrivalWindow || "Within 2 Hours");
                                    setAssignTechBooking(booking);
                                  }}
                                  className="p-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-blue-600 dark:text-blue-400 transition-all cursor-pointer"
                                  title="Dispatch / Re-assign Technician"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteBooking(booking.id)}
                                  className="p-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 transition-all cursor-pointer"
                                  title="Delete Record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: REAL TECHNICIAN FLEET ROSTER */}
        {/* =================================================================== */}
        {activeTab === "dispatch" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                  Bihar Doorstep Technician Fleet Roster
                </h3>
                <p className="text-xs text-zinc-500">
                  Manage real on-ground verified technicians for instant customer booking assignments.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setTechNameInput("");
                  setTechPhoneInput("");
                  setShowAddTechModal(true);
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full font-bold text-xs text-white dark:text-zinc-950 bg-zinc-950 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-sm hover:shadow hover:-translate-y-0.5 transition-all cursor-pointer flex-shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Register New Technician</span>
              </button>
            </div>

            {technicians.length === 0 && activeAssignedTechs.length === 0 ? (
              <div className="p-16 text-center space-y-3 rounded-3xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                  No Technicians in Fleet Roster Yet
                </h4>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Click <strong>&quot;+ Register New Technician&quot;</strong> to add your verified local engineers, or assign them on-the-fly directly to incoming customer bookings.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Registered fleet technicians */}
                {technicians.map((tech) => (
                  <div
                    key={tech.id}
                    className="p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center font-black text-xs">
                            {tech.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                              {tech.name}
                            </h4>
                            <span className="text-[11px] text-zinc-500 block">
                              {tech.district} Hub
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteTechnician(tech.id)}
                          className="text-zinc-400 hover:text-rose-500 p-1"
                          title="Remove from fleet"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950/60 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                        <p><strong>Specialty:</strong> {tech.specialty}</p>
                        <p><strong>Mobile:</strong> +91 {tech.phone}</p>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <a
                        href={`tel:${tech.phone}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Call</span>
                      </a>
                      <a
                        href={`https://wa.me/91${tech.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Hello ${tech.name}, Celebrate Bihar Central Operations Desk regarding new duty assignments.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-bold bg-zinc-950 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-950 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5 text-blue-400 dark:text-blue-600" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                ))}

                {/* Additional technicians derived from assigned bookings */}
                {activeAssignedTechs
                  .filter((at) => !technicians.some((t) => t.name.toLowerCase() === at.name.toLowerCase()))
                  .map((tech, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center font-black text-xs">
                              {tech.name.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                                {tech.name}
                              </h4>
                              <span className="text-[11px] text-zinc-500 block">
                                {tech.district || "Assigned"} Hub
                              </span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                            {tech.activeCount} Active
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950/60 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                          <p><strong>Mobile:</strong> +91 {tech.phone}</p>
                          <p><strong>Source:</strong> Assigned Booking Record</p>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center gap-2">
                        <a
                          href={`tel:${tech.phone}`}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span>Call</span>
                        </a>
                        <a
                          href={`https://wa.me/91${tech.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Hello ${tech.name}, Celebrate Bihar Central Operations Desk regarding your assigned service duty.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-bold bg-zinc-950 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-950 transition-colors"
                        >
                          <Send className="w-3.5 h-3.5 text-blue-400 dark:text-blue-600" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: EDITABLE SERVICES CATALOG & BIHAR NETWORK EXPANSION */}
        {/* =================================================================== */}
        {activeTab === "services" && (
          <div className="space-y-6">
            {/* Header & Add Service Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Dynamic Service Catalog & Bihar Expansion</span>
                </h3>
                <p className="text-xs text-zinc-500">
                  Add new services, manage catalog offerings, or activate new district hubs across Bihar in real-time.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingService(null);
                  setServiceName("");
                  setServiceShortDesc("");
                  setServiceFeatures("Inspection & fault diagnostics\nVerified parts replacement\n30-day doorstep warranty");
                  setShowAddServiceModal(true);
                }}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full font-bold text-xs text-white dark:text-zinc-950 bg-zinc-950 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer flex-shrink-0"
              >
                <Plus className="w-4 h-4 text-blue-400 dark:text-blue-600" />
                <span>+ Add New Service</span>
              </button>
            </div>

            {/* Bihar 38 Districts Network Coverage Hub Manager */}
            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Bihar Expansion Network Coverage ({activeHubs.length} / 38 Districts Active)</span>
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Click any district to toggle active doorstep launch coverage.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {ALL_BIHAR_DISTRICTS.filter((d) => d !== "ALL").map((dist) => {
                  const isActive = activeHubs.includes(dist);
                  return (
                    <button
                      key={dist}
                      type="button"
                      onClick={() => toggleDistrictHub(dist)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${isActive
                          ? "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-zinc-950 dark:border-white shadow-2xs font-bold"
                          : "bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400"
                        }`}
                    >
                      {isActive ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Plus className="w-3 h-3 text-zinc-400" />
                      )}
                      <span>{dist}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Service Categories & Items */}
            <div className="space-y-6">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden"
                >
                  <div className="p-4 sm:p-5 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                        {category.categoryName} ({category.services.length} Services)
                      </h4>
                      <p className="text-[11px] text-zinc-500">{category.description}</p>
                    </div>
                  </div>

                  <div className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
                    {category.services.map((service) => (
                      <div
                        key={service.id}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-blue-50/20 dark:hover:bg-blue-950/15 transition-colors"
                      >
                        <div className="space-y-1.5 max-w-xl">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white">
                              {service.name}
                            </span>
                            {service.popular && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60">
                                Popular
                              </span>
                            )}
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                              {service.group}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            {service.shortDesc}
                          </p>
                          <div className="flex flex-wrap gap-2 text-[11px] text-zinc-500 pt-1">
                            {service.features.map((feat, fidx) => (
                              <span key={fidx} className="flex items-center gap-1">
                                • {feat}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingService(service);
                              setServiceName(service.name);
                              setServiceShortDesc(service.shortDesc);
                              setServiceGroup(service.group);
                              setServiceFeatures(service.features.join("\n"));
                              setServicePopular(!!service.popular);
                              setShowAddServiceModal(true);
                            }}
                            className="p-2 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer"
                            title="Edit Service Details & Specs"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteService(service.id)}
                            className="p-2 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 transition-all cursor-pointer"
                            title="Delete Service"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 4: B2B & INSTITUTIONAL CONSULTATIONS */}
        {/* =================================================================== */}
        {activeTab === "consultations" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                  Institutional Turnkey Setup Leads (B2B)
                </h3>
                <p className="text-xs text-zinc-500">
                  Custom setup inquiries for hospitals, banks, corporate offices, hotels, and schools across Bihar.
                </p>
              </div>
            </div>

            <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden">
              {consultations.length === 0 ? (
                <div className="p-16 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                    No Institutional Inquiries Yet
                  </h4>
                  <p className="text-xs text-zinc-500">
                    Enterprise consultation leads will appear here automatically when submitted from the website.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3.5 px-4 sm:px-6">Inquiry ID</th>
                        <th className="py-3.5 px-4">Client / Institution</th>
                        <th className="py-3.5 px-4">Requirement</th>
                        <th className="py-3.5 px-4">Location</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
                      {consultations.map((c) => (
                        <tr key={c.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-colors">
                          <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-blue-600 dark:text-blue-400">
                            {c.id}
                          </td>
                          <td className="py-3.5 px-4">
                            <strong className="text-zinc-900 dark:text-white block">
                              {c.customerName}
                            </strong>
                            <span className="text-[11px] text-zinc-500 block">
                              {c.orgName || c.facilityType}
                            </span>
                            <a href={`tel:${c.phoneNumber}`} className="text-[11px] text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-0.5 font-semibold">
                              <Phone className="w-3 h-3" /> +91 {c.phoneNumber}
                            </a>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-zinc-900 dark:text-white block">
                              {c.category}
                            </span>
                            <span className="text-[11px] text-zinc-500 block truncate max-w-xs">
                              {c.projectOverview || c.scale}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                              {c.district}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-zinc-700 dark:text-zinc-300">
                            {c.status}
                          </td>
                          <td className="py-3.5 px-4 sm:px-6 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <a
                                href={`tel:${c.phoneNumber}`}
                                className="p-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                                title="Call"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                              <a
                                href={`https://wa.me/91${c.phoneNumber}?text=${encodeURIComponent(
                                  `Hello ${c.customerName}, Celebrate Bihar regarding your inquiry ${c.id}.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                                title="WhatsApp"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 5: REGIONAL ANALYTICS (100% Genuine Metrics) */}
        {/* =================================================================== */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Real Demand by Bihar District</span>
                </h3>
                <div className="space-y-3">
                  {bookings.length === 0 ? (
                    <p className="text-xs text-zinc-500">No customer bookings recorded yet to compute district demand.</p>
                  ) : (
                    activeHubs.slice(0, 8).map((dist) => {
                      const count = bookings.filter((b) => b.district.toLowerCase() === dist.toLowerCase()).length;
                      const percentage = bookings.length > 0 ? Math.round((count / bookings.length) * 100) : 0;
                      return (
                        <div key={dist} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span>{dist}</span>
                            <span className="text-zinc-500">{count} bookings ({percentage}%)</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                            <div
                              className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Operations Integrity Status</span>
                </h3>
                <div className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800">
                    <p className="font-bold text-zinc-900 dark:text-white mb-0.5">Dual-Cloud Sync Active</p>
                    <p>Live replication across Supabase PostgreSQL and Google Cloud Firestore.</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800">
                    <p className="font-bold text-zinc-900 dark:text-white mb-0.5">Strict Data Isolation</p>
                    <p>Customer appliance orders and institutional B2B inquiries are strictly compartmentalized.</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800">
                    <p className="font-bold text-zinc-900 dark:text-white mb-0.5">38 Districts Coverage</p>
                    <p>Instant activation switches across all 38 Bihar districts.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =================================================================== */}
      {/* MODAL: REGISTER VERIFIED TECHNICIAN */}
      {/* =================================================================== */}
      <AnimatePresence>
        {showAddTechModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-6"
            >
              <div className="flex items-start justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <div>
                  <h3 className="text-base font-black text-zinc-900 dark:text-white">
                    + Register Verified Technician
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Add certified engineer to the Celebrate Bihar technician roster.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddTechModal(false)}
                  className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTechnician} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">Technician Full Name *</label>
                  <input
                    type="text"
                    value={techNameInput}
                    onChange={(e) => setTechNameInput(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    required
                    className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-semibold focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">Mobile Number (WhatsApp Enabled) *</label>
                  <input
                    type="tel"
                    value={techPhoneInput}
                    onChange={(e) => setTechPhoneInput(e.target.value)}
                    placeholder="e.g. 9876543210"
                    required
                    className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-semibold focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">Assigned District Hub *</label>
                  <select
                    value={techDistrictInput}
                    onChange={(e) => setTechDistrictInput(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-semibold"
                  >
                    {ALL_BIHAR_DISTRICTS.filter((d) => d !== "ALL").map((dist) => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">Trade Specialty *</label>
                  <input
                    type="text"
                    value={techSpecialtyInput}
                    onChange={(e) => setTechSpecialtyInput(e.target.value)}
                    placeholder="e.g. AC, RO Purifier & Washing Machine Lead"
                    required
                    className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-semibold focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowAddTechModal(false)}
                    className="px-5 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-700 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingNewTech}
                    className="px-6 py-2.5 rounded-full font-bold bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-sm hover:shadow hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-75"
                  >
                    {isSavingNewTech ? "Saving..." : "Save to Roster"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* MODAL: ADD / EDIT SERVICE MODAL */}
      {/* =================================================================== */}
      <AnimatePresence>
        {showAddServiceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-6"
            >
              <div className="flex items-start justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <div>
                  <h3 className="text-base font-black text-zinc-900 dark:text-white">
                    {editingService ? "Edit Service in Catalog" : "+ Add New Service to Catalog"}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Changes will immediately reflect on the public website and booking form.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddServiceModal(false)}
                  className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveService} className="space-y-4 text-xs">
                {!editingService && (
                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-700 dark:text-zinc-300">Category *</label>
                    <select
                      value={serviceCategoryId}
                      onChange={(e) => setServiceCategoryId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-semibold"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.categoryName}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">Service Name *</label>
                  <input
                    type="text"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    placeholder="e.g. Microwave Oven Repair & Magnetron Service"
                    required
                    className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-semibold focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">Short Description *</label>
                  <textarea
                    value={serviceShortDesc}
                    onChange={(e) => setServiceShortDesc(e.target.value)}
                    placeholder="Brief description for customer cards..."
                    rows={2}
                    required
                    className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-700 dark:text-zinc-300">Group Tag</label>
                    <select
                      value={serviceGroup}
                      onChange={(e) => setServiceGroup(e.target.value as any)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-semibold"
                    >
                      <option value="cooling">Cooling & AC</option>
                      <option value="appliances">Appliances & TV</option>
                      <option value="electrical">Electrical & Wiring</option>
                      <option value="plumbing">Plumbing & Sanitary</option>
                      <option value="furniture">Furniture & Assembly</option>
                      <option value="turnkey">Turnkey Setup</option>
                      <option value="custom">Custom Requirement</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 flex flex-col justify-end">
                    <label className="flex items-center gap-2 cursor-pointer pb-2">
                      <input
                        type="checkbox"
                        checked={servicePopular}
                        onChange={(e) => setServicePopular(e.target.checked)}
                        className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-bold text-zinc-700 dark:text-zinc-300">Mark as Popular</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">Features List (1 per line)</label>
                  <textarea
                    value={serviceFeatures}
                    onChange={(e) => setServiceFeatures(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-mono focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowAddServiceModal(false)}
                    className="px-5 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-700 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingService}
                    className="px-6 py-2.5 rounded-full font-bold bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-sm hover:shadow hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-75"
                  >
                    {isSavingService ? "Saving..." : editingService ? "Update Live Service" : "Add to Live Catalog"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* MODAL: FULL BOOKING DETAILS */}
      {/* =================================================================== */}
      <AnimatePresence>
        {selectedBookingDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-6"
            >
              <div className="flex items-start justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                      Booking Summary
                    </h3>
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                      {selectedBookingDetail.id}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-500 mt-0.5 block">
                    Recorded: {new Date(selectedBookingDetail.createdAt).toLocaleString("en-IN")}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBookingDetail(null)}
                  className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Selector in Modal */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Current Operational Status
                  </span>
                  <span className="font-bold text-zinc-900 dark:text-white text-sm mt-0.5 block">
                    {getStatusBadge(selectedBookingDetail.status).label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">Update Status:</label>
                  <select
                    value={selectedBookingDetail.status}
                    onChange={(e) =>
                      handleUpdateStatus(selectedBookingDetail.id, e.target.value as BookingRecord["status"])
                    }
                    className="px-3 py-1.5 rounded-full text-xs font-bold border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-600 cursor-pointer shadow-2xs"
                  >
                    <option value="NEW_PENDING_DISPATCH">Pending Dispatch</option>
                    <option value="PAYMENT_VERIFIED">Payment Verified</option>
                    <option value="TECHNICIAN_ASSIGNED">Tech Assigned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Customer Info Card */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Customer Information</span>
                  <p><strong>Name:</strong> {selectedBookingDetail.customerName}</p>
                  <p><strong>Phone:</strong> +91 {selectedBookingDetail.phoneNumber}</p>
                  {selectedBookingDetail.alternatePhone && (
                    <p><strong>Alt Phone:</strong> +91 {selectedBookingDetail.alternatePhone}</p>
                  )}
                  {selectedBookingDetail.email && (
                    <p><strong>Email:</strong> {selectedBookingDetail.email}</p>
                  )}
                  <p><strong>District:</strong> {selectedBookingDetail.district}</p>
                  <p><strong>Address:</strong> {selectedBookingDetail.address}</p>
                  {selectedBookingDetail.landmark && (
                    <p><strong>Landmark:</strong> {selectedBookingDetail.landmark}</p>
                  )}
                  {selectedBookingDetail.pincode && (
                    <p><strong>PIN Code:</strong> {selectedBookingDetail.pincode}</p>
                  )}
                </div>

                {/* Service Specs Card */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Service Specifications</span>
                  <p><strong>Service:</strong> {selectedBookingDetail.serviceName}</p>
                  <p><strong>Appliance:</strong> {selectedBookingDetail.applianceDetail}</p>
                  <p><strong>Quantity:</strong> {selectedBookingDetail.unitCount || 1} Unit(s)</p>
                  <p><strong>Scheduled Slot:</strong> {selectedBookingDetail.slot}</p>
                  {selectedBookingDetail.specialNotes && (
                    <p><strong>Customer Notes:</strong> {selectedBookingDetail.specialNotes}</p>
                  )}
                </div>
              </div>

              {/* Payment Details Card */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Payment &amp; UPI Verification</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-700 dark:text-zinc-300">
                  <p><strong>Advance Token:</strong> ₹{selectedBookingDetail.advanceFee || 99}</p>
                  <p><strong>Payment Status:</strong> {selectedBookingDetail.paymentStatus}</p>
                  <p><strong>UTR / Transaction Ref:</strong> <span className="font-mono font-bold text-zinc-900 dark:text-white">{selectedBookingDetail.utrNumber}</span></p>
                  <p><strong>Payment App:</strong> {selectedBookingDetail.paymentAppUsed || "UPI"}</p>
                  <p><strong>Payer Name:</strong> {selectedBookingDetail.payerName || selectedBookingDetail.customerName}</p>
                  {selectedBookingDetail.payerUpiId && (
                    <p><strong>Payer UPI ID:</strong> {selectedBookingDetail.payerUpiId}</p>
                  )}
                  <p><strong>Payee UPI ID:</strong> {selectedBookingDetail.payeeUpi || "2dhirajkumar4726@okhdfcbank"}</p>
                  <p><strong>Payee Name:</strong> {selectedBookingDetail.payeeName || "Dhiraj Kumar"}</p>
                </div>

                {/* Attached Payment Screenshot */}
                {selectedBookingDetail.paymentScreenshot && (
                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                      Attached Payment Proof:
                    </span>
                    <div className="relative inline-block border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden max-h-48">
                      <img
                        src={selectedBookingDetail.paymentScreenshot}
                        alt="Payment Proof"
                        className="max-h-48 w-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => {
                          const w = window.open("");
                          w?.document.write(`<img src="${selectedBookingDetail.paymentScreenshot}" style="max-width:100%; height:auto;" />`);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Assigned Technician Card */}
              {selectedBookingDetail.assignedTechnician && (
                <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 block">
                      Assigned Field Engineer
                    </span>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      Window: {selectedBookingDetail.assignedTechnician.arrivalWindow || "Within 2 Hours"}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-white">
                        {selectedBookingDetail.assignedTechnician.name}
                      </p>
                      <p className="text-zinc-600 dark:text-zinc-400 text-[11px]">
                        Mobile: +91 {selectedBookingDetail.assignedTechnician.phone}
                      </p>
                      {selectedBookingDetail.adminNotes && (
                        <p className="text-zinc-500 text-[10px] mt-0.5">
                          Notes: {selectedBookingDetail.adminNotes}
                        </p>
                      )}
                    </div>

                    <a
                      href={generateWhatsAppDispatchLink(
                        selectedBookingDetail,
                        selectedBookingDetail.assignedTechnician.phone,
                        selectedBookingDetail.assignedTechnician.arrivalWindow
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Forward Full Job Card on WhatsApp</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`tel:${selectedBookingDetail.phoneNumber}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Call Client</span>
                  </a>
                  <a
                    href={`https://wa.me/91${selectedBookingDetail.phoneNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
                      `Hello ${selectedBookingDetail.customerName}, Celebrate Bihar regarding your booking ${selectedBookingDetail.id}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>WhatsApp Client</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      const target = selectedBookingDetail;
                      setSelectedBookingDetail(null);
                      setSelectedTechName(target.assignedTechnician?.name || "");
                      setSelectedTechPhone(target.assignedTechnician?.phone || "");
                      setArrivalWindow(target.assignedTechnician?.arrivalWindow || "Within 2 Hours");
                      setAssignTechBooking(target);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-zinc-950 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-950 transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-blue-400 dark:text-blue-600" />
                    <span>{selectedBookingDetail.assignedTechnician ? "Re-assign Tech" : "Dispatch Tech"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteBooking(selectedBookingDetail.id)}
                    className="p-2 rounded-full border border-zinc-200 dark:border-zinc-700 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedBookingDetail(null)}
                  className="px-6 py-2 rounded-full text-xs font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-300 dark:hover:bg-zinc-700 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* MODAL: DISPATCH TECHNICIAN VIA WHATSAPP & SAVE ASSIGNMENT */}
      {/* =================================================================== */}
      <AnimatePresence>
        {assignTechBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-xl w-full max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-5"
            >
              <div className="flex items-start justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-zinc-900 dark:text-white">
                      Dispatch Technician on WhatsApp
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                      {assignTechBooking.id}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Forwards full customer details, appliance specs &amp; GPS location to technician&apos;s WhatsApp.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAssignTechBooking(null)}
                  className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Client & Booking Summary Card */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Client Information Forwarded in WhatsApp Card:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-700 dark:text-zinc-300">
                  <p><strong>Customer:</strong> {assignTechBooking.customerName}</p>
                  <p><strong>Mobile:</strong> +91 {assignTechBooking.phoneNumber}</p>
                  <p><strong>District:</strong> {assignTechBooking.district}</p>
                  <p><strong>Slot:</strong> {assignTechBooking.slot}</p>
                  <p className="sm:col-span-2"><strong>Address:</strong> {assignTechBooking.address}</p>
                  <p className="sm:col-span-2"><strong>Service &amp; Appliance:</strong> {assignTechBooking.serviceName} • {assignTechBooking.applianceDetail}</p>
                  <p><strong>Advance Token:</strong> ₹{assignTechBooking.advanceFee || 99} (UTR: {assignTechBooking.utrNumber})</p>
                </div>
              </div>

              <form onSubmit={(e) => handleSaveTechnician(e, true)} className="space-y-4 text-xs">
                {technicians.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block">
                      Choose from Registered Fleet Roster
                    </label>
                    <select
                      onChange={(e) => {
                        const found = technicians.find((t) => t.id === e.target.value);
                        if (found) {
                          setSelectedTechName(found.name);
                          setSelectedTechPhone(found.phone);
                        }
                      }}
                      className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-semibold text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="">-- Or enter technician details manually below --</option>
                      {technicians.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.district} • {t.specialty} • +91 {t.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block">
                      Technician Full Name *
                    </label>
                    <input
                      type="text"
                      value={selectedTechName}
                      onChange={(e) => setSelectedTechName(e.target.value)}
                      placeholder="e.g. Amit Verma"
                      required
                      className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-semibold focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block">
                      Technician WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      value={selectedTechPhone}
                      onChange={(e) => setSelectedTechPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      required
                      className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-semibold focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block">
                    Estimated Arrival Window
                  </label>
                  <select
                    value={arrivalWindow}
                    onChange={(e) => setArrivalWindow(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-semibold text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="Within 60 Minutes (Urgent)">Within 60 Minutes (Urgent)</option>
                    <option value="Within 2 Hours">Within 2 Hours</option>
                    <option value="Morning Slot (9 AM - 12 PM)">Morning Slot (9 AM - 12 PM)</option>
                    <option value="Afternoon Slot (12 PM - 3 PM)">Afternoon Slot (12 PM - 3 PM)</option>
                    <option value="Evening Slot (3 PM - 7 PM)">Evening Slot (3 PM - 7 PM)</option>
                  </select>
                </div>

                {/* Live Preview of WhatsApp Card Text */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block">
                      WhatsApp Dispatch Message Preview
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const msg = getDispatchMessageText(assignTechBooking, arrivalWindow);
                        copyToClipboard(msg, "dispatch-card");
                      }}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedId === "dispatch-card" ? "Copied!" : "Copy Full Text"}</span>
                    </button>
                  </div>
                  <pre className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap max-h-36 border border-zinc-200 dark:border-zinc-800">
                    {getDispatchMessageText(assignTechBooking, arrivalWindow)}
                  </pre>
                </div>

                {/* Modal Buttons */}
                <div className="pt-3 flex flex-col sm:flex-row items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setAssignTechBooking(null)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-700 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={isSavingTech}
                    onClick={() => handleSaveTechnician(undefined, false)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-full font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer disabled:opacity-75"
                    title="Save assignment in system without opening WhatsApp"
                  >
                    Save In DB Only
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingTech}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-full font-bold bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-sm hover:shadow hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-75"
                  >
                    <Send className="w-3.5 h-3.5 text-blue-400 dark:text-blue-600" />
                    <span>{isSavingTech ? "Saving & Opening..." : "Confirm & Dispatch on WhatsApp"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* MODAL: MANUAL PHONE ORDER CREATOR */}
      {/* =================================================================== */}
      <AnimatePresence>
        {showNewBookingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-xl w-full max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-6"
            >
              <div className="flex items-start justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <div>
                  <h3 className="text-base font-black text-zinc-900 dark:text-white">
                    + Register Phone / Walk-in Booking
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Direct entry for customer inquiries taken over phone or WhatsApp desk.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewBookingModal(false)}
                  className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePhoneBooking} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700 dark:text-zinc-300">Customer Name *</label>
                    <input
                      type="text"
                      value={newCustName}
                      onChange={(e) => setNewCustName(e.target.value)}
                      placeholder="e.g. Rahul Kumar"
                      required
                      className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-semibold focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700 dark:text-zinc-300">Customer Mobile *</label>
                    <input
                      type="tel"
                      value={newCustPhone}
                      onChange={(e) => setNewCustPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      required
                      className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-semibold focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700 dark:text-zinc-300">Customer Email (Optional)</label>
                    <input
                      type="email"
                      value={newCustEmail}
                      onChange={(e) => setNewCustEmail(e.target.value)}
                      placeholder="e.g. customer@gmail.com"
                      className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-semibold focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700 dark:text-zinc-300">Bihar District *</label>
                    <select
                      value={newCustDistrict}
                      onChange={(e) => setNewCustDistrict(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-semibold"
                    >
                      {ALL_BIHAR_DISTRICTS.filter((d) => d !== "ALL").map((dist) => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-zinc-700 dark:text-zinc-300">Complete Address *</label>
                    <input
                      type="text"
                      value={newCustAddress}
                      onChange={(e) => setNewCustAddress(e.target.value)}
                      placeholder="House / Flat No, Street, Colony..."
                      required
                      className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-semibold focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700 dark:text-zinc-300">PIN Code</label>
                    <input
                      type="text"
                      value={newCustPincode}
                      onChange={(e) => setNewCustPincode(e.target.value)}
                      placeholder="e.g. 800001"
                      className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-semibold focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700 dark:text-zinc-300">Choose Service Category</label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          setNewServiceName(e.target.value);
                        }
                      }}
                      className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-semibold"
                    >
                      <option value="">-- Quick Select from Catalog --</option>
                      {categories.flatMap((c) =>
                        c.services.map((s) => (
                          <option key={s.id} value={s.name}>
                            {c.categoryName}: {s.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700 dark:text-zinc-300">Service Name *</label>
                    <input
                      type="text"
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      placeholder="e.g. AC Repair & Service"
                      required
                      className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-semibold focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-zinc-700 dark:text-zinc-300">Appliance Model / Fault *</label>
                    <input
                      type="text"
                      value={newApplianceDetail}
                      onChange={(e) => setNewApplianceDetail(e.target.value)}
                      placeholder="e.g. Split AC (1.5 Ton) - Voltas - Not Cooling"
                      required
                      className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-semibold focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700 dark:text-zinc-300">Unit Quantity</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={newUnitCount}
                      onChange={(e) => setNewUnitCount(Number(e.target.value) || 1)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-semibold focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700 dark:text-zinc-300">Preferred Slot</label>
                    <input
                      type="text"
                      value={newSlot}
                      onChange={(e) => setNewSlot(e.target.value)}
                      placeholder="e.g. Tomorrow Morning (9 AM - 12 PM)"
                      className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-semibold focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700 dark:text-zinc-300">Advance UTR / Transaction ID (If Paid)</label>
                    <input
                      type="text"
                      value={newUtrNumber}
                      onChange={(e) => setNewUtrNumber(e.target.value)}
                      placeholder="e.g. 123456789012 (or leave empty)"
                      className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-mono focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowNewBookingModal(false)}
                    className="px-5 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-700 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingBooking}
                    className="px-6 py-2.5 rounded-full font-bold bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-sm hover:shadow hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-75"
                  >
                    {isCreatingBooking ? "Saving..." : "Save to Cloud Database"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
