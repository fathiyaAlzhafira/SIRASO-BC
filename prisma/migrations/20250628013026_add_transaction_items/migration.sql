-- DropForeignKey
ALTER TABLE `pickupschedule` DROP FOREIGN KEY `PickupSchedule_transaction_id_fkey`;

-- CreateTable
CREATE TABLE `transaction_items` (
    `item_id` INTEGER NOT NULL AUTO_INCREMENT,
    `transaction_id` INTEGER NOT NULL,
    `menu_id` INTEGER NOT NULL,
    `jumlah` INTEGER NOT NULL,
    `harga_satuan` INTEGER NOT NULL,
    `subtotal` INTEGER NOT NULL,

    INDEX `TransactionItems_transaction_id_fkey`(`transaction_id`),
    INDEX `TransactionItems_menu_id_fkey`(`menu_id`),
    PRIMARY KEY (`item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pickupschedule` ADD CONSTRAINT `PickupSchedule_transaction_id_key` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`transaction_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_items` ADD CONSTRAINT `TransactionItems_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`transaction_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_items` ADD CONSTRAINT `TransactionItems_menu_id_fkey` FOREIGN KEY (`menu_id`) REFERENCES `menu`(`menu_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
