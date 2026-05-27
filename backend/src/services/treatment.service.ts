import prisma from '../db/prisma';

export class TreatmentService {
  async getAll(clinicId: number) {
    return prisma.treatment.findMany({
      where: { consultation: { clinicId } }
    });
  }

  async getById(id: number, clinicId: number) {
    return prisma.treatment.findFirst({
      where: { id, consultation: { clinicId } }
    });
  }

  async getByConsultationId(consultationId: number, clinicId: number) {
    return prisma.treatment.findMany({
      where: { consultationId, consultation: { clinicId } }
    });
  }

  async create(data: any, clinicId: number) {
    const { consultationId } = data;
    const consultation = await prisma.consultation.findFirst({
      where: { id: consultationId, clinicId }
    });
    if (!consultation) throw new Error('Consultation not found in this clinic');

    return prisma.treatment.create({
      data
    });
  }

  async update(id: number, data: any, clinicId: number) {
    const existing = await prisma.treatment.findFirst({
      where: { id, consultation: { clinicId } }
    });
    if (!existing) throw new Error('Treatment not found in this clinic');

    return prisma.treatment.update({
      where: { id },
      data
    });
  }

  async delete(id: number, clinicId: number) {
    const existing = await prisma.treatment.findFirst({
      where: { id, consultation: { clinicId } }
    });
    if (!existing) throw new Error('Treatment not found in this clinic');

    return prisma.treatment.delete({
      where: { id }
    });
  }
}

export const treatmentService = new TreatmentService();
