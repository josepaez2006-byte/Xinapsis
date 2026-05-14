import prisma from '../db/prisma';
import bcrypt from 'bcryptjs';
import { CreateClinicDto, UpdateClinicDto, CreateClinicAdminDto } from '../types/dtos';

export class ClinicService {
  async getAll() {
    return prisma.clinic.findMany({
      include: { _count: { select: { users: true, patients: true } } }
    });
  }

  async getById(id: number) {
    return prisma.clinic.findUnique({
      where: { id },
      include: { _count: { select: { users: true, patients: true, doctors: true } } }
    });
  }

  async create(data: CreateClinicDto) {
    const { name, address, rif, phone } = data;
    return prisma.clinic.create({ data: { name, address, rif, phone } });
  }

  async update(id: number, data: UpdateClinicDto) {
    const { name, address, rif, phone, isActive } = data;
    return prisma.clinic.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(address && { address }),
        ...(rif && { rif }),
        ...(phone && { phone }),
        ...(isActive !== undefined && { isActive })
      }
    });
  }

  async delete(id: number) {
    return prisma.clinic.update({ where: { id }, data: { isActive: false } });
  }

  // ── Admin Management ────────────────────────────────────────────────────────

  async getAdmins(clinicId: number) {
    return prisma.user.findMany({
      where: { clinicId, role: { name: 'ADMIN' } },
      select: { id: true, email: true, createdAt: true, role: true }
    });
  }

  async createAdmin(clinicId: number, data: CreateClinicAdminDto) {
    const { email, password } = data;

    // Verify clinic exists
    const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
    if (!clinic) throw new Error('Clinic not found');

    const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
    if (!adminRole) throw new Error('Role ADMIN not found in database');

    const hashedPassword = await bcrypt.hash(password, 12);

    return prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        clinicId,
        roleId: adminRole.id
      },
      select: { id: true, email: true, createdAt: true, role: true }
    });
  }

  async deleteAdmin(clinicId: number, adminId: number) {
    // Only delete if the user is an ADMIN and belongs to the specified clinic
    const admin = await prisma.user.findFirst({
      where: { id: adminId, clinicId, role: { name: 'ADMIN' } }
    });

    if (!admin) throw new Error('Admin not found in this clinic');

    return prisma.user.delete({ where: { id: adminId } });
  }
}


export const clinicService = new ClinicService();
