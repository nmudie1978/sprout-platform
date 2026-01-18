import { prisma } from "@/lib/prisma";
import { getAllCareers, getCategoryForCareer, type Career } from "./career-pathways";

/**
 * Convert static Career to context format for AI
 */
function staticCareerToContextFormat(career: Career): any {
  const category = getCategoryForCareer(career.id);
  return {
    id: career.id,
    roleName: career.title,
    summary: career.description,
    traits: career.keySkills,
    salaryBand: career.avgSalary,
    tags: [category || "", career.growthOutlook, career.entryLevel ? "entry-level" : ""].filter(Boolean),
  };
}

/**
 * Simple keyword-based retrieval for career cards
 * Searches BOTH database and static career-pathways data
 */
export async function retrieveRelevantCareerCards(query: string, limit = 3) {
  const keywords = query.toLowerCase().split(" ").filter(k => k.length > 2);
  const queryLower = query.toLowerCase();

  // Search database career cards
  let dbCareers: any[] = [];
  try {
    dbCareers = await prisma.careerCard.findMany({
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
    if (dbCareers.length === 0) {
      dbCareers = await prisma.careerCard.findMany({
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
    }
  } catch (error) {
    console.error("Failed to fetch DB careers:", error);
  }

  // Search static careers from career-pathways.ts
  const staticCareers = getAllCareers();
  const scoredStaticCareers = staticCareers
    .map((career) => {
      const category = getCategoryForCareer(career.id) || "";
      const searchText = `${career.title} ${career.description} ${career.keySkills.join(" ")} ${category}`.toLowerCase();
      let score = 0;

      // Full query match
      if (searchText.includes(queryLower)) score += 10;

      // Individual keyword matches
      for (const keyword of keywords) {
        if (searchText.includes(keyword)) score += 1;
        if (career.title.toLowerCase().includes(keyword)) score += 3;
        if (category.toLowerCase().includes(keyword)) score += 2;
      }

      return { career: staticCareerToContextFormat(career), score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.career);

  // Merge results, prioritizing static careers (more comprehensive)
  const mergedResults = [...scoredStaticCareers, ...dbCareers];

  // Dedupe by roleName and return top results
  const seen = new Set<string>();
  return mergedResults
    .filter((career) => {
      const name = career.roleName.toLowerCase();
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    })
    .slice(0, limit);
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
