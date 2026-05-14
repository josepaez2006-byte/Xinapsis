-- AlterTable
ALTER TABLE `consultations` ADD COLUMN `occupation` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `medical_histories` ADD COLUMN `blood_type` ENUM('A_POSITIVO', 'A_NEGATIVO', 'B_POSITIVO', 'B_NEGATIVO', 'AB_POSITIVO', 'AB_NEGATIVO', 'O_POSITIVO', 'O_NEGATIVO') NULL;
