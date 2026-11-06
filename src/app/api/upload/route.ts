import { NextRequest, NextResponse } from "next/server";
import { uploadMedia } from "@/lib/cloudinary";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { image, folder = "uploads" } = await req.json();

    if (!image) {
      return NextResponse.json({ success: false, error: "Image data is required" }, { status: 400 });
    }

    // Check size (max 8MB payload)
    if (image.length > 8 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File exceeds 8MB size limit" },
        { status: 400 }
      );
    }

    const result = await uploadMedia(image, folder);

    return NextResponse.json({
      success: true,
      url: result.url,
      publicId: result.publicId,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

