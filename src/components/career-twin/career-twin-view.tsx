"use client";

/**
 * Career Twin — "AI Future Self" experience.
 *
 * Lets a user talk to ONE POSSIBLE future version of themselves in a
 * selected career. Loads a deterministic persona from /api/career-twin,
 * offers conversation modes + starter questions, and lets the user save an
 * insight to My Library or (after explicit confirmation) add an AI-suggested
 * next step to My Journey. Everything is framed as a simulation, never a
 * prediction.
 */
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useTranslations } from "next-intl";
// Analytics removed — no third-party tracking (see Cookie Policy). This
// local no-op keeps the former call sites compiling while emitting nothing.
const track = (..._args: unknown[]): void => {};
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { markTwinAsked } from "@/lib/career-twin/asked-signal";
import { motion, AnimatePresence } from "framer-motion";
import { ExperienceRunner } from "./experience-runner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Send,
  Loader2,
  Compass,
  Radar,
  ShieldAlert,
  Flag,
  Volume2,
  Square,
  User as UserIcon,
  Info,
} from "lucide-react";
import { ReportModal } from "@/components/report-modal";

interface ModeDef {
  id: string;
  label: string;
  description: string;
  starterQuestions: string[];
}

interface TwinMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface CareerInfo {
  id: string;
  title: string;
  emoji: string | null;
}

