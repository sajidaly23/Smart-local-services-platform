import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { ProviderProfile, User } from "@/models";
import { getUserFromRequest } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    const { authorized, errorResponse } = requireRole(user, ["provider", "admin"]);
    if (!authorized) return errorResponse;

    await connectToDatabase();
    let profile = await ProviderProfile.findOne({ user: user!.id })
      .populate("user", "name email phone profileImage role")
      .populate("serviceCategories", "name slug icon");

    if (!profile) {
      // Auto-create default profile for newly registered providers
      profile = await ProviderProfile.create({
        user: user!.id,
        professionalTitle: "Local Service Specialist",
        bio: "",
        skills: [],
        experienceYears: 1,
        serviceAreas: ["Gilgit City"],
        city: "Gilgit",
        area: "Gilgit City",
        verificationStatus: "pending",
        isAvailable: true,
      });
      profile = await ProviderProfile.findById(profile._id)
        .populate("user", "name email phone profileImage role")
        .populate("serviceCategories", "name slug icon");
    }

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    const { authorized, errorResponse } = requireRole(user, ["provider"]);
    if (!authorized) return errorResponse;

    const body = await req.json();
    await connectToDatabase();

    // If updating name, phone or profileImage, update User document
    if (body.name !== undefined || body.phone !== undefined || body.profileImage !== undefined) {
      const userUpdates: any = {};
      if (body.name) userUpdates.name = String(body.name).trim();
      if (body.phone !== undefined) userUpdates.phone = String(body.phone).trim();
      if (body.profileImage) userUpdates.profileImage = body.profileImage;
      if (Object.keys(userUpdates).length > 0) {
        await User.findByIdAndUpdate(user!.id, { $set: userUpdates });
      }
    }

    // Filter profile updates
    const allowedFields = [
      "professionalTitle",
      "bio",
      "skills",
      "experienceYears",
      "serviceCategories",
      "serviceAreas",
      "city",
      "area",
      "location",
      "isAvailable",
    ];

    const updates: any = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    const updatedProfile = await ProviderProfile.findOneAndUpdate(
      { user: user!.id },
      { $set: updates },
      { new: true, upsert: true }
    )
      .populate("user", "name email phone profileImage role")
      .populate("serviceCategories", "name slug icon");

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

