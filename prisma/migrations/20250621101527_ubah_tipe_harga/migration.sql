/*
  Warnings:

  - You are about to alter the column `harga` on the `menu` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `menu` MODIFY `harga` INTEGER NOT NULL;
