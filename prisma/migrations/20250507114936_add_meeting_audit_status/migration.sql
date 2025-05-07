-- AlterTable
ALTER TABLE `meeting` ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    ADD COLUMN `statusReason` VARCHAR(191) NULL;
