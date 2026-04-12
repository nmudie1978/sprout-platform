-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('YOUTH', 'EMPLOYER', 'ADMIN', 'COMMUNITY_GUARDIAN');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('EMAIL', 'VIPPS', 'BANKID');

-- CreateEnum
CREATE TYPE "YouthAgeBand" AS ENUM ('UNDER_SIXTEEN', 'SIXTEEN_SEVENTEEN', 'EIGHTEEN_TWENTY');

-- CreateEnum
CREATE TYPE "AgeBracket" AS ENUM ('SIXTEEN_SEVENTEEN', 'EIGHTEEN_TWENTY');

-- CreateEnum
CREATE TYPE "EligibilityAgeBracket" AS ENUM ('UNDER_15', 'AGE_15', 'AGE_16', 'AGE_17', 'AGE_18_PLUS');

-- CreateEnum
CREATE TYPE "JobRiskCategory" AS ENUM ('LOW_RISK', 'MEDIUM_RISK', 'HIGH_RISK');

-- CreateEnum
CREATE TYPE "AgePolicyStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AgeEligibilityAction" AS ENUM ('VISIBILITY_HIDDEN', 'VISIBILITY_SHOWN', 'APPLY_BLOCKED', 'APPLY_ALLOWED', 'JOB_PUBLISH_ADJUSTED');

-- CreateEnum
CREATE TYPE "GuardianRelationship" AS ENUM ('PARENT', 'GUARDIAN');

