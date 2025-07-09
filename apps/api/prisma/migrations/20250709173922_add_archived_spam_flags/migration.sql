-- AlterTable
ALTER TABLE "emails" ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSpam" BOOLEAN NOT NULL DEFAULT false;
