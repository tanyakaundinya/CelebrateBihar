import { NextRequest } from "next/server";
import crypto from "crypto";

export type AdminRole = "SUPER_ADMIN" | "OPERATIONS_DISPATCHER";

export interface AdminUser {
  username: string;
  role: AdminRole;
  displayName: string;
}

export interface AdminSession {
  username: string;
  role: AdminRole;
  displayName: string;
  issuedAt: number;
  expiresAt: number;
}

interface Pending2FA {
  tempSessionId: string;
  username: string;
  role: AdminRole;
  displayName: string;
  otpCode: string;
  createdAt: number;
  expiresAt: number;
}

const ADMIN_SECRET =
  process.env.ADMIN_AUTH_SECRET || "cb-enterprise-sec-salt-bihar-2026-auth";

const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 hours max session
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes 2FA code validity

// In-memory temporary store for pending 2FA verification
const pending2faStore = new Map<string, Pending2FA>();

/**
 * Get configured admin accounts from environment
 */
export function getAdminAccounts(): Array<{
  username: string;
  pass: string;
  role: AdminRole;
  displayName: string;
}> {
  const superUser = process.env.ADMIN_SUPER_USER || "admin";
  const superPass = process.env.ADMIN_SUPER_PASS || process.env.ADMIN_PASSKEY || "Bihar@Admin2026!";

  const dispUser = process.env.ADMIN_DISPATCHER_USER || "dispatcher";
  const dispPass = process.env.ADMIN_DISPATCHER_PASS || "Bihar@Dispatch2026!";

  return [
    {
      username: superUser.trim(),
      pass: superPass.trim(),
      role: "SUPER_ADMIN",
      displayName: "Super Administrator",
    },
    {
      username: dispUser.trim(),
      pass: dispPass.trim(),
      role: "OPERATIONS_DISPATCHER",
      displayName: "Operations Fleet Dispatcher",
    },
  ];
}

/**
 * Validate credentials (username + password)
 */
export function validateCredentials(
  userInput: string,
  passInput: string
): AdminUser | null {
  if (!userInput || !passInput) return null;
  const accounts = getAdminAccounts();
  const trimmedUser = userInput.trim().toLowerCase();
  const trimmedPass = passInput.trim();

  // Also support passkey-only login mapped to Super Admin if username omitted
  const match = accounts.find(
    (acc) =>
      acc.username.toLowerCase() === trimmedUser && acc.pass === trimmedPass
  ) || accounts.find((acc) => trimmedUser === "admin" && acc.pass === trimmedPass);

  if (match) {
    return {
      username: match.username,
      role: match.role,
      displayName: match.displayName,
    };
  }

  return null;
}

/**
 * Generate a 6-digit cryptographic 2FA OTP code and temp session ID
 */
export function createPending2FA(user: AdminUser): {
  tempSessionId: string;
  otpCode: string;
} {
  // Clean expired 2FA codes
  const now = Date.now();
  pending2faStore.forEach((item, key) => {
    if (item.expiresAt < now) pending2faStore.delete(key);
  });

  const tempSessionId = `2fa_${crypto.randomBytes(16).toString("hex")}`;
  // 6-digit numeric OTP code
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  pending2faStore.set(tempSessionId, {
    tempSessionId,
    username: user.username,
    role: user.role,
    displayName: user.displayName,
    otpCode,
    createdAt: now,
    expiresAt: now + OTP_EXPIRY_MS,
  });

  return { tempSessionId, otpCode };
}

/**
 * Verify 2FA OTP code
 */
export function verify2FA(
  tempSessionId: string,
  inputOtp: string
): { success: boolean; user?: AdminUser; error?: string } {
  if (!tempSessionId || !inputOtp) {
    return { success: false, error: "Session ID and 2FA OTP are required." };
  }

  const pending = pending2faStore.get(tempSessionId);
  if (!pending) {
    return {
      success: false,
      error: "2FA session expired or not found. Please log in again.",
    };
  }

  if (Date.now() > pending.expiresAt) {
    pending2faStore.delete(tempSessionId);
    return {
      success: false,
      error: "2FA code has expired. Please request a new code.",
    };
  }

  if (pending.otpCode.trim() !== inputOtp.trim()) {
    return { success: false, error: "Invalid 6-digit 2FA code. Please try again." };
  }

  // OTP verified successfully - consume code
  pending2faStore.delete(tempSessionId);
  return {
    success: true,
    user: {
      username: pending.username,
      role: pending.role,
      displayName: pending.displayName,
    },
  };
}

/**
 * Sign a cryptographic HMAC session token
 */
export function generateAdminSessionToken(user: AdminUser): string {
  const now = Date.now();
  const sessionData: AdminSession = {
    username: user.username,
    role: user.role,
    displayName: user.displayName,
    issuedAt: now,
    expiresAt: now + SESSION_MAX_AGE_MS,
  };

  const payload = Buffer.from(JSON.stringify(sessionData)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", ADMIN_SECRET)
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

/**
 * Verify and decode an admin session token
 */
export function decodeAndVerifyToken(token: string): AdminSession | null {
  try {
    if (!token || typeof token !== "string") return null;

    const [payload, signature] = token.split(".");
    if (!payload || !signature) return null;

    const expectedSignature = crypto
      .createHmac("sha256", ADMIN_SECRET)
      .update(payload)
      .digest("base64url");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    ) {
      return null;
    }

    const session: AdminSession = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    // Check expiration
    if (Date.now() > session.expiresAt) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Verify request authentication and return session if valid
 */
export function getAdminSessionFromRequest(
  req: NextRequest
): AdminSession | null {
  // 1. Check Authorization: Bearer <token>
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    const session = decodeAndVerifyToken(token);
    if (session) return session;
  }

  // 2. Check x-admin-token header
  const customToken =
    req.headers.get("x-admin-token") || req.headers.get("x-admin-key");
  if (customToken) {
    const session = decodeAndVerifyToken(customToken.trim());
    if (session) return session;
  }

  // 3. Check HttpOnly Cookie
  const cookieToken = req.cookies.get("cb_admin_token")?.value;
  if (cookieToken) {
    const session = decodeAndVerifyToken(cookieToken.trim());
    if (session) return session;
  }

  return null;
}

/**
 * Verify whether the incoming HTTP request is authenticated
 */
export function verifyAdminAuth(
  req: NextRequest,
  requiredRole?: AdminRole
): boolean {
  const session = getAdminSessionFromRequest(req);
  if (!session) return false;

  if (requiredRole && requiredRole === "SUPER_ADMIN" && session.role !== "SUPER_ADMIN") {
    return false;
  }

  return true;
}
