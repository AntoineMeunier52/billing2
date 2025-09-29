-- CreateTable
CREATE TABLE `MonthlyCdrSummary` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customerId` INTEGER NOT NULL,
    `month` DATETIME(3) NOT NULL,
    `callCount` INTEGER NOT NULL,
    `totalDurationSec` INTEGER NOT NULL,
    `totalBaseCost` DECIMAL(18, 6) NOT NULL,
    `totalBilledCost` DECIMAL(18, 6) NOT NULL,
    `base_natio_mob` DECIMAL(18, 6) NOT NULL,
    `base_natio_fix` DECIMAL(18, 6) NOT NULL,
    `base_inter_mob` DECIMAL(18, 6) NOT NULL,
    `base_inter_fix` DECIMAL(18, 6) NOT NULL,
    `bill_natio_mob` DECIMAL(18, 6) NOT NULL,
    `bill_natio_fix` DECIMAL(18, 6) NOT NULL,
    `bill_inter_mob` DECIMAL(18, 6) NOT NULL,
    `bill_inter_fix` DECIMAL(18, 6) NOT NULL,

    INDEX `MonthlyCdrSummary_month_idx`(`month`),
    UNIQUE INDEX `MonthlyCdrSummary_customerId_month_key`(`customerId`, `month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MonthlyCdrSummary` ADD CONSTRAINT `MonthlyCdrSummary_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
