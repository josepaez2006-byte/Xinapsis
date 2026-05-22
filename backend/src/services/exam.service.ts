import prisma from '../db/prisma';

export class ExamService {
  async getAll() {
    return prisma.exam.findMany({
      include: {
        requestedInConsultation: true,
        analyzedInConsultation: true,
        labExamDetail: {
          include: {
            labExamTemplate: true
          }
        }
      }
    });
  }

  async getById(id: number) {
    return prisma.exam.findUnique({
      where: { id },
      include: {
        requestedInConsultation: true,
        analyzedInConsultation: true,
        labExamDetail: {
          include: {
            labExamTemplate: true
          }
        }
      }
    });
  }

  async getByRequestedConsultationId(consultationId: number) {
    return prisma.exam.findMany({
      where: { requestedInConsultationId: consultationId },
      include: {
        requestedInConsultation: true,
        analyzedInConsultation: true,
        labExamDetail: {
          include: {
            labExamTemplate: true
          }
        }
      }
    });
  }

  async getPendingByPatientDni(dni: string, clinicId: number) {
    // 1. Find patient in the clinic
    const patient = await prisma.patient.findFirst({
      where: { dni, clinicId }
    });

    if (!patient) return [];

    // 2. Find pending exams of type LABORATORIO for this patient
    return prisma.exam.findMany({
      where: {
        requestedInConsultation: {
          patientId: patient.id
        },
        type: 'LABORATORIO',
        status: 'PENDING'
      },
      include: {
        labExamDetail: {
          include: {
            labExamTemplate: true
          }
        },
        requestedInConsultation: {
          include: {
            patient: true,
            doctor: true
          }
        }
      }
    });
  }

  async create(data: any) {
    return prisma.exam.create({
      data,
      include: {
        requestedInConsultation: true,
        analyzedInConsultation: true,
        labExamDetail: {
          include: {
            labExamTemplate: true
          }
        }
      }
    });
  }

  async update(id: number, data: any) {
    return prisma.exam.update({
      where: { id },
      data,
      include: {
        requestedInConsultation: true,
        analyzedInConsultation: true,
        labExamDetail: {
          include: {
            labExamTemplate: true
          }
        }
      }
    });
  }

  async delete(id: number) {
    return prisma.exam.delete({
      where: { id }
    });
  }
}

export const examService = new ExamService();
