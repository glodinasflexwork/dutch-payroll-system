-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "isTrialActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trialExtensions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "trialStart" TIMESTAMP(3);
