import prisma from '../db/prisma';

export class TreatmentService {
  async getAll() {
    return prisma.treatment.findMany();
  }

  async getById(id: number) {
    return prisma.treatment.findUnique({
      where: { id }
    });
  }

  async getByConsultationId(consultationId: number) {
    return prisma.treatment.findMany({
      where: { consultationId }
    });
  }

  async create(data: any) {
    return prisma.treatment.create({
      data
    });
  }

  async update(id: number, data: any) {
    return prisma.treatment.update({
      where: { id },
      data
    });
  }

  async delete(id: number) {
    return prisma.treatment.delete({
      where: { id }
    });
  }
}

export const treatmentService = new TreatmentService();
