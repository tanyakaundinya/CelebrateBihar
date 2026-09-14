import { NextRequest, NextResponse } from "next/server";
import { addBookingAsync, addConsultationAsync, getActiveDatabaseEngine } from "@/lib/bookingsStore";
import { sendConsultationInquiryEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      consultationId,
      customerName,
      phoneNumber,
      district,
      address,
      category,
      scale,
      preferredSlot,
      projectOverview,
      orgName,
      email,
    } = body;

    if (!customerName || !phoneNumber || !district || !address || !projectOverview) {
      return NextResponse.json(
        { success: false, error: "Please provide all required consultation details." },
        { status: 400 }
      );
    }

    const id =
      consultationId ||
      body.bookingId ||
      `CB-CON-${Math.floor(100000 + Math.random() * 900000)}`;

    // Store in central persistent store with consultation specifics
    const bookingRecord = await addBookingAsync({
      id,
      customerName: customerName.trim(),
      phoneNumber: phoneNumber.trim(),
      email: email?.trim() || undefined,
      district: district.trim(),
      address: address.trim(),
      serviceCategory: "Consultation & Custom Setup",
      serviceName: category || "Turnkey Office Setup / Custom Repair",
      applianceDetail: `${scale || "Custom Scope"}${orgName ? ` • Org: ${orgName}` : ""}`,
      unitCount: 1,
      slot: preferredSlot || "Immediate Callback (Within 30 Mins)",
      specialNotes: `[OVERVIEW]: ${projectOverview.trim()}${orgName ? ` | Org: ${orgName}` : ""}`,
      advanceFee: 0,
      paymentStatus: "CONSULTATION_FREE" as any,
      payeeUpi: "N/A (Free Consultation)",
      payeeName: "Celebrate Bihar Operations Desk",
      payerName: customerName.trim(),
      paymentAppUsed: "Free Consultation (₹0)",
      utrNumber: "CONSULTATION-INQUIRY",
      status: "NEW_PENDING_DISPATCH",
    });

    // Also record in consultations table if separate table exists
    await addConsultationAsync({
      id,
      createdAt: new Date().toISOString(),
      customerName: customerName.trim(),
      phoneNumber: phoneNumber.trim(),
      orgName: orgName?.trim() || undefined,
      facilityType: body.facilityType || "Commercial Space",
      email: email?.trim() || undefined,
      district: district.trim(),
      address: address.trim(),
      category: category || "Turnkey Office Setup / Custom Repair",
      scale: scale || "Custom Scope",
      preferredSlot: preferredSlot || "Immediate Callback (Within 30 Mins)",
      projectOverview: projectOverview.trim(),
      status: "NEW",
    });

    // Send email alert asynchronously
    let emailSent = false;
    try {
      const mailRes = await sendConsultationInquiryEmail({
        consultationId: id,
        customerName: customerName.trim(),
        phoneNumber: phoneNumber.trim(),
        orgName: orgName?.trim(),
        email: email?.trim(),
        district: district.trim(),
        address: address.trim(),
        category: category || "Turnkey Office Setup / Custom Repair",
        scale: scale || "Custom Scope",
        preferredSlot: preferredSlot || "Immediate Callback (Within 30 Mins)",
        projectOverview: projectOverview.trim(),
      });
      emailSent = !!mailRes.success;
    } catch (mailErr) {
      console.warn("Mail dispatch error in /api/consultation:", mailErr);
    }

    return NextResponse.json({
      success: true,
      consultationId: id,
      record: bookingRecord,
      databaseEngine: getActiveDatabaseEngine(),
      emailSent,
      message: "Consultation request registered successfully with Bihar district operations lead.",
    });
  } catch (error: any) {
    console.error("Error in /api/consultation:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit consultation request." },
      { status: 500 }
    );
  }
}
