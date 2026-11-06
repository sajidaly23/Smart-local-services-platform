import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Complaint, Notification, User } from "@/models";
import { getUserFromRequest } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { ComplaintSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const filter: any = {};
    if (user.role === "customer") {
      filter.submittedBy = user.id;
    }
    // Admin sees all

    const complaints = await Complaint.find(filter)
      .populate("submittedBy", "name email phone")
      .populate("relatedProvider", "name email phone")
      .populate("relatedBooking", "bookingReference status")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, complaints });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    const { authorized, errorResponse } = requireRole(user, ["customer", "provider", "admin"]);
    if (!authorized) return errorResponse;

    const body = await req.json();
    const validated = ComplaintSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.errors[0]?.message },
        { status: 400 }
      );
    }

    const { bookingId, providerId, category, description, attachments } = validated.data;
    await connectToDatabase();

    const complaint = await Complaint.create({
      submittedBy: user!.id,
      relatedBooking: bookingId || undefined,
      relatedProvider: providerId || undefined,
      category,
      description,
      attachments: attachments || [],
      status: "open",
    });

    // Notify administrators
    const admins = await User.find({ role: "admin" }).select("_id");
    for (const admin of admins) {
      await Notification.create({
        recipient: admin._id,
        title: "New Platform Complaint Logged",
        message: `${user!.name} submitted a complaint under "${category}".`,
        type: "complaint",
        relatedId: complaint._id.toString(),
        link: "/dashboard/admin/complaints",
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Your complaint has been lodged and assigned to an administrator for review.",
        complaint,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

