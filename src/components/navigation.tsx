"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  Compass,
  LayoutDashboard,
  MessageSquare,
  TrendingUp,
  Badge as BadgeIcon,
  Building2,
  Shield,
  Sprout,
  Menu,
  X,
  Settings,
  BarChart3,
  User,
  Target,
  HelpCircle,
  Flag,
  LogOut,
  Sun,
  Moon,
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
import { UserAvatarMenu } from "@/components/user-avatar-menu";

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

// Icon mapping for mobile menu sections
const mobileIcons = {
  user: User,
  settings: Settings,
  target: Target,
  help: HelpCircle,
  flag: Flag,
};

// Helper component for mobile menu sections
function MobileMenuSection({
  title,
  items,
  pathname,
  currentRole,
  onClose,
  delay,
}: {
  title: string;
  items: Array<{ href: string; label: string; icon: keyof typeof mobileIcons }>;
  pathname: string;
  currentRole: { accentColor: string };
  onClose: () => void;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay }}
    >
      <span className="text-xs text-muted-foreground uppercase tracking-wider px-4 py-2 block">
        {title}
      </span>
      {items.map((item) => {
        const Icon = mobileIcons[item.icon];
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center space-x-3 rounded-xl px-4 py-2.5 text-sm transition-all block",
              isActive
                ? `bg-gradient-to-r ${currentRole.accentColor} text-white shadow-lg font-medium`
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            onClick={onClose}
          >
            <Icon className={cn("h-4 w-4", isActive && "animate-pulse")} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </motion.div>
  );
}

export function Navigation({ userRole, userName, userEmail, userAvatarId: initialAvatarId, userProfilePic }: NavigationProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

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

  // Primary navigation only - secondary items moved to avatar menu
  const youthLinks: NavLink[] = [
    { href: "/dashboard", label: "", icon: LayoutDashboard, isCore: false, iconOnly: true },
    { href: "/jobs", label: "Small Jobs", icon: Briefcase, isCore: true },
    { href: "/growth", label: "My Growth", icon: TrendingUp, isCore: true },
    { href: "/careers", label: "Explore Careers", icon: Compass, isCore: true },
    { href: "/insights", label: "Industry Insights", icon: BarChart3, isCore: true },
  ];

  const employerLinks: NavLink[] = [
    { href: "/employer/dashboard", label: "Dashboard", icon: LayoutDashboard, isCore: true },
    { href: "/employer/post-job", label: "Post Job", icon: Briefcase, isCore: true },
    { href: "/employer/talent", label: "Browse Talent", icon: Compass, isCore: true },
  ];

  const adminLinks: NavLink[] = [
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3, isCore: true },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, isCore: true },
    { href: "/admin/questions", label: "Moderate Q&A", icon: MessageSquare, isCore: true },
    { href: "/insights", label: "Industry Insights", icon: TrendingUp, isCore: true },
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

          {/* Desktop Navigation - Clean primary nav only */}
          <TooltipProvider delayDuration={200}>
            <div className="hidden md:flex md:items-center md:space-x-1 ml-6">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                const linkContent = (
                  <motion.div
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center rounded-lg transition-all duration-200",
                        link.iconOnly ? "p-2" : "space-x-1.5 px-3 py-2 text-sm",
                        isActive
                          ? `bg-gradient-to-r ${currentRole.accentColor} text-white shadow-lg font-medium`
                          : "text-foreground/80 font-medium hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className={cn(
                        "h-4 w-4",
                        isActive && "animate-pulse"
                      )} />
                      {link.label && <span>{link.label}</span>}
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
                          <p>Dashboard</p>
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

          {/* Right side - Notifications + Avatar Menu only */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            <NotificationBell />
            <UserAvatarMenu
              userRole={userRole}
              userName={userName}
              userAvatarId={userAvatarId}
              userProfilePic={userProfilePic}
            />
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
              {/* User Header - Mobile */}
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

              {/* Primary Navigation Links - Mobile */}
              {links.map((link, index) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                const displayLabel = link.label || (link.iconOnly ? "Dashboard" : "");
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
                          ? `bg-gradient-to-r ${currentRole.accentColor} text-white shadow-lg font-medium`
                          : "font-medium text-foreground hover:bg-muted"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className={cn("h-5 w-5", isActive && "animate-pulse")} />
                      <span>{displayLabel}</span>
                      {isActive && (
                        <span className="ml-auto h-2 w-2 rounded-full bg-white inline-block" />
                      )}
                    </Link>
                  </motion.div>
                );
              })}

              {/* Divider */}
              <div className="my-3 border-t border-border/50" />

              {/* Secondary Links - Mobile (Account & Safety) */}
              <MobileMenuSection
                title="Account"
                items={[
                  { href: "/profile", label: "Profile", icon: "user" },
                  { href: userRole === "EMPLOYER" ? "/employer/settings" : "/settings", label: "Settings", icon: "settings" },
                ]}
                pathname={pathname}
                currentRole={currentRole}
                onClose={() => setMobileMenuOpen(false)}
                delay={0.15 + links.length * 0.05}
              />

              {userRole === "YOUTH" && (
                <MobileMenuSection
                  title="Growth"
                  items={[
                    { href: "/goals", label: "My Goals", icon: "target" },
                  ]}
                  pathname={pathname}
                  currentRole={currentRole}
                  onClose={() => setMobileMenuOpen(false)}
                  delay={0.2 + links.length * 0.05}
                />
              )}

              <MobileMenuSection
                title="Safety"
                items={[
                  { href: "/legal/safety", label: "Health & Safety", icon: "help" },
                  { href: "/report", label: "Report a concern", icon: "flag" },
                ]}
                pathname={pathname}
                currentRole={currentRole}
                onClose={() => setMobileMenuOpen(false)}
                delay={0.25 + links.length * 0.05}
              />

              {/* Divider */}
              <div className="my-3 border-t border-border/50" />

              {/* Theme & Sign Out - Mobile */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + links.length * 0.05 }}
                className="space-y-1"
              >
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="flex w-full items-center space-x-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                  <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                </button>

                <button
                  className="flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-all"
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
