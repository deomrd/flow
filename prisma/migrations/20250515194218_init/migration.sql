-- CreateEnum
CREATE TYPE "fees_deleted" AS ENUM ('yes', 'no');

-- CreateEnum
CREATE TYPE "fees_method" AS ENUM ('mobile_money', 'bank_transfer');

-- CreateEnum
CREATE TYPE "fees_transaction_type" AS ENUM ('deposit', 'withdrawal', 'transfer');

-- CreateEnum
CREATE TYPE "financialreports_deleted" AS ENUM ('yes', 'no');

-- CreateEnum
CREATE TYPE "notifications_deleted" AS ENUM ('yes', 'no');

-- CreateEnum
CREATE TYPE "transactions_deleted" AS ENUM ('yes', 'no');

-- CreateEnum
CREATE TYPE "transactions_status" AS ENUM ('pending', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "transactions_type" AS ENUM ('deposit', 'withdrawal', 'transfer');

-- CreateEnum
CREATE TYPE "userprofiles_deleted" AS ENUM ('yes', 'no');

-- CreateEnum
CREATE TYPE "users_deleted" AS ENUM ('yes', 'no');

-- CreateEnum
CREATE TYPE "users_role" AS ENUM ('admin', 'user');

-- CreateEnum
CREATE TYPE "userverifications_deleted" AS ENUM ('yes', 'no');

-- CreateEnum
CREATE TYPE "userverifications_method" AS ENUM ('email', 'sms', 'document');

-- CreateEnum
CREATE TYPE "userverifications_status" AS ENUM ('pending', 'verified', 'failed');

-- CreateEnum
CREATE TYPE "virtual_cards_status" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "virtual_cards_deleted" AS ENUM ('yes', 'no');

-- CreateEnum
CREATE TYPE "card_orders_type" AS ENUM ('PURCHASE', 'TOPUP');

-- CreateEnum
CREATE TYPE "card_orders_status" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "card_orders_deleted" AS ENUM ('yes', 'no');

-- CreateTable
CREATE TABLE "fees" (
    "id_fee" SERIAL NOT NULL,
    "transaction_type" "fees_transaction_type" NOT NULL,
    "method" "fees_method" NOT NULL,
    "fee_percentage" DECIMAL(5,2) DEFAULT 0.00,
    "fee_fixed" DECIMAL(10,2) DEFAULT 0.00,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted" "fees_deleted" DEFAULT 'no',

    CONSTRAINT "fees_pkey" PRIMARY KEY ("id_fee")
);

-- CreateTable
CREATE TABLE "financialreports" (
    "id_report" SERIAL NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "total_transactions" INTEGER DEFAULT 0,
    "total_amount" DECIMAL(15,2) DEFAULT 0.00,
    "total_fees" DECIMAL(15,2) DEFAULT 0.00,
    "generated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted" "financialreports_deleted" DEFAULT 'no',

    CONSTRAINT "financialreports_pkey" PRIMARY KEY ("id_report")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id_notification" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN DEFAULT false,
    "sent_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted" "notifications_deleted" DEFAULT 'no',

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id_notification")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id_transaction" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" "transactions_type" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "transactions_status" DEFAULT 'pending',
    "initiated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fee_id" INTEGER,
    "deleted" "transactions_deleted" DEFAULT 'no',

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id_transaction")
);

-- CreateTable
CREATE TABLE "users" (
    "id_user" SERIAL NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL DEFAULT '',
    "password" VARCHAR(255) NOT NULL,
    "role" "users_role" NOT NULL DEFAULT 'user',
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "refresh_token" VARCHAR(255),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted" "users_deleted" DEFAULT 'no',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "userprofiles" (
    "id_profile" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "full_name" VARCHAR(255),
    "phone_number" VARCHAR(20),
    "address" TEXT,
    "date_of_birth" DATE,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted" "userprofiles_deleted" DEFAULT 'no',

    CONSTRAINT "userprofiles_pkey" PRIMARY KEY ("id_profile")
);

-- CreateTable
CREATE TABLE "userverifications" (
    "id_verification" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "method" "userverifications_method" NOT NULL,
    "status" "userverifications_status" DEFAULT 'pending',
    "requested_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified_at" TIMESTAMP(0),
    "deleted" "userverifications_deleted" DEFAULT 'no',

    CONSTRAINT "userverifications_pkey" PRIMARY KEY ("id_verification")
);

-- CreateTable
CREATE TABLE "virtual_cards" (
    "id_card" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "external_id" VARCHAR(255) NOT NULL,
    "card_number" VARCHAR(16) NOT NULL,
    "expiry_date" VARCHAR(5) NOT NULL,
    "cvv" VARCHAR(3),
    "status" "virtual_cards_status" NOT NULL DEFAULT 'ACTIVE',
    "balance" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted" "virtual_cards_deleted" DEFAULT 'no',

    CONSTRAINT "virtual_cards_pkey" PRIMARY KEY ("id_card")
);

-- CreateTable
CREATE TABLE "card_orders" (
    "id_order" SERIAL NOT NULL,
    "card_id" INTEGER,
    "user_id" INTEGER NOT NULL,
    "type" "card_orders_type" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "fee" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "provider_fee" DECIMAL(10,2),
    "status" "card_orders_status" NOT NULL DEFAULT 'PENDING',
    "external_ref" VARCHAR(255),
    "executed_at" TIMESTAMP(0),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted" "card_orders_deleted" DEFAULT 'no',

    CONSTRAINT "card_orders_pkey" PRIMARY KEY ("id_order")
);

-- CreateIndex
CREATE INDEX "idx_notifications_user_id" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "idx_transactions_fee_id" ON "transactions"("fee_id");

-- CreateIndex
CREATE INDEX "idx_transactions_user_id" ON "transactions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "idx_userverifications_user_id" ON "userverifications"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "virtual_cards_external_id_key" ON "virtual_cards"("external_id");

-- CreateIndex
CREATE INDEX "idx_virtual_cards_user_id" ON "virtual_cards"("user_id");

-- CreateIndex
CREATE INDEX "idx_card_orders_card_id" ON "card_orders"("card_id");

-- CreateIndex
CREATE INDEX "idx_card_orders_user_id" ON "card_orders"("user_id");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_ibfk_1" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_ibfk_1" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_ibfk_2" FOREIGN KEY ("fee_id") REFERENCES "fees"("id_fee") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "userprofiles" ADD CONSTRAINT "userprofiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userverifications" ADD CONSTRAINT "userverifications_ibfk_1" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "virtual_cards" ADD CONSTRAINT "virtual_cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_orders" ADD CONSTRAINT "card_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_orders" ADD CONSTRAINT "card_orders_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "virtual_cards"("id_card") ON DELETE SET NULL ON UPDATE CASCADE;
