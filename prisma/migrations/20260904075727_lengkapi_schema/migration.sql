-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'PESERTA') NOT NULL DEFAULT 'PESERTA',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ujian` (
    `id` VARCHAR(191) NOT NULL,
    `judul` VARCHAR(191) NOT NULL,
    `deskripsi` TEXT NULL,
    `durasiMenit` INTEGER NOT NULL,
    `acakSoal` BOOLEAN NOT NULL DEFAULT false,
    `batasPelanggaran` INTEGER NOT NULL DEFAULT 3,
    `mulai` DATETIME(3) NOT NULL,
    `selesai` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `pembuatId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `soal` (
    `id` VARCHAR(191) NOT NULL,
    `pertanyaan` TEXT NOT NULL,
    `tipe` ENUM('PILIHAN_GANDA', 'ESSAY') NOT NULL DEFAULT 'PILIHAN_GANDA',
    `poin` INTEGER NOT NULL DEFAULT 1,
    `urutan` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ujianId` VARCHAR(191) NOT NULL,

    INDEX `soal_ujianId_idx`(`ujianId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `opsi` (
    `id` VARCHAR(191) NOT NULL,
    `teks` TEXT NOT NULL,
    `benar` BOOLEAN NOT NULL DEFAULT false,
    `urutan` INTEGER NOT NULL DEFAULT 0,
    `soalId` VARCHAR(191) NOT NULL,

    INDEX `opsi_soalId_idx`(`soalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hasil_ujian` (
    `id` VARCHAR(191) NOT NULL,
    `skor` DOUBLE NULL,
    `waktuMulai` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `waktuSelesai` DATETIME(3) NULL,
    `status` ENUM('SEDANG_DIKERJAKAN', 'SELESAI') NOT NULL DEFAULT 'SEDANG_DIKERJAKAN',
    `jumlahPelanggaran` INTEGER NOT NULL DEFAULT 0,
    `userId` VARCHAR(191) NOT NULL,
    `ujianId` VARCHAR(191) NOT NULL,

    INDEX `hasil_ujian_ujianId_idx`(`ujianId`),
    UNIQUE INDEX `hasil_ujian_userId_ujianId_key`(`userId`, `ujianId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jawaban` (
    `id` VARCHAR(191) NOT NULL,
    `jawabanTeks` TEXT NULL,
    `opsiPilihan` VARCHAR(191) NULL,
    `benar` BOOLEAN NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `soalId` VARCHAR(191) NOT NULL,
    `hasilUjianId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `jawaban_soalId_hasilUjianId_key`(`soalId`, `hasilUjianId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `log_pelanggaran` (
    `id` VARCHAR(191) NOT NULL,
    `tipe` ENUM('PINDAH_TAB', 'KELUAR_FULLSCREEN', 'KEHILANGAN_FOKUS', 'COPY_PASTE', 'KLIK_KANAN', 'DEVTOOLS') NOT NULL,
    `waktu` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `hasilUjianId` VARCHAR(191) NOT NULL,

    INDEX `log_pelanggaran_hasilUjianId_idx`(`hasilUjianId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ujian` ADD CONSTRAINT `ujian_pembuatId_fkey` FOREIGN KEY (`pembuatId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `soal` ADD CONSTRAINT `soal_ujianId_fkey` FOREIGN KEY (`ujianId`) REFERENCES `ujian`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `opsi` ADD CONSTRAINT `opsi_soalId_fkey` FOREIGN KEY (`soalId`) REFERENCES `soal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hasil_ujian` ADD CONSTRAINT `hasil_ujian_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hasil_ujian` ADD CONSTRAINT `hasil_ujian_ujianId_fkey` FOREIGN KEY (`ujianId`) REFERENCES `ujian`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jawaban` ADD CONSTRAINT `jawaban_soalId_fkey` FOREIGN KEY (`soalId`) REFERENCES `soal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jawaban` ADD CONSTRAINT `jawaban_hasilUjianId_fkey` FOREIGN KEY (`hasilUjianId`) REFERENCES `hasil_ujian`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `log_pelanggaran` ADD CONSTRAINT `log_pelanggaran_hasilUjianId_fkey` FOREIGN KEY (`hasilUjianId`) REFERENCES `hasil_ujian`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
