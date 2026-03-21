'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  /** Top/bottom border gradient color */
  horizontalColor?: string;
  /** Left/right border gradient color */
  verticalColor?: string;
  /** Animation speed multiplier (default 0.5) */
  speed?: number;
  /** Show decorative corner dots */
  showDots?: boolean;
  /** Show decorative glow blurs */
  showGlow?: boolean;
}

const AnimatedCard = ({
  children,
  className,
  horizontalColor = 'via-purple-500/50',
  verticalColor = 'via-blue-500/50',
  speed = 0.5,
  showDots = false,
  showGlow = false,
}: AnimatedCardProps) => {
  const topRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationId: number;

    const animateBorder = () => {
      const now = Date.now() / 1000;

      const topX = Math.sin(now * speed) * 100;
      const rightY = Math.cos(now * speed) * 100;
      const bottomX = Math.sin(now * speed + Math.PI) * 100;
      const leftY = Math.cos(now * speed + Math.PI) * 100;

      if (topRef.current) topRef.current.style.transform = `translateX(${topX}%)`;
      if (rightRef.current) rightRef.current.style.transform = `translateY(${rightY}%)`;
      if (bottomRef.current) bottomRef.current.style.transform = `translateX(${bottomX}%)`;
      if (leftRef.current) leftRef.current.style.transform = `translateY(${leftY}%)`;

      animationId = requestAnimationFrame(animateBorder);
    };

    // Respect prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!mediaQuery.matches) {
      animationId = requestAnimationFrame(animateBorder);
    }

    return () => cancelAnimationFrame(animationId);
  }, [speed]);

  return (
    <div
      className={cn(
        'relative rounded-2xl overflow-hidden',
        className
      )}
    >
      {/* Animated border elements */}
      <div className="absolute top-0 left-0 w-full h-0.5 overflow-hidden pointer-events-none z-10">
        <div
          ref={topRef}
          className={cn(
            'absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent to-transparent',
            horizontalColor
          )}
        />
      </div>

      <div className="absolute top-0 right-0 w-0.5 h-full overflow-hidden pointer-events-none z-10">
        <div
          ref={rightRef}
          className={cn(
            'absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-transparent',
            verticalColor
          )}
        />
      </div>

      <div className="absolute bottom-0 left-0 w-full h-0.5 overflow-hidden pointer-events-none z-10">
        <div
          ref={bottomRef}
          className={cn(
            'absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent to-transparent',
            horizontalColor
          )}
        />
      </div>

      <div className="absolute top-0 left-0 w-0.5 h-full overflow-hidden pointer-events-none z-10">
        <div
          ref={leftRef}
          className={cn(
            'absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-transparent',
            verticalColor
          )}
        />
      </div>

      {/* Decorative corner dots */}
      {showDots && (
        <>
          <div className={cn('absolute top-4 right-4 w-2.5 h-2.5 rounded-full animate-pulse pointer-events-none z-10', horizontalColor.replace('via-', 'bg-').replace('/50', ''))} />
          <div className={cn('absolute bottom-4 left-4 w-2.5 h-2.5 rounded-full animate-pulse pointer-events-none z-10', verticalColor.replace('via-', 'bg-').replace('/50', ''))} />
        </>
      )}

      {/* Decorative glow blurs */}
      {showGlow && (
        <>
          <div className={cn('absolute -top-20 -right-20 w-40 h-40 rounded-full blur-xl pointer-events-none', horizontalColor.replace('via-', 'bg-').replace('/50', '/10'))} />
          <div className={cn('absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-xl pointer-events-none', verticalColor.replace('via-', 'bg-').replace('/50', '/10'))} />
        </>
      )}

      {/* Content */}
      <div className="relative z-[1]">
        {children}
      </div>
    </div>
  );
};

export default AnimatedCard;
export { AnimatedCard, type AnimatedCardProps };
