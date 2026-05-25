/*
  Warnings:

  - You are about to drop the column `shippingAddress` on the `order` table. All the data in the column will be lost.
  - Added the required column `shippingAddressSnapshot` to the `order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "order" DROP COLUMN "shippingAddress",
ADD COLUMN     "shippingAddressSnapshot" JSONB NOT NULL;
