"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/avatar";
import { motion } from "framer-motion";
import {
  Star,
  CheckCircle2,
  Circle,
  XCircle,
  Sparkles,
  MapPin,
  Search,
  Filter,
  X,
  Calendar,
  User,
  Heart,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

const availabilityConfig = {
  AVAILABLE: {
    label: "Available",
    color: "bg-green-500",
    badgeClass: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    icon: CheckCircle2,
  },
  BUSY: {
    label: "Busy",
    color: "bg-yellow-500",
    badgeClass: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    icon: Circle,
  },
  NOT_LOOKING: {
    label: "Not Looking",
    color: "bg-gray-500",
    badgeClass: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
    icon: XCircle,
  },
};

const ageBracketLabels: Record<string, string> = {
  SIXTEEN_SEVENTEEN: "16-17 years",
  EIGHTEEN_TWENTY: "18-20 years",
};

// Common interests for quick filter
const commonInterests = [
  "Animals",
  "Technology",
  "Sports",
  "Music",
  "Art",
  "Cooking",
  "Gardening",
  "Photography",
  "Gaming",
  "Reading",
];

export default function TalentBrowsePage() {
  // Filter states
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [ageBracketFilter, setAgeBracketFilter] = useState<string>("");
  const [interestsFilter, setInterestsFilter] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(true);

  // Build query params
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (availabilityFilter) params.set("availabilityStatus", availabilityFilter);
    if (locationFilter) params.set("location", locationFilter);
    if (ageBracketFilter) params.set("ageBracket", ageBracketFilter);
    if (interestsFilter.length > 0) params.set("interests", interestsFilter.join(","));
    return params.toString();
  };

  const { data: talentData, isLoading, refetch } = useQuery({
    queryKey: ["talent", availabilityFilter, locationFilter, ageBracketFilter, interestsFilter],
    queryFn: async () => {
      const queryString = buildQueryParams();
      const response = await fetch(`/api/talent?${queryString}`);
      if (!response.ok) throw new Error("Failed to fetch talent");
      return response.json();
    },
    staleTime: 60 * 1000, // Cache for 1 minute
  });

  // Handle both old array format and new paginated format
  const talent = Array.isArray(talentData) ? talentData : (talentData?.talent || []);

  const toggleInterest = (interest: string) => {
    setInterestsFilter((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const clearAllFilters = () => {
    setAvailabilityFilter("");
    setLocationFilter("");
    setAgeBracketFilter("");
    setInterestsFilter([]);
  };

  const hasActiveFilters = availabilityFilter || locationFilter || ageBracketFilter || interestsFilter.length > 0;

  return (
    <div className="container mx-auto px-4 py-8 relative min-h-screen">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Browse <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Talent</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Find skilled youth workers for your jobs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant={showFilters ? "secondary" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-purple-500">
                {(availabilityFilter ? 1 : 0) + (locationFilter ? 1 : 0) + (ageBracketFilter ? 1 : 0) + (interestsFilter.length > 0 ? 1 : 0)}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="mb-6 border-2 shadow-lg">
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Availability Status */}
                <div>
                  <label className="mb-2 block text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Availability
                  </label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={availabilityFilter}
                    onChange={(e) => setAvailabilityFilter(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="AVAILABLE">Available</option>
                    <option value="BUSY">Busy</option>
                    <option value="NOT_LOOKING">Not Looking</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="mb-2 block text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    Location
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="e.g., Oslo, Bergen..."
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Age Bracket */}
                <div>
                  <label className="mb-2 block text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-500" />
                    Age Group
                  </label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={ageBracketFilter}
                    onChange={(e) => setAgeBracketFilter(e.target.value)}
                  >
                    <option value="">All Ages</option>
                    <option value="SIXTEEN_SEVENTEEN">16-17 years</option>
                    <option value="EIGHTEEN_TWENTY">18-20 years</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    disabled={!hasActiveFilters}
                    className="w-full"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              </div>

              {/* Interests Filter */}
              <div className="mt-4 pt-4 border-t">
                <label className="mb-3 block text-sm font-medium flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink-500" />
                  Filter by Interests
                </label>
                <div className="flex flex-wrap gap-2">
                  {commonInterests.map((interest) => (
                    <Button
                      key={interest}
                      variant={interestsFilter.includes(interest) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleInterest(interest)}
                      className={interestsFilter.includes(interest) ? "bg-gradient-to-r from-purple-600 to-pink-600" : ""}
                    >
                      {interest}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Results count */}
      {talent && (
        <p className="text-sm text-muted-foreground mb-4">
          Showing {talent.length} youth worker{talent.length !== 1 ? "s" : ""}
          {hasActiveFilters && " matching your filters"}
        </p>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-8 w-8 border-3 border-purple-500 border-t-transparent rounded-full"
          />
        </div>
      )}

      {/* Talent List */}
      {!isLoading && talent && talent.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {talent.map((profile: any, index: number) => {
            const availability = availabilityConfig[profile.availabilityStatus as keyof typeof availabilityConfig];
            const AvailIcon = availability.icon;
            const profileLink = profile.publicProfileSlug ? `/p/${profile.publicProfileSlug}` : null;

            return (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full hover:shadow-xl hover:shadow-purple-500/10 border-2 transition-all group overflow-hidden relative">
                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  {/* Availability indicator bar */}
                  <div className={`h-1 ${availability.color}`} />

                  <CardHeader className="relative pb-3">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="relative">
                        <Avatar
                          avatarId={profile.avatarId}
                          fallbackInitial={profile.displayName?.[0] || "?"}
                          size="lg"
                        />
                        {/* Availability indicator */}
                        <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-background ${availability.color}`} />
                      </div>

                      {/* Name and meta */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <CardTitle className="text-lg group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                              {profile.displayName}
                            </CardTitle>
                            {profile.user.location && (
                              <CardDescription className="flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3" />
                                {profile.user.location}
                              </CardDescription>
                            )}
                          </div>
                          {profileLink && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" asChild>
                              <Link href={profileLink}>
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center gap-3 mt-2 text-sm">
                          {profile.averageRating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                              <span className="font-semibold">{profile.averageRating.toFixed(1)}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Sparkles className="h-4 w-4" />
                            <span>{profile.completedJobsCount} jobs</span>
                          </div>
                          {profile.user.ageBracket && (
                            <Badge variant="outline" className="text-xs">
                              {ageBracketLabels[profile.user.ageBracket] || profile.user.ageBracket}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="relative pt-0 space-y-3">
                    {/* Availability badge */}
                    <Badge className={availability.badgeClass}>
                      <AvailIcon className="mr-1.5 h-3 w-3" />
                      {availability.label}
                    </Badge>

                    {/* Bio */}
                    {profile.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {profile.bio}
                      </p>
                    )}

                    {/* Skills */}
                    {profile.skillTags && profile.skillTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {profile.skillTags.slice(0, 4).map((skill: string) => (
                          <Badge key={skill} variant="secondary" className="text-xs px-2 py-0.5">
                            {skill}
                          </Badge>
                        ))}
                        {profile.skillTags.length > 4 && (
                          <Badge variant="secondary" className="text-xs px-2 py-0.5">
                            +{profile.skillTags.length - 4}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Interests */}
                    {profile.interests && profile.interests.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Interests</p>
                        <div className="flex flex-wrap gap-1.5">
                          {profile.interests.slice(0, 3).map((interest: string) => (
                            <Badge
                              key={interest}
                              variant="outline"
                              className={`text-xs ${interestsFilter.includes(interest) ? "border-purple-500 bg-purple-500/10" : ""}`}
                            >
                              {interest}
                            </Badge>
                          ))}
                          {profile.interests.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{profile.interests.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : !isLoading ? (
        <Card className="border-2 shadow-lg">
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <User className="h-8 w-8 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">No talent found</h3>
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters
                ? "No youth workers match your filters. Try adjusting your search criteria."
                : "No youth workers have made their profiles public yet."}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearAllFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear All Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
