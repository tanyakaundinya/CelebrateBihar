import fs from "fs";
import path from "path";
import { BookingRecord, ConsultationRecord, DatabaseAdapter, DatabaseEngineType } from "./db/types";
import { FirestoreAdapter } from "./db/firestore";
import { SupabaseAdapter } from "./db/supabase";

export * from "./db/types";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "bookings.json");
const CONSULTATIONS_FILE = path.join(DATA_DIR, "consultations.json");

/**
 * Local File System Database Adapter (Zero-Config Dev & Local Fallback)
 */
class LocalFileAdapter implements DatabaseAdapter {
  getEngineType(): DatabaseEngineType {
    return "LOCAL_STORAGE";
  }

  private readAll(): BookingRecord[] {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (!fs.existsSync(FILE_PATH)) {
        fs.writeFileSync(FILE_PATH, JSON.stringify([], null, 2), "utf8");
        return [];
      }
      const data = fs.readFileSync(FILE_PATH, "utf8");
      if (!data.trim()) return [];
      return JSON.parse(data) as BookingRecord[];
    } catch (error) {
      console.error("Error reading local bookings:", error);
      return [];
    }
  }

  private writeAll(bookings: BookingRecord[]): boolean {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(FILE_PATH, JSON.stringify(bookings, null, 2), "utf8");
      return true;
    } catch (error) {
      console.error("Error saving local bookings:", error);
      return false;
    }
  }

  async getAllBookings(): Promise<BookingRecord[]> {
    return this.readAll();
  }

  async getBookingById(id: string): Promise<BookingRecord | null> {
    const all = this.readAll();
    return all.find((b) => b.id === id) || null;
  }

  async addBooking(booking: BookingRecord): Promise<BookingRecord> {
    const all = this.readAll();
    const existingIdx = all.findIndex((b) => b.id === booking.id);
    if (existingIdx >= 0) {
      all[existingIdx] = { ...all[existingIdx], ...booking };
    } else {
      all.unshift(booking);
    }
    this.writeAll(all);
    return booking;
  }

  async updateBooking(id: string, updates: Partial<BookingRecord>): Promise<BookingRecord | null> {
    const all = this.readAll();
    const index = all.findIndex((b) => b.id === id);
    if (index === -1) return null;
    all[index] = { ...all[index], ...updates, updatedAt: new Date().toISOString() };
    this.writeAll(all);
    return all[index];
  }

  async deleteBooking(id: string): Promise<boolean> {
    const all = this.readAll();
    const filtered = all.filter((b) => b.id !== id);
    if (filtered.length === all.length) return false;
    this.writeAll(filtered);
    return true;
  }

  async clearAllBookings(): Promise<boolean> {
    return this.writeAll([]);
  }

  setAllBookings(bookings: BookingRecord[]): boolean {
    return this.writeAll(bookings);
  }

  setAllConsultations(consultations: ConsultationRecord[]): boolean {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(CONSULTATIONS_FILE, JSON.stringify(consultations, null, 2), "utf8");
      return true;
    } catch (err) {
      console.error("Error setting local consultations:", err);
      return false;
    }
  }

  async addConsultation(consultation: ConsultationRecord): Promise<ConsultationRecord> {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      let existing: ConsultationRecord[] = [];
      if (fs.existsSync(CONSULTATIONS_FILE)) {
        const raw = fs.readFileSync(CONSULTATIONS_FILE, "utf8");
        if (raw.trim()) existing = JSON.parse(raw);
      }
      existing.unshift(consultation);
      fs.writeFileSync(CONSULTATIONS_FILE, JSON.stringify(existing, null, 2), "utf8");
      return consultation;
    } catch (err) {
      console.error("Error saving consultation:", err);
      return consultation;
    }
  }

  async getAllConsultations(): Promise<ConsultationRecord[]> {
    try {
      if (!fs.existsSync(CONSULTATIONS_FILE)) return [];
      const raw = fs.readFileSync(CONSULTATIONS_FILE, "utf8");
      if (!raw.trim()) return [];
      return JSON.parse(raw) as ConsultationRecord[];
    } catch {
      return [];
    }
  }

  async updateConsultation(id: string, updates: Partial<ConsultationRecord>): Promise<ConsultationRecord | null> {
    try {
      const all = await this.getAllConsultations();
      const idx = all.findIndex((c) => c.id === id);
      if (idx === -1) return null;
      all[idx] = { ...all[idx], ...updates };
      fs.writeFileSync(CONSULTATIONS_FILE, JSON.stringify(all, null, 2), "utf8");
      return all[idx];
    } catch {
      return null;
    }
  }
}

