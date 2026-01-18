"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import Link from "next/link";
import {
  Bell,
  BellOff,
  Settings,
  Briefcase,
  BookOpen,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import {
  getOpportunityAlerts,
  getAlertPreferences,
  updateAlertPreferences,
  markAlertSeen,
  type AlertEvent,
} from "@/lib/my-path/actions";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function AlertsPage() {
  const [showSettings, setShowSettings] = useState(false);
  const queryClient = useQueryClient();

  const { data: alerts, isLoading: alertsLoading } = useQuery<AlertEvent[]>({
    queryKey: ["opportunity-alerts"],
    queryFn: () => getOpportunityAlerts(),
    staleTime: 30 * 1000,
  });

  const { data: prefs, isLoading: prefsLoading } = useQuery({
    queryKey: ["alert-preferences"],
    queryFn: () => getAlertPreferences(),
    staleTime: 60 * 1000,
  });

  const markSeenMutation = useMutation({
    mutationFn: markAlertSeen,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunity-alerts"] });
      queryClient.invalidateQueries({ queryKey: ["my-path-overview"] });
    },
  });

  const updatePrefsMutation = useMutation({
    mutationFn: updateAlertPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-preferences"] });
      toast.success("Preferences updated");
    },
    onError: () => {
      toast.error("Failed to update preferences");
    },
  });

  const unseenCount = alerts?.filter((a) => !a.seenAt).length || 0;

  if (alertsLoading || prefsLoading) {
    return <AlertsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">Opportunity alerts</h2>
          <p className="text-sm text-muted-foreground">
            Get notified when jobs match your interests
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="h-4 w-4 mr-1" />
          Settings
        </Button>
      </div>

      {/* Settings Panel */}
      {showSettings && prefs && (
        <Card className="border-2 border-amber-200 dark:border-amber-800/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Alert preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable/Disable */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="alerts-enabled">Enable alerts</Label>
                <p className="text-xs text-muted-foreground">
                  Receive notifications for matching opportunities
                </p>
              </div>
              <Switch
                id="alerts-enabled"
                checked={prefs.enabled}
                onCheckedChange={(checked) =>
                  updatePrefsMutation.mutate({ enabled: checked })
                }
              />
            </div>

            {/* Radius */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Search radius</Label>
                <span className="text-sm text-muted-foreground">
                  {prefs.radiusKm} km
                </span>
              </div>
              <Slider
                value={[prefs.radiusKm]}
                min={5}
                max={50}
                step={5}
                onValueChange={([value]) =>
                  updatePrefsMutation.mutate({ radiusKm: value })
                }
              />
            </div>

            {/* Notification Types */}
            <div className="space-y-3">
              <Label>Notification methods</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Push notifications</span>
                  <Switch
                    checked={prefs.notifyPush}
                    onCheckedChange={(checked) =>
                      updatePrefsMutation.mutate({ notifyPush: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email notifications</span>
                  <Switch
                    checked={prefs.notifyEmail}
                    onCheckedChange={(checked) =>
                      updatePrefsMutation.mutate({ notifyEmail: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts List */}
      {alerts && alerts.length > 0 ? (
        <div className="space-y-3">
          {unseenCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-500">{unseenCount} new</Badge>
            </div>
          )}

          {alerts.map((alert) => {
            const isJob = alert.type === "job_match";
            const Icon = isJob ? Briefcase : BookOpen;
            const href = isJob ? `/jobs/${alert.entityId}` : "/my-path/courses";

            return (
              <Card
                key={alert.id}
                className={`transition-colors ${
                  !alert.seenAt
                    ? "border-2 border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20"
                    : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        isJob
                          ? "bg-green-100 dark:bg-green-900/30"
                          : "bg-blue-100 dark:bg-blue-900/30"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          isJob ? "text-green-600" : "text-blue-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-medium">{alert.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {alert.reason}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatDistanceToNow(new Date(alert.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Link href={href}>
                          <Button size="sm" variant="default">
                            View
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                        {!alert.seenAt && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markSeenMutation.mutate(alert.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Mark read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            {prefs?.enabled ? (
              <>
                <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold mb-2">No alerts yet</h3>
                <p className="text-sm text-muted-foreground">
                  We'll notify you when jobs match your interests
                </p>
              </>
            ) : (
              <>
                <BellOff className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold mb-2">Alerts are disabled</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Enable alerts to get notified about matching opportunities
                </p>
                <Button
                  onClick={() =>
                    updatePrefsMutation.mutate({ enabled: true })
                  }
                >
                  Enable alerts
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AlertsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
