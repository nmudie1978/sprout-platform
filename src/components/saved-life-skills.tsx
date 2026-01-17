"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, BookmarkX, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SavedCard {
  viewId: string;
  cardKey: string;
  title: string;
  body: string;
  tags: string[];
  savedAt: string;
}

export function SavedLifeSkills() {
  const { data: session, status } = useSession();
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isYouth = session?.user?.role === "YOUTH";
  const isAuthenticated = status === "authenticated";

  useEffect(() => {
    if (isAuthenticated && isYouth) {
      fetchSavedCards();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, isYouth]);

  const fetchSavedCards = async () => {
    try {
      const response = await fetch("/api/life-skills/saved");
      if (response.ok) {
        const data = await response.json();
        setSavedCards(data.savedCards || []);
      } else {
        setError("Failed to load saved tips");
      }
    } catch (err) {
      setError("Failed to load saved tips");
    } finally {
      setLoading(false);
    }
  };

  // Don't show for non-youth users
  if (!isYouth) {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {error}
        </CardContent>
      </Card>
    );
  }

  if (savedCards.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Saved Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="p-3 rounded-full bg-muted w-fit mx-auto mb-3">
            <Lightbulb className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            No saved tips yet. When you see a helpful tip, tap &quot;Save for later&quot; to keep it here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Saved Tips
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence>
          {savedCards.map((card, index) => (
            <motion.div
              key={card.viewId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-lg border bg-gradient-to-br from-amber-500/5 to-orange-500/5"
            >
              <h4 className="font-semibold text-sm mb-2">{card.title}</h4>
              <p className="text-sm text-muted-foreground mb-3">{card.body}</p>
              <div className="flex flex-wrap gap-1.5">
                {card.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
