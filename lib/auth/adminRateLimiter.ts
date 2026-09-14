import { sendAdminSecurityAlertEmail } from "../mail";

interface AttemptRecord {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
  lockedUntil: number | null;
}

const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout

// In-memory store for rate-limiting
const attemptsStore = new Map<string, AttemptRecord>();

/**
 * Clean expired rate-limit records periodically
 */
function cleanupExpired() {
  const now = Date.now();
  attemptsStore.forEach((record, key) => {
    if (record.lockedUntil && record.lockedUntil < now) {
      attemptsStore.delete(key);
    } else if (now - record.firstAttempt > WINDOW_MS && !record.lockedUntil) {
      attemptsStore.delete(key);
    }
  });
}

/**
 * Check if the given identifier (IP or username) is currently locked out
 */
export function checkRateLimit(identifier: string): {
  isLocked: boolean;
  remainingLockSeconds?: number;
  remainingAttempts: number;
} {
  cleanupExpired();
  const now = Date.now();
  const record = attemptsStore.get(identifier);

  if (!record) {
    return { isLocked: false, remainingAttempts: MAX_FAILED_ATTEMPTS };
  }

  if (record.lockedUntil && record.lockedUntil > now) {
    const remainingLockSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { isLocked: true, remainingLockSeconds, remainingAttempts: 0 };
  }

  // If window expired, reset
  if (now - record.firstAttempt > WINDOW_MS) {
    attemptsStore.delete(identifier);
    return { isLocked: false, remainingAttempts: MAX_FAILED_ATTEMPTS };
  }

  const remainingAttempts = Math.max(0, MAX_FAILED_ATTEMPTS - record.count);
  return { isLocked: false, remainingAttempts };
}

/**
 * Record a failed authentication attempt
 */
export async function recordFailedAttempt(
  identifier: string,
  username: string,
  ip: string
): Promise<{ isLocked: boolean; remainingLockSeconds?: number; remainingAttempts: number }> {
  cleanupExpired();
  const now = Date.now();
  let record = attemptsStore.get(identifier);

  if (!record || now - record.firstAttempt > WINDOW_MS) {
    record = {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
      lockedUntil: null,
    };
    attemptsStore.set(identifier, record);
    return { isLocked: false, remainingAttempts: MAX_FAILED_ATTEMPTS - 1 };
  }

  record.count += 1;
  record.lastAttempt = now;

  if (record.count >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    const remainingLockSeconds = Math.ceil(LOCKOUT_DURATION_MS / 1000);

    // Trigger security alert email asynchronously to admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    if (adminEmail) {
      sendAdminSecurityAlertEmail(adminEmail, {
        ip,
        username,
        timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST",
        attemptCount: record.count,
      }).catch((err) => console.error("Security alert email error:", err));
    }

    return { isLocked: true, remainingLockSeconds, remainingAttempts: 0 };
  }

  const remainingAttempts = MAX_FAILED_ATTEMPTS - record.count;
  return { isLocked: false, remainingAttempts };
}

/**
 * Reset failed attempts on successful login
 */
export function resetAttempts(identifier: string) {
  attemptsStore.delete(identifier);
}
