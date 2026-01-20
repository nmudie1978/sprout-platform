import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { geocodeAddress } from "@/lib/geocode";

// PATCH /api/profile/location - Update user's location
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { city, region, country } = body;

    if (!city || typeof city !== "string") {
      return NextResponse.json(
        { error: "City is required" },
        { status: 400 }
      );
    }

    // Try to geocode the location for lat/lng
    let lat: number | null = null;
    let lng: number | null = null;

    try {
      // Build address string for geocoding
      const addressParts = [city, region, country].filter(Boolean);
      const addressString = addressParts.join(", ");

      const geocodeResult = await geocodeAddress(addressString, "no");
      if (geocodeResult) {
        lat = geocodeResult.latitude;
        lng = geocodeResult.longitude;
      }
    } catch (geocodeError) {
      // Geocoding is optional - continue without coordinates
      console.warn("Geocoding failed:", geocodeError);
    }

    // Update the youth profile
    const profile = await prisma.youthProfile.update({
      where: { userId: session.user.id },
      data: {
        city: city.trim(),
        region: region?.trim() || null,
        country: country?.trim() || "Norway",
        lat,
        lng,
      },
      select: {
        city: true,
        region: true,
        country: true,
        lat: true,
        lng: true,
      },
    });

    return NextResponse.json({
      success: true,
      location: profile,
    });
  } catch (error) {
    console.error("[Profile Location API] Error updating location:", error);
    return NextResponse.json(
      { error: "Failed to update location" },
      { status: 500 }
    );
  }
}

// GET /api/profile/location - Get user's current location
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        city: true,
        region: true,
        country: true,
        lat: true,
        lng: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      location: profile,
    });
  } catch (error) {
    console.error("[Profile Location API] Error fetching location:", error);
    return NextResponse.json(
      { error: "Failed to fetch location" },
      { status: 500 }
    );
  }
}
