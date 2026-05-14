import prisma from '../db/prisma';

export class MedicalHistoryService {
  async getAll() {
    return prisma.medicalHistory.findMany({
      include: { patient: true }
    });
  }

  async getById(id: number) {
    return prisma.medicalHistory.findUnique({
      where: { id },
      include: { patient: true }
    });
  }

  async getByPatientId(patientId: number) {
    return prisma.medicalHistory.findUnique({
      where: { patientId },
      include: { patient: true }
    });
  }

  async create(data: any) {
    return prisma.medicalHistory.create({
      data
    });
  }

  async update(id: number, data: any) {
    return prisma.medicalHistory.update({
      where: { id },
      data
    });
  }

  async delete(id: number) {
    return prisma.medicalHistory.delete({
      where: { id }
    });
  }

  async upsert(patientId: number, data: any) {
    return prisma.medicalHistory.upsert({
      where: { patientId },
      create: { ...data, patientId },
      update: { ...data }
    });
  }
}

export const medicalHistoryService = new MedicalHistoryService();
