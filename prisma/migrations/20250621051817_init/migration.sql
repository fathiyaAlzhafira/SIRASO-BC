-- CreateTable
CREATE TABLE `User` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `fullname` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `alamat` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Menu` (
    `menu_id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_makanan` VARCHAR(191) NOT NULL,
    `deskripsi` VARCHAR(191) NOT NULL,
    `kategori` VARCHAR(191) NOT NULL,
    `harga` VARCHAR(191) NOT NULL,
    `stok` INTEGER NOT NULL,
    `gambar_url` VARCHAR(191) NOT NULL,
    `rating` DOUBLE NOT NULL,
    `available` VARCHAR(191) NOT NULL,
    `bahan` VARCHAR(191) NOT NULL,
    `toko_id` INTEGER NOT NULL,

    PRIMARY KEY (`menu_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Keranjang` (
    `keranjang_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `menu_id` INTEGER NOT NULL,
    `jumlah` INTEGER NOT NULL,
    `waktu_pengambilan` DATETIME(3) NOT NULL,

    PRIMARY KEY (`keranjang_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transactions` (
    `transaction_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `total_price` DOUBLE NOT NULL,
    `metode_pembayaran` VARCHAR(191) NOT NULL,
    `status_pembayaran` VARCHAR(191) NOT NULL,
    `kode_diskon` VARCHAR(191) NULL,
    `tanggal_transaksi` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `bukti_pembayaran` VARCHAR(191) NULL,
    `riwayat_pengembalian` VARCHAR(191) NULL,

    PRIMARY KEY (`transaction_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PickupSchedule` (
    `pickup_id` INTEGER NOT NULL AUTO_INCREMENT,
    `transaction_id` INTEGER NOT NULL,
    `waktu_pengambilan` DATETIME(3) NOT NULL,
    `status_pengambilan` BOOLEAN NOT NULL,
    `nomor_antrian` INTEGER NOT NULL,

    UNIQUE INDEX `PickupSchedule_transaction_id_key`(`transaction_id`),
    PRIMARY KEY (`pickup_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalesReports` (
    `report_id` INTEGER NOT NULL AUTO_INCREMENT,
    `admin_id` INTEGER NOT NULL,
    `tanggal_awal` DATETIME(3) NOT NULL,
    `tanggal_akhir` DATETIME(3) NOT NULL,
    `total_pendapatan` DOUBLE NOT NULL,
    `total_pesanan` INTEGER NOT NULL,
    `total_pengembalian_dana` DOUBLE NOT NULL,

    PRIMARY KEY (`report_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Review` (
    `review_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `menu_id` INTEGER NOT NULL,
    `rating` INTEGER NOT NULL,
    `komentar` VARCHAR(191) NOT NULL,
    `tanggal_ulas` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`review_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Discounts` (
    `discount_id` INTEGER NOT NULL AUTO_INCREMENT,
    `kode_diskon` VARCHAR(191) NOT NULL,
    `persentase_diskon` DOUBLE NOT NULL,
    `masa_berlaku` DATETIME(3) NOT NULL,
    `min_pembelian` DOUBLE NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Discounts_kode_diskon_key`(`kode_diskon`),
    PRIMARY KEY (`discount_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Toko` (
    `toko_id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_toko` VARCHAR(191) NOT NULL,
    `alamat` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Toko_nama_toko_key`(`nama_toko`),
    PRIMARY KEY (`toko_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Menu` ADD CONSTRAINT `Menu_toko_id_fkey` FOREIGN KEY (`toko_id`) REFERENCES `Toko`(`toko_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Keranjang` ADD CONSTRAINT `Keranjang_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Keranjang` ADD CONSTRAINT `Keranjang_menu_id_fkey` FOREIGN KEY (`menu_id`) REFERENCES `Menu`(`menu_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transactions` ADD CONSTRAINT `Transactions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PickupSchedule` ADD CONSTRAINT `PickupSchedule_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `Transactions`(`transaction_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_menu_id_fkey` FOREIGN KEY (`menu_id`) REFERENCES `Menu`(`menu_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
