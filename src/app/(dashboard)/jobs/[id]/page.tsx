"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Star,
  CheckCircle,
  CalendarDays,
  Users,
  Shield,
  ExternalLink,
  AlertTriangle,
  Timer,
  Globe,
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
  FileText,
  Target,
  Building2,
  UserPlus,
  Compass,
  Info,
  Trophy,
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
import { RecommendFriendDialog } from "@/components/recommend-friend-dialog";
import { JobRecommendations } from "@/components/job-recommendations";
import { DeleteJobButton } from "@/components/delete-job-button";
import { ReportModal } from "@/components/report-modal";
import { CommunityGuardedBadge, PausedBadge } from "@/components/guardian-badge";
import { UserBadgesDisplay } from "@/components/user-badges-display";
import { StickyActionBar, StickyActionBarSpacer } from "@/components/sticky-action-bar";

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

const categoryColors: Record<string, { from: string; to: string; accent: string }> = {
  BABYSITTING: { from: "from-pink-500", to: "to-rose-500", accent: "pink" },
  DOG_WALKING: { from: "from-amber-500", to: "to-orange-500", accent: "amber" },
  SNOW_CLEARING: { from: "from-cyan-500", to: "to-blue-500", accent: "cyan" },
  CLEANING: { from: "from-emerald-500", to: "to-green-500", accent: "emerald" },
  DIY_HELP: { from: "from-orange-500", to: "to-red-500", accent: "orange" },
  TECH_HELP: { from: "from-violet-500", to: "to-purple-500", accent: "violet" },
  ERRANDS: { from: "from-blue-500", to: "to-indigo-500", accent: "blue" },
  OTHER: { from: "from-slate-500", to: "to-gray-500", accent: "slate" },
};

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
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-muted text-xs font-mono text-muted-foreground hover:text-foreground transition-all"
          >
            <Hash className="h-3 w-3" />
            {shortId}
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3 opacity-50" />
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
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {images.map((url, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelectedIndex(index)}
            className="relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-primary/50 transition-all group"
          >
            <Image
              src={url}
              alt={`${jobTitle} - Photo ${index + 1}`}
              fill
              sizes="(max-width: 640px) 33vw, 25vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <Eye className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.button>
        ))}
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

