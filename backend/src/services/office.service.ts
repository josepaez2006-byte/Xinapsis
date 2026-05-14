import prisma from '../db/prisma';

export class OfficeService {
  async getAll(clinicId: number) {
    return prisma.office.findMany({ where: { clinicId } });
  }

  async getById(id: number, clinicId: number) {
    return prisma.office.findFirst({ where: { id, clinicId } });
  }

  async create(data: any, clinicId: number) {
    return prisma.office.create({ data: { ...data, clinicId } });
  }

  async update(id: number, data: any, clinicId: number) {
    const existing = await prisma.office.findFirst({ where: { id, clinicId } });
    if (!existing) throw new Error('Office not found in this clinic');
    return prisma.office.update({ where: { id }, data });
  }

  async delete(id: number, clinicId: number) {
    const existing = await prisma.office.findFirst({ where: { id, clinicId } });
    if (!existing) throw new Error('Office not found in this clinic');
    return prisma.office.delete({ where: { id } });
  }
}

export const officeService = new OfficeService();
