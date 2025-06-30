/*
  Warnings:

  - Added the required column `jenis` to the `menu` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `menu` ADD COLUMN `jenis` VARCHAR(191) NOT NULL DEFAULT 'Umum';

-- Update existing records with appropriate jenis values based on kategori
UPDATE `menu` SET `jenis` = 'Berkuah' WHERE `kategori` IN ('Sup', 'Mie') AND `nama_makanan` LIKE '%kuah%';
UPDATE `menu` SET `jenis` = 'Pedas' WHERE `nama_makanan` LIKE '%pedas%' OR `nama_makanan` LIKE '%sambal%';
UPDATE `menu` SET `jenis` = 'Manis' WHERE `kategori` IN ('Dessert', 'Minuman') OR `nama_makanan` LIKE '%manis%';
UPDATE `menu` SET `jenis` = 'Kering' WHERE `kategori` IN ('Gorengan', 'Snack') OR `nama_makanan` LIKE '%goreng%';
UPDATE `menu` SET `jenis` = 'Asin' WHERE `nama_makanan` LIKE '%asin%' OR `nama_makanan` LIKE '%garam%';
UPDATE `menu` SET `jenis` = 'Hangat' WHERE `nama_makanan` LIKE '%hangat%' OR `nama_makanan` LIKE '%panas%';
