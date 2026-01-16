import { prisma } from "@/lib/prisma";

/**
 * Simple keyword-based retrieval for career cards
 * In production, use vector embeddings with Pinecone/Weaviate
 */
export async function retrieveRelevantCareerCards(query: string, limit = 3) {
  const keywords = query.toLowerCase().split(" ");

  const careerCards = await prisma.careerCard.findMany({
    where: {
      active: true,
      OR: [
        {
          roleName: {
            contains: keywords.join(" "),
            mode: "insensitive",
          },
        },
        {
          summary: {
            contains: keywords.join(" "),
            mode: "insensitive",
          },
        },
        {
          tags: {
            hasSome: keywords,
          },
        },
      ],
    },
    take: limit,
  });

  // If no results, try individual keywords
  if (careerCards.length === 0) {
    const careerCardsKeyword = await prisma.careerCard.findMany({
      where: {
        active: true,
        OR: keywords.map((keyword) => ({
          OR: [
            { roleName: { contains: keyword, mode: "insensitive" } },
            { summary: { contains: keyword, mode: "insensitive" } },
          ],
        })),
      },
      take: limit,
    });
    return careerCardsKeyword;
  }

  return careerCards;
}

/**
 * Simple keyword-based retrieval for help docs
 */
export async function retrieveRelevantHelpDocs(query: string, limit = 2) {
  const keywords = query.toLowerCase().split(" ");

  const helpDocs = await prisma.helpDoc.findMany({
    where: {
      active: true,
      OR: [
        {
          title: {
            contains: keywords.join(" "),
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: keywords.join(" "),
            mode: "insensitive",
          },
        },
        {
          tags: {
            hasSome: keywords,
          },
        },
      ],
    },
    take: limit,
  });

  // If no results, try individual keywords
  if (helpDocs.length === 0) {
    const helpDocsKeyword = await prisma.helpDoc.findMany({
      where: {
        active: true,
        OR: keywords.map((keyword) => ({
          OR: [
            { title: { contains: keyword, mode: "insensitive" } },
            { content: { contains: keyword, mode: "insensitive" } },
          ],
        })),
      },
      take: limit,
    });
    return helpDocsKeyword;
  }

  return helpDocs;
}

/**
 * Retrieve relevant Q&A pairs
 */
export async function retrieveRelevantQA(query: string, limit = 2) {
  const keywords = query.toLowerCase().split(" ");

  const questions = await prisma.proQuestion.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        {
          question: {
            contains: keywords.join(" "),
            mode: "insensitive",
          },
        },
      ],
    },
    include: {
      answers: {
        where: {
          publishedAt: { not: null },
        },
        take: 1,
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    take: limit,
  });

  return questions;
}

/**
 * Format retrieved context for LLM prompt
 */
export function formatContextForPrompt(
  careerCards: any[],
  helpDocs: any[],
  qaItems: any[]
) {
  let context = "";

  if (careerCards.length > 0) {
    context += "\n## Relevant Career Information:\n\n";
    careerCards.forEach((card) => {
      context += `**${card.roleName}**\n`;
      context += `Summary: ${card.summary}\n`;
      context += `Key traits: ${card.traits.join(", ")}\n`;
      context += `Salary: ${card.salaryBand}\n\n`;
    });
  }

  if (helpDocs.length > 0) {
    context += "\n## Help Documentation:\n\n";
    helpDocs.forEach((doc) => {
      context += `**${doc.title}**\n`;
      context += `${doc.content}\n\n`;
    });
  }

  if (qaItems.length > 0) {
    context += "\n## Related Q&A:\n\n";
    qaItems.forEach((qa) => {
      context += `Q: ${qa.question}\n`;
      if (qa.answers && qa.answers.length > 0) {
        context += `A: ${qa.answers[0].answerText}\n\n`;
      }
    });
  }

  return context;
}
