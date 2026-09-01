/**
 * Server-side persistence for Career Twin conversations.
 * Import only from server code (route handlers) — touches Prisma.
 */
import { prisma } from "@/lib/prisma";

export interface TwinRow {
  role: string;
  content: string;
  mode: string | null;
  createdAt: Date;
}

export interface TwinTurn {
  role: "user" | "assistant";
  content: string;
}

/**
 * How many recent messages to replay into the model context.
 *
 * @deprecated Prefer `getCareerTwinConfig().maxContextTurns` (env-tunable) —
 * kept as the fallback default and for existing callers/tests.
 */
export const TWIN_CONTEXT_TURNS = 6;

/**
 * How many messages of a thread to load when building context. Wide enough
 * that the summariser can see what fell out of the verbatim window, bounded
 * so a very long thread never loads without limit — anything older than this
 * lives on in the rolling summary (see ./context.ts).
 */
export const TWIN_THREAD_LOAD_LIMIT = 60;

/** Pure: clamp DB rows to the last `limit` valid turns for the model context. */
export function toPromptHistory(rows: TwinRow[], limit: number): TwinTurn[] {
  return rows
    .filter((r) => r.role === "user" || r.role === "assistant")
    .slice(-limit)
    .map((r) => ({ role: r.role as "user" | "assistant", content: r.content.slice(0, 2000) }));
}

/**
 * Load a user's most recent turns for one career, returned oldest → newest.
 *
 * NB: ordered DESC then reversed. Ordering ascending with a `take` returns the
 * OLDEST rows, which on a long thread meant we replayed the start of the
 * conversation instead of the part the user is actually in.
 */
export async function loadTwinHistory(
  userId: string,
  careerId: string,
  limit = 12,
): Promise<TwinRow[]> {
  const rows = await prisma.careerTwinMessage.findMany({
    where: { userId, careerId },
    orderBy: { createdAt: "desc" },
    take: limit * 2,
    select: { role: true, content: true, mode: true, createdAt: true },
  });
  return rows.reverse();
}

/**
 * The timestamp of the most recent turn for this user+career. loadTwinHistory
 * orders ascending + take, so its last row is NOT the newest — this is a
 * dedicated newest-first lookup, fetched once by the GET route and shared with
 * loadTwinMemory / loadRecentActivity.
 */
export async function loadLastTurnAt(
  userId: string,
  careerId: string,
): Promise<{ createdAt: Date } | null> {
  return prisma.careerTwinMessage.findFirst({
    where: { userId, careerId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
}

/** Persist one or more turns (user message + assistant reply). */
export async function appendTwinTurns(
  userId: string,
  careerId: string,
  turns: { role: "user" | "assistant"; content: string; mode?: string | null }[],
): Promise<void> {
  await prisma.careerTwinMessage.createMany({
    data: turns.map((t) => ({
      userId,
      careerId,
      role: t.role,
      content: t.content.slice(0, 4000),
      mode: t.mode ?? null,
    })),
  });
}
