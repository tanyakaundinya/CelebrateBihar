import { NextRequest, NextResponse } from "next/server";
import {
  validateCredentials,
  createPending2FA,
  verify2FA,
  generateAdminSessionToken,
  getAdminSessionFromRequest,
} from "@/lib/auth/adminAuth";
import {
  checkRateLimit,
  recordFailedAttempt,
  resetAttempts,
} from "@/lib/auth/adminRateLimiter";
import { sendAdmin2faOtpEmail } from "@/lib/mail";

// Extract client IP safely for rate-limiting
function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

export async function GET(req: NextRequest) {
  try {
    const session = getAdminSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    return NextResponse.json({
      authenticated: true,
      user: {
        username: session.username,
        role: session.role,
        displayName: session.displayName,
      },
      expiresAt: session.expiresAt,
    });
  } catch (error: any) {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const body = await req.json();
    const action = body.action || (body.otp ? "verify_2fa" : "login");

    // 1. Check Rate Limiting on IP
    const rateStatus = checkRateLimit(clientIp);
    if (rateStatus.isLocked) {
      return NextResponse.json(
        {
          success: false,
          error: `Security Lockout: Too many failed attempts. Please try again in ${rateStatus.remainingLockSeconds} seconds.`,
          isLocked: true,
          remainingLockSeconds: rateStatus.remainingLockSeconds,
        },
        { status: 429 }
      );
    }

    // ACTION A: Standard Login (Username & Password / Passkey)
    if (action === "login") {
      const username = (body.username || "admin").trim();
      const password = (body.password || body.passkey || "").trim();

      const user = validateCredentials(username, password);

      if (!user) {
        const attemptResult = await recordFailedAttempt(clientIp, username, clientIp);
        if (attemptResult.isLocked) {
          return NextResponse.json(
            {
              success: false,
              error: `Rate Limit Exceeded: Account temporarily locked for 15 minutes. Security alert dispatched to admin.`,
              isLocked: true,
              remainingLockSeconds: attemptResult.remainingLockSeconds,
            },
            { status: 429 }
          );
        }

        return NextResponse.json(
          {
            success: false,
            error: `Invalid Credentials. ${attemptResult.remainingAttempts} attempt(s) remaining before security lockout.`,
            remainingAttempts: attemptResult.remainingAttempts,
          },
          { status: 401 }
        );
      }

      // Check if 2FA is enabled (default true)
      const is2FAEnabled = process.env.ADMIN_2FA_ENABLED !== "false";
      const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || "celebratebiharserviceprovider@gmail.com";
      if (is2FAEnabled) {
        // Generate cryptographic 2FA code and temp session ID
        const { tempSessionId, otpCode } = createPending2FA(user);

        // Dispatch 2FA OTP to admin email via SMTP
        let emailSent = false;
        try {
          const mailResult = await sendAdmin2faOtpEmail(
            adminEmail,
            otpCode,
            user.username,
            user.displayName,
            clientIp
          );
          emailSent = !!mailResult.success;
        } catch (mailErr: any) {
          console.warn("2FA Email dispatch notice (Check .env.local SMTP credentials):", mailErr.message);
        }

        const maskedEmail = adminEmail.replace(
          /(.{2})(.*)(@.*)/,
          "$1***$3"
        );

        return NextResponse.json({
          success: true,
          requires2FA: true,
          tempSessionId,
          maskedEmail,
          emailSent,
          devOtp: !emailSent ? otpCode : undefined,
          user: {
            username: user.username,
            role: user.role,
            displayName: user.displayName,
          },
          message: emailSent
            ? `2-Factor verification code dispatched to ${maskedEmail}.`
            : `Verification code generated. (SMTP Notice: Update App Password in .env.local)`,
        });
      }

      // If 2FA explicitly disabled in dev, directly issue session token
      resetAttempts(clientIp);
      const token = generateAdminSessionToken(user);
      const res = NextResponse.json({
        success: true,
        requires2FA: false,
        token,
        user,
        message: "Admin session authenticated successfully.",
      });

      res.cookies.set({
        name: "cb_admin_token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 8, // 8 hours
        path: "/",
      });

      return res;
    }

    // ACTION B: Verify 2FA OTP Code
    if (action === "verify_2fa") {
      const { tempSessionId, otp } = body;

      if (!tempSessionId || !otp) {
        return NextResponse.json(
          { success: false, error: "Missing 2FA Session ID or Verification Code." },
          { status: 400 }
        );
      }

      const verifyResult = verify2FA(tempSessionId, otp);

      if (!verifyResult.success || !verifyResult.user) {
        const attemptResult = await recordFailedAttempt(clientIp, "2FA_VERIFY", clientIp);
        return NextResponse.json(
          {
            success: false,
            error: "Invalid 6-digit 2FA code. Please try again.",
            remainingAttempts: attemptResult.remainingAttempts,
          },
          { status: 401 }
        );
      }

      // Verification passed: reset attempts, issue token and set cookie
      resetAttempts(clientIp);
      const user = verifyResult.user;
      const token = generateAdminSessionToken(user);

      const response = NextResponse.json({
        success: true,
        token,
        user,
        message: "2FA Verification successful. Admin access granted.",
      });

      // Set hardened SameSite=Strict HttpOnly Cookie
      response.cookies.set({
        name: "cb_admin_token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 8, // 8 hours
        path: "/",
      });

      return response;
    }

    // ACTION C: Resend 2FA OTP Code
    if (action === "resend_2fa") {
      const { username, role } = body;
      const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || "celebratebiharserviceprovider@gmail.com";
      const dummyUser = {
        username: username || "admin",
        role: (role || "SUPER_ADMIN") as any,
        displayName: "Administrator",
      };

      const { tempSessionId, otpCode } = createPending2FA(dummyUser);
      let emailSent = false;
      try {
        const mailRes = await sendAdmin2faOtpEmail(
          adminEmail,
          otpCode,
          dummyUser.username,
          dummyUser.displayName,
          clientIp
        );
        emailSent = !!mailRes.success;
      } catch (mailErr: any) {
        console.warn("2FA Resend Email notice:", mailErr.message);
      }

      return NextResponse.json({
        success: true,
        tempSessionId,
        emailSent,
        devOtp: !emailSent ? otpCode : undefined,
        message: emailSent
          ? "A fresh 2FA code has been dispatched to admin email."
          : "A fresh verification code has been generated.",
      });
    }

    // ACTION D: Logout
    if (action === "logout") {
      const response = NextResponse.json({ success: true, message: "Logged out" });
      response.cookies.delete("cb_admin_token");
      return response;
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error in /api/admin/auth:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Authentication service error." },
      { status: 500 }
    );
  }
}
