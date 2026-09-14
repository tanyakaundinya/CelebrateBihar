import { NextRequest, NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otpStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: "Email and OTP code are required." },
        { status: 400 }
      );
    }

    const verification = verifyOtp(email, otp);

    if (!verification.success) {
      return NextResponse.json(
        { success: false, error: verification.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email verified successfully.",
    });
  } catch (error: any) {
    console.error("Error in /api/verify-otp:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during verification." },
      { status: 500 }
    );
  }
}
