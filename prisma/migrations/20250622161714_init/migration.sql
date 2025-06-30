/*
  Warnings:

  - Added the required column `bahan` to the `Menu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rating` to the `Menu` table without a default value. This is not possible if the table is not empty.
  - Made the column `deskripsi` on table `menu` required. This step will fail if there are existing NULL values in that column.
  - Made the column `gambar_url` on table `menu` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `menu` ADD COLUMN `bahan` VARCHAR(191) NOT NULL,
    ADD COLUMN `rating` DOUBLE NOT NULL,
    MODIFY `deskripsi` VARCHAR(191) NOT NULL,
    MODIFY `harga` INTEGER NOT NULL,
    MODIFY `gambar_url` VARCHAR(191) NOT NULL,
    ALTER COLUMN `available` DROP DEFAULT;

-- AlterTable
ALTER TABLE `transactions` ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'Menunggu';

-- CreateTable
CREATE TABLE `Seller` (
    `seller_id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `toko_id` INTEGER NOT NULL,

    UNIQUE INDEX `Seller_username_key`(`username`),
    UNIQUE INDEX `Seller_toko_id_key`(`toko_id`),
    PRIMARY KEY (`seller_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Seller` ADD CONSTRAINT `Seller_toko_id_fkey` FOREIGN KEY (`toko_id`) REFERENCES `Toko`(`toko_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
