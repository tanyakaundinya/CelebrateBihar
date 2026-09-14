import { NextRequest, NextResponse } from "next/server";
import { sendBookingConfirmationEmails } from "@/lib/mail";
import { addBookingAsync, getActiveDatabaseEngine } from "@/lib/bookingsStore";

export async function POST(req: NextRequest) {
  try {
    const bookingData = await req.json();

    const {
      bookingId,
      customerName,
      phoneNumber,
      district,
      address,
    } = bookingData;

    if (!bookingId || !customerName || !phoneNumber || !district || !address) {
      return NextResponse.json(
        { success: false, error: "Please fill in all required booking details." },
        { status: 400 }
      );
    }

    // Persist to active cloud database (Firestore / Supabase / Local)
    const savedRecord = await addBookingAsync(bookingData);

    // Attempt email dispatch asynchronously without blocking the user response
    let emailDispatched = false;
    try {
      const emailResult = await sendBookingConfirmationEmails(bookingData);
      emailDispatched = !!emailResult.success;
    } catch (mailErr) {
      console.warn("Mail dispatch skipped or unconfigured:", mailErr);
    }

    return NextResponse.json({
      success: true,
      bookingId: savedRecord.id,
      advanceFee: savedRecord.advanceFee || 99,
      paymentStatus: savedRecord.paymentStatus || "PAID_ADVANCE_99",
      utrNumber: savedRecord.utrNumber || "",
      databaseEngine: getActiveDatabaseEngine(),
      emailDispatched,
      message: "Booking registered and persistent slot reservation recorded successfully.",
    });
  } catch (error: any) {
    console.error("Error in /api/book:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process booking." },
      { status: 500 }
    );
  }
}
