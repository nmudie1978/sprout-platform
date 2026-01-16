/**
 * Script to backfill coordinates for existing jobs
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/backfill-coordinates.ts
 */

// Load env files FIRST before any other imports
const fs = require("fs");
const path = require("path");

function loadEnvFile(filePath: string) {
  try {
    const fullPath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) return;
    const content = fs.readFileSync(fullPath, "utf-8");
    content.split("\n").forEach((line: string) => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match && !process.env[match[1].trim()]) {
        let value = match[2].trim();
        // Remove surrounding quotes
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        process.env[match[1].trim()] = value;
      }
    });
  } catch (e) {
    // Ignore errors
  }
}

// Load env files
loadEnvFile(".env");
loadEnvFile(".env.local");

// Now import Prisma after env is loaded
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

async function geocodeAddress(
  address: string,
  countryCode: string = "no"
): Promise<GeocodingResult | null> {
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&countrycodes=${countryCode}&limit=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "SproutApp/1.0 (youth-platform)",
      },
    });

    if (!response.ok) {
      console.error(`Geocoding failed for "${address}": ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      };
    }

    return null;
  } catch (error) {
    console.error(`Error geocoding "${address}":`, error);
    return null;
  }
}

async function main() {
  console.log("Starting coordinate backfill...\n");
  console.log("DATABASE_URL loaded:", process.env.DATABASE_URL ? "Yes" : "No");

  // Get jobs without coordinates
  const jobsWithoutCoords = await prisma.microJob.findMany({
    where: {
      OR: [{ latitude: null }, { longitude: null }],
      location: { not: "" },
    },
    select: {
      id: true,
      title: true,
      location: true,
    },
  });

  console.log(`Found ${jobsWithoutCoords.length} jobs without coordinates\n`);

  if (jobsWithoutCoords.length === 0) {
    console.log("All jobs already have coordinates!");
    return;
  }

  let updated = 0;
  let failed = 0;

  for (const job of jobsWithoutCoords) {
    console.log(`Processing: "${job.title}" at "${job.location}"`);

    const coords = await geocodeAddress(job.location);

    if (coords) {
      await prisma.microJob.update({
        where: { id: job.id },
        data: {
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
      });
      console.log(`  ✓ Updated: ${coords.latitude}, ${coords.longitude}`);
      updated++;
    } else {
      console.log(`  ✗ Could not geocode`);
      failed++;
    }

    // Wait 1.1 seconds between requests to respect Nominatim rate limits
    if (jobsWithoutCoords.indexOf(job) < jobsWithoutCoords.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1100));
    }
  }

  console.log(`\nBackfill complete!`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Failed: ${failed}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
