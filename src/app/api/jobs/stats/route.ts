import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { JobCategory } from "@prisma/client";

export async function GET() {
  try {
    // Get count of posted jobs per category
    const jobCounts = await prisma.microJob.groupBy({
      by: ["category"],
      where: {
        status: "POSTED",
      },
      _count: {
        id: true,
      },
    });

    // Create a map with all categories, defaulting to 0
    const allCategories: JobCategory[] = [
      "BABYSITTING",
      "DOG_WALKING",
      "SNOW_CLEARING",
      "CLEANING",
      "DIY_HELP",
      "TECH_HELP",
      "ERRANDS",
      "OTHER",
    ];

    const stats = allCategories.map((category) => {
      const found = jobCounts.find((j) => j.category === category);
      return {
        category,
        count: found?._count.id || 0,
      };
    });

    // Calculate total for percentage
    const total = stats.reduce((sum, s) => sum + s.count, 0);

    return NextResponse.json({
      stats,
      total,
    });
  } catch (error) {
    console.error("Failed to fetch job stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch job stats" },
      { status: 500 }
    );
  }
}
