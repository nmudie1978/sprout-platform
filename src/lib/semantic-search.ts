/**
 * Semantic Search using OpenAI Embeddings
 * Provides better retrieval than keyword matching by understanding meaning
 */

import OpenAI from "openai";
import { prisma } from "./prisma";

// Cache for embeddings to avoid recomputing
const embeddingsCache = new Map<string, number[]>();

// Check if OpenAI is configured for embeddings
function isEmbeddingsEnabled(): boolean {
  const apiKey = process.env.OPENAI_API_KEY;
  return !!(
    apiKey &&
    apiKey.length > 10 &&
    apiKey !== "sk-your-openai-api-key-here" &&
    apiKey.startsWith("sk-")
  );
}

/**
 * Get OpenAI embedding for a text string
 */
async function getEmbedding(text: string): Promise<number[] | null> {
  if (!isEmbeddingsEnabled()) {
    return null;
  }

  // Check cache first
  const cacheKey = text.slice(0, 100); // Use first 100 chars as key
  if (embeddingsCache.has(cacheKey)) {
    return embeddingsCache.get(cacheKey)!;
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.embeddings.create({
      model: "text-embedding-3-small", // Fast, cheap, good quality
      input: text,
    });

    const embedding = response.data[0].embedding;

    // Cache it
    embeddingsCache.set(cacheKey, embedding);

    return embedding;
  } catch (error) {
    console.error("Embedding error:", error);
    return null;
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Create a searchable text from a career card
 */
function careerToSearchText(career: any): string {
  return [
    career.roleName,
    career.summary,
    career.traits?.join(", ") || "",
    career.dayInLife?.join(". ") || "",
    career.realityCheck || "",
    career.tags?.join(", ") || "",
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Semantic search for career cards
 * Falls back to keyword search if embeddings not available
 */
export async function semanticSearchCareers(
  query: string,
  limit: number = 5
): Promise<any[]> {
  // Get all career cards
  const careers = await prisma.careerCard.findMany({
    orderBy: { order: "asc" },
  });

  // Try semantic search first
  const queryEmbedding = await getEmbedding(query);

  if (queryEmbedding) {
    // Compute embeddings for all careers and rank by similarity
    const scoredCareers = await Promise.all(
      careers.map(async (career) => {
        const careerText = careerToSearchText(career);
        const careerEmbedding = await getEmbedding(careerText);

        if (!careerEmbedding) {
          return { career, score: 0 };
        }

        const score = cosineSimilarity(queryEmbedding, careerEmbedding);
        return { career, score };
      })
    );

    // Sort by score and return top results
    scoredCareers.sort((a, b) => b.score - a.score);
    return scoredCareers.slice(0, limit).map((item) => item.career);
  }

  // Fallback: keyword-based search
  const queryLower = query.toLowerCase();
  const keywords = queryLower.split(/\s+/).filter((w) => w.length > 2);

  const scoredCareers = careers.map((career) => {
    const searchText = careerToSearchText(career).toLowerCase();
    let score = 0;

    // Full phrase match
    if (searchText.includes(queryLower)) {
      score += 10;
    }

    // Individual keyword matches
    for (const keyword of keywords) {
      if (searchText.includes(keyword)) {
        score += 1;
      }
    }

    // Tag matches (bonus)
    if (career.tags) {
      for (const tag of career.tags) {
        if (keywords.some((k) => tag.toLowerCase().includes(k))) {
          score += 2;
        }
      }
    }

    return { career, score };
  });

  // Sort by score and return top results
  scoredCareers.sort((a, b) => b.score - a.score);
  return scoredCareers
    .filter((item) => item.score > 0)
    .slice(0, limit)
    .map((item) => item.career);
}

/**
 * Semantic search for help documents
 */
export async function semanticSearchHelpDocs(
  query: string,
  limit: number = 3
): Promise<any[]> {
  const helpDocs = await prisma.helpDoc.findMany();

  const queryEmbedding = await getEmbedding(query);

  if (queryEmbedding) {
    const scoredDocs = await Promise.all(
      helpDocs.map(async (doc) => {
        const docText = `${doc.title} ${doc.content} ${doc.tags?.join(" ") || ""}`;
        const docEmbedding = await getEmbedding(docText);

        if (!docEmbedding) {
          return { doc, score: 0 };
        }

        const score = cosineSimilarity(queryEmbedding, docEmbedding);
        return { doc, score };
      })
    );

    scoredDocs.sort((a, b) => b.score - a.score);
    return scoredDocs.slice(0, limit).map((item) => item.doc);
  }

  // Fallback: keyword search
  const queryLower = query.toLowerCase();
  const keywords = queryLower.split(/\s+/).filter((w) => w.length > 2);

  const scoredDocs = helpDocs.map((doc) => {
    const searchText = `${doc.title} ${doc.content}`.toLowerCase();
    let score = 0;

    if (searchText.includes(queryLower)) {
      score += 10;
    }

    for (const keyword of keywords) {
      if (searchText.includes(keyword)) {
        score += 1;
      }
    }

    return { doc, score };
  });

  scoredDocs.sort((a, b) => b.score - a.score);
  return scoredDocs
    .filter((item) => item.score > 0)
    .slice(0, limit)
    .map((item) => item.doc);
}

/**
 * Combined semantic search across all content types
 */
export async function semanticSearch(
  query: string,
  options: {
    careerLimit?: number;
    helpDocLimit?: number;
  } = {}
): Promise<{
  careers: any[];
  helpDocs: any[];
}> {
  const { careerLimit = 5, helpDocLimit = 3 } = options;

  const [careers, helpDocs] = await Promise.all([
    semanticSearchCareers(query, careerLimit),
    semanticSearchHelpDocs(query, helpDocLimit),
  ]);

  return { careers, helpDocs };
}

/**
 * Pre-warm the embeddings cache for common queries
 * Call this on server startup for better performance
 */
export async function warmupEmbeddingsCache(): Promise<void> {
  if (!isEmbeddingsEnabled()) {
    console.log("Embeddings not enabled, skipping cache warmup");
    return;
  }

  const commonQueries = [
    "first job no experience",
    "how to become a developer",
    "what career is right for me",
    "jobs for teenagers",
    "summer job Norway",
    "how much can I earn",
    "write a job application",
    "how to find work",
    "barista cafe job",
    "retail store work",
  ];

  console.log("Warming up embeddings cache...");

  for (const query of commonQueries) {
    await getEmbedding(query);
  }

  console.log(`Embeddings cache warmed with ${commonQueries.length} queries`);
}
