-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'EXPIRED', 'CANCELLED', 'FAILED');

-- CreateTable
CREATE TABLE "inventories" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "product_variant_id" UUID NOT NULL,
    "shop_id" UUID NOT NULL,
    "total_quantity" INTEGER NOT NULL DEFAULT 0,
    "reserved_quantity" INTEGER NOT NULL DEFAULT 0,
    "available_quantity" INTEGER NOT NULL DEFAULT 0,
    "sold_quantity" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "inventories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" UUID NOT NULL,
    "inventory_id" UUID NOT NULL,
    "saga_id" UUID NOT NULL,
    "order_id" UUID,
    "user_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "expires_at" TIMESTAMPTZ NOT NULL,
    "confirmed_at" TIMESTAMPTZ,
    "cancelled_at" TIMESTAMPTZ,
    "cancellation_reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inventories_product_variant_id_key" ON "inventories"("product_variant_id");

-- CreateIndex
CREATE INDEX "inventories_product_id_is_deleted_idx" ON "inventories"("product_id", "is_deleted");

-- CreateIndex
CREATE INDEX "inventories_product_variant_id_idx" ON "inventories"("product_variant_id");

-- CreateIndex
CREATE INDEX "inventories_shop_id_available_quantity_idx" ON "inventories"("shop_id", "available_quantity");

-- CreateIndex
CREATE INDEX "inventories_available_quantity_idx" ON "inventories"("available_quantity");

-- CreateIndex
CREATE INDEX "reservations_saga_id_idx" ON "reservations"("saga_id");

-- CreateIndex
CREATE INDEX "reservations_order_id_idx" ON "reservations"("order_id");

-- CreateIndex
CREATE INDEX "reservations_inventory_id_status_idx" ON "reservations"("inventory_id", "status");

-- CreateIndex
CREATE INDEX "reservations_status_expires_at_idx" ON "reservations"("status", "expires_at");

-- CreateIndex
CREATE INDEX "reservations_user_id_status_idx" ON "reservations"("user_id", "status");

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "inventories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
