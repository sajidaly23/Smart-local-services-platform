import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Review, Booking, ProviderProfile, Notification } from "@/models";
import { getUserFromRequest } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { ReviewSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    const { authorized, errorResponse } = requireRole(user, ["customer"]);
    if (!authorized) return errorResponse;

    const body = await req.json();
    const validated = ReviewSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.errors[0]?.message },
        { status: 400 }
      );
    }

    const { bookingId, rating, comment } = validated.data;
    await connectToDatabase();

    // Verify booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    // Must be customer's booking
    if (booking.customer.toString() !== user!.id) {
      return NextResponse.json(
        { success: false, error: "You can only review your own bookings" },
        { status: 403 }
      );
    }

    // Must be completed
    if (booking.status !== "completed") {
      return NextResponse.json(
        {
          success: false,
          error: "Reviews can only be submitted for completed bookings",
        },
        { status: 400 }
      );
    }

    // Check if already reviewed
    const existing = await Review.findOne({ booking: booking._id });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "You have already submitted a review for this booking" },
        { status: 409 }
      );
    }

    const newReview = await Review.create({
      customer: user!.id,
      provider: booking.provider,
      booking: booking._id,
      rating,
      comment,
    });

    // Mark booking as reviewed
    booking.hasReview = true;
    await booking.save();

    // Recalculate Provider average rating and total reviews
    const allProviderReviews = await Review.find({ provider: booking.provider });
    const totalReviews = allProviderReviews.length;
    const avgRating =
      allProviderReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    await ProviderProfile.findOneAndUpdate(
      { user: booking.provider },
      {
        $set: {
          averageRating: Math.round(avgRating * 10) / 10,
          totalReviews: totalReviews,
        },
      }
    );

    // Notify provider
    await Notification.create({
      recipient: booking.provider,
      title: "New Review Received",
      message: `${user!.name} rated your service ${rating}/5 stars: "${comment.substring(0, 50)}..."`,
      type: "review",
      relatedId: newReview._id.toString(),
      link: `/dashboard/provider/reviews`,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Thank you! Your review has been published.",
        review: newReview,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create Review Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

