import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Service, ProviderProfile } from "@/models";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const service = await Service.findById(id)
      .populate("category", "name slug icon description")
      .populate("provider", "name email phone profileImage")
      .lean();

    if (!service) {
      return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
    }

    // Increment views counter asynchronously
    Service.findByIdAndUpdate(id, { $inc: { viewsCount: 1 } }).exec();

    // Fetch provider profile & ratings
    const providerProfile = await ProviderProfile.findOne({
      user: (service as any).provider?._id,
    }).lean();

    // Related services in the same category
    const relatedServices = await Service.find({
      category: (service as any).category?._id,
      _id: { $ne: service._id },
      isActive: true,
    })
      .limit(3)
      .populate("provider", "name profileImage")
      .lean();

    return NextResponse.json({
      success: true,
      service: {
        ...service,
        providerProfile: providerProfile || {
          professionalTitle: "Specialist",
          verificationStatus: "pending",
          averageRating: 0,
          totalReviews: 0,
          experienceYears: 1,
        },
      },
      relatedServices,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const service = await Service.findById(id);
    if (!service) {
      return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
    }

    // Only owner provider or admin can edit
    if (service.provider.toString() !== user.id && user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "You can only edit your own services" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updated = await Service.findByIdAndUpdate(id, { $set: body }, { new: true });

    return NextResponse.json({ success: true, service: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const service = await Service.findById(id);
    if (!service) {
      return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
    }

    if (service.provider.toString() !== user.id && user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "You can only delete your own services" },
        { status: 403 }
      );
    }

    await Service.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Service deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