export function CareerTwinView({
  initialCareerId,
  embedded = false,
}: {
  initialCareerId?: string | null;
  /** Rendered inside My Journey → Clarity: calmer chrome, no goal controls. */
  embedded?: boolean;
}) {
  const t = useTranslations("careerTwin");

  const [loading, setLoading] = useState(true);
  const [needsCareer, setNeedsCareer] = useState(false);
  const [career, setCareer] = useState<CareerInfo | null>(null);
  const [intro, setIntro] = useState("");
  const [opener, setOpener] = useState<{ text: string; question: string | null } | null>(null);
  const [contextStarters, setContextStarters] = useState<string[]>([]);
  const [isSparse, setIsSparse] = useState(false);
  const [modes, setModes] = useState<ModeDef[]>([]);
  const [modeId, setModeId] = useState<string>("ask_future_me");
  const [experienceActive, setExperienceActive] = useState(false);
  const [messages, setMessages] = useState<TwinMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  // Id of the assistant message currently streaming in (null when idle). While
  // a message is streaming we hide the "thinking" indicator — the live bubble
  // is the indicator.
  const [streamingId, setStreamingId] = useState<string | null>(null);
  // Cache the Twin GET (persona/modes/opener/history — ~12 DB queries) so
  // re-opening the Twin sub-tab is instant instead of re-querying every time.
  const queryClient = useQueryClient();
  const twinGetKey = useMemo(
    () => ["career-twin-get", initialCareerId ?? null] as const,
    [initialCareerId],
  );
  const [returningDays, setReturningDays] = useState<number | null>(null);
  // Opt-in text-to-speech ("Listen") — browser SpeechSynthesis only, no deps,
  // no network, no cost. Tracks which message is currently being read.
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const ttsSupported =
    typeof window !== "undefined" && typeof window.speechSynthesis !== "undefined";

  const scrollRef = useRef<HTMLDivElement>(null);

  // Stop any in-flight speech when the component unmounts (e.g. tab switch).
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleSpeak = useCallback(
    (id: string, text: string) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      const synth = window.speechSynthesis;
      // Toggle off if this message is already being read.
      if (speakingId === id) {
        synth.cancel();
        setSpeakingId(null);
        return;
      }
      synth.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1;
      utter.onend = () => setSpeakingId((cur) => (cur === id ? null : cur));
      utter.onerror = () => setSpeakingId((cur) => (cur === id ? null : cur));
      setSpeakingId(id);
      synth.speak(utter);
    },
    [speakingId],
  );

  // Load persona + modes for the resolved career. Served through React Query's
  // cache (staleTime 5min) so re-opening the Twin within the session skips the
  // server's ~12 DB queries and renders instantly. Only show the full-card
  // spinner when there's nothing cached yet.
  useEffect(() => {
    let cancelled = false;
    if (!queryClient.getQueryData(twinGetKey)) setLoading(true);
    queryClient
      .fetchQuery({
        queryKey: twinGetKey,
        queryFn: async () => {
          const qs = initialCareerId ? `?careerId=${encodeURIComponent(initialCareerId)}` : "";
          const r = await fetch(`/api/career-twin${qs}`);
          return r.json();
        },
        staleTime: 5 * 60 * 1000,
      })
      .then((data) => {
        if (cancelled) return;
        if (data.needsCareer || !data.career) {
          setNeedsCareer(true);
          return;
        }
        setCareer(data.career);
        setIntro(data.intro ?? data.persona?.intro ?? "");
        // Proactive, personalised opener (server-built, deterministic). Only
        // shown when the user has no prior conversation for this career — once
        // a real chat exists, that history leads instead.
        if (data.opener?.text) {
          setOpener({ text: data.opener.text, question: data.opener.question ?? null });
        }
        // Context-aware starter chips (server-built, deterministic). Empty for
        // brand-new users → we fall back to the generic mode starters below.
        if (Array.isArray(data.contextStarters)) {
          setContextStarters(data.contextStarters.filter((q: unknown): q is string => typeof q === "string"));
        }
        setIsSparse(
          !data.persona?.strengthsAssumedFromProfile ||
            data.persona.strengthsAssumedFromProfile.length === 0,
        );
        setModes(data.modes ?? []);
        if (Array.isArray(data.history) && data.history.length > 0) {
          setMessages(
            data.history.map((m: { role: "user" | "assistant"; content: string }, i: number) => ({
              id: `hist-${i}`,
              role: m.role,
              content: m.content,
            })),
          );
          // A prior question (this/another device) satisfies the Clarity
          // "ask Future Me" step — seed the signal from server history.
          if (data.history.some((m: { role: string }) => m.role === "user")) {
            markTwinAsked(data.career.id);
          }
        }
        if (data.checkIn?.returning) {
          setReturningDays(data.checkIn.daysSinceLastVisit ?? null);
        }
        track("career_twin_opened", { career: data.career.title });
        track("career_twin_persona_created", { career: data.career.title });
      })
      .catch(() => {
        if (!cancelled) setNeedsCareer(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initialCareerId, queryClient, twinGetKey]);

  // Load the user's current Primary Goal so we can show whether THIS career
  // is already their goal (and warn before replacing a different one).
  const activeMode = useMemo(
    () => modes.find((m) => m.id === modeId) ?? modes[0],
    [modes, modeId],
  );
  const suggested = activeMode?.starterQuestions ?? [];

  // Keep the latest message in view by scrolling the chat's OWN container —
  // not scrollIntoView, which scrolls every ancestor (including the page) and
  // yanked the whole Clarity tab to the bottom when a question was asked.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, sending]);

  const selectMode = (id: string) => {
    setExperienceActive(false);
    setModeId(id);
    track("career_twin_mode_selected", { mode: id });
  };

  const launchExperience = useCallback(() => {
    setExperienceActive(true);
    if (career) track("career_twin_experience_opened", { career: career.title });
  }, [career]);

  // Empty-state starter chips: lead with the context-aware ones (only on the
  // default "Ask Future Me" mode, where they fit), then the active mode's
  // generic starters. The opener's reflective question still leads when present.
  const emptyStateChips = useMemo(() => {
    const ctx = modeId === "ask_future_me" ? contextStarters : [];
    const base = opener?.question
      ? [opener.question, ...suggested.filter((q) => q !== opener.question)]
      : suggested;
    const seen = new Set<string>();
    return [...ctx, ...base].filter((q) => {
      if (seen.has(q)) return false;
      seen.add(q);
      return true;
    });
  }, [modeId, contextStarters, opener, suggested]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || sending || !career) return;

      const userMsg: TwinMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmed,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setSending(true);
      // The user has now asked Future Me a question — this satisfies the
      // Clarity completion checklist (recorded even if the reply later fails).
      markTwinAsked(career.id);
      track("career_twin_message_sent", { mode: modeId, career: career.title });

      const defaultMsg =
        "I'm here — ask me anything about this path, and remember it's just one possible version of your future.";
      let assistantId: string | null = null;
      const upsertAssistant = (content: string) => {
        if (assistantId === null) {
          assistantId = `a-${Date.now()}`;
          const id = assistantId;
          setStreamingId(id);
          setMessages((prev) => [...prev, { id, role: "assistant", content }]);
        } else {
          const id = assistantId;
          setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, content } : m)));
        }
      };

      try {
        const res = await fetch("/api/career-twin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            careerId: career.id,
            mode: modeId,
            message: trimmed,
          }),
        });

        // Non-streaming control responses (auth, rate limit, fallback,
        // needsCareer) still come back as plain JSON — render them as one bubble.
        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("ndjson")) {
          const data = await res.json();
          upsertAssistant(data.message || defaultMsg);
          return;
        }

        // Streaming NDJSON: each line is {delta} | {replace} | {done}.
        const reader = res.body?.getReader();
        if (!reader) {
          upsertAssistant(defaultMsg);
          return;
        }
        const decoder = new TextDecoder();
        let buf = "";
        let acc = "";
        // Server emits {done} only when it persisted the turn (a {replace}
        // fallback is NOT persisted). Mirror that into the cached GET history so
        // a quick re-open shows this turn without a refetch.
        let persistedTurn = false;
        const handleLine = (line: string) => {
          const trimmedLine = line.trim();
          if (!trimmedLine) return;
          let obj: { delta?: string; replace?: string; done?: boolean };
          try {
            obj = JSON.parse(trimmedLine);
          } catch {
            return;
          }
          if (typeof obj.delta === "string") {
            acc += obj.delta;
            upsertAssistant(acc);
          } else if (typeof obj.replace === "string") {
            acc = obj.replace;
            upsertAssistant(acc);
          } else if (obj.done) {
            persistedTurn = true;
          }
        };
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const line of lines) handleLine(line);
        }
        if (buf) handleLine(buf);
        // Stream ended without ever producing content (e.g. the body closed
        // early) — make sure the user isn't left with no reply.
        if (assistantId === null) upsertAssistant(defaultMsg);
        if (persistedTurn && acc) {
          queryClient.setQueryData(twinGetKey, (old: unknown) => {
            const prev = old as { history?: { role: string; content: string }[] } | undefined;
            if (!prev || !Array.isArray(prev.history)) return old;
            return {
              ...prev,
              history: [
                ...prev.history,
                { role: "user", content: trimmed },
                { role: "assistant", content: acc },
              ],
            };
          });
        }
      } catch {
        upsertAssistant(
          "Something glitched on my end — try asking again in a moment. (And remember, this is one possible future, not a promise.)",
        );
      } finally {
        setStreamingId(null);
        setSending(false);
      }
    },
    [career, modeId, sending, queryClient, twinGetKey],
  );

  // ── Loading ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Card className="border-2">
        <CardContent className="py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">{t("loading")}</p>
        </CardContent>
      </Card>
    );
  }

  // ── Empty state: no career selected ──────────────────────────────────
  if (needsCareer || !career) {
    return (
      <Card className="border-2">
        <CardContent className="py-14 text-center">
          <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-teal-500/20 w-fit mx-auto mb-5">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">{t("emptyTitle")}</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">{t("emptyBody")}</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/careers">
              <Button className="bg-gradient-to-r from-primary to-teal-600">
                <Compass className="h-4 w-4 mr-2" />
                {t("exploreCareers")}
              </Button>
            </Link>
            <Link href="/careers?radar=1">
              <Button variant="outline">
                <Radar className="h-4 w-4 mr-2" />
                {t("useRadar")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Main experience ──────────────────────────────────────────────────
  // Accent: embedded in Clarity ("Ask Future Me") the Twin adopts the
  // section's amber/orange accent; standalone (Career Advisor) keeps the
  // teal brand accent.
  const accentGradient = embedded
    ? "bg-gradient-to-br from-amber-500 to-orange-600"
    : "bg-gradient-to-br from-primary to-teal-600";
  const accentGradientR = embedded
    ? "bg-gradient-to-r from-amber-500 to-orange-600"
    : "bg-gradient-to-r from-primary to-teal-600";
  const accentChipActive = embedded
    ? "bg-amber-500 text-white border-amber-500"
    : "bg-primary text-primary-foreground border-primary";
  const accentHoverBorder = embedded ? "hover:border-amber-500/50" : "hover:border-primary/50";
  const accentFocusBorder = embedded ? "focus:border-amber-500" : "focus:border-primary";
  const accentHoverText = embedded ? "hover:text-amber-500" : "hover:text-primary";
  const accentSoftBg = embedded ? "bg-amber-500/5" : "bg-primary/5";
  const accentSpinner = embedded ? "text-amber-500" : "text-primary";

  return (
    <div className="space-y-4">
      {/* Header card */}
      <Card className={cn("overflow-hidden", embedded ? "border" : "border-2")}>
        <div className={cn("px-4 py-4 sm:px-6", !embedded && "bg-gradient-to-r from-primary/10 to-teal-500/10")}>
          {!embedded ? (
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-primary to-teal-600 shrink-0">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-lg leading-tight">
                  {career.emoji ? `${career.emoji} ` : ""}
                  {career.title}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">{t("subtitle")}</p>
              </div>
            </div>
          ) : (
            // Embedded in Clarity: the tab already reads "Ask Future Me", so keep
            // it calm — just a small career badge, no loud header.
            <Badge variant="secondary" className="shrink-0">
              {career.emoji ? `${career.emoji} ` : ""}
              {career.title}
            </Badge>
          )}

          {/* Future-self intro */}
          {intro && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-2xl bg-background/70 border px-4 py-3 text-sm leading-relaxed"
            >
              {intro}
              {isSparse && (
                <p className="mt-2 text-xs text-muted-foreground italic">{t("generalNote")}</p>
              )}
            </motion.div>
          )}

        </div>

        {/* AI disclosure. Embedded in Clarity ("Ask Future Me") it's a single
            calm, muted line to keep the surface clean; the standalone Career
            Twin page keeps the fuller amber reality-check banner. Both preserve
            the AI-generated / not-careers-advice disclosure. */}
        {embedded ? (
          <p className="flex items-center gap-1.5 px-4 sm:px-6 py-2 text-[11px] text-muted-foreground/70">
            <Info className="h-3 w-3 shrink-0" />
            {t("disclaimerShort")}
          </p>
        ) : (
          <div className="flex items-start gap-2 px-4 sm:px-6 py-2.5 border-y bg-amber-50 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-900/40">
            <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-xs text-amber-800 dark:text-amber-300">
              <span className="font-semibold">{t("realityCheck")}: </span>
              {t("disclaimer")}
            </p>
          </div>
        )}

        {/* Mode chips */}
        <div className="px-4 sm:px-6 pt-3">
          <p className="text-xs font-medium text-muted-foreground mb-2">{t("modesLabel")}</p>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 [scrollbar-width:thin]">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => selectMode(m.id)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  !experienceActive && m.id === modeId
                    ? accentChipActive
                    : `bg-background ${accentHoverBorder}`
                }`}
              >
                {m.label}
              </button>
            ))}
            {/* Experience The Job — swaps the chat for the guided scenario runner. */}
            <button
              onClick={launchExperience}
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                experienceActive ? accentChipActive : `bg-background ${accentHoverBorder}`
              }`}
            >
              <Compass className="h-3 w-3" />
              Experience the job
            </button>
          </div>
        </div>

        {experienceActive ? (
          <div className="px-4 sm:px-6 py-4">
            <ExperienceRunner careerId={career.id} careerTitle={career.title} />
          </div>
        ) : (
        <>
        {/* Chat area — height trimmed ~20% (420→336px) when embedded in
            Clarity so the tab reads more compact; standalone keeps 420px. */}
        <div ref={scrollRef} className={cn(
          "overflow-y-auto px-4 sm:px-6 py-4 space-y-4 bg-gradient-to-b from-background to-muted/20",
          embedded ? "h-[336px]" : "h-[420px]",
        )}>
          {/* The proactive opener already greets a returning user warmly, so
              only show the standalone welcome-back banner when there's no
              opener (avoids a redundant double greeting). */}
          {returningDays != null && !opener && (
            <div className={cn("mb-4 rounded-card border border-border px-4 py-3 text-sm text-foreground/80", accentSoftBg)}>
              {(() => {
                const weeks = Math.max(1, Math.round(returningDays / 7));
                return t("welcomeBack", { weeks });
              })()}
            </div>
          )}
          {messages.length === 0 ? (
            <div className={cn("h-full flex flex-col", opener ? "justify-start" : "items-center justify-center text-center")}>
              {/* Proactive opener — the Twin speaks first, referencing the
                  user's real recent activity, so it feels like a companion
                  who's been paying attention. */}
              {opener && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2.5 mb-5"
                >
                  <div className={cn("shrink-0 p-2 rounded-full self-start", accentGradient)}>
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="max-w-[82%]">
                    <div className="rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap bg-muted">
                      {opener.text}
                    </div>
                  </div>
                </motion.div>
              )}
              <p className="text-sm text-muted-foreground mb-3">{t("suggested")}</p>
              <div className={cn("flex flex-col gap-2 w-full", !opener && "max-w-md")}>
                {/* Lead with context-aware chips (real careers / journey stage),
                    then the opener's reflective question, then generic starters. */}
                {emptyStateChips.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => send(q)}
                    className={cn("text-sm text-left px-4 py-2.5 rounded-xl border-2 bg-background hover:shadow-sm transition-all", accentHoverBorder)}
                  >
                    {q}
                  </button>
                ))}
              </div>
              {/* Gentle, contextual nudge into the scenario runner — shown only
                  on the empty state, not on every message, so it stays calm. */}
              <button
                type="button"
                onClick={launchExperience}
                className={cn(
                  "mt-4 inline-flex items-center gap-2 self-start rounded-full border-2 border-dashed px-4 py-2 text-sm font-medium text-muted-foreground transition-colors",
                  accentHoverBorder,
                  accentHoverText,
                )}
              >
                <Compass className="h-4 w-4" />
                Want to actually live a day as a {career.title}?
              </button>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "assistant" && (
                    <div className={cn("shrink-0 p-2 rounded-full self-start", accentGradient)}>
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className="max-w-[82%]">
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                        m.role === "user"
                          ? `${accentGradientR} text-white`
                          : "bg-muted"
                      }`}
                    >
                      {m.content}
                    </div>
                    {m.role === "assistant" && (
                      <div className="mt-1 ml-1 flex items-center gap-3">
                        {ttsSupported && (
                          <button
                            type="button"
                            onClick={() => toggleSpeak(m.id, m.content)}
                            className={cn(
                              "inline-flex items-center gap-1 text-[11px] transition-colors",
                              speakingId === m.id
                                ? "text-foreground/80"
                                : cn("text-muted-foreground/60", accentHoverText),
                            )}
                            aria-label={speakingId === m.id ? "Stop reading aloud" : "Listen to this response"}
                            aria-pressed={speakingId === m.id}
                          >
                            {speakingId === m.id ? (
                              <>
                                <Square className="h-3 w-3" />
                                Stop
                              </>
                            ) : (
                              <>
                                <Volume2 className="h-3 w-3" />
                                Listen
                              </>
                            )}
                          </button>
                        )}
                        <ReportModal
                          targetType="CONTENT"
                          targetId={`career-twin-chat:${career?.id ?? ""}`}
                          targetName={career ? `Career Twin — ${career.title}` : "Career Twin response"}
                          trigger={
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/60 hover:text-destructive transition-colors"
                              aria-label="Report this response"
                            >
                              <Flag className="h-3 w-3" />
                              Report
                            </button>
                          }
                        />
                      </div>
                    )}
                  </div>
                  {m.role === "user" && (
                    <div className="shrink-0 p-2 rounded-full bg-accent self-start">
                      <UserIcon className="h-4 w-4 text-accent-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}
              {sending && !streamingId && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
                  <div className={cn("shrink-0 p-2 rounded-full", accentGradient)}>
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-2.5 flex items-center gap-2">
                    <Loader2 className={cn("h-4 w-4 animate-spin", accentSpinner)} />
                    <span className="text-sm text-muted-foreground">{t("thinking")}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Active-mode starter questions — keep mode chips actionable once a
            conversation has started (the empty-state block above is hidden). */}
        {messages.length > 0 && suggested.length > 0 && (
          <div className="px-4 sm:px-6 pt-3 border-t bg-background">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              {activeMode?.label ? `${activeMode.label} · ${t("suggested")}` : t("suggested")}
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:thin]">
              {suggested.map((q, i) => (
                <button
                  key={`${modeId}-${i}`}
                  onClick={() => send(q)}
                  disabled={sending}
                  className={cn("shrink-0 rounded-full border px-3 py-1.5 text-xs bg-background disabled:opacity-50 transition-colors", accentHoverBorder)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="border-t p-3 sm:p-4 bg-background"
        >
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder={t("inputPlaceholder")}
              rows={1}
              disabled={sending}
              className={cn("flex-1 resize-none rounded-xl border-2 border-muted bg-muted/30 px-4 py-3 text-sm focus:outline-none transition-colors min-h-[52px] max-h-[120px]", accentFocusBorder)}
            />
            <Button
              type="submit"
              disabled={!input.trim() || sending}
              className={cn("px-4", accentGradientR)}
              aria-label={t("send")}
            >
              {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </div>
        </form>
        </>
        )}
      </Card>

    </div>
  );
}
