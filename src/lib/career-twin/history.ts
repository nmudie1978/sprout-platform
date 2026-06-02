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

/** Pure: clamp DB rows to the last `limit` valid turns for the model context. */
export function toPromptHistory(rows: TwinRow[], limit: number): TwinTurn[] {
  return rows
    .filter((r) => r.role === "user" || r.role === "assistant")
    .slice(-limit)
    .map((r) => ({ role: r.role as "user" | "assistant", content: r.content.slice(0, 2000) }));
}

/** Load a user's prior turns for one career, oldest → newest. */
export async function loadTwinHistory(
  userId: string,
  careerId: string,
  limit = 12,
): Promise<TwinRow[]> {
  return prisma.careerTwinMessage.findMany({
    where: { userId, careerId },
    orderBy: { createdAt: "asc" },
    take: limit * 2,
    select: { role: true, content: true, mode: true, createdAt: true },
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
