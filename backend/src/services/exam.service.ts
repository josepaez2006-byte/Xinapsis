import prisma from '../db/prisma';

export class ExamService {
  async getAll(clinicId: number) {
    return prisma.exam.findMany({
      where: {
        requestedInConsultation: { clinicId }
      },
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

  async getById(id: number, clinicId: number) {
    return prisma.exam.findFirst({
      where: {
        id,
        requestedInConsultation: { clinicId }
      },
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

  async getByRequestedConsultationId(consultationId: number, clinicId: number) {
    return prisma.exam.findMany({
      where: {
        requestedInConsultationId: consultationId,
        requestedInConsultation: { clinicId }
      },
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

  async create(data: any, clinicId: number) {
    const { requestedInConsultationId } = data;
    const consultation = await prisma.consultation.findFirst({
      where: { id: requestedInConsultationId, clinicId }
    });
    if (!consultation) throw new Error('Requested consultation not found in this clinic');

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

  async update(id: number, data: any, clinicId: number) {
    const existing = await prisma.exam.findFirst({
      where: {
        id,
        requestedInConsultation: { clinicId }
      }
    });
    if (!existing) {
      throw new Error('Exam not found in this clinic');
    }

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

  async delete(id: number, clinicId: number) {
    const existing = await prisma.exam.findFirst({
      where: {
        id,
        requestedInConsultation: { clinicId }
      }
    });
    if (!existing) {
      throw new Error('Exam not found in this clinic');
    }

    return prisma.exam.delete({
      where: { id }
    });
  }
}

export const examService = new ExamService();
