import prisma from '../db/prisma';
import { CreatePatientDto, UpdatePatientDto } from '../types/dtos';

export class PatientService {
  async getAll(clinicId: number) {
    return prisma.patient.findMany({
      where: { clinicId },
      include: { medicalHistory: true }
    });
  }

  async getById(id: number, clinicId: number) {
    return prisma.patient.findFirst({
      where: { id, clinicId },
      include: { medicalHistory: true }
    });
  }

  async create(data: CreatePatientDto, clinicId: number) {
    // Destructuring explícito: el clinicId del body es ignorado
    const { firstName, lastName, dni, dateOfBirth: rawDate, sex, phone, email } = data;
    if (!rawDate) throw new Error('dateOfBirth is required');
    const dateOfBirth = new Date(rawDate);

    return prisma.patient.create({
      data: { firstName, lastName, dni, sex, phone, email, clinicId, dateOfBirth },
      include: { medicalHistory: true }
    });
  }

  async update(id: number, data: UpdatePatientDto, clinicId: number) {
    // Verificar propiedad antes de actualizar
    const existing = await prisma.patient.findFirst({ where: { id, clinicId } });
    if (!existing) throw new Error('Patient not found in this clinic');

    // Destructuring explícito: el clinicId del body es ignorado
    const { firstName, lastName, dni, dateOfBirth: rawDate, sex, phone, email } = data;
    const dateOfBirth = rawDate ? new Date(rawDate) : undefined;

    return prisma.patient.update({
      where: { id },
      data: { firstName, lastName, dni, sex, phone, email, ...(dateOfBirth && { dateOfBirth }) },
      include: { medicalHistory: true }
    });
  }

  async delete(id: number, clinicId: number) {
    const existing = await prisma.patient.findFirst({ where: { id, clinicId } });
    if (!existing) throw new Error('Patient not found in this clinic');

    await prisma.medicalHistory.deleteMany({ where: { patientId: id } });
    return prisma.patient.delete({ where: { id } });
  }
}

export const patientService = new PatientService();
