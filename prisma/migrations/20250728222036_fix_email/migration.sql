/*
  Warnings:

  - Made the column `email` on table `Business` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "pin" VARCHAR(255),
ALTER COLUMN "email" SET NOT NULL;
