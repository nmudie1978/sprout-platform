"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { LifeSkillTipModal } from "./life-skill-tip-modal";

interface LifeSkillTip {
  id: string;
  cardKey: string;
  title: string;
  body: string;
  tags: string[];
  source: string;
  reason: string | null;
  createdAt: string;
}

interface LifeSkillsContextType {
  pendingTip: LifeSkillTip | null;
  showTip: () => void;
  dismissTip: () => void;
  refreshRecommendations: () => Promise<void>;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => Promise<void>;
}

const LifeSkillsContext = createContext<LifeSkillsContextType | null>(null);

export function useLifeSkills() {
  const context = useContext(LifeSkillsContext);
  if (!context) {
    throw new Error("useLifeSkills must be used within a LifeSkillsProvider");
  }
  return context;
}

interface LifeSkillsProviderProps {
  children: ReactNode;
}

export function LifeSkillsProvider({ children }: LifeSkillsProviderProps) {
  const { data: session, status } = useSession();
  const [pendingTip, setPendingTip] = useState<LifeSkillTip | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [hasCheckedInitial, setHasCheckedInitial] = useState(false);

  // Only fetch for authenticated youth users
  const shouldFetch = status === "authenticated" && session?.user?.role === "YOUTH";

  // Fetch user's preference
  const fetchPreference = useCallback(async () => {
    if (!shouldFetch) return;

    try {
      const response = await fetch("/api/life-skills/preferences");
      if (response.ok) {
        const data = await response.json();
        setIsEnabled(data.showLifeSkills);
      }
    } catch (error) {
      console.error("Failed to fetch life skills preference:", error);
    }
  }, [shouldFetch]);

  // Fetch pending recommendations
  const refreshRecommendations = useCallback(async () => {
    if (!shouldFetch || !isEnabled) {
      setPendingTip(null);
      return;
    }

    try {
      const response = await fetch("/api/life-skills/recommendations");
      if (response.ok) {
        const data = await response.json();
        if (data.recommendations && data.recommendations.length > 0) {
          setPendingTip(data.recommendations[0]);
        } else {
          setPendingTip(null);
        }
      }
    } catch (error) {
      console.error("Failed to fetch life skills recommendations:", error);
    }
  }, [shouldFetch, isEnabled]);

  // Initial fetch on mount
  useEffect(() => {
    if (shouldFetch && !hasCheckedInitial) {
      setHasCheckedInitial(true);
      fetchPreference().then(() => {
        // Small delay before showing tip to not interrupt page load
        setTimeout(() => {
          refreshRecommendations();
        }, 2000);
      });
    }
  }, [shouldFetch, hasCheckedInitial, fetchPreference, refreshRecommendations]);

  // Auto-show tip when one becomes available (with delay)
  useEffect(() => {
    if (pendingTip && !isModalOpen && isEnabled) {
      // Mark as shown and display
      fetch("/api/life-skills/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recommendationId: pendingTip.id,
          action: "shown",
        }),
      }).catch(console.error);

      setIsModalOpen(true);
    }
  }, [pendingTip, isModalOpen, isEnabled]);

  const showTip = useCallback(() => {
    if (pendingTip) {
      setIsModalOpen(true);
    }
  }, [pendingTip]);

  const dismissTip = useCallback(() => {
    setIsModalOpen(false);
    setPendingTip(null);
  }, []);

  const setEnabledPref = useCallback(async (enabled: boolean) => {
    try {
      const response = await fetch("/api/life-skills/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showLifeSkills: enabled }),
      });

      if (response.ok) {
        setIsEnabled(enabled);
        if (!enabled) {
          setPendingTip(null);
          setIsModalOpen(false);
        } else {
          // Fetch recommendations when re-enabled
          refreshRecommendations();
        }
      }
    } catch (error) {
      console.error("Failed to update life skills preference:", error);
    }
  }, [refreshRecommendations]);

  const value: LifeSkillsContextType = {
    pendingTip,
    showTip,
    dismissTip,
    refreshRecommendations,
    isEnabled,
    setEnabled: setEnabledPref,
  };

  return (
    <LifeSkillsContext.Provider value={value}>
      {children}
      <LifeSkillTipModal
        isOpen={isModalOpen}
        onClose={dismissTip}
        tip={pendingTip}
      />
    </LifeSkillsContext.Provider>
  );
}
