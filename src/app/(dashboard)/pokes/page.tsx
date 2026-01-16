"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { HandHeart, Briefcase, CheckCircle2, XCircle, Eye, Star, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";

const categoryLabels: Record<string, string> = {
  BABYSITTING: "Babysitting",
  DOG_WALKING: "Dog Walking",
  SNOW_CLEARING: "Snow Clearing",
  CLEANING: "Cleaning",
  DIY_HELP: "DIY Help",
  TECH_HELP: "Tech Help",
  ERRANDS: "Errands",
  OTHER: "Other",
};

const formatDateRange = (startDate: string | null, endDate: string | null, dateTime: string | null) => {
  const start = startDate || dateTime;
  if (!start && !endDate) return null;

  const startFormatted = start ? formatDate(start) : null;
  const endFormatted = endDate ? formatDate(endDate) : null;

  if (startFormatted && endFormatted) {
    return `${startFormatted} - ${endFormatted}`;
  }
  return startFormatted ? `From ${startFormatted}` : `Until ${endFormatted}`;
};

export default function PokesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const isYouth = session?.user?.role === "YOUTH";

  const { data: pokes, isLoading } = useQuery({
    queryKey: ["pokes"],
    queryFn: async () => {
      const response = await fetch("/api/pokes");
      if (!response.ok) throw new Error("Failed to fetch pokes");
      return response.json();
    },
  });

  const updatePokeMutation = useMutation({
    mutationFn: async ({
      pokeId,
      status,
    }: {
      pokeId: string;
      status: "READ" | "ACCEPTED" | "DECLINED";
    }) => {
      const response = await fetch("/api/pokes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pokeId, status }),
      });
      if (!response.ok) throw new Error("Failed to update poke");
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pokes"] });
      const statusMessages = {
        READ: "Marked as read",
        ACCEPTED: "Accepted! The employer will be notified.",
        DECLINED: "Declined politely",
      };
      toast({
        title: "Success",
        description: statusMessages[variables.status],
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update poke. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading pokes...</div>
      </div>
    );
  }

  const pendingPokes = pokes?.filter((p: any) => p.status === "PENDING") || [];
  const respondedPokes = pokes?.filter((p: any) => p.status !== "PENDING") || [];

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-pink-500/5 via-transparent to-purple-500/5 pointer-events-none" />

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <HandHeart className="h-10 w-10 text-pink-500" />
          {isYouth ? "Your Pokes" : "Pokes Sent"}
        </h1>
        <p className="text-lg text-muted-foreground">
          {isYouth
            ? "Employers who are interested in working with you"
            : "Youth workers you've shown interest in"}
        </p>
      </div>

      {/* Youth View: Pending Pokes */}
      {isYouth && pendingPokes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-pink-500 animate-pulse" />
            New Pokes ({pendingPokes.length})
          </h2>
          <div className="grid gap-6">
            {pendingPokes.map((poke: any) => (
              <Card
                key={poke.id}
                className="border-2 border-pink-500/20 hover-lift transition-all overflow-hidden relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <CardHeader className="relative">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl flex items-center gap-2">
                        {poke.employer?.employerProfile?.companyName}
                        {poke.employer?.employerProfile?.verified && (
                          <Badge className="bg-blue-500">Verified</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {poke.employer?.email}
                      </CardDescription>
                    </div>
                    {poke.employer?.employerProfile?.averageRating && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        <span className="font-semibold">
                          {poke.employer.employerProfile.averageRating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  {poke.job && (
                    <div className="mb-4 p-3 rounded-lg bg-muted/50 border">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-primary" />
                            {poke.job.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {categoryLabels[poke.job.category]} • {poke.job.payAmount} kr{" "}
                            {poke.job.payType === "HOURLY" ? "/hour" : "fixed"}
                          </p>
                          {formatDateRange(poke.job.startDate, poke.job.endDate, poke.job.dateTime) && (
                            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                              <CalendarDays className="h-3.5 w-3.5 text-primary" />
                              {formatDateRange(poke.job.startDate, poke.job.endDate, poke.job.dateTime)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {poke.message && (
                    <div className="mb-4 p-4 rounded-lg bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-2 border-pink-500/20">
                      <p className="text-sm italic">"{poke.message}"</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Received {formatDate(poke.createdAt)}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updatePokeMutation.mutate({ pokeId: poke.id, status: "READ" })
                        }
                        disabled={updatePokeMutation.isPending}
                      >
                        <Eye className="mr-1.5 h-4 w-4" />
                        Mark Read
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() =>
                          updatePokeMutation.mutate({ pokeId: poke.id, status: "DECLINED" })
                        }
                        disabled={updatePokeMutation.isPending}
                      >
                        <XCircle className="mr-1.5 h-4 w-4" />
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() =>
                          updatePokeMutation.mutate({ pokeId: poke.id, status: "ACCEPTED" })
                        }
                        disabled={updatePokeMutation.isPending}
                      >
                        <CheckCircle2 className="mr-1.5 h-4 w-4" />
                        Accept
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Pokes (Youth: Responded, Employer: All sent) */}
      {((isYouth && respondedPokes.length > 0) || (!isYouth && pokes && pokes.length > 0)) && (
        <div>
          <h2 className="text-2xl font-bold mb-4">
            {isYouth ? `Previous Responses (${respondedPokes.length})` : `All Pokes Sent (${pokes?.length || 0})`}
          </h2>
          <div className="grid gap-4">
            {(isYouth ? respondedPokes : pokes).map((poke: any) => {
              const statusConfig = {
                READ: { color: "bg-blue-500/10 text-blue-500", label: "Read" },
                ACCEPTED: { color: "bg-green-500/10 text-green-500", label: "Accepted" },
                DECLINED: { color: "bg-red-500/10 text-red-500", label: "Declined" },
                PENDING: { color: "bg-yellow-500/10 text-yellow-500", label: "Pending" },
              };
              const config = statusConfig[poke.status as keyof typeof statusConfig];

              return (
                <Card key={poke.id} className="border opacity-80 hover:opacity-100 transition-opacity">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">
                          {isYouth
                            ? poke.employer?.employerProfile?.companyName
                            : poke.youth?.youthProfile?.displayName}
                        </p>
                        {poke.job && (
                          <div className="mt-1">
                            <p className="text-sm text-muted-foreground">
                              {poke.job.title}
                            </p>
                            {formatDateRange(poke.job.startDate, poke.job.endDate, poke.job.dateTime) && (
                              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" />
                                {formatDateRange(poke.job.startDate, poke.job.endDate, poke.job.dateTime)}
                              </p>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDate(poke.createdAt)}
                        </p>
                      </div>
                      <Badge className={config.color}>{config.label}</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {pokes && pokes.length === 0 && (
        <Card className="border-2 shadow-lg">
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-pink-500/10 flex items-center justify-center">
              <HandHeart className="h-8 w-8 text-pink-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">No pokes yet</h3>
            <p className="text-muted-foreground">
              {isYouth
                ? "When employers are interested in you, they'll appear here"
                : "Start poking youth workers you're interested in!"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
