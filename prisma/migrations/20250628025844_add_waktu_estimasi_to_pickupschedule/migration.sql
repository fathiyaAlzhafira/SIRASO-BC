/*
  Warnings:

  - Added the required column `waktu_estimasi` to the `pickupschedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `pickupschedule` ADD COLUMN `waktu_estimasi` DATETIME(3) NOT NULL;
