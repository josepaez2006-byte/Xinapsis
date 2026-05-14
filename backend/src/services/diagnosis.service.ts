import prisma from '../db/prisma';

export class DiagnosisService {
  async getAll() {
    return prisma.diagnosis.findMany();
  }

  async getById(id: number) {
    return prisma.diagnosis.findUnique({
      where: { id }
    });
  }

  async getByConsultationId(consultationId: number) {
    return prisma.diagnosis.findMany({
      where: { consultationId }
    });
  }

  async create(data: any) {
    return prisma.diagnosis.create({
      data
    });
  }

  async update(id: number, data: any) {
    return prisma.diagnosis.update({
      where: { id },
      data
    });
  }

  async delete(id: number) {
    return prisma.diagnosis.delete({
      where: { id }
    });
  }
}

export const diagnosisService = new DiagnosisService();
