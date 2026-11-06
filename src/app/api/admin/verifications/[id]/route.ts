import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { VerificationRequest, ProviderProfile, Service, Notification } from "@/models";
import { getUserFromRequest } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req);
    const { authorized, errorResponse } = requireRole(user, ["admin"]);
    if (!authorized) return errorResponse;

    const { id } = await params;
    const { status, adminNotes } = await req.json();

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Status must be either 'approved' or 'rejected'" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const verification = await VerificationRequest.findById(id);

    if (!verification) {
      return NextResponse.json(
        { success: false, error: "Verification request not found" },
        { status: 404 }
      );
    }

    verification.status = status;
    if (adminNotes) verification.adminNotes = adminNotes;
    verification.reviewedBy = user!.id as any;
    verification.reviewedAt = new Date();
    await verification.save();

    const providerId = verification.provider;
    const isApproved = status === "approved";

    // Update ProviderProfile status
    await ProviderProfile.findOneAndUpdate(
      { user: providerId },
      {
        $set: {
          verificationStatus: isApproved ? "verified" : "rejected",
        },
      }
    );

    // If approved, automatically activate the provider's draft services so they appear publicly
    if (isApproved) {
      await Service.updateMany(
        { provider: providerId },
        { $set: { isActive: true } }
      );
    }

    // Notify provider
    await Notification.create({
      recipient: providerId,
      title: isApproved ? "Verification Approved!" : "Verification Request Declined",
      message: isApproved
        ? "Congratulations! Your provider profile has been verified. You now have a verified badge and your services are live."
        : `Your verification request was declined. Admin notes: ${adminNotes || "Please review your documents and resubmit."}`,
      type: "verification",
      relatedId: verification._id.toString(),
      link: "/dashboard/provider/verification",
    });

    return NextResponse.json({
      success: true,
      message: `Provider verification request ${status}`,
      verification,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

