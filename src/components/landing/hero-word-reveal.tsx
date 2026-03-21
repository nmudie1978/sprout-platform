"use client";

import { type ReactNode } from "react";

/* -------------------------------------------------- */
/* CSS keyframes injected once per mount               */
/* -------------------------------------------------- */
function RevealStyles() {
  return (
    <style>{`
      @keyframes word-reveal {
        0% {
          opacity: 0;
          filter: blur(8px);
          transform: translateY(20px) scale(0.9);
        }
        100% {
          opacity: 1;
          filter: blur(0);
          transform: translateY(0) scale(1);
        }
      }
      @keyframes fade-reveal {
        0% { opacity: 0; transform: translateY(12px); }
        100% { opacity: 1; transform: translateY(0); }
      }

      .word-reveal-span {
        display: inline-block;
        opacity: 0;
        animation: word-reveal 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }
      .fade-reveal-block {
        opacity: 0;
        animation: fade-reveal 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }

      @media (prefers-reduced-motion: reduce) {
        .word-reveal-span,
        .fade-reveal-block {
          animation: none !important;
          opacity: 1 !important;
          filter: none !important;
          transform: none !important;
        }
      }
    `}</style>
  );
}

/* -------------------------------------------------- */
/* WordRevealLine                                      */
/* Splits text into per-word <span>s with stagger      */
/* -------------------------------------------------- */
interface WordRevealLineProps {
  text: string;
  startDelay: number; // ms
  wordDelay?: number; // ms between each word (default 120)
  className?: string;
  /** Render function for a word — allows wrapping individual words in styled spans */
  renderWord?: (word: string, index: number) => ReactNode;
}

export function WordRevealLine({
  text,
  startDelay,
  wordDelay = 120,
  className,
  renderWord,
}: WordRevealLineProps) {
  const words = text.split(" ");

  return (
    <>
      <RevealStyles />
      <span className={className}>
        {words.map((word, i) => (
          <span
            key={i}
            className="word-reveal-span"
            style={{ animationDelay: `${startDelay + i * wordDelay}ms` }}
          >
            {renderWord ? renderWord(word, i) : word}
            {i < words.length - 1 ? "\u00A0" : ""}
          </span>
        ))}
      </span>
    </>
  );
}

/* -------------------------------------------------- */
/* FadeReveal                                          */
/* Block-level fade for paragraphs / CTAs              */
/* -------------------------------------------------- */
interface FadeRevealProps {
  delay: number; // ms
  duration?: number; // ms (default 700)
  className?: string;
  children: ReactNode;
}

export function FadeReveal({
  delay,
  duration = 700,
  className,
  children,
}: FadeRevealProps) {
  return (
    <>
      <RevealStyles />
      <div
        className={`fade-reveal-block ${className ?? ""}`}
        style={{
          animationDelay: `${delay}ms`,
          animationDuration: `${duration}ms`,
        }}
      >
        {children}
      </div>
    </>
  );
}
