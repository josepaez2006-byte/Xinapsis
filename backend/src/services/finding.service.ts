import prisma from '../db/prisma';

export class FindingService {
  async getAll() {
    return prisma.finding.findMany();
  }

  async getById(id: number) {
    return prisma.finding.findUnique({
      where: { id }
    });
  }

  async getByConsultationId(consultationId: number) {
    return prisma.finding.findMany({
      where: { consultationId }
    });
  }

  async create(data: any) {
    return prisma.finding.create({
      data
    });
  }

  async update(id: number, data: any) {
    return prisma.finding.update({
      where: { id },
      data
    });
  }

  async delete(id: number) {
    return prisma.finding.delete({
      where: { id }
    });
  }
}

export const findingService = new FindingService();
