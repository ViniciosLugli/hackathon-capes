/*
  Warnings:

  - You are about to drop the column `peerReviewed` on the `Article` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Article" DROP COLUMN "peerReviewed",
ADD COLUMN     "isPeerReviewed" BOOLEAN NOT NULL DEFAULT false;
