'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const STORAGE_KEY = 'endeavrly-welcome-seen';

export function WelcomeHero() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) !== 'true') {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/[0.06] to-transparent p-5 sm:p-6 mb-6"
        >
          <button
            onClick={dismiss}
            className="absolute top-3 right-3 p-1 rounded-md text-muted-foreground/40 hover:text-muted-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>

          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-2 pr-6">
            You don't need to have it all figured out.
          </h2>
          <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-lg">
            Most people your age are still exploring — and that's exactly the right place to be.
            This is a space to learn about yourself, explore what's out there, and move forward one step at a time.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
