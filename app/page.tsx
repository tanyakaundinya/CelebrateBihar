"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { ServiceGrid } from "@/components/ServiceGrid";
import { StatsSection } from "@/components/StatsSection";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { Footer } from "@/components/Footer";
import { BookingForm } from "@/components/BookingForm";
import { ConsultationModal } from "@/components/ConsultationModal";

export default function Home() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedConsultationCategory, setSelectedConsultationCategory] = useState<string>("");

  const handleOpenBooking = (serviceName?: string) => {
    setSelectedService(serviceName || "");
    setIsBookingOpen(true);
  };

  const handleOpenConsultation = (categoryName?: string) => {
    setSelectedConsultationCategory(categoryName || "");
    setIsConsultationOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
    setSelectedService("");
  };

  const handleCloseConsultation = () => {
    setIsConsultationOpen(false);
    setSelectedConsultationCategory("");
  };

  return (
    <main className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      {/* Fixed Navigation Bar with Theme Toggle */}
      <Navbar
        onOpenBooking={() => handleOpenBooking()}
        onOpenConsultation={() => handleOpenConsultation()}
      />

      {/* Hero Section with Staggered Minimal Motion Reveal */}
      <HeroSection onOpenBooking={(serviceName) => handleOpenBooking(serviceName)} />

      {/* Metrics & Trust Stats */}
      <StatsSection />

      {/* Service Grid with Category Mapping and Scroll Reveals */}
      <ServiceGrid
        onSelectService={(serviceName) => handleOpenBooking(serviceName)}
        onOpenConsultation={(categoryName) => handleOpenConsultation(categoryName)}
      />

      {/* Why Choose Us & Service Guarantees */}
      <WhyChooseUs
        onOpenBooking={() => handleOpenBooking()}
        onOpenConsultation={() => handleOpenConsultation()}
      />

      {/* Footer & Coverage Areas with Theme Toggle */}
      <Footer onOpenBooking={() => handleOpenBooking()} />

      {/* Multi-Step Booking Modal */}
      <BookingForm
        isOpen={isBookingOpen}
        onClose={handleCloseBooking}
        initialService={selectedService}
      />

      {/* Free Consultation & Custom Setup Modal */}
      <ConsultationModal
        isOpen={isConsultationOpen}
        onClose={handleCloseConsultation}
        initialCategory={selectedConsultationCategory}
      />
    </main>
  );
}

