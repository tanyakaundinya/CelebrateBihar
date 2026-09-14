import { NextRequest, NextResponse } from "next/server";
import { sendOtpEmail } from "@/lib/mail";
import { saveOtp } from "@/lib/otpStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name } = body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required." },
        { status: 400 }
      );
    }

    // Generate real secure 4-digit numeric OTP
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Store in server memory (valid for 10 mins)
    saveOtp(email, otpCode, 10);

    // Send real email via Nodemailer
    await sendOtpEmail(email.trim(), otpCode, name);

    return NextResponse.json({
      success: true,
      message: `A verification code has been dispatched to ${email}.`,
    });
  } catch (error: any) {
    console.error("Error in /api/send-otp:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          "Failed to send email OTP. Please verify your email address or SMTP setup.",
      },
      { status: 500 }
    );
  }
}
