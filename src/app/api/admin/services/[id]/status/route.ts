import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import { Service, Notification } from "@/models";
import { getUserFromRequest } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req);
    const { authorized, errorResponse } = requireRole(user, ["admin"]);
    if (!authorized) return errorResponse;

    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const { status, reason } = body;

    if (!status || !["approved", "rejected", "suspended"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status. Must be approved, rejected, or suspended." },
        { status: 400 }
      );
    }

    if ((status === "rejected" || status === "suspended") && !reason) {
      return NextResponse.json(
        { success: false, error: "A reason is required when rejecting or suspending a service." },
        { status: 400 }
      );
    }

    const service = await Service.findById(id);
    if (!service) {
      return NextResponse.json(
        { success: false, error: "Service not found" },
        { status: 404 }
      );
    }

    // Update service moderation fields
    service.status = status;
    service.reviewedBy = new mongoose.Types.ObjectId(user!.id) as any;

    if (status === "approved") {
      service.approvedAt = new Date();
      service.rejectionReason = null;
      service.isActive = true;
    } else if (status === "rejected") {
      service.rejectionReason = reason || null;
      service.approvedAt = null;
      service.isActive = false;
    } else if (status === "suspended") {
      service.rejectionReason = reason || null;
      service.isActive = false;
    }

    await service.save();

    // Send notification to the service provider
    const notificationMessages: Record<string, { title: string; message: string }> = {
      approved: {
        title: "Service Approved ✅",
        message: `Your service "${service.title}" has been approved by the admin and is now live on the marketplace.`,
      },
      rejected: {
        title: "Service Rejected ❌",
        message: `Your service "${service.title}" was not approved. Reason: ${reason || "Does not meet platform guidelines."}`,
      },
      suspended: {
        title: "Service Suspended ⚠️",
        message: `Your service "${service.title}" has been suspended. Reason: ${reason || "Under review by platform administrators."}`,
      },
    };

    const notif = notificationMessages[status];
    await Notification.create({
      recipient: service.provider,
      title: notif.title,
      message: notif.message,
      type: "system",
      link: "/dashboard/provider/services",
      relatedId: service._id.toString(),
    });

    return NextResponse.json({
      success: true,
      message: `Service ${status} successfully`,
      service,
    });
  } catch (error: any) {
    console.error("Admin Update Service Status Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

