import { BookingRecord, ConsultationRecord, DatabaseAdapter, DatabaseEngineType } from "./types";

/**
 * Supabase & PostgreSQL Database Adapter for Celebrate Bihar.
 * Communicates with Supabase PostgreSQL via PostgREST endpoint using API Key.
 */
export class SupabaseAdapter implements DatabaseAdapter {
  private supabaseUrl: string;
  private supabaseKey: string;
  private tableName = "bookings";
  private consultationsTable = "consultations";

  constructor() {
    this.supabaseUrl = (process.env.SUPABASE_URL || "").replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
    this.supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";
  }

  getEngineType(): DatabaseEngineType {
    return "SUPABASE";
  }

  private getHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      apikey: this.supabaseKey,
      Authorization: `Bearer ${this.supabaseKey}`,
      Prefer: "return=representation",
    };
  }

  async getAllBookings(): Promise<BookingRecord[]> {
    try {
      if (!this.supabaseUrl || !this.supabaseKey) return [];

      const res = await fetch(`${this.supabaseUrl}/rest/v1/${this.tableName}?select=*&order=createdAt.desc`, {
        method: "GET",
        headers: this.getHeaders(),
        cache: "no-store",
      });

      if (!res.ok) {
        console.warn(`Supabase GET failed (${res.status})`);
        return [];
      }

      const rows = await res.json();
      return rows.map((r: any) => ({
        ...r,
        assignedTechnician: r.assignedTechnician ? JSON.parse(typeof r.assignedTechnician === "string" ? r.assignedTechnician : JSON.stringify(r.assignedTechnician)) : undefined,
      }));
    } catch (err) {
      console.error("Supabase getAllBookings error:", err);
      return [];
    }
  }

  async getBookingById(id: string): Promise<BookingRecord | null> {
    try {
      if (!this.supabaseUrl || !this.supabaseKey) return null;

      const res = await fetch(`${this.supabaseUrl}/rest/v1/${this.tableName}?id=eq.${encodeURIComponent(id)}&select=*`, {
        method: "GET",
        headers: this.getHeaders(),
        cache: "no-store",
      });

      if (!res.ok) return null;
      const rows = await res.json();
      if (!rows || rows.length === 0) return null;

      const r = rows[0];
      return {
        ...r,
        assignedTechnician: r.assignedTechnician ? JSON.parse(typeof r.assignedTechnician === "string" ? r.assignedTechnician : JSON.stringify(r.assignedTechnician)) : undefined,
      };
    } catch (err) {
      console.error(`Supabase getBookingById (${id}) error:`, err);
      return null;
    }
  }

  async addBooking(booking: BookingRecord): Promise<BookingRecord> {
    try {
      if (!this.supabaseUrl || !this.supabaseKey) return booking;

      const payload = {
        ...booking,
        assignedTechnician: booking.assignedTechnician ? JSON.stringify(booking.assignedTechnician) : null,
      };

      await fetch(`${this.supabaseUrl}/rest/v1/${this.tableName}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      return booking;
    } catch (err) {
      console.error("Supabase addBooking error:", err);
      return booking;
    }
  }

  async updateBooking(id: string, updates: Partial<BookingRecord>): Promise<BookingRecord | null> {
    try {
      if (!this.supabaseUrl || !this.supabaseKey) return null;

      const payload: any = { ...updates, updatedAt: new Date().toISOString() };
      if (updates.assignedTechnician) {
        payload.assignedTechnician = JSON.stringify(updates.assignedTechnician);
      }

      const res = await fetch(`${this.supabaseUrl}/rest/v1/${this.tableName}?id=eq.${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) return null;
      return await this.getBookingById(id);
    } catch (err) {
      console.error("Supabase updateBooking error:", err);
      return null;
    }
  }

  async deleteBooking(id: string): Promise<boolean> {
    try {
      if (!this.supabaseUrl || !this.supabaseKey) return false;

      const res = await fetch(`${this.supabaseUrl}/rest/v1/${this.tableName}?id=eq.${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });

      return res.ok;
    } catch (err) {
      console.error("Supabase deleteBooking error:", err);
      return false;
    }
  }

  async clearAllBookings(): Promise<boolean> {
    try {
      if (!this.supabaseUrl || !this.supabaseKey) return false;

      const res = await fetch(`${this.supabaseUrl}/rest/v1/${this.tableName}?id=neq.NULL`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });

      return res.ok;
    } catch {
      return false;
    }
  }

  async addConsultation(consultation: ConsultationRecord): Promise<ConsultationRecord> {
    try {
      if (!this.supabaseUrl || !this.supabaseKey) return consultation;

      await fetch(`${this.supabaseUrl}/rest/v1/${this.consultationsTable}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(consultation),
      });

      return consultation;
    } catch (err) {
      console.error("Supabase addConsultation error:", err);
      return consultation;
    }
  }

  async getAllConsultations(): Promise<ConsultationRecord[]> {
    try {
      if (!this.supabaseUrl || !this.supabaseKey) return [];

      const res = await fetch(`${this.supabaseUrl}/rest/v1/${this.consultationsTable}?select=*&order=createdAt.desc`, {
        method: "GET",
        headers: this.getHeaders(),
        cache: "no-store",
      });

      if (!res.ok) return [];
      return (await res.json()) as ConsultationRecord[];
    } catch (err) {
      console.error("Supabase getAllConsultations error:", err);
      return [];
    }
  }

  async updateConsultation(id: string, updates: Partial<ConsultationRecord>): Promise<ConsultationRecord | null> {
    try {
      if (!this.supabaseUrl || !this.supabaseKey) return null;

      const res = await fetch(`${this.supabaseUrl}/rest/v1/${this.consultationsTable}?id=eq.${id}`, {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify(updates),
      });

      if (!res.ok) return null;
      const data = await res.json();
      return Array.isArray(data) && data.length > 0 ? data[0] : null;
    } catch (err) {
      console.error("Supabase updateConsultation error:", err);
      return null;
    }
  }
}
