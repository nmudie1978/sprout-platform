// Run with: node --env-file=.env.local --import tsx scripts/add-employer-review.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addEmployerReview() {
  try {
    // Find Nick Mudie's employer profile
    const employer = await prisma.user.findFirst({
      where: {
        role: "EMPLOYER",
        employerProfile: {
          companyName: {
            contains: "Nick",
            mode: "insensitive",
          },
        },
      },
      include: {
        employerProfile: true,
        postedJobs: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!employer) {
      console.log("No employer found with name containing 'Nick'");

      // List all employers
      const allEmployers = await prisma.user.findMany({
        where: { role: "EMPLOYER" },
        include: { employerProfile: true },
      });

      console.log("\nAll employers:");
      allEmployers.forEach((e) => {
        console.log(`- ${e.email}: ${e.employerProfile?.companyName || "No profile"}`);
      });

      return;
    }

    console.log(`Found employer: ${employer.employerProfile?.companyName} (${employer.email})`);

    // Find a youth user to be the reviewer
    const youth = await prisma.user.findFirst({
      where: { role: "YOUTH" },
      include: { youthProfile: true },
    });

    if (!youth) {
      console.log("No youth user found to create review");
      return;
    }

    console.log(`Found youth reviewer: ${youth.youthProfile?.displayName || youth.email}`);

    // Check if employer has any jobs
    let job = employer.postedJobs[0];

    if (!job) {
      console.log("Employer has no jobs, creating a completed job for review...");

      job = await prisma.microJob.create({
        data: {
          title: "Garden Cleanup Help",
          category: "OTHER",
          description: "Helped clean up the garden - raking leaves and trimming hedges.",
          payType: "FIXED",
          payAmount: 300,
          location: "Oslo",
          status: "COMPLETED",
          postedById: employer.id,
          startDate: new Date("2024-01-15"),
          endDate: new Date("2024-01-15"),
        },
      });

      console.log(`Created job: ${job.title}`);
    }

    // Check if review already exists
    const existingReview = await prisma.review.findFirst({
      where: {
        jobId: job.id,
        reviewerId: youth.id,
        reviewedId: employer.id,
      },
    });

    if (existingReview) {
      console.log("Review already exists for this job");
      return;
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        jobId: job.id,
        reviewerId: youth.id,
        reviewedId: employer.id,
        punctuality: 5,
        communication: 5,
        reliability: 5,
        overall: 5,
        positiveTags: ["Great communicator", "Fair payment", "Friendly"],
        comment: "Nick was an excellent employer! Very clear instructions, fair pay, and friendly throughout. Would definitely work with him again!",
      },
    });

    console.log(`\nCreated review with ID: ${review.id}`);

    // Update employer's average rating
    const allReviews = await prisma.review.findMany({
      where: { reviewedId: employer.id },
    });

    const avgRating =
      allReviews.reduce((sum, r) => sum + r.overall, 0) / allReviews.length;

    await prisma.employerProfile.update({
      where: { userId: employer.id },
      data: {
        averageRating: avgRating,
        totalReviews: allReviews.length,
      },
    });

    console.log(`Updated employer rating: ${avgRating.toFixed(1)} (${allReviews.length} reviews)`);
    console.log("\nDone!");

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addEmployerReview();
