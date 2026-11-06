import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Complaint, Notification } from "@/models";
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

    const { id } = await params;
    const { status, adminResponse } = await req.json();

    await connectToDatabase();
    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return NextResponse.json({ success: false, error: "Complaint not found" }, { status: 404 });
    }

    if (status) complaint.status = status;
    if (adminResponse) complaint.adminResponse = adminResponse;
    if (status === "resolved") complaint.resolvedAt = new Date();

    await complaint.save();

    // Notify the submitter
    await Notification.create({
      recipient: complaint.submittedBy,
      title: `Complaint Status Updated: ${status.toUpperCase()}`,
      message: `Admin has reviewed your complaint: ${adminResponse || "Status changed to " + status}`,
      type: "complaint",
      relatedId: complaint._id.toString(),
      link: "/dashboard/customer/complaints",
    });

    return NextResponse.json({
      success: true,
      message: "Complaint updated successfully",
      complaint,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

