/*
  Warnings:

  - You are about to drop the column `fee_id` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the `fees` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_fee_id_fkey";

-- DropIndex
DROP INDEX "transactions_fee_id_idx";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "fee_id",
ADD COLUMN     "fees" DECIMAL(10,2);

-- DropTable
DROP TABLE "fees";
