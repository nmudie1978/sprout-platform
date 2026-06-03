-- Remove the redundant Secondary Career Goal.
-- "Other careers I'm considering" is already covered by Saved careers +
-- interest levels, so the single-slot secondary goal added confusion without
-- driving any journey logic. Dropping the column; only the Primary goal remains.
ALTER TABLE "YouthProfile" DROP COLUMN IF EXISTS "secondaryGoal";
