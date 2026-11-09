import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Service, ProviderProfile } from "@/models";
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
    const query = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const filter: any = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { city: { $regex: query, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [services, total, statusCounts] = await Promise.all([
      Service.find(filter)
        .populate("category", "name slug icon")
        .populate("provider", "name email phone profileImage")
        .populate("reviewedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Service.countDocuments(filter),
      Service.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Build status counts map
    const counts: Record<string, number> = {
      pending: 0,
      approved: 0,
      rejected: 0,
      suspended: 0,
    };
    statusCounts.forEach((sc: any) => {
      if (sc._id) counts[sc._id] = sc.count;
    });
    counts.all = Object.values(counts).reduce((a, b) => a + b, 0);

    // Attach provider verification info
    const providerIds = services.map((s: any) => s.provider?._id).filter(Boolean);
    const providerProfiles = await ProviderProfile.find({
      user: { $in: providerIds },
    })
      .select("user verificationStatus averageRating totalReviews")
      .lean();

    const profileMap = new Map();
    providerProfiles.forEach((p: any) => {
      profileMap.set(p.user.toString(), p);
    });

    const enrichedServices = services.map((s: any) => {
      const pId = s.provider?._id?.toString();
      const profile = pId ? profileMap.get(pId) : null;
      return {
        ...s,
        providerProfile: profile || {
          verificationStatus: "pending",
          averageRating: 0,
          totalReviews: 0,
        },
      };
    });

    return NextResponse.json({
      success: true,
      services: enrichedServices,
      counts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Admin Fetch Services Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

