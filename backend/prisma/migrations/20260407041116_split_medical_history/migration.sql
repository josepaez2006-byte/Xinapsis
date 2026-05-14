/*
  Warnings:

  - You are about to drop the column `family_history` on the `medical_histories` table. All the data in the column will be lost.
  - You are about to drop the column `toxic_habits` on the `medical_histories` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `medical_histories` DROP COLUMN `family_history`,
    DROP COLUMN `toxic_habits`,
    ADD COLUMN `alcohol` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `drugs` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `father_cause_of_death` TEXT NULL,
    ADD COLUMN `father_history` TEXT NULL,
    ADD COLUMN `father_is_alive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `mother_cause_of_death` TEXT NULL,
    ADD COLUMN `mother_history` TEXT NULL,
    ADD COLUMN `mother_is_alive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `other_toxic_habits` TEXT NULL,
    ADD COLUMN `sedentary` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `smoking` BOOLEAN NOT NULL DEFAULT false;
