/*
  Warnings:

  - The primary key for the `Appointment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `appointmentDate` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `departmentId` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `reason` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Appointment` table. All the data in the column will be lost.
  - The primary key for the `Doctor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `departmentId` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `licenseNumber` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `specialization` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Doctor` table. All the data in the column will be lost.
  - The primary key for the `Patient` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `address` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `dateOfBirth` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `departmentId` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `emergencyContact` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the `Department` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MedicalRecord` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Medication` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Prescription` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PrescriptionMedication` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `date` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Doctor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `specialty` to the `Doctor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `age` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Patient` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_patientId_fkey";

-- DropForeignKey
ALTER TABLE "Doctor" DROP CONSTRAINT "Doctor_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "Doctor" DROP CONSTRAINT "Doctor_userId_fkey";

-- DropForeignKey
ALTER TABLE "MedicalRecord" DROP CONSTRAINT "MedicalRecord_appointmentId_fkey";

-- DropForeignKey
ALTER TABLE "MedicalRecord" DROP CONSTRAINT "MedicalRecord_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "MedicalRecord" DROP CONSTRAINT "MedicalRecord_patientId_fkey";

-- DropForeignKey
ALTER TABLE "Patient" DROP CONSTRAINT "Patient_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "Patient" DROP CONSTRAINT "Patient_userId_fkey";

-- DropForeignKey
ALTER TABLE "Prescription" DROP CONSTRAINT "Prescription_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "Prescription" DROP CONSTRAINT "Prescription_medicalRecordId_fkey";

-- DropForeignKey
ALTER TABLE "Prescription" DROP CONSTRAINT "Prescription_patientId_fkey";

-- DropForeignKey
ALTER TABLE "PrescriptionMedication" DROP CONSTRAINT "PrescriptionMedication_medicationId_fkey";

-- DropForeignKey
ALTER TABLE "PrescriptionMedication" DROP CONSTRAINT "PrescriptionMedication_prescriptionId_fkey";

-- DropIndex
DROP INDEX "Appointment_departmentId_appointmentDate_idx";

-- DropIndex
DROP INDEX "Appointment_doctorId_appointmentDate_key";

-- DropIndex
DROP INDEX "Appointment_patientId_appointmentDate_idx";

-- DropIndex
DROP INDEX "Doctor_departmentId_idx";

-- DropIndex
DROP INDEX "Doctor_email_key";

-- DropIndex
DROP INDEX "Doctor_licenseNumber_key";

-- DropIndex
DROP INDEX "Doctor_userId_key";

-- DropIndex
DROP INDEX "Patient_departmentId_idx";

-- DropIndex
DROP INDEX "Patient_email_key";

-- DropIndex
DROP INDEX "Patient_userId_key";

-- AlterTable
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_pkey",
DROP COLUMN "appointmentDate",
DROP COLUMN "createdAt",
DROP COLUMN "departmentId",
DROP COLUMN "notes",
DROP COLUMN "reason",
DROP COLUMN "status",
DROP COLUMN "updatedAt",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "patientId" SET DATA TYPE TEXT,
ALTER COLUMN "doctorId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Appointment_id_seq";

-- AlterTable
ALTER TABLE "Doctor" DROP CONSTRAINT "Doctor_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "departmentId",
DROP COLUMN "email",
DROP COLUMN "firstName",
DROP COLUMN "isActive",
DROP COLUMN "lastName",
DROP COLUMN "licenseNumber",
DROP COLUMN "phone",
DROP COLUMN "specialization",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "specialty" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Doctor_id_seq";

-- AlterTable
ALTER TABLE "Patient" DROP CONSTRAINT "Patient_pkey",
DROP COLUMN "address",
DROP COLUMN "createdAt",
DROP COLUMN "dateOfBirth",
DROP COLUMN "departmentId",
DROP COLUMN "email",
DROP COLUMN "emergencyContact",
DROP COLUMN "firstName",
DROP COLUMN "gender",
DROP COLUMN "isActive",
DROP COLUMN "lastName",
DROP COLUMN "phone",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "age" INTEGER NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Patient_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Patient_id_seq";

-- DropTable
DROP TABLE "Department";

-- DropTable
DROP TABLE "MedicalRecord";

-- DropTable
DROP TABLE "Medication";

-- DropTable
DROP TABLE "Prescription";

-- DropTable
DROP TABLE "PrescriptionMedication";

-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "AppointmentStatus";

-- DropEnum
DROP TYPE "Gender";

-- DropEnum
DROP TYPE "MedicalRecordStatus";

-- DropEnum
DROP TYPE "PrescriptionStatus";

-- DropEnum
DROP TYPE "Role";

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
