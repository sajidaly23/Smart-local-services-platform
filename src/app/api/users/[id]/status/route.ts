import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models";
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
    const { isActive } = await req.json();

    if (isActive === undefined) {
      return NextResponse.json({ success: false, error: "isActive boolean is required" }, { status: 400 });
    }

    // Admin cannot deactivate themselves
    if (id === user!.id) {
      return NextResponse.json(
        { success: false, error: "You cannot change your own admin account status" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: { isActive } },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `User account has been ${isActive ? "reactivated" : "suspended"}`,
      user: updatedUser,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

