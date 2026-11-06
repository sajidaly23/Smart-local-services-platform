import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { User, ProviderProfile } from "@/models";
import { getUserFromRequest } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    const { authorized, errorResponse } = requireRole(user, ["admin"]);
    if (!authorized) return errorResponse;

    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const role = searchParams.get("role");
    const search = searchParams.get("search");

    const filter: any = {};
    if (role && role !== "all") {
      filter.role = role;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    // If searching providers, attach verification status
    const providerUserIds = users.filter((u: any) => u.role === "provider").map((u: any) => u._id);
    const profiles = await ProviderProfile.find({ user: { $in: providerUserIds } })
      .select("user verificationStatus averageRating totalReviews")
      .lean();

    const profileMap = new Map();
    profiles.forEach((p: any) => profileMap.set(p.user.toString(), p));

    const enrichedUsers = users.map((u: any) => ({
      ...u,
      providerProfile: profileMap.get(u._id.toString()) || null,
    }));

    return NextResponse.json({ success: true, users: enrichedUsers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

