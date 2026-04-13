-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('YOUTH', 'EMPLOYER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AgeBracket" AS ENUM ('SIXTEEN_SEVENTEEN', 'EIGHTEEN_TWENTY');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'POSTED', 'ASSIGNED', 'COMPLETED', 'REVIEWED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "PayType" AS ENUM ('FIXED', 'HOURLY');

-- CreateEnum
CREATE TYPE "JobCategory" AS ENUM ('BABYSITTING', 'DOG_WALKING', 'SNOW_CLEARING', 'CLEANING', 'DIY_HELP', 'TECH_HELP', 'ERRANDS', 'OTHER');

-- CreateEnum
CREATE TYPE "SwipeDirection" AS ENUM ('LEFT', 'RIGHT', 'UP', 'DOWN');

-- CreateEnum
CREATE TYPE "QuestionStatus" AS ENUM ('PENDING', 'ANSWERED', 'PUBLISHED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "role" "UserRole" NOT NULL DEFAULT 'YOUTH',
    "ageBracket" "AgeBracket",
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "YouthProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "availability" TEXT,
    "interests" TEXT[],
    "skillTags" TEXT[],
    "profileVisibility" BOOLEAN NOT NULL DEFAULT false,
    "publicProfileSlug" TEXT,
    "completedJobsCount" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION,
    "reliabilityScore" INTEGER NOT NULL DEFAULT 0,
    "guardianEmail" TEXT,
    "guardianConsent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YouthProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "website" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MicroJob" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "JobCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "payType" "PayType" NOT NULL,
    "payAmount" DOUBLE PRECISION NOT NULL,
    "location" TEXT NOT NULL,
    "dateTime" TIMESTAMP(3),
    "duration" INTEGER,
    "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
    "requiredTraits" TEXT[],
    "postedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MicroJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "youthId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "reviewedId" TEXT NOT NULL,
    "punctuality" INTEGER NOT NULL,
    "communication" INTEGER NOT NULL,
    "reliability" INTEGER NOT NULL,
    "overall" INTEGER NOT NULL,
    "positiveTags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerCard" (
    "id" TEXT NOT NULL,
    "roleName" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "traits" TEXT[],
    "dayInLife" TEXT[],
    "realityCheck" TEXT NOT NULL,
    "salaryBand" TEXT NOT NULL,
    "companies" TEXT[],
    "nextSteps" TEXT[],
    "tags" TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Swipe" (
    "id" TEXT NOT NULL,
    "youthId" TEXT NOT NULL,
    "careerCardId" TEXT NOT NULL,
    "direction" "SwipeDirection" NOT NULL,
    "saved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Swipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProQuestion" (
    "id" TEXT NOT NULL,
    "youthId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "category" TEXT,
    "relatedCareerIds" TEXT[],
    "tags" TEXT[],
    "status" "QuestionStatus" NOT NULL DEFAULT 'PENDING',
    "moderatedBy" TEXT,
    "moderatedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProAnswer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answeredBy" TEXT NOT NULL,
    "answerText" TEXT NOT NULL,
    "professionalTitle" TEXT,
    "professionalCompany" TEXT,
    "yearsExperience" INTEGER,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiIntentLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "intentType" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiIntentLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelpDoc" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HelpDoc_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "YouthProfile_userId_key" ON "YouthProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "YouthProfile_publicProfileSlug_key" ON "YouthProfile"("publicProfileSlug");

-- CreateIndex
CREATE INDEX "YouthProfile_userId_idx" ON "YouthProfile"("userId");

-- CreateIndex
CREATE INDEX "YouthProfile_publicProfileSlug_idx" ON "YouthProfile"("publicProfileSlug");

-- CreateIndex
CREATE UNIQUE INDEX "EmployerProfile_userId_key" ON "EmployerProfile"("userId");

-- CreateIndex
CREATE INDEX "EmployerProfile_userId_idx" ON "EmployerProfile"("userId");

-- CreateIndex
CREATE INDEX "MicroJob_postedById_idx" ON "MicroJob"("postedById");

-- CreateIndex
CREATE INDEX "MicroJob_category_idx" ON "MicroJob"("category");

-- CreateIndex
CREATE INDEX "MicroJob_status_idx" ON "MicroJob"("status");

-- CreateIndex
CREATE INDEX "MicroJob_location_idx" ON "MicroJob"("location");

-- CreateIndex
CREATE INDEX "MicroJob_dateTime_idx" ON "MicroJob"("dateTime");

-- CreateIndex
CREATE INDEX "Application_jobId_idx" ON "Application"("jobId");

-- CreateIndex
CREATE INDEX "Application_youthId_idx" ON "Application"("youthId");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Application_jobId_youthId_key" ON "Application"("jobId", "youthId");

-- CreateIndex
CREATE INDEX "Review_jobId_idx" ON "Review"("jobId");

-- CreateIndex
CREATE INDEX "Review_reviewedId_idx" ON "Review"("reviewedId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_jobId_reviewerId_reviewedId_key" ON "Review"("jobId", "reviewerId", "reviewedId");

-- CreateIndex
CREATE UNIQUE INDEX "CareerCard_roleName_key" ON "CareerCard"("roleName");

-- CreateIndex
CREATE INDEX "CareerCard_active_idx" ON "CareerCard"("active");

-- CreateIndex
CREATE INDEX "CareerCard_order_idx" ON "CareerCard"("order");

-- CreateIndex
CREATE INDEX "Swipe_youthId_idx" ON "Swipe"("youthId");

-- CreateIndex
CREATE INDEX "Swipe_careerCardId_idx" ON "Swipe"("careerCardId");

-- CreateIndex
CREATE INDEX "Swipe_saved_idx" ON "Swipe"("saved");

-- CreateIndex
CREATE UNIQUE INDEX "Swipe_youthId_careerCardId_key" ON "Swipe"("youthId", "careerCardId");

-- CreateIndex
CREATE INDEX "ProQuestion_youthId_idx" ON "ProQuestion"("youthId");

-- CreateIndex
CREATE INDEX "ProQuestion_status_idx" ON "ProQuestion"("status");

-- CreateIndex
CREATE INDEX "ProQuestion_createdAt_idx" ON "ProQuestion"("createdAt");

-- CreateIndex
CREATE INDEX "ProQuestion_category_idx" ON "ProQuestion"("category");

-- CreateIndex
CREATE INDEX "ProAnswer_questionId_idx" ON "ProAnswer"("questionId");

-- CreateIndex
CREATE INDEX "ProAnswer_answeredBy_idx" ON "ProAnswer"("answeredBy");

-- CreateIndex
CREATE INDEX "ProAnswer_publishedAt_idx" ON "ProAnswer"("publishedAt");

-- CreateIndex
CREATE INDEX "Report_reporterId_idx" ON "Report"("reporterId");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE INDEX "Report_targetType_targetId_idx" ON "Report"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "AiIntentLog_userId_idx" ON "AiIntentLog"("userId");

-- CreateIndex
CREATE INDEX "AiIntentLog_intentType_idx" ON "AiIntentLog"("intentType");

-- CreateIndex
CREATE INDEX "AiIntentLog_createdAt_idx" ON "AiIntentLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "HelpDoc_slug_key" ON "HelpDoc"("slug");

-- CreateIndex
CREATE INDEX "HelpDoc_slug_idx" ON "HelpDoc"("slug");

-- CreateIndex
CREATE INDEX "HelpDoc_active_idx" ON "HelpDoc"("active");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YouthProfile" ADD CONSTRAINT "YouthProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployerProfile" ADD CONSTRAINT "EmployerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MicroJob" ADD CONSTRAINT "MicroJob_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "MicroJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_youthId_fkey" FOREIGN KEY ("youthId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "MicroJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewedId_fkey" FOREIGN KEY ("reviewedId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Swipe" ADD CONSTRAINT "Swipe_youthId_fkey" FOREIGN KEY ("youthId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Swipe" ADD CONSTRAINT "Swipe_careerCardId_fkey" FOREIGN KEY ("careerCardId") REFERENCES "CareerCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProQuestion" ADD CONSTRAINT "ProQuestion_youthId_fkey" FOREIGN KEY ("youthId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProAnswer" ADD CONSTRAINT "ProAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ProQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProAnswer" ADD CONSTRAINT "ProAnswer_answeredBy_fkey" FOREIGN KEY ("answeredBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiIntentLog" ADD CONSTRAINT "AiIntentLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
