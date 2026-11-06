import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Location } from "@/models";

export async function GET() {
  try {
    await connectToDatabase();
    const locations = await Location.find({ isActive: true }).sort({ city: 1, name: 1 });
    return NextResponse.json({ success: true, locations });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

