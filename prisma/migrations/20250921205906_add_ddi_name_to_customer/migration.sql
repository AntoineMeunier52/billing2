-- CreateTable
CREATE TABLE `DdiName` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `descriptionName` VARCHAR(191) NULL,
    `customerId` INTEGER NOT NULL,

    UNIQUE INDEX `DdiName_descriptionName_key`(`descriptionName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DdiName` ADD CONSTRAINT `DdiName_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
