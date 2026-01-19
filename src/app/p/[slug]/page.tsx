import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatSkillName } from "@/lib/skills-mapping";
import { MapPin, Star, Award, Calendar, Shield, Trophy } from "lucide-react";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { ProfileReportButton } from "@/components/profile-report-button";
import { UserBadgesDisplay } from "@/components/user-badges-display";

async function getPublicProfile(slug: string) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/profile/${slug}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export default async function PublicProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const profile = await getPublicProfile(params.slug);

  if (!profile) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <Avatar
              avatarId={profile.avatarId}
              fallbackInitial={profile.displayName.charAt(0)}
              size="2xl"
              showBorder
              animated
            />
          </div>
          <h1 className="text-3xl font-bold">{profile.displayName}</h1>
          {profile.location && (
            <p className="mt-2 flex items-center justify-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {profile.location}
            </p>
          )}
        </div>

        {/* Stats Overview */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="mb-2 flex justify-center">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <div className="text-2xl font-bold">
                  {profile.completedJobsCount}
                </div>
                <div className="text-sm text-muted-foreground">
                  Jobs Completed
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="mb-2 flex justify-center">
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
                <div className="text-2xl font-bold">
                  {profile.averageRating
                    ? profile.averageRating.toFixed(1)
                    : "New"}
                </div>
                <div className="text-sm text-muted-foreground">
                  Average Rating
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="mb-2 flex justify-center">
                  <Shield className="h-8 w-8 text-green-500" />
                </div>
                <div className="text-2xl font-bold">
                  {profile.reliabilityScore}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Reliability
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            {profile.bio && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{profile.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {profile.topSkills && profile.topSkills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                  <CardDescription>
                    Developed through {profile.completedJobsCount} completed jobs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {profile.topSkills.map((skill: string) => {
                      const level = profile.skillLevels[skill] || 0;
                      return (
                        <div key={skill}>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="font-medium">
                              {formatSkillName(skill as any)}
                            </span>
                            <span className="text-muted-foreground">
                              {level}%
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${level}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Positive Feedback */}
            {profile.topTags && profile.topTags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>What Job Posters Say</CardTitle>
                  <CardDescription>
                    Based on {profile.reviews} reviews
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.topTags.map(
                      ({ tag, count }: { tag: string; count: number }) => (
                        <Badge key={tag} variant="secondary" className="text-sm">
                          {tag} ({count})
                        </Badge>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Achievement Badges */}
            {profile.badges && profile.badges.length > 0 && (
              <UserBadgesDisplay
                badges={profile.badges}
                variant="full"
              />
            )}

            {/* Availability */}
            {profile.availability && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="h-4 w-4" />
                    Availability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {profile.availability}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Interests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest: string) => (
                      <Badge key={interest} variant="outline">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Trust Badge */}
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base">Verified Youth</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  This profile is verified by Sprout. All reviews are
                  authenticated and privacy-protected.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              This is a public profile on{" "}
              <a href="/" className="text-primary hover:underline">
                Sprout
              </a>
            </p>
          </div>
          {profile.userId && (
            <ProfileReportButton
              userId={profile.userId}
              displayName={profile.displayName}
            />
          )}
        </div>
      </div>
    </div>
  );
}
