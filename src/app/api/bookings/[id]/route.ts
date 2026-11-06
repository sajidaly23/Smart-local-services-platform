import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Booking, Review } from "@/models";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const booking = await Booking.findById(id)
      .populate("service")
      .populate("customer", "name email phone profileImage")
      .populate("provider", "name email phone profileImage")
      .lean();

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    // Authorization check
    const isCustomer = (booking.customer as any)?._id?.toString() === user.id;
    const isProvider = (booking.provider as any)?._id?.toString() === user.id;
    const isAdmin = user.role === "admin";

    if (!isCustomer && !isProvider && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Access denied to this booking" },
        { status: 403 }
      );
    }

    // Fetch review if exists
    let review = null;
    if (booking.hasReview) {
      review = await Review.findOne({ booking: booking._id }).lean();
    }

    return NextResponse.json({ success: true, booking, review });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    const isCustomer = booking.customer.toString() === user.id;
    const isProvider = booking.provider.toString() === user.id;
    const isAdmin = user.role === "admin";

    if (!isCustomer && !isProvider && !isAdmin) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const updated = await Booking.findByIdAndUpdate(id, { $set: body }, { new: true });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

