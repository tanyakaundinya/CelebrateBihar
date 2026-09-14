// In-memory OTP Cache with TTL (Time-to-Live)
interface OtpEntry {
  otp: string;
  expiresAt: number;
  attempts: number;
}

const otpMap = new Map<string, OtpEntry>();

// Clean expired entries periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    otpMap.forEach((entry, email) => {
      if (entry.expiresAt < now) {
        otpMap.delete(email);
      }
    });
  }, 60 * 1000);
}

export function saveOtp(email: string, otp: string, ttlMinutes: number = 10) {
  const normalizedEmail = email.trim().toLowerCase();
  otpMap.set(normalizedEmail, {
    otp,
    expiresAt: Date.now() + ttlMinutes * 60 * 1000,
    attempts: 0,
  });
}

export function verifyOtp(email: string, enteredOtp: string): { success: boolean; error?: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const entry = otpMap.get(normalizedEmail);

  if (!entry) {
    return { success: false, error: "No OTP found or code has expired. Please request a new code." };
  }

  if (Date.now() > entry.expiresAt) {
    otpMap.delete(normalizedEmail);
    return { success: false, error: "OTP has expired. Please click 'Resend New Code'." };
  }

  if (entry.attempts >= 5) {
    otpMap.delete(normalizedEmail);
    return { success: false, error: "Too many failed attempts. Please request a new code." };
  }

  entry.attempts += 1;

  if (entry.otp !== enteredOtp.trim()) {
    return { success: false, error: "Incorrect verification code. Please check your email inbox and try again." };
  }

  // Once verified, remove from store to prevent replay attacks
  otpMap.delete(normalizedEmail);
  return { success: true };
}
