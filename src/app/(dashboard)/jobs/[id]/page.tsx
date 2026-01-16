"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Clock,
  ArrowLeft,
  Send,
  Building2,
  Star,
  CheckCircle,
  CalendarDays,
  Users,
  Shield,
  ExternalLink,
  AlertTriangle,
  Timer,
  Globe,
  Banknote,
  ImageIcon,
  Hash,
  Copy,
  Check,
  Sparkles,
  Heart,
  ChevronLeft,
  ChevronRight,
  X,
  Briefcase,
  DollarSign,
  Eye,
  MessageSquare,
  User,
  Award,
  CircleCheck,
  CircleDot,
  ChevronRight as ChevronRightIcon,
  Phone,
} from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ConfirmPaymentButton } from "@/components/confirm-payment-button";
import { CareerCard } from "@/components/career-card";
import { getCareersForCategory } from "@/lib/career-pathways";
import { Compass, UserPlus } from "lucide-react";
import { RecommendFriendDialog } from "@/components/recommend-friend-dialog";
import { JobRecommendations } from "@/components/job-recommendations";

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

const categoryEmojis: Record<string, string> = {
  BABYSITTING: "👶",
  DOG_WALKING: "🐕",
  SNOW_CLEARING: "❄️",
  CLEANING: "🧹",
  DIY_HELP: "🔧",
  TECH_HELP: "💻",
  ERRANDS: "🏃",
  OTHER: "✨",
};

