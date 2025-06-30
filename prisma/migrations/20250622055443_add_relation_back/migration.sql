/*
  Warnings:

  - You are about to drop the column `bahan` on the `menu` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `menu` table. All the data in the column will be lost.
  - You are about to alter the column `harga` on the `menu` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Double`.
  - You are about to alter the column `available` on the `menu` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `TinyInt`.

*/
-- AlterTable
ALTER TABLE `menu` DROP COLUMN `bahan`,
    DROP COLUMN `rating`,
    MODIFY `deskripsi` VARCHAR(191) NULL,
    MODIFY `harga` DOUBLE NOT NULL,
    MODIFY `gambar_url` VARCHAR(191) NULL,
    MODIFY `available` BOOLEAN NOT NULL DEFAULT true;
