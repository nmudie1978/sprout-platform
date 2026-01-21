"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import {
  Compass,
  TrendingUp,
  Eye,
  Briefcase,
  ChevronRight,
} from "lucide-react";

interface ExploreLink {
  href: string;
  label: string;
  description: string;
  icon: typeof Compass;
  color: string;
}

const exploreLinks: ExploreLink[] = [
  {
    href: "/careers",
    label: "Explore careers",
    description: "See what paths interest you",
    icon: Compass,
    color: "text-purple-500",
  },
  {
    href: "/insights",
    label: "Industry insights",
    description: "Learn about different fields",
    icon: TrendingUp,
    color: "text-blue-500",
  },
  {
    href: "/shadows",
    label: "Career shadows",
    description: "Experience workplaces firsthand",
    icon: Eye,
    color: "text-indigo-500",
  },
  {
    href: "/jobs",
    label: "Small jobs",
    description: "Find opportunities near you",
    icon: Briefcase,
    color: "text-emerald-500",
  },
];

export function ExploreWhenReady() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <h2 className="text-sm font-medium text-muted-foreground mb-3">
        Explore when you're ready
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {exploreLinks.map((link, index) => {
          const Icon = link.icon;
          return (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
            >
              <Link href={link.href}>
                <Card className="border bg-card/50 hover:bg-muted/50 hover:border-muted-foreground/20 transition-all group cursor-pointer h-full">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`${link.color} mt-0.5`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground group-hover:text-foreground/90">
                          {link.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {link.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default ExploreWhenReady;
