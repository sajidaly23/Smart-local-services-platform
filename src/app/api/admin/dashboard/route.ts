import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import {
  User,
  ProviderProfile,
  Service,
  Booking,
  Complaint,
  VerificationRequest,
} from "@/models";
import { getUserFromRequest } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    const { authorized, errorResponse } = requireRole(user, ["admin"]);
    if (!authorized) return errorResponse;

    await connectToDatabase();

    const [
      totalUsers,
      totalCustomers,
      totalProviders,
      verifiedProviders,
      pendingVerifications,
      totalServices,
      totalBookings,
      completedBookings,
      pendingComplaints,
      recentBookings,
      recentComplaints,
      recentVerifications,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ role: "provider" }),
      ProviderProfile.countDocuments({ verificationStatus: "verified" }),
      VerificationRequest.countDocuments({ status: "pending" }),
      Service.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: "completed" }),
      Complaint.countDocuments({ status: { $in: ["open", "under_review"] } }),
      Booking.find()
        .populate("customer", "name email")
        .populate("provider", "name email")
        .populate("service", "title price")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Complaint.find({ status: { $in: ["open", "under_review"] } })
        .populate("submittedBy", "name email")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      VerificationRequest.find({ status: "pending" })
        .populate("provider", "name email phone")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalCustomers,
        totalProviders,
        verifiedProviders,
        pendingVerifications,
        totalServices,
        totalBookings,
        completedBookings,
        pendingComplaints,
      },
      recentActivity: {
        bookings: recentBookings,
        complaints: recentComplaints,
        verifications: recentVerifications,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

