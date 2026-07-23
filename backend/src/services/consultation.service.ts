import prisma from '../db/prisma';
import { ExamTypes } from '@prisma/client';
import { CreateConsultationDto, UpdateConsultationDto } from '../types/dtos';

export class ConsultationService {
  async getAll(clinicId: number, page = 1, limit = 100) {
    return prisma.consultation.findMany({
      where: { clinicId },
      include: { 
        patient: true, 
        doctor: true, 
        appointment: true, 
        findings: true, 
        diagnoses: true, 
        treatments: true,
        examsRequested: true,
        examsAnalyzed: true
      },
      orderBy: { datetime: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async count(clinicId: number) {
    return prisma.consultation.count({ where: { clinicId } });
  }

  async getById(id: number, clinicId: number) {
    return prisma.consultation.findFirst({
      where: { id, clinicId },
      include: { 
        patient: true, 
        doctor: true, 
        clinic: true,
        appointment: true, 
        findings: true, 
        diagnoses: true, 
        treatments: true,
        examsRequested: true,
        examsAnalyzed: true
      }
    });
  }

  async create(data: CreateConsultationDto, clinicId: number) {
    // Destructuring explícito: el clinicId del body es ignorado
    const {
      patientId, doctorId, appointmentId,
      datetime: rawDatetime, weight, height,
      bloodPressure, heartRate, occupation, reason, symptoms,
      findings, diagnoses, treatments, exams
    } = data;
    const datetime = rawDatetime ? new Date(rawDatetime) : undefined;

    // Validar referencias cruzadas de inquilinos
    const patient = await prisma.patient.findFirst({ where: { id: patientId, clinicId } });
    if (!patient) throw new Error('Patient not found in this clinic');

    const doctor = await prisma.doctor.findFirst({ where: { id: doctorId, clinicId } });
    if (!doctor) throw new Error('Doctor not found in this clinic');

    if (appointmentId) {
      const appointment = await prisma.appointment.findFirst({ where: { id: appointmentId, clinicId } });
      if (!appointment) throw new Error('Appointment not found in this clinic');
    }

    return prisma.consultation.create({
      data: {
        patientId, doctorId, clinicId,
        ...(appointmentId && { appointmentId }),
        ...(datetime && { datetime }),
        weight, height, bloodPressure, heartRate, occupation, reason, symptoms,
        findings: findings?.length ? { create: findings } : undefined,
        diagnoses: diagnoses?.length ? { create: diagnoses } : undefined,
        treatments: treatments?.length ? { create: treatments } : undefined,
        examsRequested: exams?.length ? { create: exams } : undefined,
      },
      include: { patient: true, doctor: true, appointment: true }
    });
  }

  async update(id: number, data: UpdateConsultationDto, clinicId: number) {
    const existing = await prisma.consultation.findFirst({ where: { id, clinicId } });
    if (!existing) throw new Error('Consultation not found in this clinic');

    // Destructuring explícito: el clinicId del body es ignorado
    const {
      datetime: rawDatetime, weight, height,
      bloodPressure, heartRate, occupation, reason, symptoms,
      findings, diagnoses, treatments, exams
    } = data;
    const datetime = rawDatetime ? new Date(rawDatetime) : undefined;

    return prisma.$transaction(async (tx) => {
      // 1. Update main consultation
      const updated = await tx.consultation.update({
        where: { id },
        data: {
          ...(datetime && { datetime }),
          weight, height, bloodPressure, heartRate, occupation, reason, symptoms
        },
        include: { patient: true, doctor: true }
      });

      // 2. Sync findings
      if (findings) {
        const incomingIds = findings.filter(f => f.id).map(f => f.id);
        await tx.finding.deleteMany({
          where: { consultationId: id, id: { notIn: incomingIds as number[] } }
        });
        for (const item of findings) {
          if (item.id) {
            await tx.finding.update({ where: { id: item.id }, data: { description: item.description } });
          } else {
            await tx.finding.create({ data: { consultationId: id, description: item.description } });
          }
        }
      }

      // 3. Sync diagnoses
      if (diagnoses) {
        const incomingIds = diagnoses.filter(d => d.id).map(d => d.id);
        await tx.diagnosis.deleteMany({
          where: { consultationId: id, id: { notIn: incomingIds as number[] } }
        });
        for (const item of diagnoses) {
          if (item.id) {
            await tx.diagnosis.update({ where: { id: item.id }, data: { description: item.description, codeCIE10: item.codeCIE10 } });
          } else {
            await tx.diagnosis.create({ data: { consultationId: id, description: item.description, codeCIE10: item.codeCIE10 } });
          }
        }
      }

      // 4. Sync treatments
      if (treatments) {
        const incomingIds = treatments.filter(t => t.id).map(t => t.id);
        await tx.treatment.deleteMany({
          where: { consultationId: id, id: { notIn: incomingIds as number[] } }
        });
        for (const item of treatments) {
          if (item.id) {
            await tx.treatment.update({ where: { id: item.id }, data: { medication: item.medication, dosage: item.dosage, instructions: item.instructions } });
          } else {
            await tx.treatment.create({ data: { consultationId: id, medication: item.medication, dosage: item.dosage, instructions: item.instructions } });
          }
        }
      }

      // 5. Sync exams
      if (exams) {
        const incomingIds = exams.filter(e => e.id).map(e => e.id);
        await tx.exam.deleteMany({
          where: { requestedInConsultationId: id, id: { notIn: incomingIds as number[] } }
        });
        for (const item of exams) {
          if (item.id) {
            await tx.exam.update({ where: { id: item.id }, data: { name: item.name, type: item.type as ExamTypes, referenceValues: item.referenceValues } });
          } else {
            await tx.exam.create({ data: { requestedInConsultationId: id, name: item.name, type: item.type as ExamTypes, referenceValues: item.referenceValues } });
          }
        }
      }

      return updated;
    });
  }

  async delete(id: number, clinicId: number) {
    const existing = await prisma.consultation.findFirst({ where: { id, clinicId } });
    if (!existing) throw new Error('Consultation not found in this clinic');

    // ── Eliminar hijos en orden correcto para evitar FK constraint errors ──
    // Los exámenes tienen dos FK hacia Consultation, se deben desanclar primero
    await prisma.exam.updateMany({
      where: { analyzedInConsultationId: id },
      data: { analyzedInConsultationId: null }
    });
    await prisma.exam.deleteMany({ where: { requestedInConsultationId: id } });
    await prisma.finding.deleteMany({ where: { consultationId: id } });
    await prisma.diagnosis.deleteMany({ where: { consultationId: id } });
    await prisma.treatment.deleteMany({ where: { consultationId: id } });

    return prisma.consultation.delete({ where: { id } });
  }
}

export const consultationService = new ConsultationService();
