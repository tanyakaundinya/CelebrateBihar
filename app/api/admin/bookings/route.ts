import { NextRequest, NextResponse } from "next/server";
import {
  getAllBookingsAsync,
  getAllConsultationsAsync,
  updateConsultationAsync,
  addBookingAsync,
  updateBookingAsync,
  deleteBookingAsync,
  clearAllBookingsAsync,
  getActiveDatabaseEngine,
  ConsultationRecord,
} from "@/lib/bookingsStore";
import { verifyAdminAuth } from "@/lib/auth/adminAuth";

export async function GET(req: NextRequest) {
  try {
    // Security Verification: Strictly restrict customer PII to authenticated admins
    if (!verifyAdminAuth(req)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin credentials required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const district = searchParams.get("district");
    const search = searchParams.get("search");

    const [all, rawConsultations] = await Promise.all([
      getAllBookingsAsync(),
      getAllConsultationsAsync(),
    ]);

    // Separate genuine appliance service bookings from free B2B consultations
    const applianceBookings = all.filter(
      (b) =>
        b.serviceCategory !== "Consultation & Custom Setup" &&
        !b.id.startsWith("CB-CON-")
    );

    // Also include any consultation records that might have been saved in bookings collection
    const extraConsultations: ConsultationRecord[] = all
      .filter(
        (b) =>
          b.serviceCategory === "Consultation & Custom Setup" ||
          b.id.startsWith("CB-CON-")
      )
      .map((b) => ({
        id: b.id,
        createdAt: b.createdAt,
        customerName: b.customerName,
        phoneNumber: b.phoneNumber,
        email: b.email,
        district: b.district,
        address: b.address || "Bihar",
        facilityType: b.applianceDetail || "Enterprise",
        category: b.serviceName || "Turnkey Setup",
        scale: b.applianceDetail || "Custom",
        preferredSlot: b.slot || "Immediate Callback",
        projectOverview: b.specialNotes || b.applianceDetail || "Direct Consultation Lead",
        status: (b.status === "COMPLETED" ? "COMPLETED" : "NEW") as any,
      }));

    const combinedConsultations = [...rawConsultations];
    for (const ec of extraConsultations) {
      if (!combinedConsultations.some((c) => c.id === ec.id)) {
        combinedConsultations.push(ec);
      }
    }

    let filteredBookings = [...applianceBookings];

    // Filter by status
    if (status && status !== "ALL") {
      if (status === "NEEDS_VERIFICATION") {
        filteredBookings = filteredBookings.filter(
          (b) => b.status === "NEW_PENDING_DISPATCH" || b.status === "PAYMENT_VERIFIED"
        );
      } else {
        filteredBookings = filteredBookings.filter((b) => b.status === status);
      }
    }

    // Filter by district
    if (district && district !== "ALL") {
      filteredBookings = filteredBookings.filter(
        (b) => b.district.toLowerCase() === district.toLowerCase()
      );
    }

    // Search query
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filteredBookings = filteredBookings.filter(
        (b) =>
          b.id.toLowerCase().includes(q) ||
          b.customerName.toLowerCase().includes(q) ||
          b.phoneNumber.includes(q) ||
          (b.alternatePhone && b.alternatePhone.includes(q)) ||
          (b.email && b.email.toLowerCase().includes(q)) ||
          b.utrNumber.toLowerCase().includes(q) ||
          b.serviceName.toLowerCase().includes(q) ||
          b.applianceDetail.toLowerCase().includes(q) ||
          b.district.toLowerCase().includes(q) ||
          b.address.toLowerCase().includes(q) ||
          (b.payerName && b.payerName.toLowerCase().includes(q)) ||
          (b.assignedTechnician?.name &&
            b.assignedTechnician.name.toLowerCase().includes(q))
      );
    }

    // Calculate analytics from bookings
    const stats = {
      total: applianceBookings.length,
      revenueAdvance: applianceBookings
        .filter((b) => b.paymentStatus === "VERIFIED" || b.paymentStatus === "PAID_ADVANCE_99")
        .reduce((sum, b) => sum + (b.advanceFee || 99), 0),
      pendingVerification: applianceBookings.filter(
        (b) => b.status === "NEW_PENDING_DISPATCH" || b.status === "PAYMENT_VERIFIED"
      ).length,
      assigned: applianceBookings.filter((b) => b.status === "TECHNICIAN_ASSIGNED").length,
      inProgress: applianceBookings.filter((b) => b.status === "IN_PROGRESS").length,
      completed: applianceBookings.filter((b) => b.status === "COMPLETED").length,
      cancelled: applianceBookings.filter((b) => b.status === "CANCELLED").length,
      consultationsCount: combinedConsultations.length,
    };

    return NextResponse.json({
      success: true,
      bookings: filteredBookings,
      consultations: combinedConsultations,
      stats,
      databaseEngine: getActiveDatabaseEngine(),
    });
  } catch (error: any) {
    console.error("Error in GET /api/admin/bookings:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!verifyAdminAuth(req)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin credentials required." },
        { status: 401 }
      );
    }

    const body = await req.json();

    if (!body.customerName || !body.phoneNumber || !body.district || !body.address) {
      return NextResponse.json(
        { success: false, error: "Customer Name, Phone, District, and Address are required." },
        { status: 400 }
      );
    }

    const newRecord = await addBookingAsync(body);

    return NextResponse.json({
      success: true,
      booking: newRecord,
      databaseEngine: getActiveDatabaseEngine(),
      message: "New booking created successfully.",
    });
  } catch (error: any) {
    console.error("Error in POST /api/admin/bookings:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create booking." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!verifyAdminAuth(req)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin credentials required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, bookingId, type, ...updates } = body;
    const targetId = id || bookingId;

    if (!targetId) {
      return NextResponse.json(
        { success: false, error: "Record ID is required." },
        { status: 400 }
      );
    }

    if (type === "consultation") {
      const updatedConsultation = await updateConsultationAsync(targetId, updates);
      return NextResponse.json({
        success: true,
        consultation: updatedConsultation,
        databaseEngine: getActiveDatabaseEngine(),
        message: "Consultation updated successfully",
      });
    }

    const updated = await updateBookingAsync(targetId, updates);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Booking record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: updated,
      databaseEngine: getActiveDatabaseEngine(),
      message: "Booking updated successfully",
    });
  } catch (error: any) {
    console.error("Error in PATCH /api/admin/bookings:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update booking" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!verifyAdminAuth(req)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin credentials required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id") || searchParams.get("bookingId");
    const action = searchParams.get("action");

    if (action === "clear_all") {
      if (!verifyAdminAuth(req, "SUPER_ADMIN")) {
        return NextResponse.json(
          { success: false, error: "Access Denied. Only Super Administrators can clear all bookings." },
          { status: 403 }
        );
      }
      await clearAllBookingsAsync();
      return NextResponse.json({
        success: true,
        databaseEngine: getActiveDatabaseEngine(),
        message: "All bookings cleared successfully.",
      });
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Booking ID is required." },
        { status: 400 }
      );
    }

    const deleted = await deleteBookingAsync(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Booking not found or already removed." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      databaseEngine: getActiveDatabaseEngine(),
      message: "Booking deleted successfully",
    });
  } catch (error: any) {
    console.error("Error in DELETE /api/admin/bookings:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete booking" },
      { status: 500 }
    );
  }
}
