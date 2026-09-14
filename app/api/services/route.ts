import { NextRequest, NextResponse } from "next/server";
import {
  getAllServiceCategoriesAsync,
  addServiceItemAsync,
  updateServiceItemAsync,
  deleteServiceItemAsync,
} from "@/lib/servicesStore";
import { verifyAdminAuth } from "@/lib/auth/adminAuth";

export async function GET() {
  try {
    const categories = await getAllServiceCategoriesAsync();
    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error: any) {
    console.error("Error in GET /api/services:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch services catalog" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!verifyAdminAuth(req, "SUPER_ADMIN")) {
      return NextResponse.json(
        { success: false, error: "Access Denied. Only Super Administrators can add services to catalog." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { categoryId, name, shortDesc, basePrice, pricingModel, features, group, popular } = body;

    if (!categoryId || !name || !shortDesc) {
      return NextResponse.json(
        { success: false, error: "Category ID, Service Name, and Description are required." },
        { status: 400 }
      );
    }

    const result = await addServiceItemAsync(categoryId, {
      name,
      shortDesc,
      basePrice: basePrice !== undefined && basePrice !== null ? Number(basePrice) : null,
      pricingModel,
      features,
      group,
      popular,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      service: result.service,
      message: "New service successfully added to catalog.",
    });
  } catch (error: any) {
    console.error("Error in POST /api/services:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to add service" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!verifyAdminAuth(req, "SUPER_ADMIN")) {
      return NextResponse.json(
        { success: false, error: "Access Denied. Only Super Administrators can update service catalog." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Service ID is required." },
        { status: 400 }
      );
    }

    if (updates.basePrice !== undefined && updates.basePrice !== null) {
      updates.basePrice = Number(updates.basePrice);
    }

    const result = await updateServiceItemAsync(id, updates);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      service: result.service,
      message: "Service updated successfully.",
    });
  } catch (error: any) {
    console.error("Error in PATCH /api/services:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update service" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!verifyAdminAuth(req, "SUPER_ADMIN")) {
      return NextResponse.json(
        { success: false, error: "Access Denied. Only Super Administrators can remove services from catalog." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Service ID is required." },
        { status: 400 }
      );
    }

    const result = await deleteServiceItemAsync(id);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Service deleted successfully.",
    });
  } catch (error: any) {
    console.error("Error in DELETE /api/services:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete service" },
      { status: 500 }
    );
  }
}
