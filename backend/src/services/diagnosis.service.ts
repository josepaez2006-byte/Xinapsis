import prisma from '../db/prisma';

export class DiagnosisService {
  async getAll(clinicId: number) {
    return prisma.diagnosis.findMany({
      where: { consultation: { clinicId } }
    });
  }

  async getById(id: number, clinicId: number) {
    return prisma.diagnosis.findFirst({
      where: { id, consultation: { clinicId } }
    });
  }

  async getByConsultationId(consultationId: number, clinicId: number) {
    return prisma.diagnosis.findMany({
      where: { consultationId, consultation: { clinicId } }
    });
  }

  async create(data: any, clinicId: number) {
    const { consultationId } = data;
    const consultation = await prisma.consultation.findFirst({
      where: { id: consultationId, clinicId }
    });
    if (!consultation) throw new Error('Consultation not found in this clinic');

    return prisma.diagnosis.create({
      data
    });
  }

  async update(id: number, data: any, clinicId: number) {
    const existing = await prisma.diagnosis.findFirst({
      where: { id, consultation: { clinicId } }
    });
    if (!existing) throw new Error('Diagnosis not found in this clinic');

    return prisma.diagnosis.update({
      where: { id },
      data
    });
  }

  async delete(id: number, clinicId: number) {
    const existing = await prisma.diagnosis.findFirst({
      where: { id, consultation: { clinicId } }
    });
    if (!existing) throw new Error('Diagnosis not found in this clinic');

    return prisma.diagnosis.delete({
      where: { id }
    });
  }
}

export const diagnosisService = new DiagnosisService();
