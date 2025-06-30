-- CreateTable
CREATE TABLE `RefundRequests` (
    `refund_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `transaction_id` INTEGER NOT NULL,
    `nomor_rekening` VARCHAR(191) NOT NULL,
    `nama_bank` VARCHAR(191) NOT NULL,
    `alasan` VARCHAR(191) NOT NULL,
    `bukti` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Pending',
    `tanggal_pengajuan` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`refund_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RefundRequests` ADD CONSTRAINT `RefundRequests_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RefundRequests` ADD CONSTRAINT `RefundRequests_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `Transactions`(`transaction_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