// Floating background shapes
function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute -top-20 -right-20 w-72 h-72 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
        animate={{
          x: [0, -30, 0],
          y: [0, 20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 -left-20 w-80 h-80 bg-gradient-to-br from-cyan-500/15 to-blue-500/15 rounded-full blur-3xl"
        animate={{
          x: [0, 20, 0],
          y: [0, -30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-20 right-1/3 w-64 h-64 bg-gradient-to-br from-emerald-500/15 to-green-500/15 rounded-full blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

// Copy Job ID component
function CopyJobId({ jobId }: { jobId: string }) {
  const [copied, setCopied] = useState(false);
  const shortId = jobId.slice(0, 8).toUpperCase();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jobId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/80 hover:bg-muted text-sm font-mono text-muted-foreground hover:text-foreground transition-all"
          >
            <Hash className="h-4 w-4" />
            {shortId}
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4 opacity-50" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? "Copied!" : "Click to copy Job ID"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Image Gallery Modal
function ImageGallery({ images, jobTitle }: { images: string[]; jobTitle: string }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20">
            <ImageIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="font-semibold">Job Photos</h3>
          <Badge variant="secondary" className="text-xs">
            {images.length}
          </Badge>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {images.map((url, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedIndex(index)}
              className="relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-purple-500 transition-all group"
            >
              <img
                src={url}
                alt={`${jobTitle} - Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedIndex(null)}
          >
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              onClick={() => setSelectedIndex(null)}
            >
              <X className="h-6 w-6 text-white" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex((prev) => (prev! > 0 ? prev! - 1 : images.length - 1));
                  }}
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </button>
                <button
                  className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex((prev) => (prev! < images.length - 1 ? prev! + 1 : 0));
                  }}
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </button>
              </>
            )}

            <motion.img
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={images[selectedIndex]}
              alt={`${jobTitle} - Photo ${selectedIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === selectedIndex ? "bg-white w-6" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Section component
function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20">
          <Icon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [applicationMessage, setApplicationMessage] = useState("");
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showRecommendDialog, setShowRecommendDialog] = useState(false);

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", params.id],
    queryFn: async () => {
      const response = await fetch(`/api/jobs/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch job");
      return response.json();
    },
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: params.id,
          message: applicationMessage,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to apply");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application submitted!",
        description: "The employer will review your application.",
      });
      setShowApplicationForm(false);
      setApplicationMessage("");
      queryClient.invalidateQueries({ queryKey: ["job", params.id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen relative">
        <FloatingShapes />
        <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-8 w-8 border-3 border-purple-500 border-t-transparent rounded-full"
            />
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen relative">
        <FloatingShapes />
        <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-2 border-red-500/20 bg-red-500/5">
              <CardContent className="py-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Job Not Found</h2>
                <p className="text-muted-foreground mb-6">This job may have been removed or doesn't exist.</p>
                <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600">
                  <Link href="/jobs">
                    <Briefcase className="mr-2 h-4 w-4" />
                    Browse Available Jobs
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  const employer = job.postedBy?.employerProfile;
  const hasApplied = job.applications?.some((app: any) => app.youth?.id === session?.user.id);
  const isYouth = session?.user.role === "YOUTH";
  const isEmployer = session?.user.role === "EMPLOYER";
  const isOwner = job.postedById === session?.user.id;
  const applicationCount = job._count?.applications || 0;
  const isDeadlinePassed = job.applicationDeadline && new Date(job.applicationDeadline) < new Date();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "POSTED":
        return { bg: "from-blue-500 to-cyan-500", label: "Open", icon: Sparkles };
      case "ON_HOLD":
        return { bg: "from-yellow-500 to-orange-500", label: "Paused", icon: Clock };
      case "IN_PROGRESS":
      case "ASSIGNED":
        return { bg: "from-emerald-500 to-green-500", label: "Assigned", icon: Timer };
      case "COMPLETED":
        return { bg: "from-purple-500 to-pink-500", label: "Done", icon: CheckCircle };
      case "CANCELLED":
        return { bg: "from-red-500 to-rose-500", label: "Cancelled", icon: Briefcase };
      default:
        return { bg: "from-gray-500 to-slate-500", label: status, icon: Briefcase };
    }
  };

  const statusConfig = getStatusConfig(job.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen relative">
      <FloatingShapes />

      <div className="container mx-auto px-4 py-6 max-w-4xl relative z-10">
        {/* Back button */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2 hover:bg-purple-500/10">
            <Link href={isOwner ? "/employer/dashboard" : "/jobs"}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              {isOwner ? "Back to Dashboard" : "Back to Jobs"}
            </Link>
          </Button>
        </motion.div>

        {/* Main Card with Neon Border */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative group"
        >
          {/* Neon glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-3xl opacity-20 group-hover:opacity-30 blur-sm transition-opacity duration-500" />

          <Card className="relative rounded-3xl border-0 bg-background/90 backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* Status bar */}
            <div className={`h-2 bg-gradient-to-r ${statusConfig.bg}`} />

            {/* Header Section */}
            <div className="p-6 md:p-8 pb-0">
              {/* Top row: ID, Category, Status */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <CopyJobId jobId={job.id} />

                <Badge className="bg-muted text-foreground border-0 text-sm px-3 py-1">
                  <span className="mr-1.5">{categoryEmojis[job.category]}</span>
                  {categoryLabels[job.category] || job.category}
                </Badge>

                <Badge className={`bg-gradient-to-r ${statusConfig.bg} text-white border-0 text-sm px-3 py-1`}>
                  <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
                  {statusConfig.label}
                </Badge>

                {applicationCount > 0 && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5 ml-auto">
                    <Users className="h-4 w-4" />
                    {applicationCount} applicant{applicationCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                {job.title}
              </h1>

              {/* Key info row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {/* Pay */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <DollarSign className="h-4 w-4" />
                    Payment
                  </div>
                  <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {formatCurrency(job.payAmount)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {job.payType === "HOURLY" ? "per hour" : "fixed price"}
                  </div>
                </div>

                {/* Date */}
                <div className="p-4 rounded-2xl bg-muted/50 border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <CalendarDays className="h-4 w-4" />
                    Date
                  </div>
                  <div className="font-semibold">
                    {job.startDate ? formatDate(job.startDate) : "TBC"}
                  </div>
                  {job.endDate && job.startDate !== job.endDate && (
                    <div className="text-xs text-muted-foreground">
                      to {formatDate(job.endDate)}
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className="p-4 rounded-2xl bg-muted/50 border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <MapPin className="h-4 w-4" />
                    Location
                  </div>
                  <div className="font-semibold truncate">{job.location}</div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-600 hover:underline flex items-center gap-1"
                  >
                    View map <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {/* Duration */}
                <div className="p-4 rounded-2xl bg-muted/50 border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Timer className="h-4 w-4" />
                    Duration
                  </div>
                  <div className="font-semibold">
                    {job.duration ? `${job.duration} mins` : "Flexible"}
                  </div>
                  {job.applicationDeadline && (
                    <div className={`text-xs ${isDeadlinePassed ? "text-red-500" : "text-muted-foreground"}`}>
                      {isDeadlinePassed ? "Deadline passed" : `Apply by ${formatDate(job.applicationDeadline)}`}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <CardContent className="p-6 md:p-8 pt-0 space-y-6">
              {/* Job Photos */}
              {Array.isArray(job.images) && job.images.length > 0 && (
                <ImageGallery images={job.images} jobTitle={job.title} />
              )}

              {/* Description */}
              <Section icon={MessageSquare} title="Description">
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed pl-1">
                  {job.description}
                </p>
              </Section>

              {/* Required Traits */}
              {job.requiredTraits && job.requiredTraits.length > 0 && (
                <Section icon={Heart} title="Ideal Candidate">
                  <div className="flex flex-wrap gap-2 pl-1">
                    {job.requiredTraits.map((trait: string) => (
                      <Badge
                        key={trait}
                        variant="outline"
                        className="px-3 py-1.5 rounded-full border-purple-500/30 bg-purple-500/5 text-sm"
                      >
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </Section>
              )}

              {/* Career Connections */}
              {isYouth && (
                <Section icon={Compass} title="Career Connections">
                  <p className="text-sm text-muted-foreground mb-3 pl-1">
                    This job builds skills for careers like:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {getCareersForCategory(job.category).slice(0, 4).map((career) => (
                      <CareerCard key={career.id} career={career} compact />
                    ))}
                  </div>
                  <div className="mt-3 pl-1">
                    <Button variant="link" className="p-0 h-auto text-purple-600" asChild>
                      <Link href={`/careers?category=${job.category}`}>
                        Explore all related careers
                        <ChevronRightIcon className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </Section>
              )}

              {/* Deadline Warning */}
              {job.applicationDeadline && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center gap-3 p-4 rounded-2xl ${
                    isDeadlinePassed
                      ? "bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400"
                      : "bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400"
                  }`}
                >
                  <Clock className="h-5 w-5" />
                  <div>
                    <div className="font-medium">
                      {isDeadlinePassed ? "Applications Closed" : "Application Deadline"}
                    </div>
                    <div className="text-sm opacity-80">
                      {isDeadlinePassed
                        ? `Closed on ${formatDate(job.applicationDeadline)}`
                        : `Apply before ${formatDate(job.applicationDeadline)}`}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

              {/* Employer Info */}
              {(() => {
                // Check if current user is assigned to this job
                const isAssignedYouth = isYouth && job.applications?.some(
                  (app: any) => app.status === "ACCEPTED" && app.youth?.id === session?.user.id
                );

                return (
                  <div className="p-4 rounded-2xl bg-muted/30 border space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14 border-2 border-purple-500/30">
                          <AvatarImage src={employer?.companyLogo || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-lg">
                            {(employer?.companyName || "E")[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-lg">
                              {employer?.companyName || "Individual Employer"}
                            </span>
                            {employer?.verified && (
                              <CheckCircle className="h-4 w-4 text-blue-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            {employer?.averageRating && (
                              <span className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                <span className="font-medium text-foreground">{employer.averageRating.toFixed(1)}</span>
                              </span>
                            )}
                            {employer?.totalReviews > 0 && (
                              <span>{employer.totalReviews} reviews</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {employer?.website && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={employer.website} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4 mr-2" />
                            Website
                          </a>
                        </Button>
                      )}
                    </div>

                    {/* Contact info for assigned youth worker */}
                    {isAssignedYouth && employer?.phoneNumber && (
                      <div className="pt-3 border-t">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-purple-600" />
                          <span className="text-muted-foreground">Contact:</span>
                          <a href={`tel:${employer.phoneNumber}`} className="font-medium text-purple-700 dark:text-purple-400 hover:underline">
                            {employer.phoneNumber}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Assigned Youth Worker - shown when job is in progress */}
              {(() => {
                const acceptedApplication = job.applications?.find((app: any) => app.status === "ACCEPTED");
                if (!acceptedApplication) return null;

                const youthProfile = acceptedApplication.youth?.youthProfile;
                const profileLink = youthProfile?.publicProfileSlug
                  ? `/p/${youthProfile.publicProfileSlug}`
                  : null;

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/30"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 rounded-xl bg-emerald-500/20">
                        <CircleCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="font-semibold text-emerald-700 dark:text-emerald-400">Assigned Youth Worker</h3>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-emerald-500/30">
                          <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-green-500 text-white">
                            {(youthProfile?.displayName || "Y")[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{youthProfile?.displayName || "Youth Worker"}</div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            {youthProfile?.averageRating && (
                              <span className="flex items-center gap-1">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                <span className="font-medium text-foreground">{youthProfile.averageRating.toFixed(1)}</span>
                              </span>
                            )}
                            {youthProfile?.completedJobsCount > 0 && (
                              <span className="flex items-center gap-1">
                                <Award className="h-3.5 w-3.5" />
                                {youthProfile.completedJobsCount} jobs
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {profileLink && (
                        <Button variant="outline" size="sm" asChild className="border-emerald-500/30 hover:bg-emerald-500/10">
                          <Link href={profileLink}>
                            View Profile
                            <ChevronRightIcon className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>

                    {/* Contact info for employer */}
                    {isOwner && youthProfile?.phoneNumber && (
                      <div className="mt-3 pt-3 border-t border-emerald-500/20">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-emerald-600" />
                          <span className="text-muted-foreground">Contact:</span>
                          <a href={`tel:${youthProfile.phoneNumber}`} className="font-medium text-emerald-700 dark:text-emerald-400 hover:underline">
                            {youthProfile.phoneNumber}
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Confirm Payment button for employer on completed jobs */}
                    {isOwner && (job.status === "COMPLETED" || job.status === "REVIEWED") && (
                      <div className="mt-3 pt-3 border-t border-emerald-500/20 flex justify-end">
                        <ConfirmPaymentButton
                          jobId={job.id}
                          jobTitle={job.title}
                          amount={job.payAmount}
                          youthName={youthProfile?.displayName}
                        />
                      </div>
                    )}
                  </motion.div>
                );
              })()}

              {/* Applicants Overview - shown for employers when there are pending applications */}
              {isOwner && (() => {
                const pendingApplications = job.applications?.filter((app: any) => app.status === "PENDING") || [];
                if (pendingApplications.length === 0) return null;

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20">
                          <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="font-semibold">Applicants</h3>
                        <Badge variant="secondary" className="text-xs">
                          {pendingApplications.length} pending
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/employer/dashboard">
                          Manage All
                          <ChevronRightIcon className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {pendingApplications.slice(0, 5).map((app: any) => {
                        const youthProfile = app.youth?.youthProfile;
                        const profileLink = youthProfile?.publicProfileSlug
                          ? `/p/${youthProfile.publicProfileSlug}`
                          : null;

                        return (
                          <div
                            key={app.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-sm">
                                  {(youthProfile?.displayName || "Y")[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-sm">{youthProfile?.displayName || "Youth Worker"}</div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  {youthProfile?.averageRating && (
                                    <span className="flex items-center gap-0.5">
                                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                      {youthProfile.averageRating.toFixed(1)}
                                    </span>
                                  )}
                                  {youthProfile?.completedJobsCount > 0 && (
                                    <span>{youthProfile.completedJobsCount} jobs done</span>
                                  )}
                                  {youthProfile?.skillTags && youthProfile.skillTags.length > 0 && (
                                    <span className="truncate max-w-[150px]">
                                      {youthProfile.skillTags.slice(0, 2).join(", ")}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {profileLink && (
                                <Button variant="ghost" size="sm" asChild className="h-8 px-2">
                                  <Link href={profileLink}>
                                    <User className="h-4 w-4" />
                                  </Link>
                                </Button>
                              )}
                              <Badge variant="outline" className="text-xs text-amber-600 border-amber-500/30 bg-amber-500/10">
                                <CircleDot className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            </div>
                          </div>
                        );
                      })}

                      {pendingApplications.length > 5 && (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          +{pendingApplications.length - 5} more applicants
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })()}

              {/* Apply Section for Youth */}
              {isYouth && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-6" />

                  {isDeadlinePassed ? (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground mb-4">Applications are closed for this job.</p>
                      <Button variant="outline" asChild>
                        <Link href="/jobs">Browse Other Jobs</Link>
                      </Button>
                    </div>
                  ) : hasApplied ? (
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                      <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                        <div className="p-2 rounded-full bg-emerald-500/20">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-semibold">Application Submitted</div>
                          <div className="text-sm opacity-80">The employer will review your application</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard">View Status</Link>
                      </Button>
                    </div>
                  ) : showApplicationForm ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-4"
                    >
                      <div>
                        <Label htmlFor="message" className="text-base font-semibold">
                          Your Application Message
                        </Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          Tell the employer why you're the perfect fit for this job
                        </p>
                        <Textarea
                          id="message"
                          placeholder="Hi! I'm interested in this opportunity because..."
                          value={applicationMessage}
                          onChange={(e) => setApplicationMessage(e.target.value)}
                          className="min-h-[120px] rounded-xl border-2 focus-visible:ring-purple-500"
                          rows={5}
                        />
                        <div className="flex justify-between mt-2 text-sm">
                          <span className={applicationMessage.length < 10 ? "text-amber-500" : "text-muted-foreground"}>
                            {applicationMessage.length < 10 ? "Minimum 10 characters" : "Looking good!"}
                          </span>
                          <span className="text-muted-foreground">{applicationMessage.length}/500</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => applyMutation.mutate()}
                          disabled={
                            applicationMessage.length < 10 ||
                            applicationMessage.length > 500 ||
                            applyMutation.isPending
                          }
                          className="flex-1 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          <Send className="mr-2 h-4 w-4" />
                          {applyMutation.isPending ? "Submitting..." : "Submit Application"}
                        </Button>
                        <Button
                          variant="outline"
                          className="h-12 rounded-xl"
                          onClick={() => setShowApplicationForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <Button
                      onClick={() => setShowApplicationForm(true)}
                      className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 text-lg font-semibold shadow-lg shadow-purple-500/25"
                    >
                      <Sparkles className="mr-2 h-5 w-5" />
                      Apply for This Job
                    </Button>
                  )}

                  {/* Recommend a Friend button */}
                  {job.status === "POSTED" && !isDeadlinePassed && (
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowRecommendDialog(true)}
                        className="w-full h-12 rounded-xl border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50"
                      >
                        <UserPlus className="mr-2 h-4 w-4 text-purple-500" />
                        Recommend a Friend
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Recommendations Section for Employers */}
              {isOwner && (
                <JobRecommendations jobId={params.id} isEmployer={true} />
              )}

              {/* Recommend Friend Dialog */}
              {isYouth && (
                <RecommendFriendDialog
                  open={showRecommendDialog}
                  onOpenChange={setShowRecommendDialog}
                  jobId={params.id}
                  jobTitle={job.title}
                />
              )}

              {/* Owner Actions */}
              {isOwner && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex gap-3"
                >
                  <Button variant="outline" className="flex-1 h-12 rounded-xl" asChild>
                    <Link href="/employer/dashboard">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Dashboard
                    </Link>
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Safety Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 rounded-2xl bg-muted/30 border flex items-start gap-3"
        >
          <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Safety First:</span> Always meet in public places, tell someone where you'll be, and agree on payment terms before starting any work.
          </div>
        </motion.div>
      </div>
    </div>
  );
}
