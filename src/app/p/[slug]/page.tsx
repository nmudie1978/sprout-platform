import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { ProfileReportButton } from "@/components/profile-report-button";

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

export default async function PublicProfilePage(
  props: {
    params: Promise<{ slug: string }>;
  }
) {
  const params = await props.params;
  const profile = await getPublicProfile(params.slug);

  if (!profile) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-2xl px-4 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <Avatar
              name={profile.displayName}
              size="2xl"
              showBorder
            />
          </div>
          <h1 className="text-3xl font-bold">{profile.displayName}</h1>
        </div>

        <div className="space-y-6">
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

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Interests</CardTitle>
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
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-green-500" />
                Verified Youth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                This profile is verified by Endeavrly and privacy-protected.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              This is a public profile on{" "}
              <Link href="/" className="text-primary hover:underline">
                Endeavrly
              </Link>
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
