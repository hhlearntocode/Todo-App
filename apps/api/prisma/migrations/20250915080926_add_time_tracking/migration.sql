-- AlterTable
ALTER TABLE "tasks" ADD COLUMN "actualMinutes" INTEGER;
ALTER TABLE "tasks" ADD COLUMN "completedAt" DATETIME;
ALTER TABLE "tasks" ADD COLUMN "estimatedMinutes" INTEGER;
ALTER TABLE "tasks" ADD COLUMN "startedAt" DATETIME;
