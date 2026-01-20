import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { calculateDistance } from "@/lib/geocode";
import { CareerEvent, LocationMode } from "@prisma/client";

const MAX_DISTANCE_KM = 50;
const DATE_RANGE_DAYS = 120;
const MAX_EVENTS_PER_SECTION = 10;

interface EventWithDistance extends CareerEvent {
  distanceKm?: number;
}

// GET /api/career-events - Get events split into local and online/europe-wide
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Get user's location if authenticated
    let userLocation: {
      lat?: number | null;
      lng?: number | null;
      city?: string | null;
      region?: string | null;
      country?: string | null;
    } = {};

    if (session?.user?.id) {
      const profile = await prisma.youthProfile.findUnique({
        where: { userId: session.user.id },
        select: {
          lat: true,
          lng: true,
          city: true,
          region: true,
          country: true,
        },
      });
      if (profile) {
        userLocation = profile;
      }
    }

    // Calculate date range: NOW to NOW + 120 days
    const now = new Date();
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + DATE_RANGE_DAYS);

    // Query all active AND verified events within date range
    // Events must be verified by an admin/curator before display
    const events = await prisma.careerEvent.findMany({
      where: {
        isActive: true,
        isVerified: true, // Only show verified events
        startDate: {
          gte: now,
          lte: maxDate,
        },
      },
      orderBy: [
        { isYouthFocused: "desc" }, // Youth-focused first
        { startDate: "asc" },
      ],
    });

    // Split events into local and online/europe-wide
    const localEvents: EventWithDistance[] = [];
    const onlineEvents: EventWithDistance[] = [];

    for (const event of events) {
      // Online events always go to the second section
      if (event.locationMode === LocationMode.ONLINE) {
        onlineEvents.push(event);
        continue;
      }

      // For in-person or hybrid events, check if they're local
      let isLocal = false;
      let distanceKm: number | undefined;

      // 1. Try distance calculation if user has lat/lng and event has lat/lng
      if (
        userLocation.lat &&
        userLocation.lng &&
        event.lat &&
        event.lng
      ) {
        distanceKm = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          event.lat,
          event.lng
        );
        isLocal = distanceKm <= MAX_DISTANCE_KM;
      }
      // 2. Fallback to location string matching
      else if (userLocation.city || userLocation.region || userLocation.country) {
        // Match by city first
        if (
          userLocation.city &&
          event.city &&
          event.city.toLowerCase() === userLocation.city.toLowerCase()
        ) {
          isLocal = true;
        }
        // Then by region
        else if (
          userLocation.region &&
          event.region &&
          event.region.toLowerCase() === userLocation.region.toLowerCase()
        ) {
          isLocal = true;
        }
        // Finally by country (but only if event is not Europe-wide)
        else if (
          userLocation.country &&
          event.country &&
          event.country.toLowerCase() === userLocation.country.toLowerCase()
        ) {
          isLocal = true;
        }
      }

      if (isLocal) {
        localEvents.push({ ...event, distanceKm });
      } else {
        // Non-local in-person events go to online/europe-wide section
        onlineEvents.push(event);
      }
    }

    // Sort local events: youth-focused first, then by distance (if available), then by date
    localEvents.sort((a, b) => {
      // Youth-focused first
      if (a.isYouthFocused !== b.isYouthFocused) {
        return a.isYouthFocused ? -1 : 1;
      }
      // Then by distance if both have it
      if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
        return a.distanceKm - b.distanceKm;
      }
      // Then by date
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

    // Sort online events: youth-focused first, then by date
    onlineEvents.sort((a, b) => {
      if (a.isYouthFocused !== b.isYouthFocused) {
        return a.isYouthFocused ? -1 : 1;
      }
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

    // Limit each section to maximum 10 events
    return NextResponse.json({
      localEvents: localEvents.slice(0, MAX_EVENTS_PER_SECTION),
      onlineEvents: onlineEvents.slice(0, MAX_EVENTS_PER_SECTION),
      userHasLocation: !!(userLocation.lat || userLocation.city),
      locationInfo: {
        city: userLocation.city,
        region: userLocation.region,
        country: userLocation.country,
      },
    });
  } catch (error) {
    console.error("[Career Events API] Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch career events" },
      { status: 500 }
    );
  }
}
