import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { ProviderProfile, Service, Review } from "@/models";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    // ID can be providerProfile._id or user._id
    let profile = await ProviderProfile.findOne({
      $or: [{ _id: id }, { user: id }],
    })
      .populate("user", "name email phone profileImage createdAt")
      .populate("serviceCategories", "name slug icon")
      .lean();

    if (!profile) {
      return NextResponse.json({ success: false, error: "Provider not found" }, { status: 404 });
    }

    const providerUserId = (profile.user as any)?._id || profile.user;

    // Fetch services offered by provider
    const services = await Service.find({
      provider: providerUserId,
      isActive: true,
    })
      .populate("category", "name slug icon")
      .lean();

    // Fetch reviews
    const reviews = await Review.find({ provider: providerUserId })
      .populate("customer", "name profileImage")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      provider: profile,
      services,
      reviews,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

