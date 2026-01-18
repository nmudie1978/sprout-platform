"use client";

import { memo } from "react";

/**
 * AnimatedBackground - CSS-only version for better performance
 * Uses CSS animations instead of framer-motion to reduce JS bundle and improve LCP
 */
export const AnimatedBackground = memo(function AnimatedBackground() {
  return (
    <>
      {/* Animated Background - CSS-only animations (hidden on mobile for performance) */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none hidden sm:block">
        {/* Animated gradient blobs using CSS animations */}
        <div
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-green-400/25 via-emerald-300/20 to-transparent blur-3xl animate-blob"
        />
        <div
          className="absolute top-1/4 -left-32 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-teal-400/20 via-cyan-300/15 to-transparent blur-3xl animate-blob animation-delay-2000"
        />
        <div
          className="absolute bottom-1/4 right-1/3 w-[350px] h-[350px] rounded-full bg-gradient-to-tl from-emerald-400/20 via-green-300/15 to-transparent blur-3xl animate-blob animation-delay-4000"
        />

        {/* Subtle grid pattern - static for performance */}
        <div
          className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.08)_1px,transparent_1px)] bg-[size:40px_40px] opacity-60"
        />
      </div>

      {/* Floating dots - CSS animations only, reduced count for performance */}
      <div className="fixed inset-0 z-[1] overflow-hidden pointer-events-none hidden sm:block">
        <div className="absolute left-[5%] top-[20%] w-2 h-2 rounded-full bg-green-500/30 animate-float" />
        <div className="absolute left-[8%] top-[50%] w-3 h-3 rounded-full bg-emerald-500/25 animate-float animation-delay-1000" />
        <div className="absolute right-[5%] top-[30%] w-2 h-2 rounded-full bg-teal-500/30 animate-float animation-delay-2000" />
        <div className="absolute right-[8%] top-[60%] w-3 h-3 rounded-full bg-green-500/25 animate-float animation-delay-3000" />
      </div>

      {/* CSS for animations - injected via style tag for self-contained component */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(20px, -20px) scale(1.05);
          }
          66% {
            transform: translate(-10px, 10px) scale(0.95);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) scale(1.1);
            opacity: 0.5;
          }
        }

        .animate-blob {
          animation: blob 12s ease-in-out infinite;
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-3000 {
          animation-delay: 3s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  );
});
