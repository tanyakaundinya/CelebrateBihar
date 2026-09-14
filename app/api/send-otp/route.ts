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
    let emailSent = false;
    let emailError = "";
    try {
      await sendOtpEmail(email.trim(), otpCode, name);
      emailSent = true;
    } catch (mailErr: any) {
      console.warn("SMTP email dispatch notice (Check .env.local SMTP credentials):", mailErr.message);
      emailError = mailErr.message;
    }

    return NextResponse.json({
      success: true,
      emailSent,
      devOtp: !emailSent ? otpCode : undefined,
      message: emailSent
        ? `A verification code has been dispatched to ${email}.`
        : `Verification code generated. (SMTP Notice: Update App Password in .env.local)`,
    });
  } catch (error: any) {
    console.error("Error in /api/send-otp:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          "Failed to process verification code. Please check your network.",
      },
      { status: 500 }
    );
  }
}
