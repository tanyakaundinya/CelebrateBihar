import { NextRequest, NextResponse } from "next/server";
import {
  getAllTechniciansAsync,
  addTechnicianAsync,
  updateTechnicianAsync,
  deleteTechnicianAsync,
} from "@/lib/techniciansStore";
import { verifyAdminAuth } from "@/lib/auth/adminAuth";

export async function GET(req: NextRequest) {
  try {
    const isAdmin = verifyAdminAuth(req);
    const rawTechnicians = await getAllTechniciansAsync();

    // If not authenticated admin, mask phone numbers for privacy
    const technicians = isAdmin
      ? rawTechnicians
      : rawTechnicians.map((t) => ({
          ...t,
          phone: t.phone ? t.phone.replace(/(\+?91)?(\d{2})\d{4,6}(\d{2,4})/, "$1 $2******$3") : "Verified Technician",
        }));

    return NextResponse.json({ success: true, technicians });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!verifyAdminAuth(req)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin credentials required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    if (!body.name || !body.phone || !body.district) {
      return NextResponse.json(
        { success: false, error: "Name, phone, and district are required." },
        { status: 400 }
      );
    }
    const created = await addTechnicianAsync({
      name: body.name,
      phone: body.phone,
      district: body.district,
      specialty: body.specialty || "Appliance & Electrical Technician",
    });
    return NextResponse.json({ success: true, technician: created });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!verifyAdminAuth(req)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin credentials required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: "Technician ID is required." }, { status: 400 });
    }
    const updated = await updateTechnicianAsync(body.id, body);
    return NextResponse.json({ success: true, technician: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!verifyAdminAuth(req)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin credentials required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required." }, { status: 400 });
    }
    const deleted = await deleteTechnicianAsync(id);
    return NextResponse.json({ success: true, deleted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
