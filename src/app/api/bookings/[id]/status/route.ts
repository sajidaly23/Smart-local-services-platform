import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Booking, Notification } from "@/models";
import { getUserFromRequest } from "@/lib/auth";

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
    const { status, reason } = await req.json();

    if (!status) {
      return NextResponse.json({ success: false, error: "New status is required" }, { status: 400 });
    }

    await connectToDatabase();
    const booking = await Booking.findById(id).populate("service", "title");

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    const isCustomer = booking.customer.toString() === user.id;
    const isProvider = booking.provider.toString() === user.id;
    const isAdmin = user.role === "admin";

    if (!isCustomer && !isProvider && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "You are not authorized to update this booking" },
        { status: 403 }
      );
    }

    const currentStatus = booking.status;

    // Terminal states cannot be changed except by admin
    if (["completed", "cancelled", "rejected"].includes(currentStatus) && !isAdmin) {
      return NextResponse.json(
        { success: false, error: `Booking is already ${currentStatus} and cannot be altered` },
        { status: 400 }
      );
    }

    // Role-specific transition rules
    if (isCustomer && !isAdmin) {
      if (status !== "cancelled") {
        return NextResponse.json(
          { success: false, error: "Customers can only cancel bookings" },
          { status: 403 }
        );
      }
      if (!["pending", "accepted"].includes(currentStatus)) {
        return NextResponse.json(
          { success: false, error: "Bookings already in progress or completed cannot be cancelled" },
          { status: 400 }
        );
      }
    }

    if (isProvider && !isAdmin) {
      const allowedTransitions: Record<string, string[]> = {
        pending: ["accepted", "rejected"],
        accepted: ["in_progress", "cancelled"],
        in_progress: ["completed"],
      };

      const allowed = allowedTransitions[currentStatus] || [];
      if (!allowed.includes(status)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid transition from ${currentStatus} to ${status}. Allowed: ${allowed.join(", ")}`,
          },
          { status: 400 }
        );
      }
    }

    // Apply updates
    booking.status = status;
    if (reason) {
      booking.cancellationReason = reason;
    }
    if (status === "completed") {
      booking.completedAt = new Date();
    }
    await booking.save();

    // Trigger Notification to opposite party
    const recipientId = isCustomer ? booking.provider : booking.customer;
    const statusMessages: Record<string, string> = {
      accepted: `Your booking for "${(booking.service as any)?.title || "service"}" has been accepted!`,
      rejected: `Your booking for "${(booking.service as any)?.title || "service"}" was declined by the provider.`,
      in_progress: `Provider has started work on your booking for "${(booking.service as any)?.title || "service"}".`,
      completed: `Your booking for "${(booking.service as any)?.title || "service"}" is marked completed. You can now leave a review!`,
      cancelled: `The booking for "${(booking.service as any)?.title || "service"}" was cancelled.`,
    };

    await Notification.create({
      recipient: recipientId,
      title: `Booking Status: ${status.replace("_", " ").toUpperCase()}`,
      message: statusMessages[status] || `Booking status changed to ${status}`,
      type: "booking",
      relatedId: booking._id.toString(),
      link: isCustomer
        ? `/dashboard/provider/bookings/${booking._id}`
        : `/dashboard/customer/bookings/${booking._id}`,
    });

    return NextResponse.json({
      success: true,
      message: `Booking status updated to ${status}`,
      booking,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

