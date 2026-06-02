-- Phase B: Drop the dead jobs-marketplace data cluster.
-- Removes MicroJob + all cascade-linked models (Application, Review, Earning,
-- Recommendation, Conversation, Message, PaymentAgreement, ConversationReport,
-- JobCompletion, StructuredFeedback, SavedJob, JobTemplate, Standard* templates,
-- FavoriteWorker, WorkerNote, WorkerCareerSnapshot, MessageTemplate) and their
-- enums, plus the VaultItem.jobId link. Follows Phase A (PR #57, drop EMPLOYER).
--
-- DESTRUCTIVE: drops tables and all their data. Take a DB backup first.
-- See prisma/migrations/20260602000000_drop_jobs_marketplace/RUNBOOK.md

-- DropForeignKey
ALTER TABLE "WorkerCareerSnapshot" DROP CONSTRAINT "WorkerCareerSnapshot_workerId_fkey";

-- DropForeignKey
ALTER TABLE "MicroJob" DROP CONSTRAINT "MicroJob_postedById_fkey";

-- DropForeignKey
ALTER TABLE "MicroJob" DROP CONSTRAINT "MicroJob_communityId_fkey";

-- DropForeignKey
ALTER TABLE "MicroJob" DROP CONSTRAINT "MicroJob_standardCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "MicroJob" DROP CONSTRAINT "MicroJob_standardTemplateId_fkey";

-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_jobId_fkey";

-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_youthId_fkey";

-- DropForeignKey
ALTER TABLE "SavedJob" DROP CONSTRAINT "SavedJob_jobId_fkey";

-- DropForeignKey
ALTER TABLE "SavedJob" DROP CONSTRAINT "SavedJob_youthId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_jobId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_reviewerId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_reviewedId_fkey";

-- DropForeignKey
ALTER TABLE "Earning" DROP CONSTRAINT "Earning_youthId_fkey";

-- DropForeignKey
ALTER TABLE "Earning" DROP CONSTRAINT "Earning_jobId_fkey";

-- DropForeignKey
ALTER TABLE "Recommendation" DROP CONSTRAINT "Recommendation_recommenderId_fkey";

-- DropForeignKey
ALTER TABLE "Recommendation" DROP CONSTRAINT "Recommendation_recommendedId_fkey";

-- DropForeignKey
ALTER TABLE "Recommendation" DROP CONSTRAINT "Recommendation_jobId_fkey";

-- DropForeignKey
ALTER TABLE "Recommendation" DROP CONSTRAINT "Recommendation_employerId_fkey";

-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_participant1Id_fkey";

-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_participant2Id_fkey";

-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_jobId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentAgreement" DROP CONSTRAINT "PaymentAgreement_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentAgreement" DROP CONSTRAINT "PaymentAgreement_markedPaidById_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_templateId_fkey";

-- DropForeignKey
ALTER TABLE "ConversationReport" DROP CONSTRAINT "ConversationReport_reporterId_fkey";

-- DropForeignKey
ALTER TABLE "ConversationReport" DROP CONSTRAINT "ConversationReport_reportedId_fkey";

-- DropForeignKey
ALTER TABLE "ConversationReport" DROP CONSTRAINT "ConversationReport_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "FavoriteWorker" DROP CONSTRAINT "FavoriteWorker_employerId_fkey";

-- DropForeignKey
ALTER TABLE "FavoriteWorker" DROP CONSTRAINT "FavoriteWorker_youthId_fkey";

-- DropForeignKey
ALTER TABLE "WorkerNote" DROP CONSTRAINT "WorkerNote_employerId_fkey";

-- DropForeignKey
ALTER TABLE "WorkerNote" DROP CONSTRAINT "WorkerNote_youthId_fkey";

-- DropForeignKey
ALTER TABLE "JobTemplate" DROP CONSTRAINT "JobTemplate_employerId_fkey";

-- DropForeignKey
ALTER TABLE "JobCompletion" DROP CONSTRAINT "JobCompletion_jobId_fkey";

-- DropForeignKey
ALTER TABLE "JobCompletion" DROP CONSTRAINT "JobCompletion_youthId_fkey";

-- DropForeignKey
ALTER TABLE "JobCompletion" DROP CONSTRAINT "JobCompletion_employerId_fkey";

-- DropForeignKey
ALTER TABLE "StructuredFeedback" DROP CONSTRAINT "StructuredFeedback_jobCompletionId_fkey";

-- DropForeignKey
ALTER TABLE "StandardJobTemplate" DROP CONSTRAINT "StandardJobTemplate_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "VaultItem" DROP CONSTRAINT "VaultItem_jobId_fkey";

-- DropIndex
DROP INDEX "VaultItem_jobId_idx";

-- AlterTable
ALTER TABLE "VaultItem" DROP COLUMN "jobId";

-- DropTable
DROP TABLE "WorkerCareerSnapshot";

-- DropTable
DROP TABLE "MicroJob";

-- DropTable
DROP TABLE "Application";

-- DropTable
DROP TABLE "SavedJob";

-- DropTable
DROP TABLE "Review";

-- DropTable
DROP TABLE "Earning";

-- DropTable
DROP TABLE "Recommendation";

-- DropTable
DROP TABLE "Conversation";

-- DropTable
DROP TABLE "PaymentAgreement";

-- DropTable
DROP TABLE "MessageTemplate";

-- DropTable
DROP TABLE "Message";

-- DropTable
DROP TABLE "ConversationReport";

-- DropTable
DROP TABLE "FavoriteWorker";

-- DropTable
DROP TABLE "WorkerNote";

-- DropTable
DROP TABLE "JobTemplate";

-- DropTable
DROP TABLE "JobCompletion";

-- DropTable
DROP TABLE "StructuredFeedback";

-- DropTable
DROP TABLE "StandardJobCategory";

-- DropTable
DROP TABLE "StandardJobTemplate";

-- DropEnum
DROP TYPE "JobRiskCategory";

-- DropEnum
DROP TYPE "PaymentMethod";

-- DropEnum
DROP TYPE "PaymentAgreementStatus";

-- DropEnum
DROP TYPE "JobStatus";

-- DropEnum
DROP TYPE "ApplicationStatus";

-- DropEnum
DROP TYPE "PayType";

-- DropEnum
DROP TYPE "JobCategory";

-- DropEnum
DROP TYPE "EarningStatus";

-- DropEnum
DROP TYPE "ConversationStatus";

-- DropEnum
DROP TYPE "MessageTemplateDirection";

-- DropEnum
DROP TYPE "MessageIntent";

-- DropEnum
DROP TYPE "ConversationReportCategory";

-- DropEnum
DROP TYPE "ConversationReportStatus";

-- DropEnum
DROP TYPE "JobCompletionOutcome";

-- DropEnum
DROP TYPE "SupervisionLevel";

-- DropEnum
DROP TYPE "ResponsibilityLevel";

