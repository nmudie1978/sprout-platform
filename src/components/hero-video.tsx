"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * HeroVideo Component
 *
 * A responsive, accessible video player designed for hero sections.
 *
 * Features:
 * - Responsive 16:9 container
 * - Lazy loading for performance (no auto-download)
 * - Play button overlay with tap-to-play on mobile
 * - Keyboard accessible (Space/Enter to play/pause)
 * - Respects reduced-motion preferences
 * - Supports captions/subtitles via tracks prop
 * - Poster image for LCP optimization
 * - aria-labels for screen readers
 */

interface VideoTrack {
  src: string;
  kind: "subtitles" | "captions";
  srcLang: string;
  label: string;
  default?: boolean;
}

interface HeroVideoProps {
  /** Video source URL (MP4 or hosted video URL) */
  src: string;
  /** Poster image URL shown before video loads */
  poster?: string;
  /** Optional caption/subtitle tracks */
  tracks?: VideoTrack[];
  /** Accessible label for the video */
  ariaLabel?: string;
  /** Optional caption text below the video */
  caption?: string;
}

export function HeroVideo({
  src,
  poster,
  tracks = [],
  ariaLabel = "Explainer video",
  caption,
}: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State for video controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Lazy loading: Only load video when container is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px", threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Handle play/pause
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
      setHasInteracted(true);
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Handle mute/unmute
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  // Keyboard accessibility
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        toggleMute();
      }
    },
    [togglePlay, toggleMute]
  );

  // Sync state when video ends
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => setIsPlaying(false);
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    video.addEventListener("ended", handleEnded);
    video.addEventListener("pause", handlePause);
    video.addEventListener("play", handlePlay);

    return () => {
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("play", handlePlay);
    };
  }, [isVisible]);

  return (
    <div className="w-full max-w-xs sm:max-w-sm mx-auto px-4">
      {/* Video Container - 16:9 aspect ratio */}
      <div
        ref={containerRef}
        className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-lg sm:shadow-xl"
        style={{ aspectRatio: "16 / 9" }}
      >
        {/* Video element - only rendered when visible (lazy load) */}
        {isVisible && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            poster={poster}
            preload="none"
            playsInline
            aria-label={ariaLabel}
            tabIndex={0}
            onKeyDown={handleKeyDown}
          >
            <source src={src} type="video/mp4" />
            {/* Subtitle/caption tracks */}
            {tracks.map((track, index) => (
              <track
                key={index}
                src={track.src}
                kind={track.kind}
                srcLang={track.srcLang}
                label={track.label}
                default={track.default}
              />
            ))}
            Your browser does not support the video tag.
          </video>
        )}

        {/* Poster fallback before lazy load */}
        {!isVisible && poster && (
          <img
            src={poster}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            aria-hidden="true"
          />
        )}

        {/* Play Button Overlay */}
        <AnimatePresence>
          {!isPlaying && (
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
              className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px]"
            >
              <button
                onClick={togglePlay}
                onKeyDown={handleKeyDown}
                aria-label="Play video"
                className="group relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/95 dark:bg-slate-900/95 shadow-xl hover:scale-105 active:scale-95 transition-transform focus:outline-none focus:ring-4 focus:ring-green-500/50 focus:ring-offset-2 focus:ring-offset-transparent"
              >
                <Play
                  className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-500 ml-1 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors"
                  fill="currentColor"
                />
                {/* Pulsing ring animation (respects reduced motion) */}
                {!prefersReducedMotion && (
                  <span className="absolute inset-0 rounded-full border-2 border-green-500/50 animate-ping" />
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video Controls - shown after first interaction */}
        <AnimatePresence>
          {hasInteracted && isPlaying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/60 to-transparent"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Play/Pause button */}
                <button
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Pause video" : "Play video"}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  ) : (
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" />
                  )}
                </button>

                {/* Mute/Unmute button */}
                <button
                  onClick={toggleMute}
                  aria-label={isMuted ? "Unmute video" : "Mute video"}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  ) : (
                    <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  )}
                </button>

                {/* Keyboard hint */}
                <span className="hidden sm:block ml-auto text-xs text-white/70">
                  Press Space to play/pause • M to mute
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Click overlay for pausing when playing */}
        {isPlaying && (
          <button
            onClick={togglePlay}
            aria-label="Pause video"
            className="absolute inset-0 w-full h-full cursor-pointer focus:outline-none"
          />
        )}
      </div>

      {/* Optional caption below video */}
      {caption && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-center text-sm sm:text-base text-muted-foreground px-2"
        >
          {caption}
        </motion.p>
      )}
    </div>
  );
}
