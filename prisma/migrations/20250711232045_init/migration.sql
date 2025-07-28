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
CREATE TYPE "virtual_cards_status" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "virtual_cards_deleted" AS ENUM ('yes', 'no');

-- CreateEnum
CREATE TYPE "card_orders_type" AS ENUM ('PURCHASE', 'TOPUP');

-- CreateEnum
CREATE TYPE "card_orders_status" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "card_orders_deleted" AS ENUM ('yes', 'no');

-- CreateEnum
CREATE TYPE "BusinessUserRole" AS ENUM ('BOSS', 'OWNER', 'CASHIER');

-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('AGENCE', 'BOULANGERIE', 'BOUTIQUE', 'CABINET_MEDICAL', 'CENTRE_SPORTIF', 'CHARCUTERIE', 'COIFFURE', 'ECOLE', 'ENTREPRISE', 'ETABLISSEMENT', 'HOPITAL', 'HOTEL', 'LIBRAIRIE', 'PHARMACIE', 'RESTAURANT', 'SALON_DE_BEAUTE', 'SERVICE_INFORMATIQUE', 'STATION_SERVICE', 'SUPERMARCHE', 'TRANSPORT', 'UNIVERSITE', 'AUTRE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('APPLICATION', 'QR');

-- CreateEnum
CREATE TYPE "OTPType" AS ENUM ('VERIFICATION_EMAIL', 'VERIFICATION_PHONE', 'RESET_PASSWORD', 'RESET_PIN');

-- CreateEnum
CREATE TYPE "ModeRetrait" AS ENUM ('MOBILE', 'AGENT');

-- CreateEnum
CREATE TYPE "StatutRetrait" AS ENUM ('PENDING', 'COMPLETED', 'EXPIRED', 'CANCELLED', 'FAILED');

-- CreateTable
CREATE TABLE "Withdrawal" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "fees" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "mode" "ModeRetrait" NOT NULL,
    "status" "StatutRetrait" NOT NULL DEFAULT 'PENDING',
    "withdrawalCode" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pinUsed" TEXT,
    "recipientPhone" TEXT,

    CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id_notification" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN DEFAULT false,
    "sent_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted" "notifications_deleted" DEFAULT 'no',

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id_notification")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id_transaction" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "recipient_user_id" UUID,
    "type" "transactions_type" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "fees" DECIMAL(10,2),
    "status" "transactions_status" DEFAULT 'pending',
    "note" TEXT,
    "code" VARCHAR(20),
    "initiated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted" "transactions_deleted" DEFAULT 'no',

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id_transaction")
);

-- CreateTable
CREATE TABLE "users" (
    "id_user" UUID NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "users_role" NOT NULL DEFAULT 'user',
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "pin" VARCHAR(255),
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_verified_email" BOOLEAN NOT NULL DEFAULT false,
    "is_verified_number" BOOLEAN NOT NULL DEFAULT false,
    "refresh_token" VARCHAR(255),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted" "users_deleted" DEFAULT 'no',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "userprofiles" (
    "id_profile" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "phone_number" VARCHAR(20),
    "address" TEXT,
    "date_of_birth" DATE,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted" "userprofiles_deleted" DEFAULT 'no',

    CONSTRAINT "userprofiles_pkey" PRIMARY KEY ("id_profile")
);

-- CreateTable
CREATE TABLE "otp" (
    "id" UUID NOT NULL,
    "code" VARCHAR(6) NOT NULL,
    "type" "OTPType" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "virtual_cards" (
    "id_card" UUID NOT NULL,
    "user_id" UUID NOT NULL,
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
    "id_order" UUID NOT NULL,
    "card_id" UUID,
    "user_id" UUID NOT NULL,
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

-- CreateTable
CREATE TABLE "Business" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "BusinessType" NOT NULL,
    "email" TEXT,
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointOfSale" (
    "id" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "qrCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PointOfSale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessUser" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "businessId" UUID NOT NULL,
    "pointOfSaleId" UUID,
    "role" "BusinessUserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "pointOfSaleId" UUID,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "method" "PaymentMethod" NOT NULL,
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Withdrawal_withdrawalCode_key" ON "Withdrawal"("withdrawalCode");

-- CreateIndex
CREATE INDEX "Withdrawal_withdrawalCode_idx" ON "Withdrawal"("withdrawalCode");

-- CreateIndex
CREATE INDEX "Withdrawal_userId_idx" ON "Withdrawal"("userId");

-- CreateIndex
CREATE INDEX "Withdrawal_expiresAt_idx" ON "Withdrawal"("expiresAt");

-- CreateIndex
CREATE INDEX "Withdrawal_status_idx" ON "Withdrawal"("status");

-- CreateIndex
CREATE INDEX "idx_notifications_user_id" ON "notifications"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_code_key" ON "transactions"("code");

-- CreateIndex
CREATE INDEX "transactions_user_id_idx" ON "transactions"("user_id");

-- CreateIndex
CREATE INDEX "transactions_recipient_user_id_idx" ON "transactions"("recipient_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "virtual_cards_external_id_key" ON "virtual_cards"("external_id");

-- CreateIndex
CREATE INDEX "idx_virtual_cards_user_id" ON "virtual_cards"("user_id");

-- CreateIndex
CREATE INDEX "idx_card_orders_card_id" ON "card_orders"("card_id");

-- CreateIndex
CREATE INDEX "idx_card_orders_user_id" ON "card_orders"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Business_email_key" ON "Business"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessUser_username_businessId_key" ON "BusinessUser"("username", "businessId");

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_ibfk_1" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_recipient_user_id_fkey" FOREIGN KEY ("recipient_user_id") REFERENCES "users"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userprofiles" ADD CONSTRAINT "userprofiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otp" ADD CONSTRAINT "otp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virtual_cards" ADD CONSTRAINT "virtual_cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_orders" ADD CONSTRAINT "card_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_orders" ADD CONSTRAINT "card_orders_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "virtual_cards"("id_card") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointOfSale" ADD CONSTRAINT "PointOfSale_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessUser" ADD CONSTRAINT "BusinessUser_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessUser" ADD CONSTRAINT "BusinessUser_pointOfSaleId_fkey" FOREIGN KEY ("pointOfSaleId") REFERENCES "PointOfSale"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_pointOfSaleId_fkey" FOREIGN KEY ("pointOfSaleId") REFERENCES "PointOfSale"("id") ON DELETE SET NULL ON UPDATE CASCADE;
