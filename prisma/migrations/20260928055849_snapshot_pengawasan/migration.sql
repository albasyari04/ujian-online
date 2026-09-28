-- CreateTable
CREATE TABLE `snapshot_pengawasan` (
    `hasilUjianId` VARCHAR(191) NOT NULL,
    `kamera` LONGBLOB NULL,
    `layar` LONGBLOB NULL,
    `kameraAt` DATETIME(3) NULL,
    `layarAt` DATETIME(3) NULL,
    `fokus` BOOLEAN NOT NULL DEFAULT true,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`hasilUjianId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `snapshot_pengawasan` ADD CONSTRAINT `snapshot_pengawasan_hasilUjianId_fkey` FOREIGN KEY (`hasilUjianId`) REFERENCES `hasil_ujian`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
