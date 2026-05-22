import prisma from '../db/prisma';
import { CreateLabExamTemplateDto, UpdateLabExamTemplateDto } from '../types/dtos';

export class LabExamService {
  async getAll(clinicId: number) {
    return prisma.labExamTemplate.findMany({
      where: { clinicId },
      include: { details: true }
    });
  }

  async getById(id: number, clinicId: number) {
    return prisma.labExamTemplate.findFirst({
      where: { id, clinicId },
      include: { details: true }
    });
  }

  async create(data: CreateLabExamTemplateDto, clinicId: number) {
    const { name, details } = data;

    return prisma.labExamTemplate.create({
      data: {
        name,
        clinicId,
        details: {
          create: details.map(d => ({
            name: d.name,
            referenceValue: d.referenceValue
          }))
        }
      },
      include: { details: true }
    });
  }

  async update(id: number, data: UpdateLabExamTemplateDto, clinicId: number) {
    const existing = await prisma.labExamTemplate.findFirst({
      where: { id, clinicId }
    });

    if (!existing) {
      throw new Error('Lab exam template not found in this clinic');
    }

    const { name, details } = data;

    return prisma.$transaction(async (tx) => {
      // 1. Update the template name if provided
      const updatedTemplate = await tx.labExamTemplate.update({
        where: { id },
        data: {
          ...(name && { name })
        },
        include: { details: true }
      });

      // 2. Sync details if provided
      if (details) {
        const incomingIds = details.filter(d => d.id).map(d => d.id as number);
        
        // Delete details that are not in the update payload
        await tx.labExamDetail.deleteMany({
          where: {
            labExamTemplateId: id,
            id: { notIn: incomingIds }
          }
        });

        // Update existing details or create new ones
        for (const item of details) {
          if (item.id) {
            await tx.labExamDetail.update({
              where: { id: item.id },
              data: {
                name: item.name,
                referenceValue: item.referenceValue
              }
            });
          } else {
            await tx.labExamDetail.create({
              data: {
                labExamTemplateId: id,
                name: item.name,
                referenceValue: item.referenceValue
              }
            });
          }
        }
      }

      return tx.labExamTemplate.findUnique({
        where: { id },
        include: { details: true }
      });
    });
  }

  async delete(id: number, clinicId: number) {
    const existing = await prisma.labExamTemplate.findFirst({
      where: { id, clinicId }
    });

    if (!existing) {
      throw new Error('Lab exam template not found in this clinic');
    }

    return prisma.labExamTemplate.delete({
      where: { id }
    });
  }
}

export const labExamService = new LabExamService();
