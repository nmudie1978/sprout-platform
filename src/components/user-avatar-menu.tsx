"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  User,
  Settings,
  HelpCircle,
  Flag,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  Bot,
  Route,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/avatar";
import Image from "next/image";

interface UserAvatarMenuProps {
  userRole: "YOUTH" | "EMPLOYER" | "ADMIN" | "COMMUNITY_GUARDIAN";
  userName?: string;
  userAvatarId?: string | null;
  userProfilePic?: string | null;
}

export function UserAvatarMenu({
  userRole,
  userName,
  userAvatarId,
  userProfilePic,
}: UserAvatarMenuProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const roleLabels = {
    YOUTH: "Youth",
    EMPLOYER: "Job Poster",
    ADMIN: "Admin",
    COMMUNITY_GUARDIAN: "Guardian",
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full p-1 hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20">
          {userRole === "YOUTH" && userAvatarId ? (
            <Avatar avatarId={userAvatarId} size="sm" />
          ) : userProfilePic ? (
            <Image
              src={userProfilePic}
              alt={userName || "Profile"}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
              {userName?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
          <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* User header */}
        <div className="flex items-center gap-3 p-3 border-b">
          {userRole === "YOUTH" && userAvatarId ? (
            <Avatar avatarId={userAvatarId} size="sm" />
          ) : userProfilePic ? (
            <Image
              src={userProfilePic}
              alt={userName || "Profile"}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
              {userName?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-medium truncate max-w-[150px]">
              {userName || "User"}
            </span>
            <span className="text-xs text-muted-foreground">
              {roleLabels[userRole]}
            </span>
          </div>
        </div>

        {/* ACCOUNT Section */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
            Account
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigateTo("/profile")} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          {userRole === "EMPLOYER" ? (
            <DropdownMenuItem onClick={() => navigateTo("/employer/settings")} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => navigateTo("/settings")} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* MY SPACE Section - Only for Youth */}
        {userRole === "YOUTH" && (
          <>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
                My Space
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigateTo("/my-journey")} className="cursor-pointer">
                <Route className="mr-2 h-4 w-4" />
                My Journey
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigateTo("/career-advisor")} className="cursor-pointer">
                <Bot className="mr-2 h-4 w-4" />
                AI Career Advisor
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
          </>
        )}

        {/* SAFETY Section */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
            Safety
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigateTo("/legal/safety")} className="cursor-pointer">
            <HelpCircle className="mr-2 h-4 w-4" />
            Health & Safety
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigateTo("/report")} className="cursor-pointer">
            <Flag className="mr-2 h-4 w-4" />
            Report a concern
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Theme toggle */}
        <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
          {theme === "dark" ? (
            <Sun className="mr-2 h-4 w-4" />
          ) : (
            <Moon className="mr-2 h-4 w-4" />
          )}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Log out */}
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/" })}
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
