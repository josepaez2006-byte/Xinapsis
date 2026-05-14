/*
  Warnings:

  - You are about to alter the column `status` on the `appointments` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `appointments` MODIFY `status` ENUM('PENDIENTE', 'COMPLETADO', 'CANCELADO') NOT NULL DEFAULT 'PENDIENTE';

-- AlterTable
ALTER TABLE `doctors` ADD COLUMN `other_specialties` VARCHAR(191) NULL;
