import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/** Extract YouTube video ID from various URL formats */
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const match = url.match(p);
    if (match) return match[1];
  }
  return null;
}

/**
 * GET /api/career-stories?career=doctor&career=physician
 * Returns published career stories matching any of the career tags
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const careers = searchParams.getAll('career');

  const where: any = { published: true };

  if (careers.length > 0) {
    where.careerTags = { hasSome: careers };
  }

  const stories = await prisma.careerStory.findMany({
    where,
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    take: 4,
  });

  return NextResponse.json({ stories, count: stories.length });
}

/**
 * POST /api/career-stories — Create a new career story (admin only)
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 403 });
  }

  const body = await req.json();
  const { videoUrl, name, jobTitle, company, location, yearsInRole, careerTags, industry, headline, takeaways, duration } = body;

  if (!videoUrl || !name || !jobTitle || !headline || !careerTags?.length) {
    return NextResponse.json({ error: 'Missing required fields: videoUrl, name, jobTitle, headline, careerTags' }, { status: 400 });
  }

  const videoId = extractVideoId(videoUrl);
  if (!videoId) {
    return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
  }

  const story = await prisma.careerStory.create({
    data: {
      videoUrl,
      videoId,
      duration,
      name,
      jobTitle,
      company,
      location,
      yearsInRole: yearsInRole ? parseInt(yearsInRole) : null,
      careerTags,
      industry,
      headline,
      takeaways: takeaways || [],
      published: true,
      featured: false,
      uploadedBy: session.user.id,
    },
  });

  return NextResponse.json({ story }, { status: 201 });
}
