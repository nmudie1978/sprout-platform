import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sprout, ArrowRight } from "lucide-react";

/**
 * Hero Section Configuration
 * Update these values to easily swap the hero image without layout changes
 */
const HERO_IMAGE = {
  src: "/images/hero-youth-explorer.png",
  alt: "Young person with backpack standing at a crossroads, looking toward a bright horizon filled with career opportunity icons - signposts pointing to different paths, floating symbols of ideas, goals, and growth, representing youth exploring their future with confidence and guidance",
  // Aspect ratio helps maintain proportions during load
  width: 800,
  height: 1200,
};

/**
 * HeroSection - Server component with hero illustration
 * Features the primary landing page visual representing youth exploration and guidance
 * No "use client" directive = zero JS shipped for this component
 */
export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b bg-gradient-to-b from-transparent via-green-50/30 to-emerald-50/50 dark:from-transparent dark:via-green-950/10 dark:to-emerald-950/20">
      <div className="container px-4 py-8 sm:py-12 md:py-16 lg:py-20">
        {/* Mobile Layout: Image first, then content */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-8 xl:gap-12">

          {/* Hero Image - Mobile: Top, Desktop: Right */}
          <div className="lg:order-2 lg:flex-1 mb-6 lg:mb-0">
            <div className="relative mx-auto max-w-[200px] sm:max-w-[240px] md:max-w-[280px] lg:max-w-[320px] lg:ml-auto">
              {/* Soft glow effect behind image */}
              <div className="absolute inset-0 bg-gradient-radial from-green-200/40 via-emerald-100/20 to-transparent dark:from-green-900/20 dark:via-emerald-900/10 dark:to-transparent blur-3xl scale-125 -z-10" />

              {/* Frame container */}
              <div className="relative rounded-3xl bg-gradient-to-br from-white/80 via-green-50/60 to-emerald-100/40 dark:from-slate-800/60 dark:via-green-950/40 dark:to-emerald-950/30 p-3 sm:p-4 shadow-sm border border-green-200/30 dark:border-green-800/20">
                <Image
                  src={HERO_IMAGE.src}
                  alt={HERO_IMAGE.alt}
                  width={HERO_IMAGE.width}
                  height={HERO_IMAGE.height}
                  priority
                  quality={90}
                  className="w-full h-auto object-contain rounded-2xl"
                  sizes="(max-width: 640px) 200px, (max-width: 768px) 240px, (max-width: 1024px) 280px, 320px"
                />
              </div>
            </div>
          </div>

          {/* Content - Mobile: Below image, Desktop: Left */}
          <div className="lg:order-1 lg:flex-1 text-center lg:text-left animate-fade-in-up">
            <div
              className="inline-flex items-center gap-2 rounded-full bg-green-100 dark:bg-green-900/30 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-green-700 dark:text-green-400 mb-4 sm:mb-5 animate-fade-in-scale animation-delay-200"
            >
              <Sprout className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Your Path, Your Pace
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl mb-4 sm:mb-5">
              Discover Your{" "}
              <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                Direction
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-6 sm:mb-7 leading-relaxed">
              Not sure what comes next? Sprout helps you explore careers, find local gigs,
              and take small steps toward a future that fits you—no pressure, just real experience and guidance.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start animate-fade-in-up animation-delay-400"
            >
              <Button size="lg" asChild className="bg-green-600 hover:bg-green-700 text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-11 shadow-sm">
                <Link href="/auth/signup">
                  Start Exploring
                  <Sprout className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-11">
                <Link href="/careers">
                  Browse Careers
                </Link>
              </Button>
            </div>

            <div className="mt-5 sm:mt-6 animate-fade-in animation-delay-600">
              <Link
                href="/about"
                className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
              >
                Learn how Sprout works
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
