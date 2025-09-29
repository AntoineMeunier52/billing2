/*
  Warnings:

  - Added the required column `count_inter_fix` to the `MonthlyCdrSummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `count_inter_mob` to the `MonthlyCdrSummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `count_natio_fix` to the `MonthlyCdrSummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `count_natio_mob` to the `MonthlyCdrSummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time_inter_fix` to the `MonthlyCdrSummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time_inter_mob` to the `MonthlyCdrSummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time_natio_fix` to the `MonthlyCdrSummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time_natio_mob` to the `MonthlyCdrSummary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `MonthlyCdrSummary` ADD COLUMN `count_inter_fix` INTEGER NOT NULL,
    ADD COLUMN `count_inter_mob` INTEGER NOT NULL,
    ADD COLUMN `count_natio_fix` INTEGER NOT NULL,
    ADD COLUMN `count_natio_mob` INTEGER NOT NULL,
    ADD COLUMN `time_inter_fix` INTEGER NOT NULL,
    ADD COLUMN `time_inter_mob` INTEGER NOT NULL,
    ADD COLUMN `time_natio_fix` INTEGER NOT NULL,
    ADD COLUMN `time_natio_mob` INTEGER NOT NULL;
