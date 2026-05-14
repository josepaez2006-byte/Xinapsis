import prisma from '../db/prisma';

export class DoctorService {
  async getAll(clinicId: number) {
    return prisma.doctor.findMany({
      where: { clinicId },
      include: { user: { select: { id: true, email: true } } }
    });
  }

  async getById(id: number, clinicId: number) {
    return prisma.doctor.findFirst({
      where: { id, clinicId },
      include: { user: { select: { id: true, email: true } } }
    });
  }

  async create(data: any, clinicId: number) {
    return prisma.doctor.create({ data: { ...data, clinicId } });
  }

  async update(id: number, data: any, clinicId: number) {
    const existing = await prisma.doctor.findFirst({ where: { id, clinicId } });
    if (!existing) throw new Error('Doctor not found in this clinic');
    return prisma.doctor.update({ where: { id }, data });
  }

  async delete(id: number, clinicId: number) {
    const existing = await prisma.doctor.findFirst({ where: { id, clinicId } });
    if (!existing) throw new Error('Doctor not found in this clinic');
    return prisma.doctor.delete({ where: { id } });
  }
}

export const doctorService = new DoctorService();
