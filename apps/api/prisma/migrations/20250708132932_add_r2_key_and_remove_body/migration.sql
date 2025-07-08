/*
  Warnings:

  - You are about to drop the column `body_html` on the `emails` table. All the data in the column will be lost.
  - You are about to drop the column `body_text` on the `emails` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "emails" DROP COLUMN "body_html",
DROP COLUMN "body_text",
ADD COLUMN     "r2_object_key" TEXT;
