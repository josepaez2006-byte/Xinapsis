import prisma from '../db/prisma';

export class MedicalHistoryService {
  async getAll(clinicId: number) {
    return prisma.medicalHistory.findMany({
      where: { patient: { clinicId } },
      include: { patient: true }
    });
  }

  async getById(id: number, clinicId: number) {
    return prisma.medicalHistory.findFirst({
      where: { id, patient: { clinicId } },
      include: { patient: true }
    });
  }

  async getByPatientId(patientId: number, clinicId: number) {
    const patient = await prisma.patient.findFirst({ where: { id: patientId, clinicId } });
    if (!patient) throw new Error('Patient not found in this clinic');

    return prisma.medicalHistory.findUnique({
      where: { patientId },
      include: { patient: true }
    });
  }

  async create(data: any, clinicId: number) {
    const { patientId } = data;
    const patient = await prisma.patient.findFirst({ where: { id: patientId, clinicId } });
    if (!patient) throw new Error('Patient not found in this clinic');

    return prisma.medicalHistory.create({
      data
    });
  }

  async update(id: number, data: any, clinicId: number) {
    const existing = await prisma.medicalHistory.findFirst({
      where: { id, patient: { clinicId } }
    });
    if (!existing) throw new Error('Medical history not found in this clinic');

    return prisma.medicalHistory.update({
      where: { id },
      data
    });
  }

  async delete(id: number, clinicId: number) {
    const existing = await prisma.medicalHistory.findFirst({
      where: { id, patient: { clinicId } }
    });
    if (!existing) throw new Error('Medical history not found in this clinic');

    return prisma.medicalHistory.delete({
      where: { id }
    });
  }

  async upsert(patientId: number, data: any, clinicId: number) {
    const patient = await prisma.patient.findFirst({ where: { id: patientId, clinicId } });
    if (!patient) throw new Error('Patient not found in this clinic');

    return prisma.medicalHistory.upsert({
      where: { patientId },
      create: { ...data, patientId },
      update: { ...data }
    });
  }
}

export const medicalHistoryService = new MedicalHistoryService();
