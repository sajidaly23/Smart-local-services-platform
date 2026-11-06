import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { VerificationRequest, ProviderProfile, Notification, User } from "@/models";
import { getUserFromRequest } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { VerificationSubmissionSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    const { authorized, errorResponse } = requireRole(user, ["provider", "admin"]);
    if (!authorized) return errorResponse;

    await connectToDatabase();

    const filter: any = {};
    if (user!.role === "provider") {
      filter.provider = user!.id;
    }

    const requests = await VerificationRequest.find(filter)
      .populate("provider", "name email phone")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, verifications: requests });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    const { authorized, errorResponse } = requireRole(user, ["provider"]);
    if (!authorized) return errorResponse;

    const body = await req.json();
    const validated = VerificationSubmissionSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.errors[0]?.message },
        { status: 400 }
      );
    }

    const { documentType, documentUrls, notes } = validated.data;
    await connectToDatabase();

    // Check if there is already a pending verification request
    const existingPending = await VerificationRequest.findOne({
      provider: user!.id,
      status: "pending",
    });

    if (existingPending) {
      return NextResponse.json(
        {
          success: false,
          error: "You already have a pending verification request under admin review",
        },
        { status: 400 }
      );
    }

    const verification = await VerificationRequest.create({
      provider: user!.id,
      documentType,
      documentUrls,
      adminNotes: notes || "",
      status: "pending",
    });

    // Update ProviderProfile status to pending and save document URLs
    await ProviderProfile.findOneAndUpdate(
      { user: user!.id },
      {
        $set: {
          verificationStatus: "pending",
          verificationDocuments: documentUrls,
        },
      }
    );

    // Notify administrators
    const admins = await User.find({ role: "admin" }).select("_id");
    for (const admin of admins) {
      await Notification.create({
        recipient: admin._id,
        title: "New Provider Verification Request",
        message: `${user!.name} has submitted documents for provider identity verification.`,
        type: "verification",
        relatedId: verification._id.toString(),
        link: "/dashboard/admin/verifications",
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Verification documents submitted successfully. Admin will review your credentials.",
        verification,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

