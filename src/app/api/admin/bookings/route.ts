import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Booking } from "@/models";
import { getUserFromRequest } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    const { authorized, errorResponse } = requireRole(user, ["admin"]);
    if (!authorized) return errorResponse;

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const filter: any = {};
    if (status && status !== "all") filter.status = status;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate("customer", "name email phone profileImage")
        .populate("provider", "name email phone profileImage")
        .populate("service", "title price priceType category")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Booking.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      bookings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
