import prisma from '../db/prisma';

export class ExamService {
  async getAll() {
    return prisma.exam.findMany({
      include: {
        requestedInConsultation: true,
        analyzedInConsultation: true
      }
    });
  }

  async getById(id: number) {
    return prisma.exam.findUnique({
      where: { id },
      include: {
        requestedInConsultation: true,
        analyzedInConsultation: true
      }
    });
  }

  async getByRequestedConsultationId(consultationId: number) {
    return prisma.exam.findMany({
      where: { requestedInConsultationId: consultationId },
      include: {
        requestedInConsultation: true,
        analyzedInConsultation: true
      }
    });
  }

  async create(data: any) {
    return prisma.exam.create({
      data,
      include: {
        requestedInConsultation: true,
        analyzedInConsultation: true
      }
    });
  }

  async update(id: number, data: any) {
    return prisma.exam.update({
      where: { id },
      data,
      include: {
        requestedInConsultation: true,
        analyzedInConsultation: true
      }
    });
  }

  async delete(id: number) {
    return prisma.exam.delete({
      where: { id }
    });
  }
}

export const examService = new ExamService();
