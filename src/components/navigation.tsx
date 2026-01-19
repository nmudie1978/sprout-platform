"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  Compass,
  LayoutDashboard,
  MessageSquare,
  User,
  LogOut,
  Menu,
  TrendingUp,
  Badge as BadgeIcon,
  Building2,
  Shield,
  Sprout,
  X,
  Settings,
  BarChart3,
  Bot,
  Target,
  HelpCircle,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationBell } from "@/components/notification-bell";
import { Avatar } from "@/components/avatar";

interface NavigationProps {
  userRole: "YOUTH" | "EMPLOYER" | "ADMIN" | "COMMUNITY_GUARDIAN";
  userName?: string;
  userEmail?: string;
  userAvatarId?: string | null;
  userProfilePic?: string | null;
}

interface NavLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isCore: boolean;
  iconOnly?: boolean;
  iconColor?: string;
}

export function Navigation({ userRole, userName, userEmail, userAvatarId: initialAvatarId, userProfilePic }: NavigationProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  // Fetch avatar dynamically for youth users so it updates when changed
  const { data: profile } = useQuery({
    queryKey: ["my-profile", session?.user?.id],
    queryFn: async () => {
      const response = await fetch("/api/profile");
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error("Failed to fetch profile");
      }
      return response.json();
    },
    enabled: userRole === "YOUTH" && !!session?.user?.id,
    staleTime: 0, // Always check for fresh data
  });

  // Check if user is a guardian (for any role)
  const { data: guardianInfo } = useQuery({
    queryKey: ["my-guardian-status"],
    queryFn: async () => {
      const response = await fetch("/api/guardian");
      if (!response.ok) return null;
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const isGuardian = guardianInfo?.isGuardian || guardianInfo?.isAdmin;

  // Use fetched avatar if available, otherwise fall back to initial
  const userAvatarId = userRole === "YOUTH" ? (profile?.avatarId ?? initialAvatarId) : initialAvatarId;

  // Role badge configuration with accent colors
  const roleConfig = {
    YOUTH: {
      label: "Youth Worker",
      icon: BadgeIcon,
      className: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0",
      accentColor: "from-blue-500 to-cyan-500",
      iconColor: "text-blue-500",
    },
    EMPLOYER: {
      label: "Job Poster",
      icon: Building2,
      className: "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0",
      accentColor: "from-purple-500 to-pink-500",
      iconColor: "text-purple-500",
    },
    ADMIN: {
      label: "Admin",
      icon: Shield,
      className: "bg-gradient-to-r from-orange-500 to-red-500 text-white border-0",
      accentColor: "from-orange-500 to-red-500",
      iconColor: "text-orange-500",
    },
    COMMUNITY_GUARDIAN: {
      label: "Guardian",
      icon: Shield,
      className: "bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0",
      accentColor: "from-emerald-500 to-green-500",
      iconColor: "text-emerald-500",
    },
  };

  const currentRole = roleConfig[userRole];

  const youthLinks: NavLink[] = [
    { href: "/dashboard", label: "", icon: LayoutDashboard, isCore: false, iconOnly: true, iconColor: "text-blue-500" },
    { href: "/jobs", label: "Small Jobs", icon: Briefcase, isCore: true },
    { href: "/growth", label: "My Growth", icon: TrendingUp, isCore: true },
    { href: "/careers", label: "Explore Careers", icon: Compass, isCore: true },
    { href: "/insights", label: "Industry Insights", icon: BarChart3, isCore: true },
    { href: "/goals", label: "", icon: Target, isCore: false, iconOnly: true, iconColor: "text-amber-500" },
    { href: "/career-advisor", label: "", icon: Bot, isCore: false, iconOnly: true, iconColor: "text-purple-500" },
    { href: "/legal/safety", label: "", icon: HelpCircle, isCore: false, iconOnly: true, iconColor: "text-green-500" },
    { href: "/profile", label: "", icon: User, isCore: false, iconOnly: true },
  ];

  const employerLinks: NavLink[] = [
    { href: "/employer/dashboard", label: "", icon: LayoutDashboard, isCore: false, iconOnly: true, iconColor: "text-purple-500" },
    { href: "/employer/post-job", label: "Post Job", icon: Briefcase, isCore: false },
    { href: "/employer/talent", label: "Browse Talent", icon: User, isCore: false },
    { href: "/employer/settings", label: "Settings", icon: Settings, isCore: false },
    { href: "/legal/safety", label: "", icon: HelpCircle, isCore: false, iconOnly: true, iconColor: "text-green-500" },
  ];

  const adminLinks: NavLink[] = [
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3, isCore: true },
    { href: "/dashboard", label: "", icon: LayoutDashboard, isCore: false, iconOnly: true, iconColor: "text-orange-500" },
    { href: "/admin/questions", label: "Moderate Q&A", icon: MessageSquare, isCore: false },
    { href: "/insights", label: "Industry Insights", icon: TrendingUp, isCore: false },
  ];

  // Guardian link - shown only for users who are guardians
  const guardianLink: NavLink = { href: "/guardian", label: "Guardian", icon: Shield, isCore: false };

  // Guardian-only links (when user's primary role is COMMUNITY_GUARDIAN)
  const guardianOnlyLinks: NavLink[] = [
    { href: "/guardian", label: "Guardian Dashboard", icon: Shield, isCore: true },
    { href: "/jobs", label: "Small Jobs", icon: Briefcase, isCore: false },
  ];

  const baseLinks =
    userRole === "YOUTH" ? youthLinks :
    userRole === "ADMIN" ? adminLinks :
    userRole === "COMMUNITY_GUARDIAN" ? guardianOnlyLinks :
    employerLinks;

  // Build final links list with optional guardian and admin links
  let links = [...baseLinks];

  // Add guardian link if user is a guardian (but not if their role is already COMMUNITY_GUARDIAN)
  if (isGuardian && userRole !== "COMMUNITY_GUARDIAN") {
    links.push(guardianLink);
  }

  return (
    <nav className="sticky top-0 z-50 border-b backdrop-blur-lg bg-background/80 shadow-sm">
      {/* Animated gradient accent bar */}
      <motion.div
        className={`h-1 bg-gradient-to-r ${currentRole.accentColor}`}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo with animation - Links to homepage */}
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <Sprout className="h-8 w-8 text-green-600" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              Sprout
            </span>
          </Link>

          {/* Desktop Navigation */}
          <TooltipProvider delayDuration={200}>
            <div className="hidden md:flex md:items-center md:space-x-1 ml-6">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                const isProfile = link.href === "/profile";
                const isAiAdvisor = link.href === "/career-advisor";
                const isGoals = link.href === "/goals";
                const isDashboard = link.href === "/dashboard" || link.href === "/employer/dashboard";

                // Get tooltip text for icon-only items
                const getTooltipText = () => {
                  if (isProfile) return "My Profile";
                  if (isAiAdvisor) return "AI Career Advisor";
                  if (isGoals) return "My Goals";
                  if (isDashboard) return "Dashboard";
                  if (link.href === "/legal/safety") return "Help & Safety";
                  return link.label;
                };

                const linkContent = (
                  <motion.div
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center space-x-1 rounded-lg px-2 py-1.5 text-xs transition-all duration-200",
                        isActive
                          ? `bg-gradient-to-r ${currentRole.accentColor} text-white shadow-lg font-bold`
                          : link.isCore
                            ? "text-foreground font-medium hover:bg-primary/10 border border-primary/20"
                            : "text-muted-foreground font-medium hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <Icon className={cn(
                        isProfile ? "h-5 w-5" : "h-4 w-4",
                        isActive && "animate-pulse",
                        link.isCore && !isActive && "text-primary",
                        !isActive && link.iconColor
                      )} />
                      {link.label && <span className="hidden lg:inline">{link.label}</span>}
                    </Link>
                  </motion.div>
                );

                return (
                  <div key={link.href} className="relative group">
                    {link.iconOnly ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          {linkContent}
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{getTooltipText()}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      linkContent
                    )}

                    {/* Active indicator dot */}
                    {isActive && (
                      <motion.div
                        className={`absolute -bottom-1 left-1/2 h-1.5 w-1.5 rounded-full bg-gradient-to-r ${currentRole.accentColor}`}
                        layoutId="activeIndicator"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </TooltipProvider>

          {/* User Menu */}
          <div className="hidden md:flex md:items-center md:space-x-3">
            {/* Notification Bell */}
            <NotificationBell />

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <ThemeToggle />
            </motion.div>

            {/* Animated Role Badge */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Badge className={cn("shadow-lg hover:shadow-xl transition-shadow", currentRole.className)}>
                <currentRole.icon className="mr-1.5 h-3.5 w-3.5" />
                {currentRole.label}
              </Badge>
            </motion.div>

            <div className="h-8 w-px bg-gradient-to-b from-transparent via-border to-transparent" />

            {/* User avatar and name */}
            {userRole === "YOUTH" && userAvatarId ? (
              <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Avatar avatarId={userAvatarId} size="sm" />
                <span className="text-sm font-medium hidden lg:block max-w-[100px] truncate">
                  {userName && userName.length > 12
                    ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                    : userName}
                </span>
              </Link>
            ) : (
              <span className="text-sm font-medium max-w-[120px] truncate">
                {userName && userName.length > 15
                  ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                  : userName}
              </span>
            )}

            {/* Sign out button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="hidden lg:inline">Sign Out</span>
              </Button>
            </motion.div>
          </div>

          {/* Mobile menu button */}
          <motion.button
            className="md:hidden p-2 rounded-lg hover:bg-muted"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="border-t md:hidden backdrop-blur-xl bg-background/95"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-1 px-4 pb-4 pt-2">
              {/* Role Badge & User - Mobile */}
              <motion.div
                className={`flex items-center justify-between p-4 rounded-xl mb-3 bg-gradient-to-r ${currentRole.accentColor}`}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-3">
                  {userRole === "YOUTH" && userAvatarId ? (
                    <Avatar avatarId={userAvatarId} size="sm" className="border-2 border-white/30" />
                  ) : userProfilePic ? (
                    <Image
                      src={userProfilePic}
                      alt={userName || "Profile"}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover border-2 border-white/30"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold">
                      {userName?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  <span className="text-sm font-medium text-white">{userName}</span>
                </div>
                <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                  <currentRole.icon className="mr-1.5 h-3.5 w-3.5" />
                  {currentRole.label}
                </Badge>
              </motion.div>

              {/* Mobile Links */}
              {links.map((link, index) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center space-x-3 rounded-xl px-4 py-3 text-sm transition-all block",
                        isActive
                          ? `bg-gradient-to-r ${currentRole.accentColor} text-white shadow-lg font-bold`
                          : link.isCore
                            ? "font-bold text-foreground bg-primary/5 border-2 border-primary/30 hover:bg-primary/10"
                            : "font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className={cn(
                        "h-5 w-5",
                        isActive && "animate-pulse",
                        link.isCore && !isActive && "text-primary",
                        !isActive && link.iconColor
                      )} />
                      <span>{link.label || (link.href.includes("dashboard") ? "Dashboard" : link.href === "/profile" ? "My Profile" : link.href === "/career-advisor" ? "AI Career Advisor" : link.href === "/goals" ? "My Goals" : link.href === "/legal/safety" ? "Help & Safety" : "")}</span>
                      {isActive && (
                        <span className="ml-auto h-2 w-2 rounded-full bg-white inline-block" />
                      )}
                    </Link>
                  </motion.div>
                );
              })}

              {/* Sign Out - Mobile */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.15 + links.length * 0.05 }}
              >
                <button
                  className="flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-all mt-2"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