/**
 * Hybrid Dual-Cloud Database Adapter (Simultaneous Dual-Write & Redundancy Sync)
 * Automatically replicates writes, updates, technician assignments, and consultations
 * across both Supabase (PostgreSQL) and Google Cloud Firestore.
 */
class DualCloudAdapter implements DatabaseAdapter {
  private local = new LocalFileAdapter();

  constructor(
    private primary: DatabaseAdapter,
    private secondary: DatabaseAdapter
  ) { }

  getEngineType(): DatabaseEngineType {
    return "HYBRID_DUAL_CLOUD";
  }

  async getAllBookings(): Promise<BookingRecord[]> {
    // 1. Try Primary Cloud (Supabase)
    try {
      const records = await this.primary.getAllBookings();
      if (Array.isArray(records)) {
        this.local.setAllBookings(records);
        return records;
      }
    } catch { }

    // 2. Try Secondary Cloud (Firestore)
    try {
      const secondaryRecords = await this.secondary.getAllBookings();
      if (Array.isArray(secondaryRecords)) {
        this.local.setAllBookings(secondaryRecords);
        return secondaryRecords;
      }
    } catch { }

    // 3. Fallback to Local only if BOTH clouds failed/offline
    return await this.local.getAllBookings();
  }

  async getBookingById(id: string): Promise<BookingRecord | null> {
    try {
      const rec = await this.primary.getBookingById(id);
      if (rec) return rec;
    } catch { }

    try {
      const secondaryRec = await this.secondary.getBookingById(id);
      if (secondaryRec) return secondaryRec;
    } catch { }

    return await this.local.getBookingById(id);
  }

  async addBooking(booking: BookingRecord): Promise<BookingRecord> {
    await this.local.addBooking(booking);
    await Promise.allSettled([
      this.primary.addBooking(booking),
      this.secondary.addBooking(booking),
    ]);
    return booking;
  }

  async updateBooking(id: string, updates: Partial<BookingRecord>): Promise<BookingRecord | null> {
    const localUpdated = await this.local.updateBooking(id, updates);
    const [primaryRes, secondaryRes] = await Promise.allSettled([
      this.primary.updateBooking(id, updates),
      this.secondary.updateBooking(id, updates),
    ]);

    if (primaryRes.status === "fulfilled" && primaryRes.value) return primaryRes.value;
    if (secondaryRes.status === "fulfilled" && secondaryRes.value) return secondaryRes.value;
    return localUpdated;
  }

  async deleteBooking(id: string): Promise<boolean> {
    const localDeleted = await this.local.deleteBooking(id);
    const results = await Promise.allSettled([
      this.primary.deleteBooking(id),
      this.secondary.deleteBooking(id),
    ]);
    return localDeleted || results.some((r) => r.status === "fulfilled" && r.value === true);
  }

  async clearAllBookings(): Promise<boolean> {
    await this.local.clearAllBookings();
    await Promise.allSettled([
      this.primary.clearAllBookings(),
      this.secondary.clearAllBookings(),
    ]);
    return true;
  }

  async addConsultation(consultation: ConsultationRecord): Promise<ConsultationRecord> {
    await this.local.addConsultation(consultation);
    await Promise.allSettled([
      this.primary.addConsultation ? this.primary.addConsultation(consultation) : Promise.resolve(),
      this.secondary.addConsultation ? this.secondary.addConsultation(consultation) : Promise.resolve(),
    ]);
    return consultation;
  }

