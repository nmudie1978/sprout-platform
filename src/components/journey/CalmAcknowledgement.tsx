'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { prefersReducedMotion, DURATION, PREMIUM_EASE } from '@/lib/motion';
import type { AcknowledgementMessage } from '@/lib/acknowledgements/messages';

interface CalmAcknowledgementProps {
  message: AcknowledgementMessage | null;
}

export function CalmAcknowledgement({ message }: CalmAcknowledgementProps) {
  const reduced = typeof window !== 'undefined' && prefersReducedMotion();

  return (
    <AnimatePresence>
      {message && (
        <motion.p
          key={message.id}
          role="status"
          aria-live="polite"
          className="text-sm text-muted-foreground/70 italic text-center py-2"
          initial={reduced ? undefined : { opacity: 0 }}
          animate={reduced ? undefined : { opacity: 1 }}
          exit={reduced ? undefined : { opacity: 0 }}
          transition={{
            duration: DURATION.section,
            ease: PREMIUM_EASE as unknown as string,
          }}
        >
          {message.text}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
