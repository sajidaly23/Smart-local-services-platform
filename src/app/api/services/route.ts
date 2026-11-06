import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Service, ProviderProfile, Category } from "@/models";
import { getUserFromRequest } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { ServiceSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const query = searchParams.get("q") || "";
    const categorySlug = searchParams.get("category");
    const categoryId = searchParams.get("categoryId");
    const city = searchParams.get("city");
    const area = searchParams.get("area");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const verifiedOnly = searchParams.get("verifiedOnly") === "true";
    const sortBy = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const providerId = searchParams.get("providerId");

    // Geospatial search params
    const lat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : null;
    const lng = searchParams.get("lng") ? parseFloat(searchParams.get("lng")!) : null;
    const radiusKm = searchParams.get("radius") ? parseFloat(searchParams.get("radius")!) : 25; // default 25km

    const filter: any = { isActive: true };

    if (providerId) {
      filter.provider = providerId;
    }

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { serviceAreas: { $regex: query, $options: "i" } },
      ];
    }

    if (categoryId) {
      filter.category = categoryId;
    } else if (categorySlug && categorySlug !== "all") {
      const cat = await Category.findOne({ slug: categorySlug });
      if (cat) {
        filter.category = cat._id;
      }
    }

    if (city && city !== "all") {
      filter.city = { $regex: new RegExp(`^${city}$`, "i") };
    }

    if (area && area !== "all") {
      filter.$or = [
        { area: { $regex: area, $options: "i" } },
        { serviceAreas: { $regex: area, $options: "i" } },
      ];
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Geospatial proximity query if coordinates are supplied
    if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
      // In MongoDB, 1 radian = approx 6378.1 km
      const radiusInRadians = radiusKm / 6378.1;
      filter.location = {
        $geoWithin: {
          $centerSphere: [[lng, lat], radiusInRadians],
        },
      };
    }

    // Provider verification filter
    if (verifiedOnly) {
      const verifiedProfiles = await ProviderProfile.find({
        verificationStatus: "verified",
      }).select("user");
      const verifiedUserIds = verifiedProfiles.map((p) => p.user);
      filter.provider = { $in: verifiedUserIds };
    }

    // Sorting
    let sortOptions: any = { createdAt: -1 };
    if (sortBy === "price_asc") sortOptions = { price: 1 };
    if (sortBy === "price_desc") sortOptions = { price: -1 };
    if (sortBy === "popular") sortOptions = { viewsCount: -1, bookingsCount: -1 };

    const skip = (page - 1) * limit;

    const [services, total] = await Promise.all([
      Service.find(filter)
        .populate("category", "name slug icon")
        .populate("provider", "name email phone profileImage")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Service.countDocuments(filter),
    ]);

    // Attach provider verification and rating
    const providerIds = services.map((s: any) => s.provider?._id).filter(Boolean);
    const providerProfiles = await ProviderProfile.find({
      user: { $in: providerIds },
    })
      .select("user verificationStatus averageRating totalReviews")
      .lean();

    const profileMap = new Map();
    providerProfiles.forEach((p: any) => {
      profileMap.set(p.user.toString(), p);
    });

    const enrichedServices = services.map((s: any) => {
      const pId = s.provider?._id?.toString();
      const profile = pId ? profileMap.get(pId) : null;
      return {
        ...s,
        providerProfile: profile || {
          verificationStatus: "pending",
          averageRating: 0,
          totalReviews: 0,
        },
      };
    });

    return NextResponse.json({
      success: true,
      services: enrichedServices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Fetch Services Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    const { authorized, errorResponse } = requireRole(user, ["provider", "admin"]);
    if (!authorized) return errorResponse;

    await connectToDatabase();
    const body = await req.json();

    const validated = ServiceSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.errors[0]?.message },
        { status: 400 }
      );
    }

    const {
      title,
      category,
      description,
      price,
      priceType,
      serviceAreas,
      images,
      location,
      isActive,
    } = validated.data;

    // Check provider verification status
    let isPublicActive = isActive;
    if (user!.role === "provider") {
      const providerProfile = await ProviderProfile.findOne({ user: user!.id });
      // If provider is not verified yet, default service to private or draft
      if (providerProfile?.verificationStatus !== "verified") {
        isPublicActive = false; // Only verified providers can publish publicly
      }
    }

    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;

    const newService = await Service.create({
      provider: user!.id,
      category,
      title,
      slug,
      description,
      price,
      priceType,
      serviceAreas,
      images: images && images.length > 0 ? images : ["https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80"],
      city: location?.city || "Gilgit",
      area: location?.area || "Gilgit City",
      location: {
        type: "Point",
        coordinates: location?.coordinates || [74.3142, 35.9208],
      },
      isActive: isPublicActive,
    });

    return NextResponse.json(
      {
        success: true,
        message: isPublicActive
          ? "Service published successfully"
          : "Service saved as private draft pending provider verification approval",
        service: newService,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create Service Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

