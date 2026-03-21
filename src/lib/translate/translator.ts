import { createHash } from "crypto";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/** 30-day cache TTL */
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const SYSTEM_PROMPT = `You are a professional translator for a Norwegian youth career platform (ages 15-23).

Rules:
- Translate the provided text accurately and naturally.
- Use clear, youth-friendly language appropriate for ages 15-23.
- Preserve all formatting (markdown, line breaks, bullet points).
- Do NOT translate brand names (Sprout, NAV, SSB, NHO, WEF, ILO, OECD, CFYE).
- Do NOT translate URLs or email addresses.
- Keep Norwegian-specific terms like "fagbrev", "lærling", etc. as-is.
- Maintain the same tone — professional but friendly.`;

function contentHash(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

interface TranslateOptions {
  sourceLocale?: string;
  targetLocale: string;
  contentType?: string;
}

/**
 * Translate a single text string. Checks cache first.
 */
export async function translateText(
  text: string,
  options: TranslateOptions
): Promise<string> {
  const { sourceLocale = "en-GB", targetLocale, contentType = "general" } = options;

  if (sourceLocale === targetLocale) return text;

  const hash = contentHash(text);

  // Check cache
  const cached = await prisma.translationCache.findUnique({
    where: { contentHash_targetLocale: { contentHash: hash, targetLocale } },
  });

  if (cached && cached.expiresAt > new Date()) {
    return cached.translated;
  }

  // Call OpenAI
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Translate the following from ${sourceLocale} to ${targetLocale}:\n\n${text}`,
      },
    ],
  });

  const translated = completion.choices[0]?.message?.content?.trim() ?? text;

  // Upsert cache
  const expiresAt = new Date(Date.now() + CACHE_TTL_MS);
  await prisma.translationCache.upsert({
    where: { contentHash_targetLocale: { contentHash: hash, targetLocale } },
    update: { translated, updatedAt: new Date(), expiresAt },
    create: {
      contentHash: hash,
      sourceLocale,
      targetLocale,
      sourceText: text,
      translated,
      contentType,
      expiresAt,
    },
  });

  return translated;
}

interface BatchItem {
  key: string;
  text: string;
}

/**
 * Translate a batch of items (up to 20) in a single OpenAI call.
 * Returns a map of key → translated text.
 */
export async function translateBatch(
  items: BatchItem[],
  options: TranslateOptions
): Promise<Record<string, string>> {
  const { sourceLocale = "en-GB", targetLocale, contentType = "general" } = options;

  if (sourceLocale === targetLocale) {
    return Object.fromEntries(items.map((i) => [i.key, i.text]));
  }

  const results: Record<string, string> = {};
  const toTranslate: { index: number; item: BatchItem; hash: string }[] = [];

  // Check cache for each item
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const hash = contentHash(item.text);

    const cached = await prisma.translationCache.findUnique({
      where: { contentHash_targetLocale: { contentHash: hash, targetLocale } },
    });

    if (cached && cached.expiresAt > new Date()) {
      results[item.key] = cached.translated;
    } else {
      toTranslate.push({ index: i + 1, item, hash });
    }
  }

  if (toTranslate.length === 0) return results;

  // Build numbered prompt for batch
  const numberedInput = toTranslate
    .map((t) => `[${t.index}] ${t.item.text}`)
    .join("\n\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Translate each numbered item from ${sourceLocale} to ${targetLocale}. Keep the [N] numbering in your output.\n\n${numberedInput}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "";

  // Parse numbered responses
  const parsed = new Map<number, string>();
  const parts = raw.split(/\[(\d+)\]\s*/);
  for (let i = 1; i < parts.length; i += 2) {
    const num = parseInt(parts[i], 10);
    const translatedText = parts[i + 1]?.trim();
    if (translatedText) parsed.set(num, translatedText);
  }

  // Assign results and cache
  const expiresAt = new Date(Date.now() + CACHE_TTL_MS);
  for (const t of toTranslate) {
    const translated = parsed.get(t.index) ?? t.item.text;
    results[t.item.key] = translated;

    await prisma.translationCache.upsert({
      where: {
        contentHash_targetLocale: { contentHash: t.hash, targetLocale },
      },
      update: { translated, updatedAt: new Date(), expiresAt },
      create: {
        contentHash: t.hash,
        sourceLocale,
        targetLocale,
        sourceText: t.item.text,
        translated,
        contentType,
        expiresAt,
      },
    });
  }

  return results;
}
