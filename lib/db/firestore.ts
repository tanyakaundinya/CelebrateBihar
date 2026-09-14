import { BookingRecord, ConsultationRecord, DatabaseAdapter, DatabaseEngineType } from "./types";

/**
 * Cloud Firestore Database Adapter for Celebrate Bihar.
 * Communicates with Google Cloud Firestore via REST API with OAuth2 / Service Account credentials.
 */
export class FirestoreAdapter implements DatabaseAdapter {
  private projectId: string;
  private apiKey?: string;
  private collectionName = "celebrate_bihar_bookings";
  private consultationsCollection = "celebrate_bihar_consultations";

  constructor() {
    this.projectId =
      process.env.FIREBASE_PROJECT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      "celebrate-bihar-default";
    this.apiKey = process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  }

  getEngineType(): DatabaseEngineType {
    return "FIRESTORE";
  }

  private getBaseUrl(): string {
    return `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents`;
  }

  /**
   * Helper to format a JS object into Firestore document fields
   */
  private toFirestoreFields(obj: Record<string, any>): Record<string, any> {
    const fields: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined || value === null) continue;
      if (typeof value === "string") {
        fields[key] = { stringValue: value };
      } else if (typeof value === "number") {
        fields[key] = { integerValue: value.toString() };
      } else if (typeof value === "boolean") {
        fields[key] = { booleanValue: value };
      } else if (Array.isArray(value)) {
        fields[key] = {
          arrayValue: {
            values: value.map((v) =>
              typeof v === "string" ? { stringValue: v } : { mapValue: { fields: this.toFirestoreFields(v) } }
            ),
          },
        };
      } else if (typeof value === "object") {
        fields[key] = { mapValue: { fields: this.toFirestoreFields(value) } };
      }
    }
    return fields;
  }

  /**
   * Helper to parse Firestore document fields back to JS object
   */
  private fromFirestoreDocument(doc: any): any {
    if (!doc || !doc.fields) return null;
    const result: Record<string, any> = {};
    for (const [key, val] of Object.entries(doc.fields as Record<string, any>)) {
      if (val.stringValue !== undefined) result[key] = val.stringValue;
      else if (val.integerValue !== undefined) result[key] = Number(val.integerValue);
      else if (val.doubleValue !== undefined) result[key] = Number(val.doubleValue);
      else if (val.booleanValue !== undefined) result[key] = val.booleanValue;
      else if (val.mapValue !== undefined) result[key] = this.fromFirestoreDocument(val.mapValue);
      else if (val.arrayValue !== undefined) {
        result[key] = (val.arrayValue.values || []).map((v: any) =>
          v.stringValue !== undefined ? v.stringValue : this.fromFirestoreDocument(v.mapValue)
        );
      }
    }
    return result;
  }

  async getAllBookings(): Promise<BookingRecord[]> {
    const url = `${this.getBaseUrl()}/${this.collectionName}?pageSize=500${
      this.apiKey ? `&key=${this.apiKey}` : ""
    }`;

    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Firestore GET failed (${res.status})`);
    }

    const data = await res.json();
    if (!data.documents || !Array.isArray(data.documents)) {
      return [];
    }

    const records: BookingRecord[] = data.documents
      .map((doc: any) => this.fromFirestoreDocument(doc))
      .filter(Boolean);

    // Sort by creation date descending
    return records.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getBookingById(id: string): Promise<BookingRecord | null> {
    try {
      const url = `${this.getBaseUrl()}/${this.collectionName}/${encodeURIComponent(id)}${
        this.apiKey ? `&key=${this.apiKey}` : ""
      }`;

      const res = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) return null;
      const doc = await res.json();
      return this.fromFirestoreDocument(doc) as BookingRecord;
    } catch (err) {
      console.error(`Firestore getBookingById (${id}) error:`, err);
      return null;
    }
  }

  async addBooking(booking: BookingRecord): Promise<BookingRecord> {
    try {
      const url = `${this.getBaseUrl()}/${this.collectionName}?documentId=${encodeURIComponent(
        booking.id
      )}${this.apiKey ? `&key=${this.apiKey}` : ""}`;

      const fields = this.toFirestoreFields(booking);

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`Firestore addBooking failed (${res.status}):`, errText);
      }

      return booking;
    } catch (err) {
      console.error("Firestore addBooking error:", err);
      return booking;
    }
  }

  async updateBooking(
    id: string,
    updates: Partial<BookingRecord>
  ): Promise<BookingRecord | null> {
    try {
      const existing = await this.getBookingById(id);
      if (!existing) return null;

      const merged: BookingRecord = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      const url = `${this.getBaseUrl()}/${this.collectionName}/${encodeURIComponent(id)}${
        this.apiKey ? `&key=${this.apiKey}` : ""
      }`;

      const fields = this.toFirestoreFields(merged);

      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields }),
      });

      if (!res.ok) {
        console.error(`Firestore updateBooking failed (${res.status})`);
        return null;
      }

      return merged;
    } catch (err) {
      console.error("Firestore updateBooking error:", err);
      return null;
    }
  }

  async deleteBooking(id: string): Promise<boolean> {
    try {
      const url = `${this.getBaseUrl()}/${this.collectionName}/${encodeURIComponent(id)}${
        this.apiKey ? `&key=${this.apiKey}` : ""
      }`;

      const res = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      return res.ok;
    } catch (err) {
      console.error("Firestore deleteBooking error:", err);
      return false;
    }
  }

  async clearAllBookings(): Promise<boolean> {
    try {
      const all = await this.getAllBookings();
      for (const b of all) {
        await this.deleteBooking(b.id);
      }
      return true;
    } catch {
      return false;
    }
  }

  async addConsultation(consultation: ConsultationRecord): Promise<ConsultationRecord> {
    try {
      const url = `${this.getBaseUrl()}/${this.consultationsCollection}?documentId=${encodeURIComponent(
        consultation.id
      )}${this.apiKey ? `&key=${this.apiKey}` : ""}`;

      const fields = this.toFirestoreFields(consultation);

      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields }),
      });

      return consultation;
    } catch (err) {
      console.error("Firestore addConsultation error:", err);
      return consultation;
    }
  }

  async getAllConsultations(): Promise<ConsultationRecord[]> {
    const url = `${this.getBaseUrl()}/${this.consultationsCollection}?pageSize=100${
      this.apiKey ? `&key=${this.apiKey}` : ""
    }`;

    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Firestore GET consultations failed (${res.status})`);
    }

    const data = await res.json();
    if (!data.documents || !Array.isArray(data.documents)) return [];

    return data.documents.map((doc: any) => this.fromFirestoreDocument(doc) as ConsultationRecord);
  }

  async updateConsultation(id: string, updates: Partial<ConsultationRecord>): Promise<ConsultationRecord | null> {
    try {
      const updateMask = Object.keys(updates)
        .map((k) => `updateMask.fieldPaths=${k}`)
        .join("&");

      const url = `${this.getBaseUrl()}/${this.consultationsCollection}/${encodeURIComponent(id)}?${updateMask}${
        this.apiKey ? `&key=${this.apiKey}` : ""
      }`;

      const fields = this.toFirestoreFields(updates);

      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields }),
      });

      if (!res.ok) return null;
      const data = await res.json();
      return this.fromFirestoreDocument(data) as ConsultationRecord;
    } catch (err) {
      console.error("Firestore updateConsultation error:", err);
      return null;
    }
  }
}
