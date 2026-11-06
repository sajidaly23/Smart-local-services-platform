import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Booking, Service, Notification, User } from "@/models";
import { getUserFromRequest } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { BookingSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const filter: any = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    if (user.role === "customer") {
      filter.customer = user.id;
    } else if (user.role === "provider") {
      filter.provider = user.id;
    }
    // If admin, no filter restriction: sees all platform bookings

    const bookings = await Booking.find(filter)
      .populate("service", "title price priceType images city area")
      .populate("customer", "name email phone profileImage")
      .populate("provider", "name email phone profileImage")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, bookings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    const { authorized, errorResponse } = requireRole(user, ["customer", "admin"]);
    if (!authorized) return errorResponse;

    const body = await req.json();
    const validated = BookingSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.errors[0]?.message },
        { status: 400 }
      );
    }

    const {
      serviceId,
      requestedDate,
      requestedTime,
      description,
      serviceAddress,
      contactPhone,
    } = validated.data;

    await connectToDatabase();

    const service = await Service.findById(serviceId);
    if (!service) {
      return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
    }

    // Customer cannot book their own service if they happen to be provider
    if (service.provider.toString() === user!.id) {
      return NextResponse.json(
        { success: false, error: "You cannot book your own service" },
        { status: 400 }
      );
    }

    const bookingRef = `LC-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking = await Booking.create({
      bookingReference: bookingRef,
      customer: user!.id,
      provider: service.provider,
      service: service._id,
      requestedDate,
      requestedTime,
      description,
      serviceAddress,
      contactPhone,
      price: service.price,
      status: "pending",
    });

    // Increment service bookings count
    await Service.findByIdAndUpdate(service._id, { $inc: { bookingsCount: 1 } });

    // Notify Provider
    await Notification.create({
      recipient: service.provider,
      title: "New Booking Request Received",
      message: `${user!.name} requested a booking for "${service.title}" on ${requestedDate}.`,
      type: "booking",
      relatedId: newBooking._id.toString(),
      link: `/dashboard/provider/bookings`,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Booking request submitted successfully. Provider has been notified.",
        booking: newBooking,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create Booking Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

