import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { ProviderProfile, User } from "@/models";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const city = searchParams.get("city");
    const categoryId = searchParams.get("category");
    const verification = searchParams.get("verification");
    const isAvailable = searchParams.get("isAvailable");

    const filter: any = {};
    if (city && city !== "all") {
      filter.city = { $regex: new RegExp(`^${city}$`, "i") };
    }
    if (categoryId && categoryId !== "all") {
      filter.serviceCategories = categoryId;
    }
    if (verification) {
      filter.verificationStatus = verification;
    }
    if (isAvailable === "true") {
      filter.isAvailable = true;
    }

    const profiles = await ProviderProfile.find(filter)
      .populate("user", "name email phone profileImage")
      .populate("serviceCategories", "name slug icon")
      .sort({ averageRating: -1, totalReviews: -1 })
      .lean();

    return NextResponse.json({ success: true, providers: profiles });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

