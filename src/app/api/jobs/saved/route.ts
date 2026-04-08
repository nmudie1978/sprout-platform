export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/jobs/saved — list jobs the current youth has saved
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "YOUTH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const saved = await prisma.savedJob.findMany({
    where: { youthId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      job: {
        include: {
          postedBy: { include: { employerProfile: true } },
        },
      },
    },
  });

  return NextResponse.json({
    saved: saved.map((s) => ({
      id: s.id,
      savedAt: s.createdAt,
      job: s.job,
    })),
  });
}

// POST /api/jobs/saved  body: { jobId }  — bookmark a job
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "YOUTH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await req.json().catch(() => ({}));
  if (!jobId || typeof jobId !== "string") {
    return NextResponse.json({ error: "jobId required" }, { status: 400 });
  }

  const job = await prisma.microJob.findUnique({ where: { id: jobId }, select: { id: true } });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const saved = await prisma.savedJob.upsert({
    where: { jobId_youthId: { jobId, youthId: session.user.id } },
    create: { jobId, youthId: session.user.id },
    update: {},
  });

  return NextResponse.json({ saved: true, id: saved.id });
}

// DELETE /api/jobs/saved?jobId=...  — unsave
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "YOUTH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobId = new URL(req.url).searchParams.get("jobId");
  if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 });

  await prisma.savedJob.deleteMany({
    where: { jobId, youthId: session.user.id },
  });

  return NextResponse.json({ saved: false });
}
