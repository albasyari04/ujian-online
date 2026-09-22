-- CreateTable
CREATE TABLE `pengaturan_pelanggaran` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'global',
    `cekPindahTab` BOOLEAN NOT NULL DEFAULT true,
    `cekKeluarFullscreen` BOOLEAN NOT NULL DEFAULT true,
    `cekKehilanganFokus` BOOLEAN NOT NULL DEFAULT true,
    `cekCopyPaste` BOOLEAN NOT NULL DEFAULT true,
    `cekKlikKanan` BOOLEAN NOT NULL DEFAULT true,
    `cekDevtools` BOOLEAN NOT NULL DEFAULT true,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