// Info Card component for key details
function InfoCard({
  icon: Icon,
  label,
  value,
  subValue,
  accent = "emerald",
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subValue?: string;
  accent?: string;
  href?: string;
}) {
  const content = (
    <div className={`p-4 rounded-2xl bg-${accent}-500/5 dark:bg-${accent}-500/10 border border-${accent}-500/20 hover:border-${accent}-500/40 transition-colors`}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
        <Icon className={`h-3.5 w-3.5 text-${accent}-600 dark:text-${accent}-400`} />
        {label}
      </div>
      <div className="font-semibold text-foreground">{value}</div>
      {subValue && (
        <div className="text-xs text-muted-foreground mt-0.5">{subValue}</div>
      )}
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-xs text-${accent}-600 dark:text-${accent}-400 hover:underline flex items-center gap-1 mt-1`}
          onClick={(e) => e.stopPropagation()}
        >
          View map <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );

  return content;
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
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-2 border-red-500/20">
          <CardContent className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Job Not Found</h2>
            <p className="text-muted-foreground mb-6">This job may have been removed or doesn't exist.</p>
            <Button asChild>
              <Link href="/jobs">
                <Briefcase className="mr-2 h-4 w-4" />
                Browse Available Jobs
              </Link>
            </Button>
          </CardContent>
        </Card>
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
  const colors = categoryColors[job.category] || categoryColors.OTHER;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "POSTED":
        return { bg: "from-emerald-500 to-green-500", label: "Open for Applications", color: "emerald" };
      case "ON_HOLD":
        return { bg: "from-amber-500 to-orange-500", label: "On Hold", color: "amber" };
      case "IN_PROGRESS":
      case "ASSIGNED":
        return { bg: "from-blue-500 to-cyan-500", label: "In Progress", color: "blue" };
      case "COMPLETED":
        return { bg: "from-violet-500 to-purple-500", label: "Completed", color: "violet" };
      case "CANCELLED":
        return { bg: "from-red-500 to-rose-500", label: "Cancelled", color: "red" };
      default:
        return { bg: "from-gray-500 to-slate-500", label: status, color: "gray" };
    }
  };

  const statusConfig = getStatusConfig(job.status);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background - Same as Profile Page */}
      <div className="fixed inset-0 -z-20">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-100 via-amber-50/30 to-emerald-50/40 dark:from-stone-950 dark:via-stone-900 dark:to-emerald-950/20" />

        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
        />
      </div>

      {/* Animated Morphing Shapes Layer */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Large morphing blob - top right */}
        <motion.div
          className="absolute -top-20 -right-20 w-[600px] h-[600px]"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        >
          <motion.div
            className="w-full h-full bg-gradient-to-br from-amber-300/20 via-orange-200/15 to-rose-200/10 dark:from-amber-700/10 dark:via-orange-800/8 dark:to-rose-900/5"
            style={{ borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" }}
            animate={{
              borderRadius: [
                "60% 40% 30% 70% / 60% 30% 70% 40%",
                "30% 60% 70% 40% / 50% 60% 30% 60%",
                "60% 40% 30% 70% / 60% 30% 70% 40%",
              ],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Medium morphing blob - bottom left */}
        <motion.div
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px]"
          animate={{ rotate: [360, 0] }}
          transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
        >
          <motion.div
            className="w-full h-full bg-gradient-to-tr from-emerald-300/15 via-teal-200/12 to-cyan-200/8 dark:from-emerald-800/10 dark:via-teal-900/8 dark:to-cyan-950/5"
            style={{ borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%" }}
            animate={{
              borderRadius: [
                "40% 60% 70% 30% / 40% 50% 60% 50%",
                "70% 30% 50% 50% / 30% 30% 70% 70%",
                "40% 60% 70% 30% / 40% 50% 60% 50%",
              ],
              scale: [1, 1.15, 1],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </motion.div>

        {/* Flowing wave lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06] dark:opacity-[0.03]" preserveAspectRatio="none">
          <motion.path
            d="M0,200 Q200,100 400,200 T800,200 T1200,200 T1600,200"
            fill="none"
            stroke="url(#wave-gradient)"
            strokeWidth="2"
            animate={{
              d: [
                "M0,200 Q200,100 400,200 T800,200 T1200,200 T1600,200",
                "M0,200 Q200,300 400,200 T800,200 T1200,200 T1600,200",
                "M0,200 Q200,100 400,200 T800,200 T1200,200 T1600,200",
              ],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.path
            d="M0,400 Q200,300 400,400 T800,400 T1200,400 T1600,400"
            fill="none"
            stroke="url(#wave-gradient)"
            strokeWidth="1.5"
            animate={{
              d: [
                "M0,400 Q200,300 400,400 T800,400 T1200,400 T1600,400",
                "M0,400 Q200,500 400,400 T800,400 T1200,400 T1600,400",
                "M0,400 Q200,300 400,400 T800,400 T1200,400 T1600,400",
              ],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <defs>
            <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="50%" stopColor="#059669" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
          </defs>
        </svg>

        {/* Geometric floating shapes */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${10 + (i * 15)}%`,
              top: `${20 + ((i * 20) % 50)}%`,
            }}
            animate={{
              y: [0, -25, 0],
              x: [0, i % 2 === 0 ? 12 : -12, 0],
              rotate: [0, i % 2 === 0 ? 180 : -180, 0],
              opacity: [0.12, 0.25, 0.12],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.8,
            }}
          >
            {i % 3 === 0 ? (
              <div
                className="w-6 h-6 bg-gradient-to-br from-amber-400/20 to-orange-300/10 dark:from-amber-600/15 dark:to-orange-700/8"
                style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
              />
            ) : i % 3 === 1 ? (
              <div
                className="w-5 h-5 bg-gradient-to-br from-emerald-400/20 to-teal-300/10 dark:from-emerald-600/15 dark:to-teal-700/8"
                style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
              />
            ) : (
              <div
                className="w-4 h-4 bg-gradient-to-br from-rose-400/20 to-pink-300/10 dark:from-rose-600/15 dark:to-pink-700/8"
                style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
              />
            )}
          </motion.div>
        ))}

        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle, #78716c 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Accent glow spots */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-amber-400/8 dark:bg-amber-600/5 blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/4 w-48 h-48 rounded-full bg-emerald-400/8 dark:bg-emerald-600/5 blur-3xl"
          animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl relative z-10">
        {/* Back button */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2 hover:bg-muted/50">
            <Link href={isOwner ? "/employer/dashboard" : "/jobs"}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              {isOwner ? "Back to Dashboard" : "Back to Jobs"}
            </Link>
          </Button>
        </motion.div>

        <div className="space-y-6">
          {/* Hero Card - Job Title & Key Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2 shadow-xl overflow-hidden relative">
              {/* Category color bar */}
              <div className={`h-1.5 bg-gradient-to-r ${colors.from} ${colors.to}`} />

              <CardContent className="p-6 md:p-8">
                {/* Top row: badges */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge className={`bg-gradient-to-r ${colors.from} ${colors.to} text-white border-0`}>
                    <span className="mr-1">{categoryEmojis[job.category]}</span>
                    {categoryLabels[job.category] || job.category}
                  </Badge>
                  <Badge className={`bg-gradient-to-r ${statusConfig.bg} text-white border-0`}>
                    {statusConfig.label}
                  </Badge>
                  {job.isPaused && <PausedBadge reason={job.pausedReason} />}
                  {job.community && (
                    <CommunityGuardedBadge
                      communityName={job.community.name}
                      guardianName={job.community.guardian?.displayName}
                    />
                  )}
                  <div className="ml-auto">
                    <CopyJobId jobId={job.id} />
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-2xl md:text-3xl font-bold mb-6">{job.title}</h1>

                {/* Key info grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Pay - highlighted */}
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${colors.from}/10 ${colors.to}/5 border-2 border-${colors.accent}-500/30`}>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <DollarSign className={`h-3.5 w-3.5 text-${colors.accent}-600 dark:text-${colors.accent}-400`} />
                      Payment
                    </div>
                    <div className="text-xl font-bold text-gray-600 dark:text-gray-400">
                      {formatCurrency(job.payAmount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {job.payType === "HOURLY" ? "per hour" : "fixed price"}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="p-4 rounded-2xl bg-muted/40 border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Date
                    </div>
                    <div className="font-semibold">
                      {job.startDate ? formatDate(job.startDate) : "To be confirmed"}
                    </div>
                    {job.endDate && job.startDate !== job.endDate && (
                      <div className="text-xs text-muted-foreground">to {formatDate(job.endDate)}</div>
                    )}
                  </div>

                  {/* Location */}
                  <div className="p-4 rounded-2xl bg-muted/40 border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <MapPin className="h-3.5 w-3.5" />
                      Location
                    </div>
                    <div className="font-semibold truncate">{job.location}</div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5"
                    >
                      View map <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  {/* Duration/Deadline */}
                  <div className="p-4 rounded-2xl bg-muted/40 border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Timer className="h-3.5 w-3.5" />
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

                {/* Applicant count */}
                {applicationCount > 0 && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {applicationCount} applicant{applicationCount > 1 ? "s" : ""} so far
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Description & Photos Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border-2 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${colors.from}/10 ${colors.to}/10`}>
                    <FileText className={`h-4 w-4 text-${colors.accent}-600 dark:text-${colors.accent}-400`} />
                  </div>
                  About This Job
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Description */}
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {job.description}
                  </p>
                </div>

                {/* Photos */}
                {Array.isArray(job.images) && job.images.length > 0 && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 mb-3">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Photos</span>
                      <Badge variant="secondary" className="text-xs">{job.images.length}</Badge>
                    </div>
                    <ImageGallery images={job.images} jobTitle={job.title} />
                  </div>
                )}

                {/* Required Traits */}
                {job.requiredTraits && job.requiredTraits.length > 0 && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Ideal Candidate</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {job.requiredTraits.map((trait: string) => (
                        <Badge
                          key={trait}
                          variant="outline"
                          className={`px-3 py-1.5 rounded-full border-${colors.accent}-500/30 bg-${colors.accent}-500/5`}
                        >
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Employer Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-2 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 rounded-xl bg-violet-500/10">
                    <Building2 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  Posted By
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const isAssignedYouth = isYouth && job.applications?.some(
                    (app: any) => app.status === "ACCEPTED" && app.youth?.id === session?.user.id
                  );

                  return (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14 border-2 border-violet-500/30">
                          <AvatarImage src={employer?.companyLogo || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-500 text-white text-lg">
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
                          {/* Contact info for assigned youth */}
                          {isAssignedYouth && employer?.phoneNumber && (
                            <div className="flex items-center gap-2 text-sm mt-2">
                              <Phone className="h-4 w-4 text-emerald-600" />
                              <a href={`tel:${employer.phoneNumber}`} className="font-medium text-emerald-600 hover:underline">
                                {employer.phoneNumber}
                              </a>
                            </div>
                          )}
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
                  );
                })()}
              </CardContent>
            </Card>
          </motion.div>

          {/* Assigned Youth Worker (when job is in progress) */}
          {(() => {
            const acceptedApplication = job.applications?.find((app: any) => app.status === "ACCEPTED");
            if (!acceptedApplication) return null;

            const youthProfile = acceptedApplication.youth?.youthProfile;
            const youthBadges = acceptedApplication.youth?.badges || [];
            const profileLink = youthProfile?.publicProfileSlug ? `/p/${youthProfile.publicProfileSlug}` : null;

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <Card className="border-2 border-emerald-500/30 shadow-lg bg-emerald-500/5">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg text-emerald-700 dark:text-emerald-400">
                      <div className="p-2 rounded-xl bg-emerald-500/20">
                        <CircleCheck className="h-4 w-4" />
                      </div>
                      Assigned Youth Worker
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
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
                          {/* Contact info for employer */}
                          {isOwner && youthProfile?.phoneNumber && (
                            <div className="flex items-center gap-2 text-sm mt-2">
                              <Phone className="h-4 w-4 text-emerald-600" />
                              <a href={`tel:${youthProfile.phoneNumber}`} className="font-medium text-emerald-600 hover:underline">
                                {youthProfile.phoneNumber}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {profileLink && (
                          <Button variant="outline" size="sm" asChild className="border-emerald-500/30">
                            <Link href={profileLink}>View Profile</Link>
                          </Button>
                        )}
                        {/* Confirm Payment button */}
                        {isOwner && (job.status === "COMPLETED" || job.status === "REVIEWED") && (
                          <ConfirmPaymentButton
                            jobId={job.id}
                            jobTitle={job.title}
                            amount={job.payAmount}
                            youthName={youthProfile?.displayName}
                          />
                        )}
                      </div>
                    </div>
                    {/* Badges for assigned worker */}
                    {youthBadges.length > 0 && (
                      <div className="pt-3 border-t border-emerald-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Trophy className="h-4 w-4 text-amber-600" />
                          <span className="text-sm font-medium">Achievements</span>
                          <span className="text-xs text-muted-foreground">({youthBadges.length})</span>
                        </div>
                        <UserBadgesDisplay
                          badges={youthBadges}
                          variant="inline"
                          maxDisplay={8}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })()}

          {/* Applicants Overview (for employers) */}
          {isOwner && (() => {
            const pendingApplications = job.applications?.filter((app: any) => app.status === "PENDING") || [];
            if (pendingApplications.length === 0) return null;

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <Card className="border-2 shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="p-2 rounded-xl bg-blue-500/10">
                          <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        Applicants
                        <Badge variant="secondary">{pendingApplications.length} pending</Badge>
                      </CardTitle>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/employer/dashboard">
                          Manage All
                          <ChevronRightIcon className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pendingApplications.slice(0, 5).map((app: any) => {
                        const youthProfile = app.youth?.youthProfile;
                        const youthBadges = app.youth?.badges || [];
                        const profileLink = youthProfile?.publicProfileSlug ? `/p/${youthProfile.publicProfileSlug}` : null;

                        return (
                          <div
                            key={app.id}
                            className="p-4 rounded-xl bg-muted/30 border hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
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
                            {/* Badges row */}
                            {youthBadges.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-dashed">
                                <div className="flex items-center gap-2">
                                  <Trophy className="h-3.5 w-3.5 text-amber-600" />
                                  <span className="text-xs text-muted-foreground">Achievements:</span>
                                  <UserBadgesDisplay
                                    badges={youthBadges}
                                    variant="inline"
                                    maxDisplay={6}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {pendingApplications.length > 5 && (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          +{pendingApplications.length - 5} more applicants
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })()}

          {/* Career Connections (for youth) */}
          {isYouth && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="border-2 shadow-lg overflow-hidden">
                <CardHeader className="pb-4 bg-gradient-to-r from-orange-500/5 to-amber-500/5">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 rounded-xl bg-orange-500/10">
                      <Compass className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    Career Connections
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    This job builds skills for careers like:
                  </p>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {getCareersForCategory(job.category).slice(0, 4).map((career) => (
                      <CareerCard key={career.id} career={career} compact />
                    ))}
                  </div>
                  <div className="mt-4">
                    <Button variant="link" className="p-0 h-auto text-orange-600" asChild>
                      <Link href={`/careers?category=${job.category}`}>
                        Explore all related careers
                        <ChevronRightIcon className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Application Section (for youth) */}
          {isYouth && (
            <motion.div
              id="application-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-2 shadow-lg">
                <CardContent className="p-6">
                  {isDeadlinePassed ? (
                    <div className="text-center py-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 mb-3">
                        <Clock className="h-6 w-6 text-red-500" />
                      </div>
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
                          className="min-h-[120px] rounded-xl border-2"
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
                          className={`flex-1 h-12 rounded-xl bg-gradient-to-r ${colors.from} ${colors.to}`}
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
                    <div className="space-y-4">
                      <Button
                        onClick={() => setShowApplicationForm(true)}
                        className={`w-full h-14 rounded-2xl bg-gradient-to-r ${colors.from} ${colors.to} text-lg font-semibold shadow-lg`}
                      >
                        <Sparkles className="mr-2 h-5 w-5" />
                        Apply for This Job
                      </Button>

                      {/* Recommend a Friend */}
                      {job.status === "POSTED" && !isDeadlinePassed && (
                        <Button
                          variant="outline"
                          onClick={() => setShowRecommendDialog(true)}
                          className="w-full h-12 rounded-xl"
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Recommend a Friend
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
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
              transition={{ delay: 0.35 }}
            >
              <Card className="border-2 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 h-12 rounded-xl" asChild>
                      <Link href="/employer/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                      </Link>
                    </Button>
                  </div>
                  {job.status === "CANCELLED" && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-muted-foreground mb-2">
                        This job has been cancelled. You can permanently delete it if you no longer need it.
                      </p>
                      <DeleteJobButton
                        jobId={job.id}
                        jobTitle={job.title}
                        jobStatus={job.status}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Safety Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-4 rounded-2xl bg-muted/50 border flex items-start justify-between gap-3"
          >
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Safety First:</span> Always meet in public places, tell someone where you'll be, and agree on payment terms before starting any work.
              </div>
            </div>
            {session?.user && !isOwner && (
              <ReportModal
                targetType="JOB_POST"
                targetId={params.id}
                targetName={job.title}
              />
            )}
          </motion.div>

          {/* Mobile spacer for sticky action bar */}
          {isYouth && !hasApplied && !isDeadlinePassed && (
            <StickyActionBarSpacer />
          )}
        </div>
      </div>

      {/* Mobile Sticky Apply Button */}
      {isYouth && !hasApplied && !isDeadlinePassed && !showApplicationForm && (
        <StickyActionBar>
          <Button
            onClick={() => {
              setShowApplicationForm(true);
              // Scroll to application form
              setTimeout(() => {
                document.getElementById("application-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
              }, 100);
            }}
            className={`flex-1 h-12 rounded-xl bg-gradient-to-r ${colors.from} ${colors.to} text-base font-semibold shadow-lg`}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Apply for This Job
          </Button>
        </StickyActionBar>
      )}
    </div>
  );
}
