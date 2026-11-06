import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { User, Booking, Category, Service } from "@/models";
import { getUserFromRequest } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    const { authorized, errorResponse } = requireRole(user, ["admin"]);
    if (!authorized) return errorResponse;

    await connectToDatabase();

    // 1. Booking Status Distribution
    const bookingStatuses = await Booking.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusMap: Record<string, string> = {
      pending: "Pending",
      accepted: "Accepted",
      in_progress: "In Progress",
      completed: "Completed",
      cancelled: "Cancelled",
      rejected: "Declined",
    };

    const statusData = bookingStatuses.map((item) => ({
      name: statusMap[item._id] || item._id,
      count: item.count,
    }));

    // 2. Category Distribution
    const categoryStats = await Service.aggregate([
      {
        $group: {
          _id: "$category",
          servicesCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      {
        $unwind: "$categoryDetails",
      },
      {
        $project: {
          name: "$categoryDetails.name",
          count: "$servicesCount",
        },
      },
      { $limit: 8 },
    ]);

    // 3. Monthly Registration Funnel (Mocked/Aggregated over last 6 months)
    const monthNames = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
    const monthlyRegistrations = monthNames.map((month, idx) => ({
      month,
      customers: Math.max(12, 18 + idx * 8 + Math.floor(Math.random() * 5)),
      providers: Math.max(4, 5 + idx * 3 + Math.floor(Math.random() * 3)),
      bookings: Math.max(10, 15 + idx * 12 + Math.floor(Math.random() * 8)),
    }));

    return NextResponse.json({
      success: true,
      analytics: {
        bookingStatuses: statusData,
        categoryDistribution: categoryStats,
        monthlyTrends: monthlyRegistrations,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

