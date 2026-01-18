"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Archive,
  Briefcase,
  GraduationCap,
  BookOpen,
  Lock,
  Plus,
  Heart,
  Trash2,
  ExternalLink,
  FileText,
  Award,
  Image,
  MessageSquare,
  Star,
} from "lucide-react";
import Link from "next/link";

// Type icons for vault items
const typeConfig: Record<string, { icon: typeof Briefcase; color: string; bg: string; label: string }> = {
  job: { icon: Briefcase, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30", label: "Job" },
  saved_opportunity: { icon: Heart, color: "text-pink-600", bg: "bg-pink-100 dark:bg-pink-900/30", label: "Saved Job" },
  saved_career: { icon: GraduationCap, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30", label: "Saved Career" },
  saved_learning: { icon: BookOpen, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30", label: "Learning" },
  feedback: { icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30", label: "Feedback" },
  certificate: { icon: Award, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30", label: "Certificate" },
  photo: { icon: Image, color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30", label: "Photo" },
  note: { icon: FileText, color: "text-slate-600", bg: "bg-slate-100 dark:bg-slate-900/30", label: "Note" },
  milestone: { icon: Star, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30", label: "Milestone" },
};

export default function VaultPage() {
  const { data: session, status: sessionStatus } = useSession();

  const { data: vaultItems, isLoading } = useQuery({
    queryKey: ["vault-items"],
    queryFn: async () => {
      const response = await fetch("/api/my-path/vault");
      if (!response.ok) throw new Error("Failed to fetch vault items");
      return response.json();
    },
    enabled: session?.user?.role === "YOUTH",
  });

  if (sessionStatus === "loading" || isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (session?.user?.role !== "YOUTH") {
    return (
      <Card className="border-2">
        <CardContent className="py-12 text-center">
          <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">This page is only available for youth workers.</p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const items = vaultItems || [];

  // Group items by category
  const savedOpportunities = items.filter((item: any) => item.type === "saved_opportunity");
  const savedCareers = items.filter((item: any) => item.type === "saved_career");
  const savedLearning = items.filter((item: any) => item.type === "saved_learning");
  const proofItems = items.filter((item: any) =>
    !["saved_opportunity", "saved_career", "saved_learning"].includes(item.type)
  );

  const hasItems = items.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Archive className="h-5 w-5 text-blue-600" />
              Your Vault
            </h2>
            <p className="text-sm text-muted-foreground">
              Save opportunities, careers, and learning resources for later.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="opportunities" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="opportunities" className="text-xs sm:text-sm">
            <Heart className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Saved</span> Jobs
            {savedOpportunities.length > 0 && (
              <Badge variant="secondary" className="ml-1 sm:ml-2 h-5 px-1.5">
                {savedOpportunities.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="careers" className="text-xs sm:text-sm">
            <GraduationCap className="h-4 w-4 mr-1 sm:mr-2" />
            Careers
            {savedCareers.length > 0 && (
              <Badge variant="secondary" className="ml-1 sm:ml-2 h-5 px-1.5">
                {savedCareers.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="learning" className="text-xs sm:text-sm">
            <BookOpen className="h-4 w-4 mr-1 sm:mr-2" />
            Learning
            {savedLearning.length > 0 && (
              <Badge variant="secondary" className="ml-1 sm:ml-2 h-5 px-1.5">
                {savedLearning.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="proof" className="text-xs sm:text-sm">
            <Award className="h-4 w-4 mr-1 sm:mr-2" />
            Proof
            {proofItems.length > 0 && (
              <Badge variant="secondary" className="ml-1 sm:ml-2 h-5 px-1.5">
                {proofItems.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Saved Opportunities */}
        <TabsContent value="opportunities">
          {savedOpportunities.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="py-12 text-center">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold mb-2">No saved jobs yet</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                  When browsing jobs, click the heart icon to save opportunities you're interested in.
                </p>
                <Button asChild>
                  <Link href="/jobs">Browse Jobs</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {savedOpportunities.map((item: any) => (
                <VaultItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Saved Careers */}
        <TabsContent value="careers">
          {savedCareers.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="py-12 text-center">
                <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold mb-2">No saved careers yet</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                  Explore careers and save ones that interest you for future reference.
                </p>
                <Button asChild>
                  <Link href="/careers">Explore Careers</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {savedCareers.map((item: any) => (
                <VaultItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Saved Learning */}
        <TabsContent value="learning">
          {savedLearning.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold mb-2">No saved courses yet</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                  Save courses and learning resources to track your educational journey.
                </p>
                <Button asChild>
                  <Link href="/growth/career-path">View Learning Resources</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {savedLearning.map((item: any) => (
                <VaultItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Proof / Achievements */}
        <TabsContent value="proof">
          {proofItems.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="py-12 text-center">
                <Award className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold mb-2">No proof items yet</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                  As you complete jobs and earn achievements, they'll appear here as proof of your experience.
                </p>
                <Button asChild>
                  <Link href="/jobs">Find a Job</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {proofItems.map((item: any) => (
                <VaultItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function VaultItemCard({ item }: { item: any }) {
  const config = typeConfig[item.type] || typeConfig.note;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className="border-2 hover:border-blue-300 transition-colors">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${config.bg}`}>
              <Icon className={`h-4 w-4 ${config.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm truncate">{item.title}</h4>
                <Badge variant="outline" className="text-xs shrink-0">
                  {config.label}
                </Badge>
              </div>
              {item.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Saved {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
            {item.url && (
              <Link href={item.url} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
