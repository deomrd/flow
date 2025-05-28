-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_ibfk_1";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_ibfk_2";

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "recipient_user_id" INTEGER;

-- CreateIndex
CREATE INDEX "transactions_recipient_user_id_idx" ON "transactions"("recipient_user_id");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_recipient_user_id_fkey" FOREIGN KEY ("recipient_user_id") REFERENCES "users"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_fee_id_fkey" FOREIGN KEY ("fee_id") REFERENCES "fees"("id_fee") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "idx_transactions_fee_id" RENAME TO "transactions_fee_id_idx";

-- RenameIndex
ALTER INDEX "idx_transactions_user_id" RENAME TO "transactions_user_id_idx";