  async getAllConsultations(): Promise<ConsultationRecord[]> {
    if (this.primary.getAllConsultations) {
      try {
        const primaryList = await this.primary.getAllConsultations();
        if (Array.isArray(primaryList)) {
          this.local.setAllConsultations(primaryList);
          return primaryList;
        }
      } catch { }
    }
    if (this.secondary.getAllConsultations) {
      try {
        const secondaryList = await this.secondary.getAllConsultations();
        if (Array.isArray(secondaryList)) {
          this.local.setAllConsultations(secondaryList);
          return secondaryList;
        }
      } catch { }
    }
    return await this.local.getAllConsultations();
  }

  async updateConsultation(id: string, updates: Partial<ConsultationRecord>): Promise<ConsultationRecord | null> {
    const localUpdated = await this.local.updateConsultation(id, updates);
    const promises: Promise<any>[] = [];
    if (this.primary.updateConsultation) promises.push(this.primary.updateConsultation(id, updates));
    if (this.secondary.updateConsultation) promises.push(this.secondary.updateConsultation(id, updates));
    const res = await Promise.allSettled(promises);
    for (const r of res) {
      if (r.status === "fulfilled" && r.value) return r.value;
    }
    return localUpdated;
  }
}

/**
 * Singleton database adapter resolver with auto-detection
 */
function getDatabaseAdapter(): DatabaseAdapter {
  const hasFirestore = !!(
    (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PROJECT_ID.trim()) ||
    (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID.trim())
  );

  const hasSupabase = !!(
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_URL.trim() &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)
  );

  // If BOTH are configured, activate Dual-Write Hybrid Cloud Sync
  if (hasSupabase && hasFirestore) {
    return new DualCloudAdapter(new SupabaseAdapter(), new FirestoreAdapter());
  }

  // If only Supabase is configured
  if (hasSupabase) {
    return new SupabaseAdapter();
  }

  // If only Firestore is configured
  if (hasFirestore) {
    return new FirestoreAdapter();
  }

  // Fallback to local persistent JSON file storage
  return new LocalFileAdapter();
}

const db = getDatabaseAdapter();

/**
 * Export active engine type for monitoring and admin telemetry
 */
export function getActiveDatabaseEngine(): DatabaseEngineType {
  return db.getEngineType();
}

/**
 * ASYNC CRUD Functions (Preferred for Production & Cloud Storage)
 */
export async function getAllBookingsAsync(): Promise<BookingRecord[]> {
  return await db.getAllBookings();
}

export async function getBookingByIdAsync(id: string): Promise<BookingRecord | null> {
  return await db.getBookingById(id);
}

export async function addBookingAsync(
  bookingInput: Partial<BookingRecord> & {
    bookingId?: string;
    customerName: string;
    phoneNumber: string;
    district: string;
    address: string;
  }
): Promise<BookingRecord> {
  const id =
    bookingInput.id ||
    bookingInput.bookingId ||
    `CB-${Math.floor(100000 + Math.random() * 900000)}`;

  const newRecord: BookingRecord = {
    id,
    createdAt: bookingInput.createdAt || new Date().toISOString(),
    customerName: bookingInput.customerName.trim(),
    phoneNumber: bookingInput.phoneNumber.trim(),
    alternatePhone: bookingInput.alternatePhone?.trim() || undefined,
    email:
      bookingInput.email && bookingInput.email !== "Not Provided" && bookingInput.email.includes("@")
        ? bookingInput.email.trim()
        : undefined,
    district: bookingInput.district.trim(),
    address: bookingInput.address.trim(),
    landmark: bookingInput.landmark?.trim() || undefined,
    pincode: bookingInput.pincode?.trim() || "",
    serviceCategory: bookingInput.serviceCategory || undefined,
    serviceName: bookingInput.serviceName?.trim() || "Appliance Repair & Service",
    applianceDetail: bookingInput.applianceDetail?.trim() || "Doorstep Service",
    unitCount: bookingInput.unitCount || 1,
    slot: bookingInput.slot?.trim() || "Scheduled Slot",
    advanceFee: bookingInput.advanceFee !== undefined ? bookingInput.advanceFee : 99,
    paymentStatus: (bookingInput.paymentStatus as any) || "PAID_ADVANCE_99",
    payeeUpi: bookingInput.payeeUpi || "2dhirajkumar4726@okhdfcbank",
    payeeName: bookingInput.payeeName || "Dhiraj Kumar",
    payerName: bookingInput.payerName?.trim() || bookingInput.customerName.trim(),
    payerUpiId: bookingInput.payerUpiId?.trim() || undefined,
    paymentAppUsed: bookingInput.paymentAppUsed || "Google Pay",
    utrNumber: bookingInput.utrNumber?.trim() || "UPI-RECEIVED",
    paymentScreenshot: bookingInput.paymentScreenshot || undefined,
    paymentScreenshotName: bookingInput.paymentScreenshotName || undefined,
    paymentScreenshotSize: bookingInput.paymentScreenshotSize || undefined,
    status: (bookingInput.status as any) || "NEW_PENDING_DISPATCH",
    assignedTechnician: bookingInput.assignedTechnician,
    adminNotes: bookingInput.adminNotes?.trim() || undefined,
  };

  return await db.addBooking(newRecord);
}

