import nodemailer from "nodemailer";

// Create reusable transporter object using SMTP transport
export const getTransporter = () => {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Send Real 4-Digit Verification OTP Email to Customer
 */
export async function sendOtpEmail(toEmail: string, otpCode: string, name?: string) {
  const transporter = getTransporter();

  if (!transporter) {
    throw new Error(
      "SMTP Credentials are not configured. Please add SMTP_USER and SMTP_PASS to your .env.local file to send real emails."
    );
  }

  const mailOptions = {
    from: `"Celebrate Bihar" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `🔐 ${otpCode} is your Celebrate Bihar Verification Code`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1d4ed8 0%, #ea580c 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Celebrate Bihar</h1>
          <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Doorstep Appliance Repair & Business Setup</p>
        </div>

        <div style="padding: 32px 24px; color: #1e293b;">
          <p style="font-size: 16px; margin: 0 0 16px; color: #334155;">Namaste <strong>${name || "Customer"}</strong>,</p>
          <p style="font-size: 15px; line-height: 1.6; margin: 0 0 24px; color: #475569;">
            Your one-time email verification code (OTP) for confirming your Celebrate Bihar doorstep service request is:
          </p>

          <div style="background-color: #eff6ff; border: 2px dashed #3b82f6; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px;">
            <span style="font-family: monospace; font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #1d4ed8;">${otpCode}</span>
          </div>

          <p style="font-size: 13px; color: #64748b; margin: 0 0 8px;">
            ⏰ This code is valid for 10 minutes. Please do not share this code with anyone.
          </p>
          <p style="font-size: 13px; color: #64748b; margin: 0;">
            If you did not request this verification, you can safely ignore this email.
          </p>
        </div>

        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 12px; color: #94a3b8;">
          <p style="margin: 0 0 4px;"><strong>Celebrate Bihar Operations Desk</strong></p>
          <p style="margin: 0;">Verified Technicians across Aurangabad, Arwal, Rohtas, Gaya, Jehanabad &amp; Patna • Instant Doorstep Support</p>
        </div>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  return { success: true, messageId: info.messageId };
}

/**
 * Send Booking Alert Emails:
 * 1. Customer Confirmation Receipt
 * 2. Service Provider / Admin Lead Alert
 */
export async function sendBookingConfirmationEmails(booking: {
  bookingId: string;
  customerName: string;
  phoneNumber: string;
  alternatePhone?: string;
  email: string;
  district: string;
  address: string;
  landmark?: string;
  pincode: string;
  serviceName: string;
  applianceDetail: string;
  unitCount: number;
  slot: string;
  specialNotes?: string;
  advanceFee?: number;
  paymentStatus?: string;
  payeeUpi?: string;
  payeeName?: string;
  payerName?: string;
  payerUpiId?: string;
  paymentAppUsed?: string;
  utrNumber?: string;
  paymentScreenshot?: string;
}) {
  const transporter = getTransporter();
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;

  if (!transporter) {
    console.warn("SMTP not configured. Skipping confirmation emails.");
    return { success: false, error: "SMTP not configured" };
  }

  // 1. Email to Customer
  const customerMailOptions = {
    from: `"Celebrate Bihar" <${process.env.SMTP_USER}>`,
    to: booking.email,
    subject: `✅ Booking Confirmed: [${booking.bookingId}] - Celebrate Bihar`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1d4ed8 0%, #059669 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800;">Aapki Booking Confirm Ho Gayi!</h1>
          <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Booking Ref: <strong>${booking.bookingId}</strong></p>
        </div>

        <div style="padding: 28px 24px; color: #1e293b;">
          <p style="font-size: 15px; margin: 0 0 18px;">
            Dear <strong>${booking.customerName}</strong>, thank you for booking with Celebrate Bihar. Our operations team is assigning a background-verified technician to your address.
          </p>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b;">Booking ID:</td>
              <td style="padding: 10px 0; font-weight: 700; text-align: right; color: #0f172a;">${booking.bookingId}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b;">Service:</td>
              <td style="padding: 10px 0; font-weight: 700; text-align: right; color: #0f172a;">${booking.serviceName} (${booking.unitCount} Unit${booking.unitCount > 1 ? "s" : ""})</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b;">Appliance / Specs:</td>
              <td style="padding: 10px 0; font-weight: 600; text-align: right; color: #334155;">${booking.applianceDetail}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b;">Schedule Slot:</td>
              <td style="padding: 10px 0; font-weight: 700; text-align: right; color: #2563eb;">${booking.slot}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b;">Service Address:</td>
              <td style="padding: 10px 0; font-weight: 600; text-align: right; color: #334155;">
                ${booking.address}, ${booking.landmark ? booking.landmark + ", " : ""}${booking.district} - ${booking.pincode}
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b;">Slot Deposit (Paid):</td>
              <td style="padding: 10px 0; font-weight: 700; text-align: right; color: #2563eb;">₹${booking.advanceFee || 99} (Paid to ${booking.payeeName || "Dhiraj Kumar"} • Ref: ${booking.utrNumber || "UPI"})</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b;">Remaining Pricing:</td>
              <td style="padding: 10px 0; font-weight: 700; text-align: right; color: #059669;">Transparent Upfront Quote Post-Inspection (₹${booking.advanceFee || 99} Deducted)</td>
            </tr>
          </table>

          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 13px; color: #166534; line-height: 1.5;">
              <strong>🛡️ Celebrate Bihar Assurance:</strong> 30-Day Service Warranty • Background Verified Technicians • ₹${booking.advanceFee || 99} 100% Adjusted in Final Bill
            </p>
          </div>
        </div>

        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 12px; color: #94a3b8;">
          <p style="margin: 0;">Helpline: +91 98765 43210 • Bihar's Premier Doorstep Marketplace</p>
        </div>
      </div>
    `,
  };

  // 2. Email to Service Provider / Admin Desk
  const adminMailOptions = adminEmail
    ? {
        from: `"Celebrate Bihar Leads" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        subject: `🚨 NEW PAID BOOKING: [${booking.bookingId}] - ${booking.customerName} (${booking.district})`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 650px; margin: 0 auto; background-color: #ffffff; border: 2px solid #2563eb; border-radius: 16px; overflow: hidden;">
            <div style="background-color: #2563eb; padding: 24px; color: #ffffff;">
              <span style="background-color: #ffffff; color: #2563eb; padding: 4px 10px; border-radius: 6px; font-weight: 800; font-size: 12px; text-transform: uppercase;">Advance Paid (₹${booking.advanceFee || 99})</span>
              <h2 style="margin: 10px 0 0; font-size: 22px;">New Confirmed Service Booking Dispatch</h2>
            </div>

            <div style="padding: 24px; color: #0f172a;">
              <h3 style="margin: 0 0 16px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; font-size: 16px; color: #1e293b;">Customer Details</h3>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Name:</strong> ${booking.customerName}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Phone:</strong> <a href="tel:${booking.phoneNumber}" style="color: #2563eb; font-weight: 700;">+91 ${booking.phoneNumber}</a></p>
              ${booking.alternatePhone ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Alt Phone:</strong> +91 ${booking.alternatePhone}</p>` : ""}
              <p style="margin: 4px 0; font-size: 14px;"><strong>Email:</strong> <a href="mailto:${booking.email}">${booking.email}</a></p>

              <h3 style="margin: 20px 0 16px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; font-size: 16px; color: #1e293b;">UPI Payment & Verification</h3>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Payee:</strong> ${booking.payeeName || "Dhiraj Kumar"} (${booking.payeeUpi || "2dhirajkumar4726@okhdfcbank"})</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Payer Name on Bank / UPI:</strong> <span style="font-weight: 700; color: #1e40af;">${booking.payerName || booking.customerName}</span></p>
              ${booking.payerUpiId ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Payer UPI ID:</strong> ${booking.payerUpiId}</p>` : ""}
              <p style="margin: 4px 0; font-size: 14px;"><strong>12-Digit UTR / Transaction Ref:</strong> <span style="font-family: monospace; font-weight: 800; color: #2563eb; font-size: 15px;">${booking.utrNumber || "N/A"}</span></p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Payment App:</strong> ${booking.paymentAppUsed || "UPI"}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Payment Status:</strong> <span style="color: #059669; font-weight: 700;">PAID ₹${booking.advanceFee || 99}</span></p>

              ${booking.paymentScreenshot ? `
                <div style="margin: 16px 0; padding: 14px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;">
                  <strong style="color: #1e293b; font-size: 13px; display: block; margin-bottom: 8px;">📸 Attached Payment Screenshot Proof:</strong>
                  <img src="${booking.paymentScreenshot}" alt="UPI Payment Screenshot" style="max-width: 100%; max-height: 400px; border-radius: 8px; border: 1px solid #cbd5e1; display: block;" />
                </div>
              ` : ""}

              <h3 style="margin: 20px 0 16px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; font-size: 16px; color: #1e293b;">Job & Location</h3>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Booking ID:</strong> <span style="font-family: monospace; font-weight: 700; color: #2563eb;">${booking.bookingId}</span></p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Service:</strong> ${booking.serviceName} (${booking.unitCount} Unit${booking.unitCount > 1 ? "s" : ""})</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Appliance / Specs:</strong> ${booking.applianceDetail}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Schedule Slot:</strong> <span style="color: #2563eb; font-weight: 700;">${booking.slot}</span></p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>District:</strong> <strong>${booking.district}</strong> (PIN: ${booking.pincode})</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Address:</strong> ${booking.address}</p>
              ${booking.landmark ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Landmark:</strong> ${booking.landmark}</p>` : ""}
              ${booking.specialNotes ? `<p style="margin: 4px 0; font-size: 14px; background: #fff7ed; padding: 10px; border-radius: 8px;"><strong>Customer Notes:</strong> ${booking.specialNotes}</p>` : ""}

              <div style="margin-top: 24px; text-align: center;">
                <a href="https://wa.me/91${booking.phoneNumber.replace(/\D/g, "")}" style="display: inline-block; background-color: #25d366; color: #ffffff; padding: 12px 24px; border-radius: 9999px; text-decoration: none; font-weight: 700; font-size: 14px;">
                  💬 Open WhatsApp with Customer
                </a>
              </div>
            </div>
          </div>
        `,
      }
    : null;

  try {
    const promises: Promise<any>[] = [];
    if (booking.email && booking.email !== "Not Provided" && booking.email.includes("@")) {
      promises.push(transporter.sendMail(customerMailOptions));
    }
    if (adminMailOptions) {
      promises.push(transporter.sendMail(adminMailOptions));
    }
    if (promises.length > 0) {
      await Promise.all(promises);
    }
    return { success: true };
  } catch (error) {
    console.error("Error sending booking confirmation emails:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Send Free Consultation & Setup Inquiry Notification Emails
 */
export async function sendConsultationInquiryEmail(consultation: {
  consultationId: string;
  customerName: string;
  phoneNumber: string;
  orgName?: string;
  email?: string;
  district: string;
  address: string;
  category: string;
  scale: string;
  preferredSlot: string;
  projectOverview: string;
}) {
  const transporter = getTransporter();
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;

  if (!transporter) {
    console.warn("SMTP not configured. Skipping consultation email dispatch.");
    return { success: false, error: "SMTP not configured" };
  }

  // 1. Email to Customer (if valid email provided)
  const customerMailOptions = consultation.email && consultation.email.includes("@")
    ? {
        from: `"Celebrate Bihar Operations" <${process.env.SMTP_USER}>`,
        to: consultation.email,
        subject: `📋 Consultation Request Logged: [${consultation.consultationId}] - Celebrate Bihar`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 800;">Consultation Request Received</h1>
              <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Ref ID: <strong>${consultation.consultationId}</strong></p>
            </div>

            <div style="padding: 28px 24px; color: #1e293b;">
              <p style="font-size: 15px; margin: 0 0 16px;">
                Namaste <strong>${consultation.customerName}</strong>, thank you for reaching out to Celebrate Bihar. Our <strong>${consultation.district}</strong> operations lead has received your project inquiry and will connect with you during your preferred slot.
              </p>

              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px 0; color: #64748b;">Inquiry ID:</td>
                  <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #0f172a;">${consultation.consultationId}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px 0; color: #64748b;">Service Category:</td>
                  <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #2563eb;">${consultation.category}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px 0; color: #64748b;">Project Scale:</td>
                  <td style="padding: 8px 0; font-weight: 600; text-align: right; color: #334155;">${consultation.scale}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px 0; color: #64748b;">District & Location:</td>
                  <td style="padding: 8px 0; font-weight: 600; text-align: right; color: #334155;">${consultation.district} (${consultation.address})</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px 0; color: #64748b;">Preferred Callback Window:</td>
                  <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #059669;">${consultation.preferredSlot}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Consultation Fee:</td>
                  <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #059669;">₹0.00 (100% Free)</td>
                </tr>
              </table>

              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase;">Your Submitted Overview:</p>
                <p style="margin: 0; font-size: 13px; color: #1e293b; line-height: 1.5; font-style: italic;">
                  &quot;${consultation.projectOverview}&quot;
                </p>
              </div>

              <p style="font-size: 13px; color: #64748b; margin: 0;">
                If you need urgent assistance, you can also connect directly on WhatsApp at <a href="https://wa.me/919876543210" style="color: #2563eb; font-weight: bold;">+91 98765 43210</a>.
              </p>
            </div>
          </div>
        `,
      }
    : null;

  // 2. Email to Admin / Operations Lead
  const adminMailOptions = adminEmail
    ? {
        from: `"Celebrate Bihar Leads" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        subject: `🚨 NEW FREE CONSULTATION INQUIRY: [${consultation.consultationId}] - ${consultation.customerName} (${consultation.district})`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 650px; margin: 0 auto; background-color: #ffffff; border: 2px solid #2563eb; border-radius: 16px; overflow: hidden;">
            <div style="background-color: #2563eb; padding: 24px; color: #ffffff;">
              <span style="background-color: #ffffff; color: #2563eb; padding: 4px 10px; border-radius: 6px; font-weight: 800; font-size: 12px; text-transform: uppercase;">100% Free Consultation Inquiry</span>
              <h2 style="margin: 10px 0 0; font-size: 22px;">New Project / Setup Lead for ${consultation.district}</h2>
            </div>

            <div style="padding: 24px; color: #0f172a;">
              <h3 style="margin: 0 0 16px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; font-size: 16px; color: #1e293b;">Client Contact</h3>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Customer Name:</strong> ${consultation.customerName}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Phone:</strong> <a href="tel:${consultation.phoneNumber}" style="color: #2563eb; font-weight: 700;">+91 ${consultation.phoneNumber}</a></p>
              ${consultation.orgName ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Organization / Entity:</strong> ${consultation.orgName}</p>` : ""}
              ${consultation.email ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Email:</strong> <a href="mailto:${consultation.email}">${consultation.email}</a></p>` : ""}

              <h3 style="margin: 20px 0 16px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; font-size: 16px; color: #1e293b;">Project Scope &amp; Timing</h3>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Inquiry ID:</strong> <span style="font-family: monospace; font-weight: 700; color: #2563eb;">${consultation.consultationId}</span></p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Category:</strong> ${consultation.category}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Scale / Volume:</strong> ${consultation.scale}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>District:</strong> <strong>${consultation.district}</strong></p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Locality / Site Address:</strong> ${consultation.address}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Preferred Callback Window:</strong> <span style="color: #2563eb; font-weight: 700;">${consultation.preferredSlot}</span></p>

              <h3 style="margin: 20px 0 16px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; font-size: 16px; color: #1e293b;">Project Overview Notes</h3>
              <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 14px; font-size: 14px; color: #334155; line-height: 1.5;">
                ${consultation.projectOverview}
              </div>

              <div style="margin-top: 24px; text-align: center;">
                <a href="https://wa.me/91${consultation.phoneNumber.replace(/\D/g, "")}" style="display: inline-block; background-color: #25d366; color: #ffffff; padding: 12px 24px; border-radius: 9999px; text-decoration: none; font-weight: 700; font-size: 14px;">
                  💬 Connect on WhatsApp with Client
                </a>
              </div>
            </div>
          </div>
        `,
      }
    : null;

  try {
    const promises: Promise<any>[] = [];
    if (customerMailOptions) promises.push(transporter.sendMail(customerMailOptions));
    if (adminMailOptions) promises.push(transporter.sendMail(adminMailOptions));
    if (promises.length > 0) await Promise.all(promises);
    return { success: true };
  } catch (error) {
    console.error("Error sending consultation email:", error);
    return { success: false, error: (error as Error).message };
  }
}
