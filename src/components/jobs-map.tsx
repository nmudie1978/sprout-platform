"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "@/lib/geocode";
import Link from "next/link";
import { MapPin, Clock, Banknote, X, ExternalLink } from "lucide-react";

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

interface Job {
  id: string;
  title: string;
  category: string;
  description: string;
  payType: string;
  payAmount: number;
  location: string;
  latitude: number | null;
  longitude: number | null;
  startDate: string | null;
  duration: number | null;
  postedBy: {
    id: string;
    employerProfile: {
      companyName: string;
      companyLogo: string | null;
      verified: boolean;
    } | null;
  };
}

interface JobsMapProps {
  jobs: Job[];
  onJobSelect?: (job: Job) => void;
  selectedJobId?: string | null;
  height?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  BABYSITTING: "#ec4899",
  DOG_WALKING: "#f97316",
  SNOW_CLEARING: "#3b82f6",
  CLEANING: "#22c55e",
  DIY_HELP: "#a855f7",
  TECH_HELP: "#06b6d4",
  ERRANDS: "#eab308",
  OTHER: "#6b7280",
};

const CATEGORY_EMOJI: Record<string, string> = {
  BABYSITTING: "👶",
  DOG_WALKING: "🐕",
  SNOW_CLEARING: "❄️",
  CLEANING: "🧹",
  DIY_HELP: "🔧",
  TECH_HELP: "💻",
  ERRANDS: "📦",
  OTHER: "📋",
};

export function JobsMap({
  jobs,
  onJobSelect,
  selectedJobId,
  height = "500px",
}: JobsMapProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [customIcon, setCustomIcon] = useState<any>(null);

  useEffect(() => {
    setMounted(true);

    // Import Leaflet icon on client side only
    import("leaflet").then((L) => {
      // Fix for default marker icon
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Create custom icon function
      const createIcon = (color: string) =>
        new L.DivIcon({
          className: "custom-marker",
          html: `<div style="
            background-color: ${color};
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        });

      setCustomIcon(() => createIcon);
    });
  }, []);

  // Filter jobs that have coordinates
  const mappableJobs = jobs.filter(
    (job) => job.latitude !== null && job.longitude !== null
  );

  // Calculate map center from jobs or use default
  const mapCenter =
    mappableJobs.length > 0
      ? {
          lat:
            mappableJobs.reduce((sum, job) => sum + (job.latitude || 0), 0) /
            mappableJobs.length,
          lng:
            mappableJobs.reduce((sum, job) => sum + (job.longitude || 0), 0) /
            mappableJobs.length,
        }
      : DEFAULT_MAP_CENTER;

  const handleMarkerClick = (job: Job) => {
    setSelectedJob(job);
    onJobSelect?.(job);
  };

  if (!mounted) {
    return (
      <div
        className="bg-muted rounded-lg flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center text-muted-foreground">
          <MapPin className="h-8 w-8 mx-auto mb-2 animate-pulse" />
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Import Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />

      <div className="rounded-lg overflow-hidden border" style={{ height }}>
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={DEFAULT_MAP_ZOOM}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {mappableJobs.map((job) => (
            <Marker
              key={job.id}
              position={[job.latitude!, job.longitude!]}
              icon={customIcon?.(CATEGORY_COLORS[job.category] || "#6b7280")}
              eventHandlers={{
                click: () => handleMarkerClick(job),
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">
                      {CATEGORY_EMOJI[job.category] || "📋"}
                    </span>
                    <span className="font-semibold text-sm">{job.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {job.postedBy?.employerProfile?.companyName || "Employer"}
                  </p>
                  <div className="flex items-center gap-2 text-xs mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {formatCurrency(job.payAmount)}
                      {job.payType === "HOURLY" && "/hr"}
                    </Badge>
                  </div>
                  <Link href={`/jobs/${job.id}`}>
                    <Button size="sm" className="w-full h-7 text-xs">
                      View Job
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Stats overlay */}
      <div className="absolute top-3 left-3 z-[1000]">
        <Card className="bg-background/95 backdrop-blur">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="font-medium">{mappableJobs.length}</span>
              <span className="text-muted-foreground">
                jobs on map
              </span>
            </div>
            {jobs.length > mappableJobs.length && (
              <p className="text-xs text-muted-foreground mt-1">
                {jobs.length - mappableJobs.length} jobs without location
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category legend */}
      <div className="absolute bottom-3 left-3 z-[1000]">
        <Card className="bg-background/95 backdrop-blur">
          <CardContent className="p-2">
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
              {Object.entries(CATEGORY_EMOJI).slice(0, 6).map(([cat, emoji]) => (
                <div key={cat} className="flex items-center gap-1">
                  <span>{emoji}</span>
                  <span className="capitalize text-muted-foreground">
                    {cat.toLowerCase().replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected job detail card */}
      {selectedJob && (
        <div className="absolute top-3 right-3 z-[1000] w-72">
          <Card className="bg-background/95 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">
                    {CATEGORY_EMOJI[selectedJob.category] || "📋"}
                  </span>
                  <div>
                    <h3 className="font-semibold text-sm">{selectedJob.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedJob.postedBy?.employerProfile?.companyName ||
                        "Employer"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setSelectedJob(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {selectedJob.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="secondary" className="text-xs">
                  <Banknote className="h-3 w-3 mr-1" />
                  {formatCurrency(selectedJob.payAmount)}
                  {selectedJob.payType === "HOURLY" && "/hr"}
                </Badge>
                {selectedJob.duration && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {selectedJob.duration} min
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                <MapPin className="h-3 w-3" />
                {selectedJob.location}
              </div>

              <Link href={`/jobs/${selectedJob.id}`}>
                <Button size="sm" className="w-full">
                  View Full Details
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