export async function updateBookingAsync(
  id: string,
  updates: Partial<BookingRecord>
): Promise<BookingRecord | null> {
  return await db.updateBooking(id, updates);
}

export async function deleteBookingAsync(id: string): Promise<boolean> {
  return await db.deleteBooking(id);
}

export async function clearAllBookingsAsync(): Promise<boolean> {
  return await db.clearAllBookings();
}

export async function addConsultationAsync(
  consultation: ConsultationRecord
): Promise<ConsultationRecord> {
  if (db.addConsultation) {
    return await db.addConsultation(consultation);
  }
  return consultation;
}

export async function getAllConsultationsAsync(): Promise<ConsultationRecord[]> {
  if (db.getAllConsultations) {
    return await db.getAllConsultations();
  }
  return [];
}

export async function updateConsultationAsync(
  id: string,
  updates: Partial<ConsultationRecord>
): Promise<ConsultationRecord | null> {
  if (db.updateConsultation) {
    return await db.updateConsultation(id, updates);
  }
  return null;
}

/**
 * Backward-compatible synchronous wrappers for legacy calls
 */
export function getAllBookings(): BookingRecord[] {
  const local = new LocalFileAdapter();
  try {
    const raw = fs.readFileSync(FILE_PATH, "utf8");
    return JSON.parse(raw) as BookingRecord[];
  } catch {
    return [];
  }
}

export function saveAllBookings(bookings: BookingRecord[]): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(FILE_PATH, JSON.stringify(bookings, null, 2), "utf8");
    return true;
  } catch {
    return false;
  }
}

export function addBooking(bookingInput: any): BookingRecord {
  const local = new LocalFileAdapter();
  const id = bookingInput.id || bookingInput.bookingId || `CB-${Math.floor(100000 + Math.random() * 900000)}`;
  const record: BookingRecord = {
    ...bookingInput,
    id,
    createdAt: bookingInput.createdAt || new Date().toISOString(),
    advanceFee: bookingInput.advanceFee ?? 99,
    paymentStatus: bookingInput.paymentStatus || "PAID_ADVANCE_99",
    status: bookingInput.status || "NEW_PENDING_DISPATCH",
  };
  local.addBooking(record);
  return record;
}

export function updateBooking(id: string, updates: Partial<BookingRecord>): BookingRecord | null {
  const local = new LocalFileAdapter();
  local.updateBooking(id, updates);
  return local.getBookingById(id) as any;
}

export function deleteBooking(id: string): boolean {
  const local = new LocalFileAdapter();
  local.deleteBooking(id);
  return true;
}

export function clearAllBookings(): boolean {
  const local = new LocalFileAdapter();
  local.clearAllBookings();
  return true;
}
