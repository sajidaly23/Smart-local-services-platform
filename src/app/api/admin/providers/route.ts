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
    const verificationStatus = searchParams.get("verificationStatus");
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // Get all provider users
    const userFilter: any = { role: "provider" };
    if (search) {
      userFilter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const providerUsers = await User.find(userFilter)
      .select("name email phone profileImage isActive createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const providerIds = providerUsers.map((u: any) => u._id);

    // Get their profiles
    const profileFilter: any = { user: { $in: providerIds } };
    if (verificationStatus && verificationStatus !== "all") {
      profileFilter.verificationStatus = verificationStatus;
    }

    const profiles = await ProviderProfile.find(profileFilter)
      .select("user professionalTitle verificationStatus averageRating totalReviews city area serviceAreas experienceYears")
      .lean();

    const profileMap = new Map();
    profiles.forEach((p: any) => profileMap.set(p.user.toString(), p));

    // Merge
    let providers = providerUsers
      .map((u: any) => ({
        ...u,
        profile: profileMap.get(u._id.toString()) || null,
      }))
      .filter((p: any) => {
        if (!verificationStatus || verificationStatus === "all") return true;
        return p.profile?.verificationStatus === verificationStatus;
      });

    const total = providers.length;
    providers = providers.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      success: true,
      providers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
