export type DatabaseEngineType = "FIRESTORE" | "SUPABASE" | "POSTGRES" | "LOCAL_STORAGE" | "HYBRID_DUAL_CLOUD";

export interface TechnicianAssignment {
  name: string;
  phone: string;
  assignedAt: string;
  arrivalWindow?: string;
}

export interface BookingRecord {
  id: string;
  createdAt: string;
  customerName: string;
  phoneNumber: string;
  alternatePhone?: string;
  email?: string;
  district: string;
  address: string;
  landmark?: string;
  pincode: string;
  serviceCategory?: string;
  serviceName: string;
  applianceDetail: string;
  unitCount: number;
  slot: string;
  specialNotes?: string;
  advanceFee: number;
  paymentStatus: "PENDING" | "PAID_ADVANCE_99" | "VERIFIED" | "REFUNDED" | "CONSULTATION_FREE";
  payeeUpi: string;
  payeeName: string;
  payerName: string;
  payerUpiId?: string;
  paymentAppUsed: string;
  utrNumber: string;
  paymentScreenshot?: string;
  paymentScreenshotName?: string;
  paymentScreenshotSize?: string;
  status:
    | "NEW_PENDING_DISPATCH"
    | "PAYMENT_VERIFIED"
    | "TECHNICIAN_ASSIGNED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";
  assignedTechnician?: TechnicianAssignment;
  adminNotes?: string;
  updatedAt?: string;
}

export interface ConsultationRecord {
  id: string;
  createdAt: string;
  customerName: string;
  phoneNumber: string;
  orgName?: string;
  facilityType: string;
  email?: string;
  district: string;
  address: string;
  category: string;
  scale: string;
  preferredSlot: string;
  projectOverview: string;
  status: "NEW" | "CONTACTED" | "INSPECTION_SCHEDULED" | "BOQ_SENT" | "CLOSED";
}

export interface DatabaseAdapter {
  getEngineType(): DatabaseEngineType;
  getAllBookings(): Promise<BookingRecord[]>;
  getBookingById(id: string): Promise<BookingRecord | null>;
  addBooking(booking: BookingRecord): Promise<BookingRecord>;
  updateBooking(id: string, updates: Partial<BookingRecord>): Promise<BookingRecord | null>;
  deleteBooking(id: string): Promise<boolean>;
  clearAllBookings(): Promise<boolean>;
  addConsultation?(consultation: ConsultationRecord): Promise<ConsultationRecord>;
  getAllConsultations?(): Promise<ConsultationRecord[]>;
  updateConsultation?(id: string, updates: Partial<ConsultationRecord>): Promise<ConsultationRecord | null>;
}