-- CreateEnum
CREATE TYPE "GuardianLinkStatus" AS ENUM ('PENDING', 'ACTIVE', 'REVOKED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('VIPPS', 'CASH', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "PaymentAgreementStatus" AS ENUM ('AGREED', 'MARKED_PAID');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'POSTED', 'ON_HOLD', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'REVIEWED', 'CANCELLED');

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

-- CreateEnum
CREATE TYPE "CommunityReportTargetType" AS ENUM ('JOB_POST', 'USER');

-- CreateEnum
CREATE TYPE "CommunityReportStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'ACTION_TAKEN', 'ESCALATED', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'BUSY', 'NOT_LOOKING');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ONBOARDING', 'PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'BANNED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NEW_APPLICATION', 'APPLICATION_ACCEPTED', 'APPLICATION_REJECTED', 'JOB_COMPLETED', 'NEW_REVIEW', 'NEW_RECOMMENDATION', 'NEW_MESSAGE', 'SYSTEM', 'GUARDIAN_CONSENT_REQUESTED', 'GUARDIAN_CONSENT_RECEIVED', 'ACCOUNT_VERIFIED', 'ACCOUNT_SUSPENDED', 'VERIFICATION_REMINDER', 'COMMUNITY_REPORT_RECEIVED', 'COMMUNITY_ACTION_TAKEN', 'REPORT_ESCALATED', 'GUARDIAN_LINK_REQUEST', 'GUARDIAN_LINK_ACCEPTED', 'GUARDIAN_LINK_REJECTED', 'GUARDIAN_LINK_REVOKED', 'NEW_SHADOW_REQUEST', 'SHADOW_APPROVED', 'SHADOW_DECLINED', 'SHADOW_COMPLETED', 'SHADOW_CANCELLED', 'SHADOW_REPORT');

-- CreateEnum
CREATE TYPE "RecommendationStatus" AS ENUM ('PENDING', 'VIEWED', 'CONTACTED', 'HIRED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "EarningStatus" AS ENUM ('PENDING', 'CONFIRMED');

-- CreateEnum
CREATE TYPE "BadgeType" AS ENUM ('FIRST_JOB', 'FIVE_JOBS', 'TEN_JOBS', 'TWENTY_FIVE_JOBS', 'FIFTY_JOBS', 'FIVE_STAR_RATING', 'RATING_STREAK', 'QUICK_RESPONDER', 'RELIABLE', 'SUPER_RELIABLE', 'EARLY_BIRD', 'CATEGORY_MASTER', 'MULTI_TALENTED', 'FIRST_REVIEW', 'HIGHLY_RATED');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('ACTIVE', 'FROZEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "MessageTemplateDirection" AS ENUM ('ANY', 'ADULT_TO_YOUTH', 'YOUTH_TO_ADULT');

-- CreateEnum
CREATE TYPE "MessageIntent" AS ENUM ('ASK_ABOUT_JOB', 'CONFIRM_AVAILABILITY', 'CONFIRM_TIME_DATE', 'CONFIRM_LOCATION', 'ASK_CLARIFICATION', 'CONFIRM_COMPLETION', 'UNABLE_TO_PROCEED');

-- CreateEnum
CREATE TYPE "ConversationReportCategory" AS ENUM ('GROOMING', 'SEXUAL_CONTENT', 'OFF_PLATFORM', 'HARASSMENT', 'INAPPROPRIATE_JOB', 'OTHER');

-- CreateEnum
CREATE TYPE "ConversationReportStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('ACCOUNT_CREATED', 'ACCOUNT_VERIFIED', 'ACCOUNT_SUSPENDED', 'ACCOUNT_BANNED', 'ACCOUNT_REINSTATED', 'ACCOUNT_DELETED', 'GUARDIAN_CONSENT_REQUESTED', 'GUARDIAN_CONSENT_GRANTED', 'GUARDIAN_CONSENT_REVOKED', 'TERMS_ACCEPTED', 'PRIVACY_CONSENT_GRANTED', 'EID_VERIFICATION_STARTED', 'EID_VERIFICATION_COMPLETED', 'EID_VERIFICATION_FAILED', 'AGE_VERIFIED', 'EMAIL_VERIFIED', 'PHONE_VERIFIED', 'DATA_EXPORT_REQUESTED', 'DATA_EXPORT_COMPLETED', 'DATA_DELETION_REQUESTED', 'DATA_DELETION_COMPLETED', 'USER_REPORTED', 'CONTENT_MODERATED', 'MESSAGE_FLAGGED', 'COMMUNITY_REPORT_CREATED', 'COMMUNITY_REPORT_CLAIMED', 'COMMUNITY_REPORT_ESCALATED', 'COMMUNITY_REPORT_RESOLVED', 'JOB_PAUSED', 'JOB_UNPAUSED', 'USER_PAUSED', 'USER_UNPAUSED', 'GUARDIAN_ASSIGNED', 'GUARDIAN_DEACTIVATED', 'CONVERSATION_CREATED', 'CONVERSATION_FROZEN', 'CONVERSATION_UNFROZEN', 'CONVERSATION_CLOSED', 'STRUCTURED_MESSAGE_SENT', 'USER_BLOCKED', 'USER_UNBLOCKED', 'CONVERSATION_REPORTED', 'REPORT_REVIEWED', 'REPORT_RESOLVED', 'REPORT_DISMISSED', 'JOURNEY_ITEM_DELETED', 'JOURNEY_ITEM_RESTORED', 'JOURNEY_DATA_EXPORTED', 'JOURNEY_DATA_IMPORTED');

-- CreateEnum
CREATE TYPE "LifeSkillAudience" AS ENUM ('YOUTH');

-- CreateEnum
CREATE TYPE "LifeSkillRecommendationSource" AS ENUM ('RULES', 'AI');

-- CreateEnum
CREATE TYPE "LifeSkillViewStatus" AS ENUM ('SHOWN', 'DISMISSED', 'SAVED');

-- CreateEnum
CREATE TYPE "SkillCategory" AS ENUM ('SERVICE', 'TECH', 'CARE', 'HOME', 'OUTDOOR', 'CREATIVE', 'OTHER');

-- CreateEnum
CREATE TYPE "JobCompletionOutcome" AS ENUM ('COMPLETED', 'NO_SHOW', 'CANCELLED', 'ISSUE_REPORTED');

-- CreateEnum
CREATE TYPE "SupervisionLevel" AS ENUM ('SUPERVISED', 'UNSUPERVISED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ResponsibilityLevel" AS ENUM ('BASIC', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "TrustSignalType" AS ENUM ('ON_TIME', 'GOOD_COMMS', 'REPEAT_HIRE', 'HELPED_OTHER', 'COMMUNITY_REPORT_RESOLVED', 'POSITIVE_TREND', 'CONSISTENCY_STREAK');

-- CreateEnum
CREATE TYPE "TrustSignalSource" AS ENUM ('JOB_COMPLETION', 'FEEDBACK', 'SYSTEM', 'COMMUNITY');

-- CreateEnum
CREATE TYPE "ProfessionalInsightMediaType" AS ENUM ('VIDEO', 'AUDIO', 'TEXT');

-- CreateEnum
CREATE TYPE "IndustryInsightVideoStatus" AS ENUM ('ACTIVE', 'REFRESH_DUE', 'REGENERATING', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "InsightsModuleStatus" AS ENUM ('ACTIVE', 'VERIFY_DUE', 'REGENERATING');

-- CreateEnum
CREATE TYPE "LearningProviderType" AS ENUM ('UNIVERSITY', 'PUBLIC_BODY', 'INDUSTRY_CERT', 'ONLINE_PLATFORM');

-- CreateEnum
CREATE TYPE "LearningDeliveryMode" AS ENUM ('ONLINE', 'IN_PERSON', 'HYBRID');

-- CreateEnum
CREATE TYPE "LearningRegionScope" AS ENUM ('LOCAL', 'REGIONAL', 'INTERNATIONAL');

-- CreateEnum
CREATE TYPE "LearningCertificationType" AS ENUM ('PROFESSIONAL_CERT', 'COURSE_COMPLETION', 'DIGITAL_BADGE', 'ACADEMIC_CREDIT', 'NONE');

-- CreateEnum
CREATE TYPE "LearningPrerequisiteLevel" AS ENUM ('NONE', 'BASIC', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "LearningResourceStatus" AS ENUM ('VERIFIED', 'PENDING_VERIFICATION', 'VERIFICATION_FAILED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CareerEventType" AS ENUM ('JOBFAIR', 'WEBINAR', 'MEETUP', 'WORKSHOP', 'CONFERENCE');

-- CreateEnum
CREATE TYPE "LocationMode" AS ENUM ('IN_PERSON', 'ONLINE', 'HYBRID');

-- CreateEnum
CREATE TYPE "FeedbackRole" AS ENUM ('TEEN_16_20', 'PARENT_GUARDIAN', 'ADULT_OTHER');

-- CreateEnum
CREATE TYPE "ShadowRequestStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'DECLINED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "ShadowFormat" AS ENUM ('WALKTHROUGH', 'HALF_DAY', 'FULL_DAY');

-- CreateEnum
CREATE TYPE "ShadowLearningGoal" AS ENUM ('DAILY_WORK', 'SKILLS_USED', 'WORK_ENVIRONMENT', 'CAREER_PATH', 'EDUCATION_REQUIRED', 'CHALLENGES');

-- CreateEnum
CREATE TYPE "CareerClipPlatform" AS ENUM ('TIKTOK', 'YOUTUBE_SHORTS');

-- CreateEnum
CREATE TYPE "CareerClipVerifiedStatus" AS ENUM ('PENDING', 'VALID', 'INVALID');

-- CreateEnum
CREATE TYPE "SavedItemType" AS ENUM ('ARTICLE', 'VIDEO', 'PODCAST', 'SHORT');

-- CreateEnum
CREATE TYPE "ReflectionContextType" AS ENUM ('ALIGNED_ACTION', 'ROLE_DEEP_DIVE', 'INDUSTRY_INSIGHTS', 'SHADOW_COMPLETED', 'CAREER_DISCOVERY', 'PLAN_BUILD', 'STRENGTHS_REFLECTION');

-- CreateEnum
CREATE TYPE "TimelineEventType" AS ENUM ('PROFILE_CREATED', 'STRENGTHS_CONFIRMED', 'CAREER_EXPLORED', 'ROLE_DEEP_DIVE_COMPLETED', 'PRIMARY_GOAL_SET', 'INDUSTRY_OUTLOOK_REVIEWED', 'REQUIREMENTS_REVIEWED', 'PLAN_CREATED', 'PLAN_UPDATED', 'SHADOW_REQUESTED', 'SHADOW_APPROVED', 'SHADOW_DECLINED', 'SHADOW_COMPLETED', 'SHADOW_SKIPPED', 'ALIGNED_ACTION_COMPLETED', 'ACTION_REFLECTION_SUBMITTED', 'EXTERNAL_FEEDBACK_RECEIVED', 'ITEM_SAVED', 'REFLECTION_RECORDED');

-- CreateEnum
CREATE TYPE "PathContributionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "emailVerified" TIMESTAMP(3),
    "role" "UserRole" NOT NULL DEFAULT 'YOUTH',
    "ageBracket" "AgeBracket",
    "dateOfBirth" TIMESTAMP(3),
    "location" TEXT,
    "doNotDisturb" BOOLEAN NOT NULL DEFAULT false,
    "accountStatus" "AccountStatus" NOT NULL DEFAULT 'ONBOARDING',
    "suspendedAt" TIMESTAMP(3),
    "suspensionReason" TEXT,
    "authProvider" "AuthProvider" NOT NULL DEFAULT 'EMAIL',
    "fullName" TEXT,
    "phoneNumber" TEXT,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerifiedAt" TIMESTAMP(3),
    "isVerifiedAdult" BOOLEAN NOT NULL DEFAULT false,
    "verificationProvider" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "youthAgeBand" "YouthAgeBand",
    "isPaused" BOOLEAN NOT NULL DEFAULT false,
    "pausedAt" TIMESTAMP(3),
    "pausedReason" TEXT,
    "pausedById" TEXT,
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
    "avatarId" TEXT DEFAULT 'kawaii-star',
    "avatarUpdatedAt" TIMESTAMP(3),
    "phoneNumber" TEXT,
    "bio" TEXT,
    "availability" TEXT,
    "availabilityStatus" "AvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',
    "interests" TEXT[],
    "skillTags" TEXT[],
    "profileVisibility" BOOLEAN NOT NULL DEFAULT false,
    "publicProfileSlug" TEXT,
    "completedJobsCount" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION,
    "reliabilityScore" INTEGER NOT NULL DEFAULT 0,
    "careerAspiration" TEXT,
    "city" TEXT,
    "region" TEXT,
    "country" TEXT DEFAULT 'Norway',
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "address" TEXT,
    "desiredRoles" TEXT[],
    "desiredSectors" TEXT[],
    "activeCareerGoal" TEXT,
    "learningPreferences" TEXT[],
    "availabilityTags" TEXT[],
    "locationBase" TEXT,
    "pathUpdatedAt" TIMESTAMP(3),
    "discoveryPreferences" JSONB,
    "primaryGoal" JSONB,
    "secondaryGoal" JSONB,
    "generatedTimeline" JSONB,
    "foundationCardData" JSONB,
    "journeyState" TEXT NOT NULL DEFAULT 'BASELINE_PROFILE',
    "journeyCompletedSteps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "journeySkippedSteps" JSONB,
    "journeyLastUpdated" TIMESTAMP(3),
    "journeySummary" JSONB,
    "onboardingCompletedAt" TIMESTAMP(3),
    "currentPriorities" TEXT[],
    "availabilityLevel" TEXT,
    "guardianEmail" TEXT,
    "guardianConsent" BOOLEAN NOT NULL DEFAULT false,
    "guardianConsentAt" TIMESTAMP(3),
    "guardianToken" TEXT,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YouthProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserNote" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerCareerSnapshot" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "shareWithEmployers" BOOLEAN NOT NULL DEFAULT false,
    "primaryInterest" VARCHAR(60),
    "exploring" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "learningGoals" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkerCareerSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyLogo" TEXT,
    "phoneNumber" TEXT,
    "bio" TEXT,
    "website" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "ageVerified" BOOLEAN NOT NULL DEFAULT false,
    "dateOfBirth" TIMESTAMP(3),
    "eidVerified" BOOLEAN NOT NULL DEFAULT false,
    "eidVerifiedAt" TIMESTAMP(3),
    "eidProvider" TEXT,
    "averageRating" DOUBLE PRECISION,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
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
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "dateTime" TIMESTAMP(3),
    "duration" INTEGER,
    "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
    "statusReason" TEXT,
    "requiredTraits" TEXT[],
    "images" TEXT[],
    "applicationDeadline" TIMESTAMP(3),
    "displayOrder" INTEGER,
    "eligibleAgeGroups" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "riskCategory" "JobRiskCategory" NOT NULL DEFAULT 'LOW_RISK',
    "minimumAge" INTEGER NOT NULL DEFAULT 15,
    "requiresAdultPresent" BOOLEAN NOT NULL DEFAULT false,
    "agePolicyVersion" INTEGER,
    "isPaused" BOOLEAN NOT NULL DEFAULT false,
    "pausedAt" TIMESTAMP(3),
    "pausedReason" TEXT,
    "pausedById" TEXT,
    "communityId" TEXT,
    "standardCategoryId" TEXT,
    "standardTemplateId" TEXT,
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
    "displayOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedJob" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "youthId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedJob_pkey" PRIMARY KEY ("id")
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
    "comment" TEXT,
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
    "certifications" TEXT[],
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

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Earning" (
    "id" TEXT NOT NULL,
    "youthId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "EarningStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Earning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "youthId" TEXT NOT NULL,
    "type" "BadgeType" NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "recommenderId" TEXT NOT NULL,
    "recommendedId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "employerId" TEXT NOT NULL,
    "message" TEXT,
    "status" "RecommendationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "participant1Id" TEXT NOT NULL,
    "participant2Id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "status" "ConversationStatus" NOT NULL DEFAULT 'ACTIVE',
    "frozenAt" TIMESTAMP(3),
    "frozenReason" TEXT,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentAgreement" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "agreedAmount" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'NOK',
    "status" "PaymentAgreementStatus" NOT NULL DEFAULT 'AGREED',
    "markedPaidById" TEXT,
    "markedPaidAt" TIMESTAMP(3),
    "notes" VARCHAR(200),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageTemplate" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "allowedFields" JSONB NOT NULL,
    "direction" "MessageTemplateDirection" NOT NULL DEFAULT 'ANY',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "category" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "intent" "MessageIntent",
    "variables" JSONB,
    "renderedMessage" TEXT,
    "templateId" TEXT,
    "payload" JSONB,
    "content" TEXT,
    "isLegacy" BOOLEAN NOT NULL DEFAULT false,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBlock" (
    "id" TEXT NOT NULL,
    "blockerId" TEXT NOT NULL,
    "blockedId" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationReport" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reportedId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "category" "ConversationReportCategory" NOT NULL,
    "details" VARCHAR(500),
    "status" "ConversationReportStatus" NOT NULL DEFAULT 'OPEN',
    "reviewerId" TEXT,
    "reviewerNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "actionTaken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoriteWorker" (
    "id" TEXT NOT NULL,
    "employerId" TEXT NOT NULL,
    "youthId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteWorker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerNote" (
    "id" TEXT NOT NULL,
    "employerId" TEXT NOT NULL,
    "youthId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkerNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobTemplate" (
    "id" TEXT NOT NULL,
    "employerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "JobCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "payType" "PayType" NOT NULL,
    "payAmount" DOUBLE PRECISION NOT NULL,
    "location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "duration" INTEGER,
    "requiredTraits" TEXT[],
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "actorId" TEXT,
    "action" "AuditAction" NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "consentType" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT true,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalAcceptance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "acceptedTermsAt" TIMESTAMP(3) NOT NULL,
    "acceptedPrivacyAt" TIMESTAMP(3) NOT NULL,
    "termsVersion" TEXT NOT NULL DEFAULT 'v1',
    "privacyVersion" TEXT NOT NULL DEFAULT 'v1',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalAcceptance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Community" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Community_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityGuardian" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "guardianUserId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deactivatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityGuardian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityReport" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "reporterUserId" TEXT NOT NULL,
    "targetType" "CommunityReportTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" "CommunityReportStatus" NOT NULL DEFAULT 'OPEN',
    "assignedGuardianUserId" TEXT,
    "guardianNote" TEXT,
    "escalatedToAdmin" BOOLEAN NOT NULL DEFAULT false,
    "actionTaken" TEXT,
    "actionTakenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LifeSkillCard" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "tags" TEXT[],
    "audience" "LifeSkillAudience" NOT NULL DEFAULT 'YOUTH',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" TEXT NOT NULL DEFAULT 'v1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LifeSkillCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LifeSkillEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LifeSkillEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LifeSkillRecommendation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "source" "LifeSkillRecommendationSource" NOT NULL DEFAULT 'RULES',
    "reason" VARCHAR(140),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LifeSkillRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LifeSkillView" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "recommendationId" TEXT,
    "status" "LifeSkillViewStatus" NOT NULL DEFAULT 'SHOWN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LifeSkillView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "showLifeSkills" BOOLEAN NOT NULL DEFAULT true,
    "preferredLocale" VARCHAR(5),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "SkillCategory" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSkillSignal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "strength" INTEGER NOT NULL DEFAULT 0,
    "evidence" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSkillSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobCompletion" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "youthId" TEXT NOT NULL,
    "employerId" TEXT NOT NULL,
    "outcome" "JobCompletionOutcome" NOT NULL DEFAULT 'COMPLETED',
    "supervision" "SupervisionLevel" NOT NULL DEFAULT 'UNKNOWN',
    "hoursWorked" DECIMAL(5,2),
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StructuredFeedback" (
    "id" TEXT NOT NULL,
    "jobCompletionId" TEXT NOT NULL,
    "punctuality" INTEGER NOT NULL,
    "communication" INTEGER NOT NULL,
    "quality" INTEGER NOT NULL,
    "respectfulness" INTEGER NOT NULL,
    "followedInstructions" INTEGER NOT NULL,
    "wouldRehire" BOOLEAN NOT NULL,
    "responsibilityLevel" "ResponsibilityLevel" NOT NULL DEFAULT 'BASIC',
    "skillsDemonstrated" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StructuredFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrustSignal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TrustSignalType" NOT NULL,
    "sourceType" "TrustSignalSource" NOT NULL,
    "sourceId" TEXT,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrustSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerRealityCheck" (
    "id" TEXT NOT NULL,
    "roleSlug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "dayToDay" JSONB NOT NULL,
    "misconceptions" JSONB NOT NULL,
    "hardParts" JSONB NOT NULL,
    "starterSteps" JSONB NOT NULL,
    "typicalPath" JSONB NOT NULL,
    "skillGaps" JSONB NOT NULL,
    "saturationNote" VARCHAR(300) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerRealityCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedIndustry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "industryId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedIndustry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndustryProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "industryId" TEXT NOT NULL,
    "stepType" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IndustryProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerQuizResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "answers" JSONB NOT NULL,
    "topIndustries" JSONB NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareerQuizResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterSubscription" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT,
    "industries" TEXT[],
    "frequency" TEXT NOT NULL DEFAULT 'weekly',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "confirmedAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsletterSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StandardJobCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StandardJobCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StandardJobTemplate" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortDesc" TEXT NOT NULL,
    "suggestedPay" TEXT,
    "duration" TEXT,
    "tags" TEXT[],
    "ageGuidance" TEXT,
    "safetyNotes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StandardJobTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VaultItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "jobId" TEXT,
    "url" TEXT,
    "metadata" JSONB,
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VaultItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpportunityAlertPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "radiusKm" INTEGER NOT NULL DEFAULT 10,
    "categories" TEXT[],
    "roles" TEXT[],
    "notifyEmail" BOOLEAN NOT NULL DEFAULT false,
    "notifyPush" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpportunityAlertPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpportunityAlertEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "seenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpportunityAlertEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PathSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "direction" TEXT[],
    "nextActions" JSONB NOT NULL,
    "confidence" TEXT NOT NULL,
    "rationale" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PathSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfessionalInsight" (
    "id" TEXT NOT NULL,
    "careerTag" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "mediaType" "ProfessionalInsightMediaType" NOT NULL,
    "mediaUrl" TEXT,
    "transcript" TEXT,
    "authorName" TEXT,
    "authorRole" TEXT,
    "authorYears" INTEGER,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfessionalInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiChatMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "intent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndustryInsightVideo" (
    "id" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "role" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "videoUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "duration" TEXT,
    "channel" TEXT,
    "topic" TEXT,
    "generatedBy" TEXT NOT NULL DEFAULT 'manual',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "refreshDueAt" TIMESTAMP(3) NOT NULL,
    "lastCheckedAt" TIMESTAMP(3),
    "status" "IndustryInsightVideoStatus" NOT NULL DEFAULT 'ACTIVE',
    "version" INTEGER NOT NULL DEFAULT 1,
    "previousVersionId" TEXT,
    "aiPrompt" TEXT,
    "aiModel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndustryInsightVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndustryInsightsModule" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "contentJson" JSONB NOT NULL,
    "renderedSummary" TEXT,
    "sourceMeta" JSONB,
    "lastGeneratedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastVerifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "refreshCadenceDays" INTEGER NOT NULL DEFAULT 90,
    "status" "InsightsModuleStatus" NOT NULL DEFAULT 'ACTIVE',
    "changeThreshold" JSONB NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndustryInsightsModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerifiedLearningResource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerType" "LearningProviderType" NOT NULL,
    "deliveryMode" "LearningDeliveryMode" NOT NULL,
    "regionScope" "LearningRegionScope" NOT NULL,
    "regionDetails" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "duration" TEXT NOT NULL,
    "timeCommitmentHours" INTEGER,
    "cost" TEXT NOT NULL,
    "costAmount" DECIMAL(10,2),
    "costCurrency" TEXT,
    "financialAidAvailable" BOOLEAN NOT NULL DEFAULT false,
    "certificationType" "LearningCertificationType" NOT NULL,
    "recognisedBy" TEXT[],
    "industryValue" TEXT,
    "minimumAge" INTEGER,
    "ageSuitability" TEXT NOT NULL,
    "prerequisiteLevel" "LearningPrerequisiteLevel" NOT NULL,
    "prerequisiteDetails" TEXT,
    "relevantCareers" TEXT[],
    "relevantSkills" TEXT[],
    "officialUrl" TEXT NOT NULL,
    "status" "LearningResourceStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "lastVerifiedAt" TIMESTAMP(3),
    "verificationNotes" TEXT,
    "verificationSource" TEXT,
    "description" TEXT,
    "highlights" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerifiedLearningResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLearningProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'saved',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLearningProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuardianProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "relationship" "GuardianRelationship" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuardianProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerGuardianLink" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "guardianId" TEXT,
    "status" "GuardianLinkStatus" NOT NULL DEFAULT 'PENDING',
    "inviteCode" TEXT,
    "inviteExpiresAt" TIMESTAMP(3),
    "consentGivenAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "visibilityScope" JSONB NOT NULL DEFAULT '{"canSeeApplications":true,"canSeeSavedJobs":true,"canSeeMessagesMeta":true,"canSeeMessageContent":false,"canSeeProfileBasics":true}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkerGuardianLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuardianActivitySnapshot" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "guardianId" TEXT NOT NULL,
    "summaryJson" JSONB NOT NULL,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuardianActivitySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgePolicy" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "AgePolicyStatus" NOT NULL DEFAULT 'ACTIVE',
    "policyJson" JSONB NOT NULL,
    "description" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "AgePolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgeEligibilityAuditLog" (
    "id" TEXT NOT NULL,
    "workerId" TEXT,
    "jobId" TEXT NOT NULL,
    "employerId" TEXT,
    "action" "AgeEligibilityAction" NOT NULL,
    "reason" TEXT NOT NULL,
    "requiredMinAge" INTEGER NOT NULL,
    "userAge" INTEGER,
    "userAgeBracket" TEXT,
    "policyVersion" INTEGER NOT NULL,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgeEligibilityAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewQuestion" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "tip" TEXT,
    "answerHint" TEXT,
    "tags" TEXT[],
    "isGenerated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedQuestionSet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleTarget" TEXT,
    "category" TEXT NOT NULL,
    "difficultyMix" JSONB NOT NULL,
    "focusAreas" TEXT[],
    "generatorType" TEXT NOT NULL DEFAULT 'MOCK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeneratedQuestionSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedSetQuestion" (
    "id" TEXT NOT NULL,
    "setId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GeneratedSetQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserQuestionState" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "saved" BOOLEAN NOT NULL DEFAULT false,
    "practicedCount" INTEGER NOT NULL DEFAULT 0,
    "lastPracticedAt" TIMESTAMP(3),
    "confidence" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserQuestionState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "CareerEventType" NOT NULL,
    "description" TEXT NOT NULL,
    "organizer" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "time" TEXT NOT NULL,
    "locationMode" "LocationMode" NOT NULL,
    "city" TEXT,
    "region" TEXT,
    "country" TEXT,
    "venue" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "onlineUrl" TEXT,
    "registrationUrl" TEXT NOT NULL,
    "spots" INTEGER,
    "isYouthFocused" BOOLEAN NOT NULL DEFAULT false,
    "industryTypes" TEXT[],
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verificationNotes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT,
    "role" "FeedbackRole" NOT NULL,
    "q1" INTEGER NOT NULL,
    "q2" INTEGER NOT NULL,
    "q3" INTEGER NOT NULL,
    "q4" INTEGER NOT NULL,
    "q5" INTEGER NOT NULL,
    "confusingText" VARCHAR(500),
    "clarityTopics" TEXT[],
    "source" VARCHAR(50),
    "userAgent" VARCHAR(200),
    "appVersion" VARCHAR(20),

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShadowRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "ShadowRequestStatus" NOT NULL DEFAULT 'DRAFT',
    "youthId" TEXT NOT NULL,
    "hostId" TEXT,
    "learningGoals" "ShadowLearningGoal"[],
    "roleTitle" VARCHAR(100) NOT NULL,
    "roleCategory" VARCHAR(50),
    "isObservationOnly" BOOLEAN NOT NULL DEFAULT true,
    "format" "ShadowFormat" NOT NULL DEFAULT 'WALKTHROUGH',
    "availabilityStart" TIMESTAMP(3),
    "availabilityEnd" TIMESTAMP(3),
    "preferredDays" TEXT[],
    "flexibleSchedule" BOOLEAN NOT NULL DEFAULT true,
    "commitsPunctuality" BOOLEAN NOT NULL DEFAULT true,
    "commitsCuriosity" BOOLEAN NOT NULL DEFAULT true,
    "commitsRespect" BOOLEAN NOT NULL DEFAULT true,
    "commitsFollowRules" BOOLEAN NOT NULL DEFAULT true,
    "acceptsNda" BOOLEAN NOT NULL DEFAULT false,
    "acceptsSafeguarding" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT NOT NULL,
    "aiAssistedDraft" BOOLEAN NOT NULL DEFAULT false,
    "scheduledDate" TIMESTAMP(3),
    "scheduledStartTime" TEXT,
    "scheduledEndTime" TEXT,
    "locationName" TEXT,
    "locationAddress" TEXT,
    "hostResponseAt" TIMESTAMP(3),
    "hostMessage" TEXT,
    "declineReason" VARCHAR(200),
    "requiresGuardianConsent" BOOLEAN NOT NULL DEFAULT false,
    "guardianNotified" BOOLEAN NOT NULL DEFAULT false,
    "guardianConsentAt" TIMESTAMP(3),
    "hostVerified" BOOLEAN NOT NULL DEFAULT false,
    "publicWorkplace" BOOLEAN NOT NULL DEFAULT true,
    "noPrivateTransport" BOOLEAN NOT NULL DEFAULT true,
    "noIsolatedScenarios" BOOLEAN NOT NULL DEFAULT true,
    "emergencyContact" VARCHAR(100),
    "emergencyContactPhone" VARCHAR(20),
    "completedAt" TIMESTAMP(3),
    "youthAttended" BOOLEAN,
    "durationMinutes" INTEGER,
    "reportedIssue" BOOLEAN NOT NULL DEFAULT false,
    "reportedAt" TIMESTAMP(3),
    "reportDetails" TEXT,
    "reportResolvedAt" TIMESTAMP(3),

    CONSTRAINT "ShadowRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShadowReflection" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "shadowRequestId" TEXT NOT NULL,
    "youthId" TEXT NOT NULL,
    "whatSurprised" TEXT,
    "whatLiked" TEXT,
    "whatDisliked" TEXT,
    "skillsNoticed" TEXT[],
    "wouldExplore" BOOLEAN,
    "wouldExploreReason" TEXT,
    "keyTakeaways" TEXT[],
    "questionsAsked" TEXT[],
    "followUpActions" TEXT[],
    "overallExperience" INTEGER,
    "hostHelpfulness" INTEGER,
    "addedToTimeline" BOOLEAN NOT NULL DEFAULT false,
    "strengthsUpdated" BOOLEAN NOT NULL DEFAULT false,
    "goalStackUpdated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ShadowReflection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerClip" (
    "id" TEXT NOT NULL,
    "careerSlug" VARCHAR(100) NOT NULL,
    "categorySlug" VARCHAR(100) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "platform" "CareerClipPlatform" NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "thumbnailUrl" VARCHAR(500),
    "durationSecs" INTEGER,
    "verifiedStatus" "CareerClipVerifiedStatus" NOT NULL DEFAULT 'PENDING',
    "lastCheckedAt" TIMESTAMP(3),
    "checkFailReason" VARCHAR(500),
    "sourceLabel" VARCHAR(100) NOT NULL DEFAULT '',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerClip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedItem" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "type" "SavedItemType" NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "url" VARCHAR(1000) NOT NULL,
    "source" VARCHAR(100),
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "careerPathId" TEXT,
    "roleId" TEXT,
    "thumbnail" VARCHAR(500),
    "description" TEXT,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SavedItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyReflection" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "contextType" "ReflectionContextType" NOT NULL,
    "contextId" TEXT,
    "prompt" VARCHAR(500) NOT NULL,
    "response" TEXT,
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JourneyReflection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TimelineEventType" NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyNote" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "title" VARCHAR(200),
    "content" TEXT NOT NULL,
    "color" VARCHAR(20),
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "groupName" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "JourneyNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TraitObservation" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "traitId" VARCHAR(50) NOT NULL,
    "observation" VARCHAR(20) NOT NULL,
    "contextType" VARCHAR(50),
    "contextId" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TraitObservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneySnapshot" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "trigger" VARCHAR(50) NOT NULL,
    "label" VARCHAR(200),
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JourneySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentInteraction" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "contentUrl" VARCHAR(1000) NOT NULL,
    "interactionType" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TranslationCache" (
    "id" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "sourceLocale" VARCHAR(5) NOT NULL,
    "targetLocale" VARCHAR(5) NOT NULL,
    "sourceText" TEXT NOT NULL,
    "translated" TEXT NOT NULL,
    "contentType" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TranslationCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyGoalData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "goalTitle" TEXT NOT NULL,
    "journeyState" TEXT NOT NULL DEFAULT 'REFLECT_ON_STRENGTHS',
    "journeyCompletedSteps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "journeySkippedSteps" JSONB,
    "journeySummary" JSONB,
    "roadmapCardData" JSONB,
    "generatedTimeline" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JourneyGoalData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerStory" (
    "id" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "duration" TEXT,
    "name" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "company" TEXT,
    "location" TEXT,
    "yearsInRole" INTEGER,
    "careerTags" TEXT[],
    "industry" TEXT,
    "headline" TEXT NOT NULL,
    "takeaways" TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerStory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoCache" (
    "id" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerPathContribution" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "currentTitle" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT,
    "steps" JSONB NOT NULL,
    "careerTags" TEXT[],
    "didAttendUniversity" BOOLEAN NOT NULL DEFAULT false,
    "yearsOfExperience" INTEGER,
    "headline" TEXT,
    "advice" TEXT,
    "status" "PathContributionStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "submittedByEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerPathContribution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_accountStatus_idx" ON "User"("accountStatus");

-- CreateIndex
CREATE INDEX "User_isPaused_idx" ON "User"("isPaused");

-- CreateIndex
CREATE INDEX "User_isVerifiedAdult_idx" ON "User"("isVerifiedAdult");

-- CreateIndex
CREATE INDEX "User_authProvider_idx" ON "User"("authProvider");

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
CREATE UNIQUE INDEX "YouthProfile_guardianToken_key" ON "YouthProfile"("guardianToken");

-- CreateIndex
CREATE INDEX "YouthProfile_userId_idx" ON "YouthProfile"("userId");

-- CreateIndex
CREATE INDEX "YouthProfile_publicProfileSlug_idx" ON "YouthProfile"("publicProfileSlug");

-- CreateIndex
CREATE INDEX "YouthProfile_availabilityStatus_idx" ON "YouthProfile"("availabilityStatus");

-- CreateIndex
CREATE INDEX "YouthProfile_guardianToken_idx" ON "YouthProfile"("guardianToken");

-- CreateIndex
CREATE INDEX "YouthProfile_profileVisibility_idx" ON "YouthProfile"("profileVisibility");

-- CreateIndex
CREATE INDEX "YouthProfile_averageRating_idx" ON "YouthProfile"("averageRating");

-- CreateIndex
CREATE INDEX "YouthProfile_completedJobsCount_idx" ON "YouthProfile"("completedJobsCount");

-- CreateIndex
CREATE INDEX "YouthProfile_city_idx" ON "YouthProfile"("city");

-- CreateIndex
CREATE INDEX "UserNote_profileId_idx" ON "UserNote"("profileId");

-- CreateIndex
CREATE INDEX "UserNote_createdAt_idx" ON "UserNote"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WorkerCareerSnapshot_workerId_key" ON "WorkerCareerSnapshot"("workerId");

-- CreateIndex
CREATE INDEX "WorkerCareerSnapshot_workerId_idx" ON "WorkerCareerSnapshot"("workerId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployerProfile_userId_key" ON "EmployerProfile"("userId");

-- CreateIndex
CREATE INDEX "EmployerProfile_userId_idx" ON "EmployerProfile"("userId");

-- CreateIndex
CREATE INDEX "EmployerProfile_eidVerified_idx" ON "EmployerProfile"("eidVerified");

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
CREATE INDEX "MicroJob_applicationDeadline_idx" ON "MicroJob"("applicationDeadline");

-- CreateIndex
CREATE INDEX "MicroJob_displayOrder_idx" ON "MicroJob"("displayOrder");

-- CreateIndex
CREATE INDEX "MicroJob_communityId_idx" ON "MicroJob"("communityId");

-- CreateIndex
CREATE INDEX "MicroJob_isPaused_idx" ON "MicroJob"("isPaused");

-- CreateIndex
CREATE INDEX "MicroJob_createdAt_idx" ON "MicroJob"("createdAt");

-- CreateIndex
CREATE INDEX "MicroJob_updatedAt_idx" ON "MicroJob"("updatedAt");

-- CreateIndex
CREATE INDEX "MicroJob_status_category_idx" ON "MicroJob"("status", "category");

-- CreateIndex
CREATE INDEX "MicroJob_status_createdAt_idx" ON "MicroJob"("status", "createdAt");

-- CreateIndex
CREATE INDEX "MicroJob_standardCategoryId_idx" ON "MicroJob"("standardCategoryId");

-- CreateIndex
CREATE INDEX "MicroJob_standardTemplateId_idx" ON "MicroJob"("standardTemplateId");

-- CreateIndex
CREATE INDEX "MicroJob_minimumAge_idx" ON "MicroJob"("minimumAge");

-- CreateIndex
CREATE INDEX "MicroJob_riskCategory_idx" ON "MicroJob"("riskCategory");

-- CreateIndex
CREATE INDEX "Application_jobId_idx" ON "Application"("jobId");

-- CreateIndex
CREATE INDEX "Application_youthId_idx" ON "Application"("youthId");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE INDEX "Application_displayOrder_idx" ON "Application"("displayOrder");

-- CreateIndex
CREATE INDEX "Application_youthId_displayOrder_createdAt_idx" ON "Application"("youthId", "displayOrder", "createdAt");

-- CreateIndex
CREATE INDEX "Application_youthId_status_idx" ON "Application"("youthId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Application_jobId_youthId_key" ON "Application"("jobId", "youthId");

-- CreateIndex
CREATE INDEX "SavedJob_youthId_createdAt_idx" ON "SavedJob"("youthId", "createdAt");

-- CreateIndex
CREATE INDEX "SavedJob_jobId_idx" ON "SavedJob"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedJob_jobId_youthId_key" ON "SavedJob"("jobId", "youthId");

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
CREATE INDEX "Swipe_youthId_saved_idx" ON "Swipe"("youthId", "saved");

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

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Earning_youthId_idx" ON "Earning"("youthId");

-- CreateIndex
CREATE INDEX "Earning_jobId_idx" ON "Earning"("jobId");

-- CreateIndex
CREATE INDEX "Earning_status_idx" ON "Earning"("status");

-- CreateIndex
CREATE INDEX "Earning_earnedAt_idx" ON "Earning"("earnedAt");

-- CreateIndex
CREATE INDEX "Earning_youthId_earnedAt_idx" ON "Earning"("youthId", "earnedAt");

-- CreateIndex
CREATE INDEX "Earning_youthId_status_idx" ON "Earning"("youthId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Earning_youthId_jobId_key" ON "Earning"("youthId", "jobId");

-- CreateIndex
CREATE INDEX "Badge_youthId_idx" ON "Badge"("youthId");

-- CreateIndex
CREATE INDEX "Badge_type_idx" ON "Badge"("type");

-- CreateIndex
CREATE INDEX "Badge_earnedAt_idx" ON "Badge"("earnedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Badge_youthId_type_key" ON "Badge"("youthId", "type");

-- CreateIndex
CREATE INDEX "Recommendation_recommenderId_idx" ON "Recommendation"("recommenderId");

-- CreateIndex
CREATE INDEX "Recommendation_recommendedId_idx" ON "Recommendation"("recommendedId");

-- CreateIndex
CREATE INDEX "Recommendation_jobId_idx" ON "Recommendation"("jobId");

-- CreateIndex
CREATE INDEX "Recommendation_employerId_idx" ON "Recommendation"("employerId");

-- CreateIndex
CREATE UNIQUE INDEX "Recommendation_recommenderId_recommendedId_jobId_key" ON "Recommendation"("recommenderId", "recommendedId", "jobId");

-- CreateIndex
CREATE INDEX "Conversation_participant1Id_idx" ON "Conversation"("participant1Id");

-- CreateIndex
CREATE INDEX "Conversation_participant2Id_idx" ON "Conversation"("participant2Id");

-- CreateIndex
CREATE INDEX "Conversation_jobId_idx" ON "Conversation"("jobId");

-- CreateIndex
CREATE INDEX "Conversation_status_idx" ON "Conversation"("status");

-- CreateIndex
CREATE INDEX "Conversation_lastMessageAt_idx" ON "Conversation"("lastMessageAt");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_participant1Id_participant2Id_jobId_key" ON "Conversation"("participant1Id", "participant2Id", "jobId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAgreement_conversationId_key" ON "PaymentAgreement"("conversationId");

-- CreateIndex
CREATE INDEX "PaymentAgreement_conversationId_idx" ON "PaymentAgreement"("conversationId");

-- CreateIndex
CREATE INDEX "PaymentAgreement_status_idx" ON "PaymentAgreement"("status");

-- CreateIndex
CREATE UNIQUE INDEX "MessageTemplate_key_key" ON "MessageTemplate"("key");

-- CreateIndex
CREATE INDEX "MessageTemplate_key_idx" ON "MessageTemplate"("key");

-- CreateIndex
CREATE INDEX "MessageTemplate_isActive_idx" ON "MessageTemplate"("isActive");

-- CreateIndex
CREATE INDEX "MessageTemplate_direction_idx" ON "MessageTemplate"("direction");

-- CreateIndex
CREATE INDEX "MessageTemplate_category_idx" ON "MessageTemplate"("category");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_templateId_idx" ON "Message"("templateId");

-- CreateIndex
CREATE INDEX "Message_intent_idx" ON "Message"("intent");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE INDEX "Message_read_idx" ON "Message"("read");

-- CreateIndex
CREATE INDEX "Message_isLegacy_idx" ON "Message"("isLegacy");

-- CreateIndex
CREATE INDEX "Message_conversationId_senderId_read_idx" ON "Message"("conversationId", "senderId", "read");

-- CreateIndex
CREATE INDEX "UserBlock_blockerId_idx" ON "UserBlock"("blockerId");

-- CreateIndex
CREATE INDEX "UserBlock_blockedId_idx" ON "UserBlock"("blockedId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBlock_blockerId_blockedId_key" ON "UserBlock"("blockerId", "blockedId");

-- CreateIndex
CREATE INDEX "ConversationReport_reporterId_idx" ON "ConversationReport"("reporterId");

-- CreateIndex
CREATE INDEX "ConversationReport_reportedId_idx" ON "ConversationReport"("reportedId");

-- CreateIndex
CREATE INDEX "ConversationReport_conversationId_idx" ON "ConversationReport"("conversationId");

-- CreateIndex
CREATE INDEX "ConversationReport_status_idx" ON "ConversationReport"("status");

-- CreateIndex
CREATE INDEX "ConversationReport_category_idx" ON "ConversationReport"("category");

-- CreateIndex
CREATE INDEX "ConversationReport_createdAt_idx" ON "ConversationReport"("createdAt");

-- CreateIndex
CREATE INDEX "FavoriteWorker_employerId_idx" ON "FavoriteWorker"("employerId");

-- CreateIndex
CREATE INDEX "FavoriteWorker_youthId_idx" ON "FavoriteWorker"("youthId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteWorker_employerId_youthId_key" ON "FavoriteWorker"("employerId", "youthId");

-- CreateIndex
CREATE INDEX "WorkerNote_employerId_idx" ON "WorkerNote"("employerId");

-- CreateIndex
CREATE INDEX "WorkerNote_youthId_idx" ON "WorkerNote"("youthId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkerNote_employerId_youthId_key" ON "WorkerNote"("employerId", "youthId");

-- CreateIndex
CREATE INDEX "JobTemplate_employerId_idx" ON "JobTemplate"("employerId");

-- CreateIndex
CREATE INDEX "JobTemplate_usageCount_idx" ON "JobTemplate"("usageCount");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "ConsentRecord_userId_idx" ON "ConsentRecord"("userId");

-- CreateIndex
CREATE INDEX "ConsentRecord_consentType_idx" ON "ConsentRecord"("consentType");

-- CreateIndex
CREATE INDEX "ConsentRecord_grantedAt_idx" ON "ConsentRecord"("grantedAt");

-- CreateIndex
CREATE UNIQUE INDEX "LegalAcceptance_userId_key" ON "LegalAcceptance"("userId");

-- CreateIndex
CREATE INDEX "LegalAcceptance_userId_idx" ON "LegalAcceptance"("userId");

-- CreateIndex
CREATE INDEX "LegalAcceptance_createdAt_idx" ON "LegalAcceptance"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Community_name_key" ON "Community"("name");

-- CreateIndex
CREATE INDEX "Community_name_idx" ON "Community"("name");

-- CreateIndex
CREATE INDEX "Community_isActive_idx" ON "Community"("isActive");

-- CreateIndex
CREATE INDEX "CommunityGuardian_guardianUserId_idx" ON "CommunityGuardian"("guardianUserId");

-- CreateIndex
CREATE INDEX "CommunityGuardian_communityId_idx" ON "CommunityGuardian"("communityId");

-- CreateIndex
CREATE INDEX "CommunityGuardian_isActive_idx" ON "CommunityGuardian"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityGuardian_communityId_guardianUserId_key" ON "CommunityGuardian"("communityId", "guardianUserId");

-- CreateIndex
CREATE INDEX "CommunityReport_communityId_status_idx" ON "CommunityReport"("communityId", "status");

-- CreateIndex
CREATE INDEX "CommunityReport_reporterUserId_idx" ON "CommunityReport"("reporterUserId");

-- CreateIndex
CREATE INDEX "CommunityReport_targetType_targetId_idx" ON "CommunityReport"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "CommunityReport_assignedGuardianUserId_idx" ON "CommunityReport"("assignedGuardianUserId");

-- CreateIndex
CREATE INDEX "CommunityReport_status_idx" ON "CommunityReport"("status");

-- CreateIndex
CREATE INDEX "CommunityReport_reporterUserId_createdAt_idx" ON "CommunityReport"("reporterUserId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LifeSkillCard_key_key" ON "LifeSkillCard"("key");

-- CreateIndex
CREATE INDEX "LifeSkillCard_key_idx" ON "LifeSkillCard"("key");

-- CreateIndex
CREATE INDEX "LifeSkillCard_isActive_idx" ON "LifeSkillCard"("isActive");

-- CreateIndex
CREATE INDEX "LifeSkillCard_audience_idx" ON "LifeSkillCard"("audience");

-- CreateIndex
CREATE INDEX "LifeSkillEvent_userId_idx" ON "LifeSkillEvent"("userId");

-- CreateIndex
CREATE INDEX "LifeSkillEvent_eventType_idx" ON "LifeSkillEvent"("eventType");

-- CreateIndex
CREATE INDEX "LifeSkillEvent_createdAt_idx" ON "LifeSkillEvent"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LifeSkillEvent_userId_eventType_entityId_key" ON "LifeSkillEvent"("userId", "eventType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "LifeSkillRecommendation_eventId_key" ON "LifeSkillRecommendation"("eventId");

-- CreateIndex
CREATE INDEX "LifeSkillRecommendation_userId_idx" ON "LifeSkillRecommendation"("userId");

-- CreateIndex
CREATE INDEX "LifeSkillRecommendation_cardId_idx" ON "LifeSkillRecommendation"("cardId");

-- CreateIndex
CREATE INDEX "LifeSkillRecommendation_source_idx" ON "LifeSkillRecommendation"("source");

-- CreateIndex
CREATE INDEX "LifeSkillRecommendation_createdAt_idx" ON "LifeSkillRecommendation"("createdAt");

-- CreateIndex
CREATE INDEX "LifeSkillView_userId_idx" ON "LifeSkillView"("userId");

-- CreateIndex
CREATE INDEX "LifeSkillView_cardId_idx" ON "LifeSkillView"("cardId");

-- CreateIndex
CREATE INDEX "LifeSkillView_status_idx" ON "LifeSkillView"("status");

-- CreateIndex
CREATE INDEX "LifeSkillView_createdAt_idx" ON "LifeSkillView"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LifeSkillView_userId_cardId_recommendationId_key" ON "LifeSkillView"("userId", "cardId", "recommendationId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_userId_key" ON "UserPreferences"("userId");

-- CreateIndex
CREATE INDEX "UserPreferences_userId_idx" ON "UserPreferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_slug_key" ON "Skill"("slug");

-- CreateIndex
CREATE INDEX "Skill_category_idx" ON "Skill"("category");

-- CreateIndex
CREATE INDEX "Skill_slug_idx" ON "Skill"("slug");

-- CreateIndex
CREATE INDEX "UserSkillSignal_userId_skillId_idx" ON "UserSkillSignal"("userId", "skillId");

-- CreateIndex
CREATE INDEX "UserSkillSignal_userId_idx" ON "UserSkillSignal"("userId");

-- CreateIndex
CREATE INDEX "UserSkillSignal_skillId_idx" ON "UserSkillSignal"("skillId");

-- CreateIndex
CREATE INDEX "UserSkillSignal_source_idx" ON "UserSkillSignal"("source");

-- CreateIndex
CREATE INDEX "JobCompletion_jobId_idx" ON "JobCompletion"("jobId");

-- CreateIndex
CREATE INDEX "JobCompletion_youthId_idx" ON "JobCompletion"("youthId");

-- CreateIndex
CREATE INDEX "JobCompletion_employerId_idx" ON "JobCompletion"("employerId");

-- CreateIndex
CREATE INDEX "JobCompletion_outcome_idx" ON "JobCompletion"("outcome");

-- CreateIndex
CREATE INDEX "JobCompletion_completedAt_idx" ON "JobCompletion"("completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "JobCompletion_jobId_youthId_key" ON "JobCompletion"("jobId", "youthId");

-- CreateIndex
CREATE UNIQUE INDEX "StructuredFeedback_jobCompletionId_key" ON "StructuredFeedback"("jobCompletionId");

-- CreateIndex
CREATE INDEX "StructuredFeedback_jobCompletionId_idx" ON "StructuredFeedback"("jobCompletionId");

-- CreateIndex
CREATE INDEX "StructuredFeedback_createdAt_idx" ON "StructuredFeedback"("createdAt");

-- CreateIndex
CREATE INDEX "TrustSignal_userId_idx" ON "TrustSignal"("userId");

-- CreateIndex
CREATE INDEX "TrustSignal_type_idx" ON "TrustSignal"("type");

-- CreateIndex
CREATE INDEX "TrustSignal_sourceType_idx" ON "TrustSignal"("sourceType");

-- CreateIndex
CREATE INDEX "TrustSignal_createdAt_idx" ON "TrustSignal"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CareerRealityCheck_roleSlug_key" ON "CareerRealityCheck"("roleSlug");

-- CreateIndex
CREATE INDEX "CareerRealityCheck_roleSlug_idx" ON "CareerRealityCheck"("roleSlug");

-- CreateIndex
CREATE INDEX "CareerRealityCheck_isActive_idx" ON "CareerRealityCheck"("isActive");

-- CreateIndex
CREATE INDEX "SavedIndustry_userId_idx" ON "SavedIndustry"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedIndustry_userId_industryId_key" ON "SavedIndustry"("userId", "industryId");

-- CreateIndex
CREATE INDEX "IndustryProgress_userId_industryId_idx" ON "IndustryProgress"("userId", "industryId");

-- CreateIndex
CREATE UNIQUE INDEX "IndustryProgress_userId_industryId_stepType_stepId_key" ON "IndustryProgress"("userId", "industryId", "stepType", "stepId");

-- CreateIndex
CREATE INDEX "CareerQuizResult_userId_idx" ON "CareerQuizResult"("userId");

-- CreateIndex
CREATE INDEX "CareerQuizResult_sessionId_idx" ON "CareerQuizResult"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscription_email_key" ON "NewsletterSubscription"("email");

-- CreateIndex
CREATE INDEX "NewsletterSubscription_userId_idx" ON "NewsletterSubscription"("userId");

-- CreateIndex
CREATE INDEX "NewsletterSubscription_email_idx" ON "NewsletterSubscription"("email");

-- CreateIndex
CREATE UNIQUE INDEX "StandardJobCategory_slug_key" ON "StandardJobCategory"("slug");

-- CreateIndex
CREATE INDEX "StandardJobCategory_slug_idx" ON "StandardJobCategory"("slug");

-- CreateIndex
CREATE INDEX "StandardJobCategory_isActive_idx" ON "StandardJobCategory"("isActive");

-- CreateIndex
CREATE INDEX "StandardJobCategory_sortOrder_idx" ON "StandardJobCategory"("sortOrder");

-- CreateIndex
CREATE INDEX "StandardJobTemplate_categoryId_idx" ON "StandardJobTemplate"("categoryId");

-- CreateIndex
CREATE INDEX "StandardJobTemplate_isActive_idx" ON "StandardJobTemplate"("isActive");

-- CreateIndex
CREATE INDEX "StandardJobTemplate_sortOrder_idx" ON "StandardJobTemplate"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "StandardJobTemplate_categoryId_title_key" ON "StandardJobTemplate"("categoryId", "title");

-- CreateIndex
CREATE INDEX "VaultItem_userId_createdAt_idx" ON "VaultItem"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "VaultItem_userId_type_idx" ON "VaultItem"("userId", "type");

-- CreateIndex
CREATE INDEX "VaultItem_jobId_idx" ON "VaultItem"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "OpportunityAlertPreference_userId_key" ON "OpportunityAlertPreference"("userId");

-- CreateIndex
CREATE INDEX "OpportunityAlertPreference_userId_idx" ON "OpportunityAlertPreference"("userId");

-- CreateIndex
CREATE INDEX "OpportunityAlertPreference_enabled_idx" ON "OpportunityAlertPreference"("enabled");

-- CreateIndex
CREATE INDEX "OpportunityAlertEvent_userId_seenAt_idx" ON "OpportunityAlertEvent"("userId", "seenAt");

-- CreateIndex
CREATE INDEX "OpportunityAlertEvent_userId_createdAt_idx" ON "OpportunityAlertEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "OpportunityAlertEvent_type_idx" ON "OpportunityAlertEvent"("type");

-- CreateIndex
CREATE INDEX "PathSnapshot_userId_createdAt_idx" ON "PathSnapshot"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "PathSnapshot_userId_idx" ON "PathSnapshot"("userId");

-- CreateIndex
CREATE INDEX "ProfessionalInsight_careerTag_idx" ON "ProfessionalInsight"("careerTag");

-- CreateIndex
CREATE INDEX "ProfessionalInsight_isPublished_idx" ON "ProfessionalInsight"("isPublished");

-- CreateIndex
CREATE INDEX "ProfessionalInsight_createdAt_idx" ON "ProfessionalInsight"("createdAt");

-- CreateIndex
CREATE INDEX "AiChatMessage_userId_createdAt_idx" ON "AiChatMessage"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "IndustryInsightVideo_industry_idx" ON "IndustryInsightVideo"("industry");

-- CreateIndex
CREATE INDEX "IndustryInsightVideo_status_idx" ON "IndustryInsightVideo"("status");

-- CreateIndex
CREATE INDEX "IndustryInsightVideo_refreshDueAt_idx" ON "IndustryInsightVideo"("refreshDueAt");

-- CreateIndex
CREATE INDEX "IndustryInsightVideo_generatedAt_idx" ON "IndustryInsightVideo"("generatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "IndustryInsightVideo_industry_role_status_key" ON "IndustryInsightVideo"("industry", "role", "status");

-- CreateIndex
CREATE UNIQUE INDEX "IndustryInsightsModule_key_key" ON "IndustryInsightsModule"("key");

-- CreateIndex
CREATE INDEX "IndustryInsightsModule_status_idx" ON "IndustryInsightsModule"("status");

-- CreateIndex
CREATE INDEX "IndustryInsightsModule_lastVerifiedAt_idx" ON "IndustryInsightsModule"("lastVerifiedAt");

-- CreateIndex
CREATE INDEX "IndustryInsightsModule_key_idx" ON "IndustryInsightsModule"("key");

-- CreateIndex
CREATE INDEX "VerifiedLearningResource_status_idx" ON "VerifiedLearningResource"("status");

-- CreateIndex
CREATE INDEX "VerifiedLearningResource_provider_idx" ON "VerifiedLearningResource"("provider");

-- CreateIndex
CREATE INDEX "VerifiedLearningResource_relevantCareers_idx" ON "VerifiedLearningResource"("relevantCareers");

-- CreateIndex
CREATE INDEX "VerifiedLearningResource_regionScope_idx" ON "VerifiedLearningResource"("regionScope");

-- CreateIndex
CREATE INDEX "VerifiedLearningResource_lastVerifiedAt_idx" ON "VerifiedLearningResource"("lastVerifiedAt");

-- CreateIndex
CREATE INDEX "UserLearningProgress_userId_idx" ON "UserLearningProgress"("userId");

-- CreateIndex
CREATE INDEX "UserLearningProgress_resourceId_idx" ON "UserLearningProgress"("resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "UserLearningProgress_userId_resourceId_key" ON "UserLearningProgress"("userId", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "GuardianProfile_userId_key" ON "GuardianProfile"("userId");

-- CreateIndex
CREATE INDEX "GuardianProfile_userId_idx" ON "GuardianProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkerGuardianLink_inviteCode_key" ON "WorkerGuardianLink"("inviteCode");

-- CreateIndex
CREATE INDEX "WorkerGuardianLink_workerId_idx" ON "WorkerGuardianLink"("workerId");

-- CreateIndex
CREATE INDEX "WorkerGuardianLink_guardianId_idx" ON "WorkerGuardianLink"("guardianId");

-- CreateIndex
CREATE INDEX "WorkerGuardianLink_status_idx" ON "WorkerGuardianLink"("status");

-- CreateIndex
CREATE INDEX "WorkerGuardianLink_inviteCode_idx" ON "WorkerGuardianLink"("inviteCode");

-- CreateIndex
CREATE UNIQUE INDEX "WorkerGuardianLink_workerId_guardianId_key" ON "WorkerGuardianLink"("workerId", "guardianId");

-- CreateIndex
CREATE INDEX "GuardianActivitySnapshot_workerId_idx" ON "GuardianActivitySnapshot"("workerId");

-- CreateIndex
CREATE INDEX "GuardianActivitySnapshot_guardianId_idx" ON "GuardianActivitySnapshot"("guardianId");

-- CreateIndex
CREATE UNIQUE INDEX "GuardianActivitySnapshot_workerId_guardianId_key" ON "GuardianActivitySnapshot"("workerId", "guardianId");

-- CreateIndex
CREATE UNIQUE INDEX "AgePolicy_version_key" ON "AgePolicy"("version");

-- CreateIndex
CREATE INDEX "AgePolicy_status_idx" ON "AgePolicy"("status");

-- CreateIndex
CREATE INDEX "AgePolicy_version_idx" ON "AgePolicy"("version");

-- CreateIndex
CREATE INDEX "AgePolicy_createdAt_idx" ON "AgePolicy"("createdAt");

-- CreateIndex
CREATE INDEX "AgeEligibilityAuditLog_workerId_idx" ON "AgeEligibilityAuditLog"("workerId");

-- CreateIndex
CREATE INDEX "AgeEligibilityAuditLog_jobId_idx" ON "AgeEligibilityAuditLog"("jobId");

-- CreateIndex
CREATE INDEX "AgeEligibilityAuditLog_employerId_idx" ON "AgeEligibilityAuditLog"("employerId");

-- CreateIndex
CREATE INDEX "AgeEligibilityAuditLog_action_idx" ON "AgeEligibilityAuditLog"("action");

-- CreateIndex
CREATE INDEX "AgeEligibilityAuditLog_policyVersion_idx" ON "AgeEligibilityAuditLog"("policyVersion");

-- CreateIndex
CREATE INDEX "AgeEligibilityAuditLog_createdAt_idx" ON "AgeEligibilityAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AgeEligibilityAuditLog_workerId_jobId_idx" ON "AgeEligibilityAuditLog"("workerId", "jobId");

-- CreateIndex
CREATE INDEX "InterviewQuestion_category_idx" ON "InterviewQuestion"("category");

-- CreateIndex
CREATE INDEX "InterviewQuestion_difficulty_idx" ON "InterviewQuestion"("difficulty");

-- CreateIndex
CREATE INDEX "InterviewQuestion_isGenerated_idx" ON "InterviewQuestion"("isGenerated");

-- CreateIndex
CREATE INDEX "GeneratedQuestionSet_userId_idx" ON "GeneratedQuestionSet"("userId");

-- CreateIndex
CREATE INDEX "GeneratedQuestionSet_createdAt_idx" ON "GeneratedQuestionSet"("createdAt");

-- CreateIndex
CREATE INDEX "GeneratedSetQuestion_setId_idx" ON "GeneratedSetQuestion"("setId");

-- CreateIndex
CREATE INDEX "GeneratedSetQuestion_questionId_idx" ON "GeneratedSetQuestion"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedSetQuestion_setId_questionId_key" ON "GeneratedSetQuestion"("setId", "questionId");

-- CreateIndex
CREATE INDEX "UserQuestionState_userId_idx" ON "UserQuestionState"("userId");

-- CreateIndex
CREATE INDEX "UserQuestionState_questionId_idx" ON "UserQuestionState"("questionId");

-- CreateIndex
CREATE INDEX "UserQuestionState_saved_idx" ON "UserQuestionState"("saved");

-- CreateIndex
CREATE INDEX "UserQuestionState_lastPracticedAt_idx" ON "UserQuestionState"("lastPracticedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserQuestionState_userId_questionId_key" ON "UserQuestionState"("userId", "questionId");

-- CreateIndex
CREATE INDEX "CareerEvent_startDate_idx" ON "CareerEvent"("startDate");

-- CreateIndex
CREATE INDEX "CareerEvent_locationMode_idx" ON "CareerEvent"("locationMode");

-- CreateIndex
CREATE INDEX "CareerEvent_isYouthFocused_idx" ON "CareerEvent"("isYouthFocused");

-- CreateIndex
CREATE INDEX "CareerEvent_isActive_idx" ON "CareerEvent"("isActive");

-- CreateIndex
CREATE INDEX "CareerEvent_isVerified_idx" ON "CareerEvent"("isVerified");

-- CreateIndex
CREATE INDEX "CareerEvent_city_idx" ON "CareerEvent"("city");

-- CreateIndex
CREATE INDEX "CareerEvent_country_idx" ON "CareerEvent"("country");

-- CreateIndex
CREATE INDEX "CareerEvent_isActive_isVerified_startDate_idx" ON "CareerEvent"("isActive", "isVerified", "startDate");

-- CreateIndex
CREATE INDEX "CareerEvent_isYouthFocused_startDate_idx" ON "CareerEvent"("isYouthFocused", "startDate");

-- CreateIndex
CREATE INDEX "Feedback_createdAt_idx" ON "Feedback"("createdAt");

-- CreateIndex
CREATE INDEX "Feedback_role_idx" ON "Feedback"("role");

-- CreateIndex
CREATE INDEX "ShadowRequest_youthId_idx" ON "ShadowRequest"("youthId");

-- CreateIndex
CREATE INDEX "ShadowRequest_hostId_idx" ON "ShadowRequest"("hostId");

-- CreateIndex
CREATE INDEX "ShadowRequest_status_idx" ON "ShadowRequest"("status");

-- CreateIndex
CREATE INDEX "ShadowRequest_createdAt_idx" ON "ShadowRequest"("createdAt");

-- CreateIndex
CREATE INDEX "ShadowRequest_scheduledDate_idx" ON "ShadowRequest"("scheduledDate");

-- CreateIndex
CREATE INDEX "ShadowRequest_roleTitle_idx" ON "ShadowRequest"("roleTitle");

-- CreateIndex
CREATE UNIQUE INDEX "ShadowReflection_shadowRequestId_key" ON "ShadowReflection"("shadowRequestId");

-- CreateIndex
CREATE INDEX "ShadowReflection_youthId_idx" ON "ShadowReflection"("youthId");

-- CreateIndex
CREATE INDEX "ShadowReflection_createdAt_idx" ON "ShadowReflection"("createdAt");

-- CreateIndex
CREATE INDEX "CareerClip_careerSlug_idx" ON "CareerClip"("careerSlug");

-- CreateIndex
CREATE INDEX "CareerClip_categorySlug_idx" ON "CareerClip"("categorySlug");

-- CreateIndex
CREATE INDEX "CareerClip_verifiedStatus_idx" ON "CareerClip"("verifiedStatus");

-- CreateIndex
CREATE INDEX "CareerClip_displayOrder_idx" ON "CareerClip"("displayOrder");

-- CreateIndex
CREATE INDEX "SavedItem_profileId_idx" ON "SavedItem"("profileId");

-- CreateIndex
CREATE INDEX "SavedItem_profileId_deletedAt_idx" ON "SavedItem"("profileId", "deletedAt");

-- CreateIndex
CREATE INDEX "SavedItem_type_idx" ON "SavedItem"("type");

-- CreateIndex
CREATE INDEX "SavedItem_savedAt_idx" ON "SavedItem"("savedAt");

-- CreateIndex
CREATE INDEX "SavedItem_careerPathId_idx" ON "SavedItem"("careerPathId");

-- CreateIndex
CREATE INDEX "JourneyReflection_profileId_idx" ON "JourneyReflection"("profileId");

-- CreateIndex
CREATE INDEX "JourneyReflection_contextType_idx" ON "JourneyReflection"("contextType");

-- CreateIndex
CREATE INDEX "JourneyReflection_createdAt_idx" ON "JourneyReflection"("createdAt");

-- CreateIndex
CREATE INDEX "TimelineEvent_userId_idx" ON "TimelineEvent"("userId");

-- CreateIndex
CREATE INDEX "TimelineEvent_type_idx" ON "TimelineEvent"("type");

-- CreateIndex
CREATE INDEX "TimelineEvent_createdAt_idx" ON "TimelineEvent"("createdAt");

-- CreateIndex
CREATE INDEX "JourneyNote_profileId_idx" ON "JourneyNote"("profileId");

-- CreateIndex
CREATE INDEX "JourneyNote_profileId_deletedAt_idx" ON "JourneyNote"("profileId", "deletedAt");

-- CreateIndex
CREATE INDEX "JourneyNote_profileId_groupName_idx" ON "JourneyNote"("profileId", "groupName");

-- CreateIndex
CREATE INDEX "JourneyNote_createdAt_idx" ON "JourneyNote"("createdAt");

-- CreateIndex
CREATE INDEX "JourneyNote_pinned_idx" ON "JourneyNote"("pinned");

-- CreateIndex
CREATE INDEX "TraitObservation_profileId_idx" ON "TraitObservation"("profileId");

-- CreateIndex
CREATE INDEX "TraitObservation_profileId_deletedAt_idx" ON "TraitObservation"("profileId", "deletedAt");

-- CreateIndex
CREATE INDEX "TraitObservation_traitId_idx" ON "TraitObservation"("traitId");

-- CreateIndex
CREATE UNIQUE INDEX "TraitObservation_profileId_traitId_key" ON "TraitObservation"("profileId", "traitId");

-- CreateIndex
CREATE INDEX "JourneySnapshot_profileId_idx" ON "JourneySnapshot"("profileId");

-- CreateIndex
CREATE INDEX "JourneySnapshot_createdAt_idx" ON "JourneySnapshot"("createdAt");

-- CreateIndex
CREATE INDEX "ContentInteraction_profileId_idx" ON "ContentInteraction"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentInteraction_profileId_contentUrl_interactionType_key" ON "ContentInteraction"("profileId", "contentUrl", "interactionType");

-- CreateIndex
CREATE INDEX "TranslationCache_contentHash_targetLocale_idx" ON "TranslationCache"("contentHash", "targetLocale");

-- CreateIndex
CREATE INDEX "TranslationCache_expiresAt_idx" ON "TranslationCache"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "TranslationCache_contentHash_targetLocale_key" ON "TranslationCache"("contentHash", "targetLocale");

-- CreateIndex
CREATE INDEX "JourneyGoalData_userId_idx" ON "JourneyGoalData"("userId");

-- CreateIndex
CREATE INDEX "JourneyGoalData_userId_isActive_idx" ON "JourneyGoalData"("userId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "JourneyGoalData_userId_goalId_key" ON "JourneyGoalData"("userId", "goalId");

-- CreateIndex
CREATE INDEX "CareerStory_published_idx" ON "CareerStory"("published");

-- CreateIndex
CREATE INDEX "CareerStory_careerTags_idx" ON "CareerStory"("careerTags");

-- CreateIndex
CREATE UNIQUE INDEX "VideoCache_cacheKey_key" ON "VideoCache"("cacheKey");

-- CreateIndex
CREATE INDEX "VideoCache_cacheKey_idx" ON "VideoCache"("cacheKey");

-- CreateIndex
CREATE INDEX "VideoCache_expiresAt_idx" ON "VideoCache"("expiresAt");

-- CreateIndex
CREATE INDEX "CareerPathContribution_status_idx" ON "CareerPathContribution"("status");

-- CreateIndex
CREATE INDEX "CareerPathContribution_careerTags_idx" ON "CareerPathContribution"("careerTags");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YouthProfile" ADD CONSTRAINT "YouthProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNote" ADD CONSTRAINT "UserNote_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "YouthProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerCareerSnapshot" ADD CONSTRAINT "WorkerCareerSnapshot_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployerProfile" ADD CONSTRAINT "EmployerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MicroJob" ADD CONSTRAINT "MicroJob_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MicroJob" ADD CONSTRAINT "MicroJob_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MicroJob" ADD CONSTRAINT "MicroJob_standardCategoryId_fkey" FOREIGN KEY ("standardCategoryId") REFERENCES "StandardJobCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MicroJob" ADD CONSTRAINT "MicroJob_standardTemplateId_fkey" FOREIGN KEY ("standardTemplateId") REFERENCES "StandardJobTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "MicroJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_youthId_fkey" FOREIGN KEY ("youthId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "MicroJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_youthId_fkey" FOREIGN KEY ("youthId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Earning" ADD CONSTRAINT "Earning_youthId_fkey" FOREIGN KEY ("youthId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Earning" ADD CONSTRAINT "Earning_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "MicroJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Badge" ADD CONSTRAINT "Badge_youthId_fkey" FOREIGN KEY ("youthId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_recommenderId_fkey" FOREIGN KEY ("recommenderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_recommendedId_fkey" FOREIGN KEY ("recommendedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "MicroJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_participant1Id_fkey" FOREIGN KEY ("participant1Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_participant2Id_fkey" FOREIGN KEY ("participant2Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "MicroJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAgreement" ADD CONSTRAINT "PaymentAgreement_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAgreement" ADD CONSTRAINT "PaymentAgreement_markedPaidById_fkey" FOREIGN KEY ("markedPaidById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "MessageTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBlock" ADD CONSTRAINT "UserBlock_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBlock" ADD CONSTRAINT "UserBlock_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationReport" ADD CONSTRAINT "ConversationReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationReport" ADD CONSTRAINT "ConversationReport_reportedId_fkey" FOREIGN KEY ("reportedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationReport" ADD CONSTRAINT "ConversationReport_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteWorker" ADD CONSTRAINT "FavoriteWorker_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteWorker" ADD CONSTRAINT "FavoriteWorker_youthId_fkey" FOREIGN KEY ("youthId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerNote" ADD CONSTRAINT "WorkerNote_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerNote" ADD CONSTRAINT "WorkerNote_youthId_fkey" FOREIGN KEY ("youthId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobTemplate" ADD CONSTRAINT "JobTemplate_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityGuardian" ADD CONSTRAINT "CommunityGuardian_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityGuardian" ADD CONSTRAINT "CommunityGuardian_guardianUserId_fkey" FOREIGN KEY ("guardianUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityReport" ADD CONSTRAINT "CommunityReport_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityReport" ADD CONSTRAINT "CommunityReport_reporterUserId_fkey" FOREIGN KEY ("reporterUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityReport" ADD CONSTRAINT "CommunityReport_assignedGuardianUserId_fkey" FOREIGN KEY ("assignedGuardianUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LifeSkillEvent" ADD CONSTRAINT "LifeSkillEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LifeSkillRecommendation" ADD CONSTRAINT "LifeSkillRecommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LifeSkillRecommendation" ADD CONSTRAINT "LifeSkillRecommendation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "LifeSkillEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LifeSkillRecommendation" ADD CONSTRAINT "LifeSkillRecommendation_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "LifeSkillCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LifeSkillView" ADD CONSTRAINT "LifeSkillView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LifeSkillView" ADD CONSTRAINT "LifeSkillView_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "LifeSkillCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LifeSkillView" ADD CONSTRAINT "LifeSkillView_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "LifeSkillRecommendation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreferences" ADD CONSTRAINT "UserPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSkillSignal" ADD CONSTRAINT "UserSkillSignal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSkillSignal" ADD CONSTRAINT "UserSkillSignal_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCompletion" ADD CONSTRAINT "JobCompletion_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "MicroJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCompletion" ADD CONSTRAINT "JobCompletion_youthId_fkey" FOREIGN KEY ("youthId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCompletion" ADD CONSTRAINT "JobCompletion_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StructuredFeedback" ADD CONSTRAINT "StructuredFeedback_jobCompletionId_fkey" FOREIGN KEY ("jobCompletionId") REFERENCES "JobCompletion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustSignal" ADD CONSTRAINT "TrustSignal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedIndustry" ADD CONSTRAINT "SavedIndustry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustryProgress" ADD CONSTRAINT "IndustryProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerQuizResult" ADD CONSTRAINT "CareerQuizResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsletterSubscription" ADD CONSTRAINT "NewsletterSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StandardJobTemplate" ADD CONSTRAINT "StandardJobTemplate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "StandardJobCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaultItem" ADD CONSTRAINT "VaultItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaultItem" ADD CONSTRAINT "VaultItem_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "MicroJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpportunityAlertPreference" ADD CONSTRAINT "OpportunityAlertPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpportunityAlertEvent" ADD CONSTRAINT "OpportunityAlertEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PathSnapshot" ADD CONSTRAINT "PathSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiChatMessage" ADD CONSTRAINT "AiChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLearningProgress" ADD CONSTRAINT "UserLearningProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLearningProgress" ADD CONSTRAINT "UserLearningProgress_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "VerifiedLearningResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuardianProfile" ADD CONSTRAINT "GuardianProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerGuardianLink" ADD CONSTRAINT "WorkerGuardianLink_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerGuardianLink" ADD CONSTRAINT "WorkerGuardianLink_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "GuardianProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedQuestionSet" ADD CONSTRAINT "GeneratedQuestionSet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedSetQuestion" ADD CONSTRAINT "GeneratedSetQuestion_setId_fkey" FOREIGN KEY ("setId") REFERENCES "GeneratedQuestionSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedSetQuestion" ADD CONSTRAINT "GeneratedSetQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "InterviewQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuestionState" ADD CONSTRAINT "UserQuestionState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuestionState" ADD CONSTRAINT "UserQuestionState_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "InterviewQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShadowRequest" ADD CONSTRAINT "ShadowRequest_youthId_fkey" FOREIGN KEY ("youthId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShadowRequest" ADD CONSTRAINT "ShadowRequest_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShadowReflection" ADD CONSTRAINT "ShadowReflection_shadowRequestId_fkey" FOREIGN KEY ("shadowRequestId") REFERENCES "ShadowRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShadowReflection" ADD CONSTRAINT "ShadowReflection_youthId_fkey" FOREIGN KEY ("youthId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedItem" ADD CONSTRAINT "SavedItem_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "YouthProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyReflection" ADD CONSTRAINT "JourneyReflection_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "YouthProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyNote" ADD CONSTRAINT "JourneyNote_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "YouthProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TraitObservation" ADD CONSTRAINT "TraitObservation_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "YouthProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneySnapshot" ADD CONSTRAINT "JourneySnapshot_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "YouthProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentInteraction" ADD CONSTRAINT "ContentInteraction_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "YouthProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyGoalData" ADD CONSTRAINT "JourneyGoalData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

