import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sprout, ArrowRight } from "lucide-react";

/**
 * HeroSection - Server component with CSS animations
 * Converted from framer-motion to CSS for faster initial load
 * No "use client" directive = zero JS shipped for this component
 */
export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b">
      <div className="container px-4 py-12 sm:py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center animate-fade-in-up">
          <div
            className="inline-flex items-center gap-2 rounded-full bg-green-100 dark:bg-green-900/30 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-green-700 dark:text-green-400 mb-4 sm:mb-6 animate-fade-in-scale animation-delay-200"
          >
            <Sprout className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Growth from Small Beginnings
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-4 sm:mb-6">
            Where Young Talent{" "}
            <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              Takes Root
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
            Sprout connects Norwegian neighborhoods with young talent. Find local micro-jobs,
            build real skills, and discover your career path—all in a safe, legally compliant platform for ages 15–20.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0 animate-fade-in-up animation-delay-400"
          >
            <Button size="lg" asChild className="bg-green-600 hover:bg-green-700 text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-11">
              <Link href="/auth/signup">
                Start Growing
                <Sprout className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-11">
              <Link href="/auth/signup?role=employer">
                Hire Young Talent
              </Link>
            </Button>
          </div>

          <div className="mt-6 animate-fade-in animation-delay-600">
            <Link
              href="/about"
              className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              Learn more about Sprout
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .animate-fade-in-scale {
          animation: fadeInScale 0.5s ease-out forwards;
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
        }

        .animation-delay-600 {
          animation-delay: 0.6s;
          opacity: 0;
        }
      `}</style>
    </section>
  );
}
