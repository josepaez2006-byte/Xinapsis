/*
  Warnings:

  - Added the required column `sex` to the `patients` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `patients` ADD COLUMN `sex` ENUM('MASCULINO', 'FEMENINO') NOT NULL;
