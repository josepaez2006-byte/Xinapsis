import prisma from '../db/prisma';

export class FindingService {
  async getAll(clinicId: number) {
    return prisma.finding.findMany({
      where: { consultation: { clinicId } }
    });
  }

  async getById(id: number, clinicId: number) {
    return prisma.finding.findFirst({
      where: { id, consultation: { clinicId } }
    });
  }

  async getByConsultationId(consultationId: number, clinicId: number) {
    return prisma.finding.findMany({
      where: { consultationId, consultation: { clinicId } }
    });
  }

  async create(data: any, clinicId: number) {
    const { consultationId } = data;
    const consultation = await prisma.consultation.findFirst({
      where: { id: consultationId, clinicId }
    });
    if (!consultation) throw new Error('Consultation not found in this clinic');

    return prisma.finding.create({
      data
    });
  }

  async update(id: number, data: any, clinicId: number) {
    const existing = await prisma.finding.findFirst({
      where: { id, consultation: { clinicId } }
    });
    if (!existing) throw new Error('Finding not found in this clinic');

    return prisma.finding.update({
      where: { id },
      data
    });
  }

  async delete(id: number, clinicId: number) {
    const existing = await prisma.finding.findFirst({
      where: { id, consultation: { clinicId } }
    });
    if (!existing) throw new Error('Finding not found in this clinic');

    return prisma.finding.delete({
      where: { id }
    });
  }
}

export const findingService = new FindingService();
