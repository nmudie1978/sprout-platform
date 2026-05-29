-- Parent injection model: replace timeline-based contribution shape
-- with prose prompts. Safe to run as destructive ALTER because the
-- table is empty at migration time.
ALTER TABLE "CareerPathContribution" DROP COLUMN "advice",
DROP COLUMN "didAttendUniversity",
DROP COLUMN "headline",
DROP COLUMN "steps",
DROP COLUMN "yearsOfExperience",
ADD COLUMN     "adviceToSeventeen" TEXT NOT NULL,
ADD COLUMN     "firstSalary" TEXT NOT NULL,
ADD COLUMN     "hardestPart" TEXT NOT NULL,
ADD COLUMN     "howIGotHere" TEXT NOT NULL,
ADD COLUMN     "realityOfJob" TEXT NOT NULL,
ADD COLUMN     "videoUrl" TEXT,
ADD COLUMN     "whatIStudied" TEXT NOT NULL;
