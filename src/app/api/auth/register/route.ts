import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { User, ProviderProfile } from "@/models";
import { RegisterSchema } from "@/lib/validations";
import { hashPassword, signJwtToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = RegisterSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          success: false,
          error: validatedData.error.errors[0]?.message || "Invalid input data",
        },
        { status: 400 }
      );
    }

    const { name, email, password, phone, role } = validatedData.data;

    // Prevent direct admin registration
    if (role === ("admin" as any)) {
      return NextResponse.json(
        { success: false, error: "Admin registration is prohibited" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Check if email already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      isActive: true,
      isEmailVerified: true, // Auto-verified for FYP demonstration
    });

    // If role is provider, initialize default ProviderProfile
    if (role === "provider") {
      await ProviderProfile.create({
        user: newUser._id,
        professionalTitle: "Independent Specialist",
        bio: `Professional service provider in Gilgit-Baltistan. Registered on LocalConnect.`,
        skills: ["Customer Service", "Technical Execution"],
        serviceAreas: ["Gilgit City", "Jutial"],
        city: "Gilgit",
        area: "Gilgit City",
        location: {
          type: "Point",
          coordinates: [74.3142, 35.9208],
        },
        verificationStatus: "pending",
      });
    }

    const token = signJwtToken({
      id: newUser._id.toString(),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      phone: newUser.phone,
      profileImage: newUser.profileImage,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

