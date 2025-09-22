/*
  Warnings:

  - Made the column `name` on table `Customer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `address` on table `Customer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `city` on table `Customer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `province` on table `Customer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `postalCode` on table `Customer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `natioMobPourcent` on table `Customer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `natioFixPourcent` on table `Customer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `interMobPourcent` on table `Customer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `interFixPourcent` on table `Customer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ddiPrice` on table `Customer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `descriptionName` on table `DdiName` required. This step will fail if there are existing NULL values in that column.
  - Made the column `descriptionName` on table `SipLine` required. This step will fail if there are existing NULL values in that column.
  - Made the column `definition` on table `Subscription` required. This step will fail if there are existing NULL values in that column.
  - Made the column `price` on table `Subscription` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Customer` MODIFY `name` VARCHAR(191) NOT NULL,
    MODIFY `address` VARCHAR(191) NOT NULL,
    MODIFY `city` VARCHAR(191) NOT NULL,
    MODIFY `province` VARCHAR(191) NOT NULL,
    MODIFY `postalCode` INTEGER NOT NULL,
    MODIFY `natioMobPourcent` DOUBLE NOT NULL,
    MODIFY `natioFixPourcent` DOUBLE NOT NULL,
    MODIFY `interMobPourcent` DOUBLE NOT NULL,
    MODIFY `interFixPourcent` DOUBLE NOT NULL,
    MODIFY `ddiPrice` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `DdiName` MODIFY `descriptionName` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `SipLine` MODIFY `descriptionName` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Subscription` MODIFY `definition` VARCHAR(191) NOT NULL,
    MODIFY `price` INTEGER NOT NULL;
