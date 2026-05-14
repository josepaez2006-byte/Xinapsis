import prisma from '../db/prisma';

export class UserService {
  async getAll(clinicId: number) {
    return prisma.user.findMany({
      where: { clinicId },
      select: { 
        id: true, 
        email: true, 
        role: true, 
        doctor: true, 
        assistant: true,
        createdAt: true 
      }
    });
  }

  async update(id: number, clinicId: number, data: any) {
    const user = await prisma.user.findFirst({
      where: { id, clinicId },
      include: { role: true }
    });

    if (!user) throw new Error('Usuario no encontrado en esta clínica');

    const { email, doctorData, assistantData } = data;

    try {
      return await prisma.$transaction(async (tx) => {
        // 1. Actualizar usuario base
        if (email && email !== user.email) {
          await tx.user.update({
            where: { id },
            data: { email }
          });
        }

        // 2. Perfil según rol
        if (user.role.name === 'DOCTOR' && doctorData) {
          await tx.doctor.upsert({
            where: { userId: id },
            update: {
              firstName: doctorData.firstName || '',
              lastName: doctorData.lastName || '',
              specialty: doctorData.specialty || '',
              medicalLicense: doctorData.medicalLicense || '',
              rif: doctorData.rif || null,
              phone: doctorData.phone || null,
              contactEmail: doctorData.contactEmail || null,
              otherSpecialties: doctorData.otherSpecialties || null
            },
            create: {
              userId: id,
              clinicId: clinicId,
              firstName: doctorData.firstName || '',
              lastName: doctorData.lastName || '',
              specialty: doctorData.specialty || '',
              medicalLicense: doctorData.medicalLicense || '',
              rif: doctorData.rif || null,
              phone: doctorData.phone || null,
              contactEmail: doctorData.contactEmail || null,
              otherSpecialties: doctorData.otherSpecialties || null
            }
          });
        } else if (user.role.name === 'ASSISTANT' && assistantData) {
          await tx.assistant.upsert({
            where: { userId: id },
            update: {
              firstName: assistantData.firstName || '',
              lastName: assistantData.lastName || '',
              dni: assistantData.dni || '',
              phone: assistantData.phone || null,
              schedule: assistantData.schedule || null
            },
            create: {
              userId: id,
              clinicId: clinicId,
              firstName: assistantData.firstName || '',
              lastName: assistantData.lastName || '',
              dni: assistantData.dni || '',
              phone: assistantData.phone || null,
              schedule: assistantData.schedule || null
            }
          });
        }

        return { success: true, message: 'Empleado actualizado correctamente' };
      });
    } catch (err: any) {
      console.error('Update Error:', err);
      // Extraer mensaje de error de Prisma si es posible
      const msg = err.code === 'P2002' ? 'Conflicto de datos únicos (Email, Cédula o Colegiado ya existen)' : err.message;
      throw new Error(msg);
    }
  }

  async delete(id: number, clinicId: number) {
    const user = await prisma.user.findFirst({
      where: { id, clinicId },
      include: { role: true }
    });
    if (!user) throw new Error('Usuario no encontrado');

    return prisma.$transaction(async (tx) => {
      if (user.role.name === 'DOCTOR') {
        await tx.doctor.deleteMany({ where: { userId: id } });
      } else if (user.role.name === 'ASSISTANT') {
        await tx.assistant.deleteMany({ where: { userId: id } });
      }
      return tx.user.delete({ where: { id } });
    });
  }
}

export const userService = new UserService();
