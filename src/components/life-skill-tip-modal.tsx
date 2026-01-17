"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lightbulb, BookmarkPlus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LifeSkillTip {
  id: string;
  cardKey: string;
  title: string;
  body: string;
  tags: string[];
}

interface LifeSkillTipModalProps {
  isOpen: boolean;
  onClose: () => void;
  tip: LifeSkillTip | null;
}

export function LifeSkillTipModal({ isOpen, onClose, tip }: LifeSkillTipModalProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Reset saved state when modal opens with new tip
  useEffect(() => {
    if (isOpen && tip) {
      setSaved(false);
    }
  }, [isOpen, tip?.id]);

  const handleDismiss = async () => {
    if (!tip) return;

    try {
      await fetch("/api/life-skills/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recommendationId: tip.id,
          action: "dismiss",
        }),
      });
    } catch (error) {
      console.error("Failed to dismiss tip:", error);
    }

    onClose();
  };

  const handleSave = async () => {
    if (!tip || saving) return;

    setSaving(true);
    try {
      await fetch("/api/life-skills/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recommendationId: tip.id,
          action: "save",
        }),
      });
      setSaved(true);
      // Close after a brief moment to show the saved state
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (error) {
      console.error("Failed to save tip:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!tip) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={handleDismiss}
          />

          {/* Modal - bottom sheet style on mobile, centered on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 md:max-w-md w-full"
          >
            <div className="bg-background rounded-t-3xl md:rounded-3xl border-t md:border shadow-xl">
              {/* Handle bar for mobile */}
              <div className="flex justify-center pt-3 md:hidden">
                <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
              </div>

              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>

              {/* Content */}
              <div className="p-6 pt-4 md:pt-6">
                {/* Icon and title */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                    <Lightbulb className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{tip.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Quick tip</p>
                  </div>
                </div>

                {/* Body */}
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  {tip.body}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {tip.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleSave}
                    disabled={saving || saved}
                  >
                    {saved ? (
                      <>
                        <Check className="h-4 w-4 mr-2 text-green-600" />
                        Saved
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="h-4 w-4 mr-2" />
                        Save for later
                      </>
                    )}
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    onClick={handleDismiss}
                  >
                    Got it
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
