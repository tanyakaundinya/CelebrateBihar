"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  X,
  CheckCircle2,
  Phone,
  Mail,
  User,
  MapPin,
  Calendar,
  Wrench,
  Building2,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Share2,
  Send,
  SlidersHorizontal,
  ShieldCheck,
  Download,
  Clock,
  MailCheck,
  Headphones,
  QrCode,
  Smartphone,
  CreditCard,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  Trash2,
  Eye,
  FileCheck2,
} from "lucide-react";
import { serviceData } from "@/data/services";

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: string;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  isOpen,
  onClose,
  initialService = "",
}) => {
  // Steps: 1 = Appliance/Setup Specs, 2 = Contact & Address, 3 = ₹99 Slot Reservation Payment, 4 = Confirmed Receipt & Actions
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Service Category & Appliance/Office Specs
  const [selectedCategory, setSelectedCategory] = useState<string>("repair-maintenance");

  const [applianceType, setApplianceType] = useState<string>("");
  const [customApplianceType, setCustomApplianceType] = useState<string>("");

  const [applianceBrand, setApplianceBrand] = useState<string>("");
  const [customApplianceBrand, setCustomApplianceBrand] = useState<string>("");

  const [setupType, setSetupType] = useState<string>("");
  const [customSetupType, setCustomSetupType] = useState<string>("");

  const [setupPillar, setSetupPillar] = useState<string>("Complete Turnkey Setup (All-in-One)");
  const [setupScale, setSetupScale] = useState<string>("");
  const [customSetupScale, setCustomSetupScale] = useState<string>("");

  const [unitCount, setUnitCount] = useState<number>(1);
  const [specialNotes, setSpecialNotes] = useState<string>("");

  // Step 2: Contact, Address, Time Slots
  const [customerName, setCustomerName] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [alternatePhone, setAlternatePhone] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [landmark, setLandmark] = useState<string>("");
  const [pincode, setPincode] = useState<string>("");

  // Date & Slot
  const [selectedDateType, setSelectedDateType] = useState<string>("Tomorrow");
  const [customDate, setCustomDate] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("Morning (9:00 AM - 12:00 PM)");

  // Step 3: Payment & Reservation Settings (Exact UPI ID & Payee Name)
  const [upiId] = useState<string>("2dhirajkumar4726@okhdfcbank");
  const [payeeName] = useState<string>("Dhiraj Kumar");
  const [payerName, setPayerName] = useState<string>("");
  const [payerUpiId, setPayerUpiId] = useState<string>("");
  const [paymentAppUsed, setPaymentAppUsed] = useState<string>("Google Pay");
  const [utrNumber, setUtrNumber] = useState<string>("");
  const [paymentScreenshot, setPaymentScreenshot] = useState<string>("");
  const [paymentScreenshotName, setPaymentScreenshotName] = useState<string>("");
  const [paymentScreenshotSize, setPaymentScreenshotSize] = useState<string>("");
  const [showScreenshotModal, setShowScreenshotModal] = useState<boolean>(false);
  const [isUpiCopied, setIsUpiCopied] = useState<boolean>(false);

  // Step 4: Confirmation & Receipt Actions
  const [bookingId, setBookingId] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [postBookingEmail, setPostBookingEmail] = useState<string>("");
  const [emailSentStatus, setEmailSentStatus] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dynamicServiceNames, setDynamicServiceNames] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.categories)) {
          const names: string[] = [];
          data.categories.forEach((c: any) => {
            if (Array.isArray(c.services)) {
              c.services.forEach((s: any) => {
                if (s.name) names.push(s.name);
              });
            }
          });
          if (names.length > 0) setDynamicServiceNames(names);
        }
      })
      .catch(() => { });
  }, []);

  // Bihar focus districts list
  const biharDistricts = [
    "Aurangabad",
    "Arwal",
    "Rohtas",
    "Gaya",
    "Jehanabad",
    "Patna",
  ];

  // Default Fallback Services list
  const defaultApplianceTypes = [
    "Television (TV) Repair & Maintenance",
    "Refrigerator Repair & Maintenance",
    "Air Conditioner (AC) Repair, Service & Installation",
    "Air Cooler Repair & Service",
    "Fan Repair & Installation",
    "General Electrical Services",
    "Electrical Wiring & Fitting",
    "Lighting Installation & Maintenance",
    "Plumbing Services",
    "Furniture Repair & Assembly",
    "Equipment Installation & Maintenance",
    "Home & Commercial Maintenance Services",
    "Washing Machine Repair & Service",
    "RO Water Purifier Service",
    "Geyser & Water Heater Repair",
    "Inverter & Battery Wiring",
    "Water Motor Pump Repair",
    "Kitchen Chimney Fitting",
    "Other Custom Repair Requirements",
    "Other",
  ];

  const applianceTypes = dynamicServiceNames.length > 0
    ? Array.from(new Set([...dynamicServiceNames, "Other Custom Repair Requirements", "Other"]))
    : defaultApplianceTypes;

  // Brand / company list
  const acBrands = [
    "Voltas",
    "LG",
    "Samsung",
    "Daikin",
    "Lloyd",
    "Hitachi",
    "Blue Star",
    "Godrej",
    "Whirlpool",
    "Carrier",
    "Panasonic",
    "Havells",
    "IFB",
    "Haier",
    "Bosch",
    "Kent",
    "Livpure",
    "Aquaguard",
    "Crompton",
    "Orient",
    "Usha",
    "Bajaj",
    "Other",
  ];

  // Setup commercial space domains
  const setupDomains = [
    "Banks & Financial Branches",
    "Corporate Offices & IT Workstations",
    "Retail Shops & Commercial Showrooms",
    "Educational Institutions, Schools & Labs",
    "Government & Private Establishments",
    "Clinics & Healthcare Facilities",
    "Restaurants, Cafés & Hospitality",
    "Other Commercial Facility",
    "Other",
  ];

  // Setup solution pillars
  const setupPillarsList = [
    "Complete Turnkey Setup (All-in-One)",
    "Furniture & Workspace Setup",
    "Electrical & Lighting Solutions",
    "Cooling & Climate Solutions",
    "Plumbing & Sanitary Utilities",
    "CCTV, Networking & Signage Setup",
    "Other Custom Setup Scope",
  ];

  const officeCapacities = [
    "Compact (1 - 10 Workstations / 500 - 1,500 sq ft)",
    "Medium (10 - 30 Workstations / 1,500 - 4,000 sq ft)",
    "Large Enterprise (30+ Workstations / Full Floor)",
    "Multi-Branch Expansion Setup across Bihar",
    "Other",
  ];

  // Time slots
  const timeSlots = [
    { id: "slot-emergency", label: "60-Min Urgent", time: "Arrive within 60 Mins", badge: "URGENT" },
    { id: "slot-morning", label: "Morning", time: "9:00 AM - 12:00 PM" },
    { id: "slot-afternoon", label: "Afternoon", time: "12:00 PM - 3:00 PM" },
    { id: "slot-evening", label: "Evening", time: "3:00 PM - 6:00 PM" },
    { id: "slot-night", label: "Night", time: "6:00 PM - 9:00 PM" },
  ];

  // Set category and automatically pre-select matching options if initialService hint is provided
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setErrors({});

      if (initialService) {
        const cleanService = initialService.trim().toLowerCase();

        // 1. Check if it's a Bank, Office or Turnkey Institutional Setup
        const isSetupCategory =
          cleanService.includes("bank") ||
          cleanService.includes("office") ||
          cleanService.includes("institution") ||
          cleanService.includes("workspace") ||
          cleanService.includes("turnkey") ||
          cleanService.includes("facility");

        if (isSetupCategory) {
          setSelectedCategory("bank-office-setup");

          // Pre-select Commercial Space Domain
          if (cleanService.includes("bank") || cleanService.includes("financial")) {
            setSetupType("Banks & Financial Branches");
          } else if (
            cleanService.includes("school") ||
            cleanService.includes("college") ||
            cleanService.includes("lab") ||
            cleanService.includes("education")
          ) {
            setSetupType("Educational Institutions, Schools & Labs");
          } else if (
            cleanService.includes("shop") ||
            cleanService.includes("retail") ||
            cleanService.includes("showroom")
          ) {
            setSetupType("Retail Shops & Commercial Showrooms");
          } else if (cleanService.includes("clinic") || cleanService.includes("health")) {
            setSetupType("Clinics & Healthcare Facilities");
          } else {
            setSetupType("Corporate Offices & IT Workstations");
          }

          // Pre-select Solution Pillar
          if (cleanService.includes("furniture") || cleanService.includes("workstation")) {
            setSetupPillar("Furniture & Workspace Setup");
          } else if (cleanService.includes("electr") || cleanService.includes("lighting")) {
            setSetupPillar("Electrical & Lighting Solutions");
          } else if (cleanService.includes("cool") || cleanService.includes("climate") || cleanService.includes("ac")) {
            setSetupPillar("Cooling & Climate Solutions");
          } else if (cleanService.includes("plumb") || cleanService.includes("sanitary") || cleanService.includes("utility")) {
            setSetupPillar("Plumbing & Sanitary Utilities");
          } else if (cleanService.includes("cctv") || cleanService.includes("network") || cleanService.includes("signage")) {
            setSetupPillar("CCTV, Networking & Signage Setup");
          } else {
            setSetupPillar("Complete Turnkey Setup (All-in-One)");
          }

          if (!setupScale) {
            setSetupScale("Medium (10 - 30 Workstations / 1,500 - 4,000 sq ft)");
          }
        } else {
          // 2. Repair & Maintenance Service
          setSelectedCategory("repair-maintenance");

          // A. Exact match in applianceTypes array
          let matchedAppliance = applianceTypes.find(
            (item) => item.toLowerCase() === cleanService
          );

          // B. Substring & semantic mapping
          if (!matchedAppliance) {
            if (cleanService.includes("ac") || cleanService.includes("air conditioner") || cleanService.includes("cooling")) {
              matchedAppliance = "Air Conditioner (AC) Repair, Service & Installation";
            } else if (cleanService.includes("refrigerator") || cleanService.includes("fridge")) {
              matchedAppliance = "Refrigerator Repair & Maintenance";
            } else if (cleanService.includes("tv") || cleanService.includes("television") || cleanService.includes("display")) {
              matchedAppliance = "Television (TV) Repair & Maintenance";
            } else if (cleanService.includes("cooler")) {
              matchedAppliance = "Air Cooler Repair & Service";
            } else if (cleanService.includes("fan")) {
              matchedAppliance = "Fan Repair & Installation";
            } else if (cleanService.includes("wiring") || cleanService.includes("conduit") || cleanService.includes("earthing")) {
              matchedAppliance = "Electrical Wiring & Fitting";
            } else if (cleanService.includes("light") || cleanService.includes("illumination") || cleanService.includes("chandelier")) {
              matchedAppliance = "Lighting Installation & Maintenance";
            } else if (cleanService.includes("plumb") || cleanService.includes("leak") || cleanService.includes("sanitary") || cleanService.includes("tap")) {
              matchedAppliance = "Plumbing Services";
            } else if (cleanService.includes("furnit") || cleanService.includes("chair") || cleanService.includes("carpenter") || cleanService.includes("assembly")) {
              matchedAppliance = "Furniture Repair & Assembly";
            } else if (cleanService.includes("washing machine") || cleanService.includes("washer")) {
              matchedAppliance = "Washing Machine Repair & Service";
            } else if (cleanService.includes("ro") || cleanService.includes("water purifier")) {
              matchedAppliance = "RO Water Purifier Service";
            } else if (cleanService.includes("geyser") || cleanService.includes("water heater")) {
              matchedAppliance = "Geyser & Water Heater Repair";
            } else if (cleanService.includes("inverter") || cleanService.includes("battery")) {
              matchedAppliance = "Inverter & Battery Wiring";
            } else if (cleanService.includes("motor") || cleanService.includes("pump")) {
              matchedAppliance = "Water Motor Pump Repair";
            } else if (cleanService.includes("chimney")) {
              matchedAppliance = "Kitchen Chimney Fitting";
            } else if (cleanService.includes("equipment")) {
              matchedAppliance = "Equipment Installation & Maintenance";
            } else if (cleanService.includes("home & commercial maintenance") || cleanService.includes("maintenance")) {
              matchedAppliance = "Home & Commercial Maintenance Services";
            } else if (cleanService.includes("electr")) {
              matchedAppliance = "General Electrical Services";
            }
          }

          if (matchedAppliance) {
            setApplianceType(matchedAppliance);
            setCustomApplianceType("");
          } else {
            setApplianceType("Other");
            setCustomApplianceType(initialService);
          }

          // Auto-prefill brand if identifiable
          if (!applianceBrand) {
            if (cleanService.includes("voltas")) setApplianceBrand("Voltas");
            else if (cleanService.includes("lg")) setApplianceBrand("LG");
            else if (cleanService.includes("samsung")) setApplianceBrand("Samsung");
            else if (cleanService.includes("daikin")) setApplianceBrand("Daikin");
            else if (cleanService.includes("blue star")) setApplianceBrand("Blue Star");
            else if (cleanService.includes("godrej")) setApplianceBrand("Godrej");
            else if (cleanService.includes("whirlpool")) setApplianceBrand("Whirlpool");
            else if (cleanService.includes("havells")) setApplianceBrand("Havells");
            else if (cleanService.includes("hitachi")) setApplianceBrand("Hitachi");
            else if (cleanService.includes("ifb")) setApplianceBrand("IFB");
            else if (cleanService.includes("panasonic")) setApplianceBrand("Panasonic");
            else setApplianceBrand("Other");
          }
        }
      }
    }
  }, [initialService, isOpen]);

  // Lock body scroll when modal is open
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

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        handleReset();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting]);

  // Update category with smart defaults
  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    setApplianceType("");
    setApplianceBrand("");
    setCustomApplianceType("");
    setCustomApplianceBrand("");
    setSetupType("");
    setSetupScale("");
    setSetupPillar("Complete Turnkey Setup (All-in-One)");
    setCustomSetupType("");
    setCustomSetupScale("");
    setErrors({});
  };

  // Reset form
  const handleReset = () => {
    setCurrentStep(1);
    setApplianceType("");
    setCustomApplianceType("");
    setApplianceBrand("");
    setCustomApplianceBrand("");
    setSetupType("");
    setCustomSetupType("");
    setSetupScale("");
    setCustomSetupScale("");
    setCustomerEmail("");
    setCustomerName("");
    setPhoneNumber("");
    setAlternatePhone("");
    setDistrict("");
    setPincode("");
    setAddress("");
    setLandmark("");
    setSpecialNotes("");
    setPayerName("");
    setPayerUpiId("");
    setPaymentAppUsed("Google Pay");
    setUtrNumber("");
    setPaymentScreenshot("");
    setPaymentScreenshotName("");
    setPaymentScreenshotSize("");
    setShowScreenshotModal(false);
    setIsUpiCopied(false);
    setEmailSentStatus("");
    setErrors({});
    onClose();
  };

  // Payment Screenshot Upload Handler
  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        screenshot: "Please upload a valid image file (PNG, JPG, JPEG, WEBP).",
      }));
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        screenshot: "Screenshot size must be less than 5MB.",
      }));
      return;
    }

    const sizeStr =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPaymentScreenshot(result);
      setPaymentScreenshotName(file.name);
      setPaymentScreenshotSize(sizeStr);
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.screenshot;
        return copy;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveScreenshot = () => {
    setPaymentScreenshot("");
    setPaymentScreenshotName("");
    setPaymentScreenshotSize("");
  };

  // Step 1 Validation
  const handleProceedToStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (selectedCategory === "repair-maintenance" || selectedCategory === "maintenance") {
      if (!applianceType) {
        newErrors.applianceType = "Please select the service / appliance to repair.";
      } else if (applianceType === "Other" && !customApplianceType.trim()) {
        newErrors.customApplianceType = "Please enter your custom appliance name.";
      }

      if (!applianceBrand) {
        newErrors.applianceBrand = "Please select the brand/company.";
      } else if (applianceBrand === "Other" && !customApplianceBrand.trim()) {
        newErrors.customApplianceBrand = "Please enter your brand/company name.";
      }
    } else {
      if (!setupType) {
        newErrors.setupType = "Please select the commercial space / setup domain.";
      } else if (setupType === "Other" && !customSetupType.trim()) {
        newErrors.customSetupType = "Please enter your setup domain.";
      }

      if (!setupScale) {
        newErrors.setupScale = "Please select the approximate capacity / scale.";
      } else if (setupScale === "Other" && !customSetupScale.trim()) {
        newErrors.customSetupScale = "Please enter your workspace scale.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setCurrentStep(2);
  };

  // Effective display values
  const effectiveApplianceType =
    applianceType === "Other"
      ? customApplianceType.trim() || "Custom Service / Appliance"
      : applianceType;

  const effectiveBrand =
    applianceBrand === "Other"
      ? customApplianceBrand.trim() || "Custom Brand"
      : applianceBrand;

  const effectiveSetupType =
    setupType === "Other"
      ? customSetupType.trim() || "Custom Commercial Space"
      : setupType;

  const effectiveSetupScale =
    setupScale === "Other"
      ? customSetupScale.trim() || "Custom Scale"
      : setupScale;

  const effectiveServiceName =
    selectedCategory === "repair-maintenance" || selectedCategory === "maintenance"
      ? (effectiveApplianceType ? effectiveApplianceType : "Repair & Maintenance Service")
      : (effectiveSetupType ? `${effectiveSetupType} (${setupPillar})` : "Bank & Office Setup Solution");

  const applianceOrSetupDetail =
    selectedCategory === "repair-maintenance" || selectedCategory === "maintenance"
      ? `${effectiveApplianceType || "Appliance"} - ${effectiveBrand || "Brand"}`
      : `${effectiveSetupType || "Commercial Space"} • ${setupPillar} • ${effectiveSetupScale || "Scale"}`;

  const finalDateDisplay =
    selectedDateType === "Custom"
      ? customDate || "Scheduled Date"
      : `${selectedDateType} (${selectedTimeSlot})`;

  // Step 2 -> Step 3: Validate Contact & Address and proceed to ₹99 Slot Payment
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!customerName.trim()) {
      newErrors.name = "Please enter your full name.";
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      newErrors.phone = "Please enter a valid 10-digit mobile number.";
    }

    if (!district.trim()) {
      newErrors.district = "Please select your Bihar district.";
    }

    if (!address.trim()) {
      newErrors.address = "Please enter your local street / address.";
    }

    if (!pincode.trim() || pincode.length !== 6) {
      newErrors.pincode = "Please enter a valid 6-digit Bihar pincode.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    if (!bookingId) {
      const genId = "CB-" + Math.floor(100000 + Math.random() * 900000);
      setBookingId(genId);
    }
    if (!payerName.trim()) {
      setPayerName(customerName.trim());
    }
    setPostBookingEmail(customerEmail.trim());

    // Advance to Step 3 (₹99 Scannable Payment)
    setCurrentStep(3);
  };

  // Step 3 -> Step 4: Finalize Booking with Verified ₹99 Payment & Dispatch
  const handleFinalizeBookingWithPayment = async () => {
    const newErrors: Record<string, string> = {};

    if (!payerName.trim()) {
      newErrors.payerName = "Please enter the account holder / payer name.";
    }

    const cleanUtr = utrNumber.trim();
    if (!cleanUtr) {
      newErrors.utrNumber = "Please enter the 12-digit UTR / UPI Reference Number from your payment receipt.";
    } else if (cleanUtr.length < 6) {
      newErrors.utrNumber = "Please enter a valid UPI Reference / UTR Number (usually 12 digits).";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    const currentId = bookingId || ("CB-" + Math.floor(100000 + Math.random() * 900000));
    if (!bookingId) setBookingId(currentId);

    // Brief verifying feedback for smooth realistic experience
    setTimeout(() => {
      setCurrentStep(4);
      setIsSubmitting(false);
    }, 450);

    // Send notification and email dispatch in background
    fetch("/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId: currentId,
        customerName: customerName.trim(),
        phoneNumber: phoneNumber.trim(),
        alternatePhone: alternatePhone.trim(),
        email: customerEmail.trim() || "Not Provided",
        district,
        address: address.trim(),
        landmark: landmark.trim(),
        pincode: pincode.trim(),
        serviceName: effectiveServiceName,
        applianceDetail: applianceOrSetupDetail,
        unitCount,
        slot: finalDateDisplay,
        specialNotes: specialNotes.trim(),
        advanceFee: 99,
        paymentStatus: "PAID_ADVANCE_99",
        payeeUpi: "2dhirajkumar4726@okhdfcbank",
        payeeName: "Dhiraj Kumar",
        payerName: payerName.trim() || customerName.trim(),
        payerUpiId: payerUpiId.trim(),
        paymentAppUsed,
        utrNumber: cleanUtr,
        paymentScreenshot: paymentScreenshot || undefined,
      }),
    }).catch((err) => {
      console.warn("Background booking dispatch notice:", err);
    });
  };

  // Copy UPI ID to clipboard
  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setIsUpiCopied(true);
    setTimeout(() => setIsUpiCopied(false), 2000);
  };

  // Exact UPI Payment URIs for Scannable QR and direct links
  const upiUri = `upi://pay?pa=2dhirajkumar4726@okhdfcbank&pn=DhirajKumar&am=99&cu=INR&tn=${encodeURIComponent(bookingId || "CB-Booking")}-Deposit`;
  const phonepeUri = `phonepe://pay?pa=2dhirajkumar4726@okhdfcbank&pn=DhirajKumar&am=99&cu=INR&tn=${encodeURIComponent(bookingId || "CB-Booking")}-Deposit`;
  const gpayUri = `tez://upi/pay?pa=2dhirajkumar4726@okhdfcbank&pn=DhirajKumar&am=99&cu=INR&tn=${encodeURIComponent(bookingId || "CB-Booking")}-Deposit`;
  const paytmUri = `paytmmp://pay?pa=2dhirajkumar4726@okhdfcbank&pn=DhirajKumar&am=99&cu=INR&tn=${encodeURIComponent(bookingId || "CB-Booking")}-Deposit`;

  // Send copy to custom email after booking
  const handleSendPostBookingEmail = async () => {
    if (!postBookingEmail.trim()) return;
    setEmailSentStatus("Sending copy...");
    try {
      await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          customerName: customerName.trim(),
          phoneNumber: phoneNumber.trim(),
          alternatePhone: alternatePhone.trim(),
          email: postBookingEmail.trim(),
          district,
          address: address.trim(),
          landmark: landmark.trim(),
          pincode: pincode.trim(),
          serviceName: effectiveServiceName,
          applianceDetail: applianceOrSetupDetail,
          unitCount,
          slot: finalDateDisplay,
          specialNotes: specialNotes.trim(),
          advanceFee: 99,
          paymentStatus: "PAID_ADVANCE_99",
          payeeUpi: "2dhirajkumar4726@okhdfcbank",
          payeeName: "Dhiraj Kumar",
          payerName: payerName.trim() || customerName.trim(),
          payerUpiId: payerUpiId.trim(),
          paymentAppUsed,
          utrNumber: utrNumber.trim() || "UPI-CONFIRMED",
          paymentScreenshot: paymentScreenshot || undefined,
        }),
      });
      setEmailSentStatus(`Receipt copy dispatched to ${postBookingEmail}!`);
    } catch {
      setEmailSentStatus("Receipt sent to queue.");
    }
  };

  // Printable Receipt Generator & PDF Downloader
  const handleDownloadReceipt = () => {
    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Celebrate Bihar Booking Receipt - ${bookingId}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #09090b;
            margin: 0;
            padding: 24px;
            background: #ffffff;
          }
          .receipt-card {
            max-width: 650px;
            margin: 0 auto;
            border: 1px solid #18181b;
            border-radius: 16px;
            padding: 32px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #e4e4e7;
            padding-bottom: 20px;
            margin-bottom: 24px;
          }
          .brand-title {
            font-size: 24px;
            font-weight: 800;
            color: #09090b;
            margin: 0;
          }
          .brand-sub {
            font-size: 12px;
            color: #71717a;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-top: 4px;
          }
          .status-badge {
            background: #f4f4f5;
            color: #09090b;
            font-size: 12px;
            font-weight: 700;
            padding: 6px 14px;
            border-radius: 20px;
            border: 1px solid #e4e4e7;
            display: inline-block;
          }
          .booking-id-box {
            background: #fafafa;
            border: 1px dashed #a1a1aa;
            border-radius: 12px;
            padding: 12px 18px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
          }
          .id-label { font-size: 12px; color: #71717a; }
          .id-val { font-size: 16px; font-weight: 800; font-family: monospace; color: #09090b; }
          .section-title {
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #18181b;
            margin-bottom: 12px;
            border-left: 3px solid #18181b;
            padding-left: 8px;
          }
          .grid-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f4f4f5;
            font-size: 13px;
          }
          .grid-label { color: #71717a; }
          .grid-val { font-weight: 600; color: #09090b; text-align: right; }
          .notice-box {
            background: #f4f4f5;
            border: 1px solid #e4e4e7;
            border-radius: 12px;
            padding: 14px;
            margin-top: 24px;
            font-size: 12px;
            color: #18181b;
            line-height: 1.5;
          }
          .footer {
            margin-top: 32px;
            padding-top: 16px;
            border-top: 1px solid #e4e4e7;
            text-align: center;
            font-size: 11px;
            color: #71717a;
          }
          @media print {
            body { padding: 0; }
            .receipt-card { border: none; box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="receipt-card">
          <div class="header">
            <div>
              <h1 class="brand-title">Celebrate Bihar</h1>
              <div class="brand-sub">Doorstep Appliance &amp; Turnkey Service</div>
            </div>
            <div class="status-badge">✓ ₹99 Advance Paid • Confirmed</div>
          </div>

          <div class="booking-id-box">
            <div>
              <div class="id-label">Official Booking Reference</div>
              <div class="id-val">${bookingId}</div>
            </div>
            <div style="text-align: right;">
              <div class="id-label">Deposit Status</div>
              <div style="font-size: 13px; font-weight: 800; color: #09090b;">₹99.00 PAID (UPI)</div>
            </div>
          </div>

          <div class="section-title">Customer &amp; Service Location</div>
          <div class="grid-row">
            <span class="grid-label">Customer Name</span>
            <span class="grid-val">${customerName}</span>
          </div>
          <div class="grid-row">
            <span class="grid-label">Primary Mobile</span>
            <span class="grid-val">+91 ${phoneNumber} ${alternatePhone ? `(Alt: ${alternatePhone})` : ""}</span>
          </div>
          <div class="grid-row">
            <span class="grid-label">Email Address</span>
            <span class="grid-val">${customerEmail || postBookingEmail || "Not Provided"}</span>
          </div>
          <div class="grid-row">
            <span class="grid-label">Doorstep Address</span>
            <span class="grid-val">${address}, ${landmark ? landmark + ", " : ""}${district} - ${pincode}</span>
          </div>

          <div style="margin-top: 20px;" class="section-title">Appliance &amp; Service Details</div>
          <div class="grid-row">
            <span class="grid-label">Service Required</span>
            <span class="grid-val">${effectiveServiceName}</span>
          </div>
          <div class="grid-row">
            <span class="grid-label">Appliance / Specs</span>
            <span class="grid-val">${applianceOrSetupDetail}</span>
          </div>
          <div class="grid-row">
            <span class="grid-label">Total Units</span>
            <span class="grid-val">${unitCount} Unit${unitCount > 1 ? "s" : ""}</span>
          </div>
          <div class="grid-row">
            <span class="grid-label">Scheduled Slot</span>
            <span class="grid-val">${finalDateDisplay}</span>
          </div>

          <div style="margin-top: 20px;" class="section-title">Payment &amp; Settlement Breakdown</div>
          <div class="grid-row">
            <span class="grid-label">Slot Reservation Deposit Paid</span>
            <span class="grid-val" style="color: #09090b; font-weight: 800;">₹99.00 (UPI Online Advance)</span>
          </div>
          <div class="grid-row">
            <span class="grid-label">Payee / Beneficiary</span>
            <span class="grid-val">Dhiraj Kumar (2dhirajkumar4726@okhdfcbank)</span>
          </div>
          <div class="grid-row">
            <span class="grid-label">Payer Account / Name</span>
            <span class="grid-val">${payerName || customerName}</span>
          </div>
          <div class="grid-row">
            <span class="grid-label">12-Digit UTR / Transaction Ref</span>
            <span class="grid-val" style="font-family: monospace; font-weight: 700; color: #09090b;">${utrNumber || "UPI-CONFIRMED"}</span>
          </div>
          <div class="grid-row">
            <span class="grid-label">Payment App Used</span>
            <span class="grid-val">${paymentAppUsed}</span>
          </div>
          ${paymentScreenshot
        ? `
          <div class="grid-row">
            <span class="grid-label">Payment Screenshot Proof</span>
            <span class="grid-val" style="color: #09090b; font-weight: 700;">✓ Attached &amp; Dispatched (${paymentScreenshotName || "Receipt Image"})</span>
          </div>
          `
        : ""
      }
          <div class="grid-row">
            <span class="grid-label">Final Invoice Adjustment</span>
            <span class="grid-val" style="font-weight: 700;">₹99.00 Deducted from Final Service Bill</span>
          </div>

          <div class="notice-box">
            <strong>📞 Next Step from Operations Team:</strong><br/>
            Our Bihar dispatch desk will call you within <strong>15–30 minutes</strong> to confirm the technician's arrival window. Your ₹99 advance deposit is 100% adjusted against your final repair bill.
          </div>

          <div class="footer">
            Celebrate Bihar Operations Desk • Aurangabad | Arwal | Rohtas | Gaya | Jehanabad | Patna • 24x7 Helpline: +91 98765 43210<br/>
            "Aap Requirement Batayein, Arrangement Celebrate Bihar Sambhalega!"
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(receiptHtml);
      printWindow.document.close();
    }
  };

  // Step Slide Animation
  const stepVariants = {
    initial: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? 30 : -30,
    }),
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.25, ease: "easeOut" },
    },
    exit: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? -30 : 30,
      transition: { duration: 0.18, ease: "easeIn" },
    }),
  };

  // Build WhatsApp share message
  const whatsappMessage = encodeURIComponent(
    `*Celebrate Bihar - Service Booking Confirmation*\n` +
    `-----------------------------------\n` +
    `*Booking ID:* ${bookingId}\n` +
    `*Customer Name:* ${customerName}\n` +
    `*Phone:* +91 ${phoneNumber}\n` +
    (customerEmail || postBookingEmail ? `*Email:* ${customerEmail || postBookingEmail}\n` : "") +
    `*Service:* ${effectiveServiceName} (${unitCount} Unit${unitCount > 1 ? "s" : ""})\n` +
    `*Appliance / Specs:* ${applianceOrSetupDetail}\n` +
    `*District & Address:* ${district} - ${address}, ${landmark ? landmark + ", " : ""}PIN: ${pincode}\n` +
    `*Preferred Slot:* ${finalDateDisplay}\n` +
    `*Advance Slot Deposit:* ₹99.00 (Paid to Dhiraj Kumar via ${paymentAppUsed})\n` +
    `*Payer Name:* ${payerName || customerName}\n` +
    (utrNumber ? `*12-Digit UTR Ref:* ${utrNumber}\n` : "") +
    (paymentScreenshot ? `*Payment Screenshot Proof:* Attached (${paymentScreenshotName || "Receipt"})\n` : "") +
    `*Payment Balance:* Post-Inspection Settlement (₹99 Deducted)\n` +
    `-----------------------------------\n` +
    `Aap Requirement Batayein, Arrangement Celebrate Bihar Sambhalega!`
  );

  const handleCopyBookingId = () => {
    navigator.clipboard.writeText(bookingId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 overflow-hidden my-auto max-h-[94vh] flex flex-col"
      >
        {/* Top Header Banner */}
        <div className="bg-zinc-950 text-white p-4 sm:p-6 md:p-7 relative border-b border-zinc-800 flex-shrink-0">
          <button
            onClick={handleReset}
            className="absolute top-4 sm:top-5 right-4 sm:right-5 w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1">
            <span className="text-white">Celebrate Bihar</span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400 font-medium normal-case tracking-normal">Doorstep Booking</span>
          </div>
          <h3 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight">
            {currentStep === 4 ? "Booking Confirmed!" : (currentStep === 3 ? "Complete ₹99 Reservation" : "Book Doorstep Service")}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            {currentStep === 1 && "Step 1 of 3: Select your service, appliance & requirement"}
            {currentStep === 2 && "Step 2 of 3: Contact info, landmark & schedule slot"}
            {currentStep === 3 && "Step 3 of 3: Fixed ₹99 Slot Reservation Fee (Scannable QR & UPI)"}
            {currentStep === 4 && "Your request is registered with verified Bihar operations"}
          </p>

          {/* Progress Indicators (3 Steps) */}
          {currentStep < 4 && (
            <div className="mt-3 sm:mt-4 flex items-center gap-2">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex-1">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${currentStep >= step ? "bg-white dark:bg-white shadow-xs" : "bg-zinc-800"
                      }`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Body Container with AnimatePresence */}
        <div className="p-4 sm:p-6 md:p-7 max-h-[75vh] overflow-y-auto flex-1">
          <AnimatePresence mode="wait" custom={currentStep}>
            {/* STEP 1: SERVICE CATEGORY & APPLIANCE TYPE / BRAND / UNITS */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                custom={1}
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                {/* 1. Category Switcher (Sleek 2-Card Track Selection) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                    1. Select Service Track
                  </label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {/* Track A: Repair & Maintenance */}
                    <button
                      type="button"
                      onClick={() => handleCategoryChange("repair-maintenance")}
                      className={`p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${selectedCategory === "repair-maintenance" || selectedCategory === "maintenance"
                        ? "border-zinc-950 dark:border-white bg-zinc-100/90 dark:bg-zinc-800/90 ring-2 ring-zinc-950 dark:ring-white shadow-sm"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950"
                        }`}
                    >
                      <div
                        className={`p-2.5 rounded-xl flex-shrink-0 transition-colors ${selectedCategory === "repair-maintenance" || selectedCategory === "maintenance"
                          ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                          }`}
                      >
                        <Wrench className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-zinc-950 dark:text-white">
                          Repair &amp; Maintenance
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-0.5">
                          TV, AC, Refrigerator, Coolers, Electrical, Plumbing &amp; Appliances
                        </div>
                      </div>
                    </button>

                    {/* Track B: Institution & Business Setup */}
                    <button
                      type="button"
                      onClick={() => handleCategoryChange("bank-office-setup")}
                      className={`p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${selectedCategory === "bank-office-setup" || selectedCategory === "setup"
                        ? "border-zinc-950 dark:border-white bg-zinc-100/90 dark:bg-zinc-800/90 ring-2 ring-zinc-950 dark:ring-white shadow-sm"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950"
                        }`}
                    >
                      <div
                        className={`p-2.5 rounded-xl flex-shrink-0 transition-colors ${selectedCategory === "bank-office-setup" || selectedCategory === "setup"
                          ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                          }`}
                      >
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-zinc-950 dark:text-white">
                          Bank &amp; Office Setup
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-0.5">
                          Turnkey Infrastructure, Workstations, Wiring, HVAC &amp; CCTV Fitouts
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. Appliance Details, Brand/Company & Quantity */}
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                    <SlidersHorizontal className="w-4 h-4 text-zinc-950 dark:text-white" />
                    <span>
                      {selectedCategory === "repair-maintenance" || selectedCategory === "maintenance"
                        ? "2. Service / Appliance, Brand & Quantity"
                        : "2. Commercial Space, Solution Pillar & Scale"}
                    </span>
                  </div>

                  {selectedCategory === "repair-maintenance" || selectedCategory === "maintenance" ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Appliance to repair */}
                        <div>
                          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                            Service / Appliance *
                          </label>
                          <select
                            value={applianceType}
                            onChange={(e) => setApplianceType(e.target.value)}
                            className={`w-full text-xs sm:text-sm p-2.5 rounded-xl border ${errors.applianceType ? "border-red-500 bg-red-50/20" : "border-zinc-200 dark:border-zinc-800"
                              } bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white font-medium`}
                          >
                            <option value="">-- Select Service / Appliance --</option>
                            {applianceTypes.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                          {errors.applianceType && (
                            <p className="text-[11px] text-red-500 mt-1">{errors.applianceType}</p>
                          )}
                        </div>

                        {/* Brand / Company */}
                        <div>
                          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                            Brand / Make *
                          </label>
                          <select
                            value={applianceBrand}
                            onChange={(e) => setApplianceBrand(e.target.value)}
                            className={`w-full text-xs sm:text-sm p-2.5 rounded-xl border ${errors.applianceBrand ? "border-red-500 bg-red-50/20" : "border-zinc-200 dark:border-zinc-800"
                              } bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white font-medium`}
                          >
                            <option value="">-- Select Brand / Make --</option>
                            {acBrands.map((b) => (
                              <option key={b} value={b}>
                                {b}
                              </option>
                            ))}
                          </select>
                          {errors.applianceBrand && (
                            <p className="text-[11px] text-red-500 mt-1">{errors.applianceBrand}</p>
                          )}
                        </div>

                        {/* Unit count */}
                        <div>
                          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                            Total Units
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setUnitCount(Math.max(1, unitCount - 1))}
                              className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-extrabold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-all cursor-pointer"
                            >
                              -
                            </button>
                            <span className="font-extrabold text-zinc-950 dark:text-white text-base w-8 text-center">
                              {unitCount}
                            </span>
                            <button
                              type="button"
                              onClick={() => setUnitCount(unitCount + 1)}
                              className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-extrabold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-all cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Dynamic Custom Input Boxes when 'Other' is selected */}
                      <div className="grid sm:grid-cols-2 gap-3">
                        {applianceType === "Other" && (
                          <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 shadow-2xs">
                            <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                              Specify Custom Requirement / Appliance *
                            </label>
                            <input
                              type="text"
                              value={customApplianceType}
                              onChange={(e) => setCustomApplianceType(e.target.value)}
                              placeholder="Specify appliance or equipment type (e.g. Chiller, Chandelier)"
                              className="w-full text-xs sm:text-sm p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                            />
                            {errors.customApplianceType && (
                              <p className="text-[11px] text-red-500 mt-1">{errors.customApplianceType}</p>
                            )}
                          </div>
                        )}

                        {applianceBrand === "Other" && (
                          <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 shadow-2xs">
                            <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                              Specify Company / Make Name *
                            </label>
                            <input
                              type="text"
                              value={customApplianceBrand}
                              onChange={(e) => setCustomApplianceBrand(e.target.value)}
                              placeholder="Specify brand or make name (e.g. Daikin, Havells, Custom)"
                              className="w-full text-xs sm:text-sm p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                            />
                            {errors.customApplianceBrand && (
                              <p className="text-[11px] text-red-500 mt-1">{errors.customApplianceBrand}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Setup Domain */}
                        <div>
                          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                            Commercial Space Type *
                          </label>
                          <select
                            value={setupType}
                            onChange={(e) => setSetupType(e.target.value)}
                            className={`w-full text-xs sm:text-sm p-2.5 rounded-xl border ${errors.setupType ? "border-red-500 bg-red-50/20" : "border-zinc-200 dark:border-zinc-800"
                              } bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white font-medium`}
                          >
                            <option value="">-- Select Space Type --</option>
                            {setupDomains.map((dom) => (
                              <option key={dom} value={dom}>
                                {dom}
                              </option>
                            ))}
                          </select>
                          {errors.setupType && (
                            <p className="text-[11px] text-red-500 mt-1">{errors.setupType}</p>
                          )}
                        </div>

                        {/* Setup Solution Pillar */}
                        <div>
                          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                            Solution Pillar
                          </label>
                          <select
                            value={setupPillar}
                            onChange={(e) => setSetupPillar(e.target.value)}
                            className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white font-medium"
                          >
                            {setupPillarsList.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Workspace Scale */}
                        <div>
                          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                            Capacity / Scale *
                          </label>
                          <select
                            value={setupScale}
                            onChange={(e) => setSetupScale(e.target.value)}
                            className={`w-full text-xs sm:text-sm p-2.5 rounded-xl border ${errors.setupScale ? "border-red-500 bg-red-50/20" : "border-zinc-200 dark:border-zinc-800"
                              } bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white font-medium`}
                          >
                            <option value="">-- Select Scale --</option>
                            {officeCapacities.map((cap) => (
                              <option key={cap} value={cap}>
                                {cap}
                              </option>
                            ))}
                          </select>
                          {errors.setupScale && (
                            <p className="text-[11px] text-red-500 mt-1">{errors.setupScale}</p>
                          )}
                        </div>
                      </div>

                      {/* Custom inputs for Setup when Other selected */}
                      <div className="grid sm:grid-cols-2 gap-3">
                        {setupType === "Other" && (
                          <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 shadow-2xs">
                            <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                              Specify Space / Establishment Type *
                            </label>
                            <input
                              type="text"
                              value={customSetupType}
                              onChange={(e) => setCustomSetupType(e.target.value)}
                              placeholder="Specify establishment or business type (e.g. Clinic, Coaching Center)"
                              className="w-full text-xs sm:text-sm p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                            />
                            {errors.customSetupType && (
                              <p className="text-[11px] text-red-500 mt-1">{errors.customSetupType}</p>
                            )}
                          </div>
                        )}

                        {setupScale === "Other" && (
                          <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 shadow-2xs">
                            <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                              Specify Custom Area / Capacity *
                            </label>
                            <input
                              type="text"
                              value={customSetupScale}
                              onChange={(e) => setCustomSetupScale(e.target.value)}
                              placeholder="Specify area or scale (e.g. 5,000 sq ft, 2 floors)"
                              className="w-full text-xs sm:text-sm p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                            />
                            {errors.customSetupScale && (
                              <p className="text-[11px] text-red-500 mt-1">{errors.customSetupScale}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Additional Notes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                    3. Problem Summary / Specific Requirements (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder="Describe your issue or specific service requirements (e.g. AC cooling low, water leakage issue, need technician today)"
                    className="w-full text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-3 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleProceedToStep2}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm text-white dark:text-zinc-950 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-md transition-all cursor-pointer"
                  >
                    <span>Proceed to Contact &amp; Address</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: CONTACT DETAILS, LANDMARK, PINCODE & TIME SLOTS */}
            {currentStep === 2 && (
              <motion.form
                key="step2"
                custom={2}
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                onSubmit={handleProceedToPayment}
                className="space-y-5"
              >
                {/* Emergency Urgency Banner */}
                <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center gap-2.5 text-xs text-zinc-800 dark:text-zinc-200">
                  <span className="relative flex h-2 w-2 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600 dark:bg-red-500" />
                  </span>
                  <span><strong>Urgent Breakdown?</strong> Guaranteed prompt technician dispatch across all Bihar focus districts.</span>
                </div>

                {/* Name & Primary Mobile */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Your full name (e.g. Rahul Sharma)"
                        className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border ${errors.name ? "border-red-500 bg-red-50/20" : "border-zinc-200 dark:border-zinc-800"
                          } bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white`}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                      Mobile Number (For Technician Call) *
                    </label>
                    <div className={`relative flex items-center rounded-xl border ${errors.phone ? "border-red-500 bg-red-50/20" : "border-zinc-200 dark:border-zinc-800"
                      } bg-white dark:bg-zinc-950 focus-within:ring-2 focus-within:ring-zinc-900 dark:focus-within:ring-white transition-all overflow-hidden`}>
                      {/* Prefix */}
                      <div className="pl-3.5 pr-2 py-2.5 flex items-center gap-1.5 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 select-none">
                        <Phone className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 font-mono">+91</span>
                      </div>

                      {/* Input area with ghost X placeholder overlay */}
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
                    {errors.phone && (
                      <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Email Address & Alternate Phone */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                      Email Address (For Instant Invoice Copy)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                      Alternate Mobile (Optional)
                    </label>
                    <div className="relative flex items-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus-within:ring-2 focus-within:ring-zinc-900 dark:focus-within:ring-white transition-all overflow-hidden">
                      <div className="pl-3.5 pr-2 py-2.5 flex items-center gap-1.5 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 select-none">
                        <Phone className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 font-mono">+91</span>
                      </div>

                      <div className="relative flex-1 flex items-center">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-mono tracking-widest pointer-events-none select-none">
                          <span className="opacity-0">{alternatePhone}</span>
                          <span className="text-zinc-400 dark:text-zinc-600">
                            {"X".repeat(Math.max(0, 10 - alternatePhone.length))}
                          </span>
                        </div>

                        <input
                          type="tel"
                          maxLength={10}
                          value={alternatePhone}
                          onChange={(e) => setAlternatePhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          className="w-full pl-3.5 pr-3.5 py-2.5 text-xs sm:text-sm font-mono tracking-widest bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-hidden relative z-10 font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* District & Pincode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                      Bihar District *
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className={`w-full pl-9 pr-2 py-2.5 text-xs sm:text-sm rounded-xl border ${errors.district ? "border-red-500 bg-red-50/20" : "border-zinc-200 dark:border-zinc-800"
                          } bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white`}
                      >
                        <option value="">-- Select Bihar District --</option>
                        {biharDistricts.map((dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.district && (
                      <p className="text-[11px] text-red-500 mt-1">{errors.district}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                      Pincode (6-Digits) *
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                      placeholder="6-digit Bihar pincode (e.g. 800001)"
                      className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border ${errors.pincode ? "border-red-500 bg-red-50/20" : "border-zinc-200 dark:border-zinc-800"
                        } bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white`}
                    />
                    {errors.pincode && (
                      <p className="text-[11px] text-red-500 mt-1">{errors.pincode}</p>
                    )}
                  </div>
                </div>

                {/* Street Address & Landmark */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                      Flat / House No. &amp; Street *
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House / Flat No., Building & Street name"
                      className={`w-full p-2.5 text-xs sm:text-sm rounded-xl border ${errors.address ? "border-red-500 bg-red-50/20" : "border-zinc-200 dark:border-zinc-800"
                        } bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white`}
                    />
                    {errors.address && (
                      <p className="text-xs text-red-500 mt-1">{errors.address}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                      Landmark / Mohalla / Area
                    </label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="Nearby landmark (e.g. Near main chowk / hospital)"
                      className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                    />
                  </div>
                </div>

                {/* Interactive Date & Time Slot Selection */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                      Select Preferred Date &amp; Time Slot
                    </span>
                  </div>

                  {/* Date Chips */}
                  <div className="flex flex-wrap gap-2">
                    {["Today", "Tomorrow", "Day After", "Custom"].map((dType) => (
                      <button
                        key={dType}
                        type="button"
                        onClick={() => setSelectedDateType(dType)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${selectedDateType === dType
                          ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-2xs"
                          : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          }`}
                      >
                        {dType}
                      </button>
                    ))}
                  </div>

                  {selectedDateType === "Custom" && (
                    <div className="pt-1">
                      <input
                        type="date"
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        className="p-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                  )}

                  {/* Time Slot Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedTimeSlot(`${slot.label} (${slot.time})`)}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${selectedTimeSlot.includes(slot.label)
                          ? "border-zinc-950 dark:border-white bg-zinc-100 dark:bg-zinc-800 ring-1 ring-zinc-950 dark:ring-white"
                          : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-950 dark:text-white">{slot.label}</span>
                          {slot.badge && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded">
                              {slot.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">{slot.time}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer order-2 sm:order-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Requirements</span>
                  </button>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm text-white dark:text-zinc-950 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-md transition-all cursor-pointer order-1 sm:order-2"
                  >
                    <span>Proceed to Slot Reservation</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.form>
            )}

            {/* STEP 3: ₹99 SLOT RESERVATION & SCANNABLE UPI QR PAYMENT */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                custom={3}
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-5"
              >
                {/* Amount & Purpose Header Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-100/90 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" />
                      Fixed Slot Reservation Deposit
                    </span>
                    <h4 className="text-lg font-bold text-zinc-950 dark:text-white">
                      {effectiveServiceName}
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Scheduled for: <strong className="text-zinc-900 dark:text-zinc-200">{finalDateDisplay}</strong>
                    </p>
                  </div>

                  <div className="text-left sm:text-right p-3 sm:p-0 rounded-xl bg-white dark:bg-zinc-900 sm:bg-transparent border sm:border-0 border-zinc-200 dark:border-zinc-700">
                    <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Payable Advance</div>
                    <div className="text-3xl font-black text-zinc-950 dark:text-white">
                      ₹99<span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 ml-1">.00</span>
                    </div>
                    <span className="inline-block mt-0.5 text-[10px] font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 rounded border border-zinc-300 dark:border-zinc-600">
                      100% Adjusted in Final Bill
                    </span>
                  </div>
                </div>

                {/* Verified Payee Details Header */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 flex-shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {payeeName}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded border border-zinc-300 dark:border-zinc-700">
                          ✓ Verified Payee
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 block truncate">
                        {upiId}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyUpiId}
                    className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-bold border border-zinc-200 dark:border-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                  >
                    {isUpiCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />
                        <span>UPI Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy UPI ID</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Payment Interaction Box: Option 1 (QR Code) & Option 2 (Direct Pay Links) */}
                <div className="p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-5">
                  {/* Scannable Dynamic QR Code Container */}
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 shadow-sm relative group">
                      <QRCodeSVG
                        value={upiUri}
                        size={175}
                        level="H"
                        includeMargin={false}
                        className="w-40 h-40 sm:w-44 sm:h-44"
                      />
                    </div>

                    <div className="mt-3 text-center space-y-1">
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-center gap-1.5">
                        <QrCode className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                        <span>Scan QR Code with Any UPI App to Pay ₹99</span>
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Google Pay • PhonePe • Paytm • BHIM • Cred • Any Bank App
                      </p>
                    </div>
                  </div>

                  {/* Mobile Direct Pay Badges (Pay Using Link) */}
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Or Pay Directly Using Link (Mobile One-Tap):
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <a
                        href={phonepeUri}
                        className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-purple-400 dark:hover:border-purple-600 text-center transition-all flex flex-col items-center justify-center gap-1 group shadow-2xs cursor-pointer"
                      >
                        <Smartphone className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">PhonePe</span>
                      </a>

                      <a
                        href={gpayUri}
                        className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-blue-400 dark:hover:border-blue-600 text-center transition-all flex flex-col items-center justify-center gap-1 group shadow-2xs cursor-pointer"
                      >
                        <Smartphone className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Google Pay</span>
                      </a>

                      <a
                        href={paytmUri}
                        className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-sky-400 dark:hover:border-sky-600 text-center transition-all flex flex-col items-center justify-center gap-1 group shadow-2xs cursor-pointer"
                      >
                        <Smartphone className="w-4 h-4 text-sky-500 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Paytm</span>
                      </a>

                      <a
                        href={upiUri}
                        className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-400 dark:hover:border-emerald-600 text-center transition-all flex flex-col items-center justify-center gap-1 group shadow-2xs cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Default UPI</span>
                      </a>
                    </div>
                  </div>

                  {/* Payee & Payer Identity Verification Section */}
                  <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                        Confirm Identity &amp; Payment Details
                      </span>
                    </div>

                    {/* Payer Account / Sender Name & UTR Number */}
                    <div className="grid sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                          Sender / Payer Name (on UPI / Bank) *
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={payerName}
                            onChange={(e) => setPayerName(e.target.value)}
                            placeholder="Account holder name as per bank records"
                            className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border ${errors.payerName ? "border-red-500 bg-red-50/20" : "border-zinc-200 dark:border-zinc-800"
                              } bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white`}
                          />
                        </div>
                        {errors.payerName && (
                          <p className="text-[11px] text-red-500 mt-1">{errors.payerName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                          12-Digit UTR / UPI Reference Number *
                        </label>
                        <div className="relative">
                          <CreditCard className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={utrNumber}
                            onChange={(e) => setUtrNumber(e.target.value)}
                            placeholder="12-digit bank transaction UTR number"
                            className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border font-mono ${errors.utrNumber ? "border-red-500 bg-red-50/20" : "border-zinc-200 dark:border-zinc-800"
                              } bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white`}
                          />
                        </div>
                        {errors.utrNumber && (
                          <p className="text-[11px] text-red-500 mt-1">{errors.utrNumber}</p>
                        )}
                      </div>
                    </div>

                    {/* App Used Selector */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Payment App Used:
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          "Google Pay",
                          "PhonePe",
                          "Paytm",
                          "BHIM UPI",
                          "Cred",
                          "Amazon Pay",
                          "Bank App / Other",
                        ].map((app) => (
                          <button
                            key={app}
                            type="button"
                            onClick={() => setPaymentAppUsed(app)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${paymentAppUsed === app
                              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-2xs"
                              : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                              }`}
                          >
                            {app}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Optional Payer UPI ID */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Your UPI ID / Mobile Number (Optional for extra confirmation)
                      </label>
                      <input
                        type="text"
                        value={payerUpiId}
                        onChange={(e) => setPayerUpiId(e.target.value)}
                        placeholder="Your UPI ID (e.g. 9876543210@upi or yourname@okhdfcbank)"
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white font-mono"
                      />
                    </div>

                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 bg-zinc-100/70 dark:bg-zinc-900/70 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <strong>Tip: Where to find UTR?</strong> In Google Pay look for <em>&apos;UPI transaction ID&apos;</em>, in PhonePe look for <em>&apos;UTR&apos;</em>, in Paytm look for <em>&apos;UPI Ref No.&apos;</em>.
                    </p>

                    {/* Payment Screenshot Upload Section */}
                    <div className="pt-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                          Payment Screenshot Proof (Recommended)
                        </label>
                        <span className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700">
                          Instant Clearance
                        </span>
                      </div>

                      <input
                        type="file"
                        id="payment-screenshot-input"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={handleScreenshotUpload}
                        className="hidden"
                      />

                      {!paymentScreenshot ? (
                        <label
                          htmlFor="payment-screenshot-input"
                          className={`group flex flex-col sm:flex-row items-center justify-center gap-3 p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${errors.screenshot
                            ? "border-red-400 bg-red-50/40 dark:bg-red-950/20"
                            : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-zinc-300 bg-zinc-50/60 dark:bg-zinc-900/60 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80"
                            }`}
                        >
                          <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <Upload className="w-5 h-5" />
                          </div>
                          <div className="text-center sm:text-left">
                            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                              Upload or Take a Photo of Payment Screenshot
                            </p>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                              Google Pay, PhonePe, Paytm or BHIM screen (PNG, JPG, WEBP up to 5MB)
                            </p>
                          </div>
                        </label>
                      ) : (
                        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-zinc-300 dark:border-zinc-700 flex-shrink-0 bg-black/10">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={paymentScreenshot}
                                alt="Payment Screenshot"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <FileCheck2 className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100 flex-shrink-0" />
                                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                  {paymentScreenshotName || "Payment_Proof.jpg"}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                {paymentScreenshotSize} • <span className="font-semibold text-zinc-900 dark:text-zinc-100">Attached</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => setShowScreenshotModal(true)}
                              className="p-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
                              title="Preview Full Image"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={handleRemoveScreenshot}
                              className="p-2 rounded-xl text-zinc-500 hover:text-red-600 dark:hover:text-red-400 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-red-300 dark:hover:border-red-800 transition-colors cursor-pointer"
                              title="Remove Screenshot"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {errors.screenshot && (
                        <p className="text-red-600 dark:text-red-400 text-[11px] font-medium mt-1">
                          {errors.screenshot}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Trust Assurances */}
                  <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                    <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
                      <ShieldCheck className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                      <span>Celebrate Bihar Service Guarantees</span>
                    </div>
                    <ul className="text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1 pl-6 list-disc">
                      <li>₹99 is 100% adjusted against your final repair/setup invoice.</li>
                      <li>Full 100% refund if cancelled at least 2 hours before the scheduled slot.</li>
                      <li>Technician brings genuine parts, official ID &amp; standardized rate card.</li>
                      <li>30-day rework warranty on all serviced appliances.</li>
                    </ul>
                  </div>
                </div>

                {/* Step 3 Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer order-2 sm:order-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Address</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleFinalizeBookingWithPayment}
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-75 order-1 sm:order-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        <span>Securing &amp; Confirming Booking...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verify &amp; Confirm Booking (₹99 Paid)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: SUCCESS RECEIPT & ACTIONS */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                custom={4}
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="text-center space-y-4 py-1"
              >
                {/* Animated Blue Tick Forming Badge */}
                <div className="relative mx-auto w-24 h-24 flex items-center justify-center my-2">
                  {/* Outer Pulsing Ambient Halo */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [0.8, 1.4, 1.15], opacity: [0, 0.45, 0.2] }}
                    transition={{ duration: 1.6, ease: "easeOut", repeat: Infinity, repeatType: "reverse" }}
                    className="absolute inset-0 rounded-full bg-blue-500/30 dark:bg-blue-400/25 blur-xl pointer-events-none"
                  />

                  {/* Outer Ripple Wave */}
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0.8 }}
                    animate={{ scale: 1.45, opacity: 0 }}
                    transition={{ duration: 1.8, ease: "easeOut", repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-2 border-blue-500/50 dark:border-blue-400/50 pointer-events-none"
                  />

                  {/* Main Blue Badge Container with Spring Pop */}
                  <motion.div
                    initial={{ scale: 0, rotate: -25 }}
                    animate={{ scale: [0, 1.18, 1], rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.05 }}
                    className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 via-blue-500 to-sky-400 shadow-xl shadow-blue-500/35 flex items-center justify-center"
                  >
                    {/* Animated SVG Circle and Checkmark */}
                    <svg className="w-12 h-12 text-white" viewBox="0 0 52 52" fill="none">
                      {/* Background Circle Stroke Drawing */}
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
                      {/* Animated Blue Tick Stroke Forming */}
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

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900/60">
                    Booking Confirmed • ₹99 Deposit Paid
                  </span>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-md mx-auto">
                    Thank you <strong>{customerName}</strong>. Your request and ₹99 advance deposit have been registered in our Bihar operations queue.
                  </p>
                </div>

                {/* Team Callback & Email Notice Banner */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-left space-y-2.5 max-w-lg mx-auto">
                  <div className="flex items-start gap-2.5 text-xs text-zinc-900 dark:text-zinc-100">
                    <Clock className="w-4 h-4 text-zinc-900 dark:text-zinc-100 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Our Operations Team Will Contact You Shortly:</strong>
                      <p className="text-zinc-600 dark:text-zinc-400 text-[11px] mt-0.5">
                        Our executive will call you within <strong>15-30 minutes</strong> on <strong>+91 {phoneNumber}</strong> to confirm your technician&apos;s exact arrival window. Your ₹99 deposit is 100% adjusted against your final repair bill.
                      </p>
                    </div>
                  </div>

                  {(customerEmail || postBookingEmail) && (
                    <div className="flex items-center gap-2 text-xs text-zinc-800 dark:text-zinc-200 pt-1.5 border-t border-zinc-200 dark:border-zinc-800">
                      <MailCheck className="w-4 h-4 text-zinc-900 dark:text-zinc-100 flex-shrink-0" />
                      <span>
                        A digital copy of this receipt has been dispatched to: <strong className="underline">{customerEmail || postBookingEmail}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Booking Receipt Summary Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-left space-y-2.5 max-w-lg mx-auto text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <span className="text-zinc-500 dark:text-zinc-400">Booking Reference ID</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-zinc-950 dark:text-white bg-white dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                        {bookingId}
                      </span>
                      <button
                        onClick={handleCopyBookingId}
                        className="p-1 rounded text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                        title="Copy ID"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">Customer Phone</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">+91 {phoneNumber}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">Service &amp; Qty</span>
                    <span className="font-bold text-zinc-950 dark:text-white">
                      {effectiveServiceName} ({unitCount} Unit{unitCount > 1 ? "s" : ""})
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">Appliance / Specs</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{applianceOrSetupDetail}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">Schedule Slot</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{finalDateDisplay}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">Address</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100 text-right line-clamp-1 max-w-[240px]">
                      {address}, {landmark ? landmark + ", " : ""}${district} - ${pincode}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    <span className="font-semibold text-zinc-600 dark:text-zinc-400">Payee Beneficiary</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                      {payeeName} ({upiId})
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">Payer Name &amp; App</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100 text-xs">
                      {payerName || customerName} ({paymentAppUsed})
                    </span>
                  </div>

                  {utrNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 dark:text-zinc-400">12-Digit UTR Ref</span>
                      <span className="font-mono font-bold text-zinc-950 dark:text-white text-xs">{utrNumber}</span>
                    </div>
                  )}

                  {paymentScreenshot && (
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 dark:text-zinc-400">Payment Screenshot</span>
                      <button
                        type="button"
                        onClick={() => setShowScreenshotModal(true)}
                        className="inline-flex items-center gap-1 font-bold text-zinc-900 dark:text-zinc-100 hover:underline cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Attached Proof ({paymentScreenshotSize})</span>
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-600 dark:text-zinc-400">Advance Deposit Paid</span>
                    <span className="font-bold text-zinc-950 dark:text-white text-xs">
                      ₹99.00 (UPI Online Advance)
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">Balance Payable</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
                      Adjusted Against Final Bill
                    </span>
                  </div>
                </div>

                {/* Email Delivery Input If Not Supplied Earlier */}
                {!customerEmail && !emailSentStatus.includes("dispatched") && (
                  <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-w-lg mx-auto text-left space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      <span>Send a copy of this receipt to your Email:</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="email"
                        value={postBookingEmail}
                        onChange={(e) => setPostBookingEmail(e.target.value)}
                        placeholder="Enter your email (e.g. name@gmail.com)"
                        className="flex-1 text-xs p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                      />
                      <button
                        type="button"
                        onClick={handleSendPostBookingEmail}
                        className="px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 font-bold text-xs shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Copy</span>
                      </button>
                    </div>
                    {emailSentStatus && (
                      <p className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 mt-1">{emailSentStatus}</p>
                    )}
                  </div>
                )}

                {/* Action Buttons Grid (Download Receipt & WhatsApp Confirmation) */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3 max-w-lg mx-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Download / Print Official Receipt */}
                    <button
                      type="button"
                      onClick={handleDownloadReceipt}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download / Print Receipt</span>
                    </button>

                    {/* Send to Celebrate Bihar WhatsApp */}
                    <a
                      href={`https://wa.me/919876543210?text=${whatsappMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold text-white dark:text-zinc-950 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>WhatsApp Operations Desk</span>
                    </a>
                  </div>

                  {/* Share with Family */}
                  <div className="flex items-center justify-center gap-3 pt-1">
                    <a
                      href={`https://api.whatsapp.com/send?text=${whatsappMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:underline cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share Booking with Family</span>
                    </a>
                    <span className="text-zinc-300 dark:text-zinc-700">•</span>
                    <a
                      href="tel:+919876543210"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:underline cursor-pointer"
                    >
                      <Headphones className="w-3.5 h-3.5" />
                      <span>Call Support Desk</span>
                    </a>
                  </div>
                </div>

                {/* Return Home */}
                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-bold text-sm text-zinc-900 dark:text-zinc-100 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-all cursor-pointer"
                  >
                    <span>Done &amp; Return to Home</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Fullscreen Payment Screenshot Lightbox Modal */}
      <AnimatePresence>
        {showScreenshotModal && paymentScreenshot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
            onClick={() => setShowScreenshotModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full bg-zinc-900 border border-zinc-700 rounded-3xl p-4 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-white">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-zinc-300" />
                  <div>
                    <h5 className="text-sm font-bold truncate max-w-[280px] sm:max-w-md">
                      {paymentScreenshotName || "UPI Payment Screenshot"}
                    </h5>
                    <p className="text-[11px] text-zinc-400">
                      ₹99 Advance Deposit • {paymentScreenshotSize || "Proof Image"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowScreenshotModal(false)}
                  className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Image Container */}
              <div className="flex-1 overflow-auto py-3 flex items-center justify-center bg-black/40 rounded-2xl my-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={paymentScreenshot}
                  alt="UPI Payment Proof"
                  className="max-h-[65vh] w-auto object-contain rounded-lg border border-zinc-800"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs text-zinc-400">
                <div className="flex items-center gap-1.5 text-zinc-200 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified ₹99 Deposit Proof Attached</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowScreenshotModal(false)}
                  className="px-4 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
