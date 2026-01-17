import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { generateTrustSignalsFromFeedback } from '@/lib/trust-signals';
import { recordLifeSkillEvent } from '@/lib/life-skills';

// Validation schemas
const jobCompletionSchema = z.object({
  jobId: z.string().min(1),
  youthId: z.string().min(1),
  outcome: z.enum(['COMPLETED', 'NO_SHOW', 'CANCELLED', 'ISSUE_REPORTED']),
  supervision: z.enum(['SUPERVISED', 'UNSUPERVISED', 'UNKNOWN']).optional(),
  hoursWorked: z.number().min(0).max(24).optional(),
  notes: z.string().max(500).optional(),
});

const structuredFeedbackSchema = z.object({
  punctuality: z.number().int().min(1).max(5),
  communication: z.number().int().min(1).max(5),
  quality: z.number().int().min(1).max(5),
  respectfulness: z.number().int().min(1).max(5),
  followedInstructions: z.number().int().min(1).max(5),
  wouldRehire: z.boolean(),
  responsibilityLevel: z.enum(['BASIC', 'INTERMEDIATE', 'ADVANCED']).optional(),
  skillsDemonstrated: z.array(z.string()).optional(),
});

// POST /api/job-completions - Create job completion with feedback
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only employers can create job completions
    if (session.user.role !== 'EMPLOYER') {
      return NextResponse.json(
        { error: 'Only employers can mark jobs as completed' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { completion: completionData, feedback: feedbackData } = body;

    // Validate completion data
    const validatedCompletion = jobCompletionSchema.parse(completionData);

    // Validate feedback data if provided
    let validatedFeedback: z.infer<typeof structuredFeedbackSchema> | null = null;
    if (feedbackData) {
      validatedFeedback = structuredFeedbackSchema.parse(feedbackData);
    }

    // Verify the job belongs to this employer
    const job = await prisma.microJob.findUnique({
      where: { id: validatedCompletion.jobId },
      select: { postedById: true, status: true },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.postedById !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only complete jobs you posted' },
        { status: 403 }
      );
    }

    // Verify youth was accepted for this job
    const application = await prisma.application.findUnique({
      where: {
        jobId_youthId: {
          jobId: validatedCompletion.jobId,
          youthId: validatedCompletion.youthId,
        },
      },
      select: { status: true },
    });

    if (!application || application.status !== 'ACCEPTED') {
      return NextResponse.json(
        { error: 'Youth must have an accepted application for this job' },
        { status: 400 }
      );
    }

    // Create job completion and feedback in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create job completion
      const completion = await tx.jobCompletion.create({
        data: {
          jobId: validatedCompletion.jobId,
          youthId: validatedCompletion.youthId,
          employerId: session.user.id,
          outcome: validatedCompletion.outcome,
          supervision: validatedCompletion.supervision || 'UNKNOWN',
          hoursWorked: validatedCompletion.hoursWorked,
          notes: validatedCompletion.notes,
        },
      });

      // Create structured feedback if provided and job was completed
      let feedback = null;
      if (validatedFeedback && validatedCompletion.outcome === 'COMPLETED') {
        feedback = await tx.structuredFeedback.create({
          data: {
            jobCompletionId: completion.id,
            punctuality: validatedFeedback.punctuality,
            communication: validatedFeedback.communication,
            quality: validatedFeedback.quality,
            respectfulness: validatedFeedback.respectfulness,
            followedInstructions: validatedFeedback.followedInstructions,
            wouldRehire: validatedFeedback.wouldRehire,
            responsibilityLevel: validatedFeedback.responsibilityLevel || 'BASIC',
            skillsDemonstrated: validatedFeedback.skillsDemonstrated || [],
          },
        });
      }

      // Update job status to COMPLETED
      await tx.microJob.update({
        where: { id: validatedCompletion.jobId },
        data: { status: 'COMPLETED' },
      });

      return { completion, feedback };
    });

    // Generate trust signals (outside transaction for performance)
    if (result.feedback) {
      const { signalsCreated } = await generateTrustSignalsFromFeedback(
        result.feedback,
        result.completion
      );

      // Record life skill event for job completed
      await recordLifeSkillEvent(
        validatedCompletion.youthId,
        'JOB_COMPLETED',
        validatedCompletion.jobId
      );

      return NextResponse.json({
        success: true,
        completion: result.completion,
        feedback: result.feedback,
        trustSignalsCreated: signalsCreated,
      });
    }

    return NextResponse.json({
      success: true,
      completion: result.completion,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to create job completion:', error);
    return NextResponse.json(
      { error: 'Failed to create job completion' },
      { status: 500 }
    );
  }
}

// GET /api/job-completions - Get job completions for current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');

    // Build query based on user role
    const where: any = {};

    if (session.user.role === 'YOUTH') {
      where.youthId = session.user.id;
    } else if (session.user.role === 'EMPLOYER') {
      where.employerId = session.user.id;
    } else {
      return NextResponse.json(
        { error: 'Invalid user role' },
        { status: 403 }
      );
    }

    if (jobId) {
      where.jobId = jobId;
    }

    const completions = await prisma.jobCompletion.findMany({
      where,
      include: {
        job: {
          select: {
            title: true,
            category: true,
            payAmount: true,
          },
        },
        feedback: true,
      },
      orderBy: { completedAt: 'desc' },
    });

    return NextResponse.json({ completions });
  } catch (error) {
    console.error('Failed to fetch job completions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job completions' },
      { status: 500 }
    );
  }
}
