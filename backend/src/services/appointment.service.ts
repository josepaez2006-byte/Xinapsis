import prisma from '../db/prisma';
import { CreateAppointmentDto, UpdateAppointmentDto } from '../types/dtos';

export class AppointmentService {
  async getAll(clinicId: number, page = 1, limit = 100) {
    return prisma.appointment.findMany({
      where: { clinicId },
      include: { patient: true, doctor: true, office: true, consultation: true },
      orderBy: { datetime: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async count(clinicId: number) {
    return prisma.appointment.count({ where: { clinicId } });
  }

  async getById(id: number, clinicId: number) {
    return prisma.appointment.findFirst({
      where: { id, clinicId },
      include: { patient: true, doctor: true, office: true, consultation: true }
    });
  }

  async create(data: CreateAppointmentDto, clinicId: number) {
    // Destructuring explícito: el clinicId del body es ignorado
    const { patientId, doctorId, officeId, datetime: rawDatetime, status, duration, type, isConfirmed, notes } = data;
    if (!rawDatetime) throw new Error('datetime is required');
    const datetime = new Date(rawDatetime);

    // Validar referencias cruzadas de inquilinos
    const patient = await prisma.patient.findFirst({ where: { id: patientId, clinicId } });
    if (!patient) throw new Error('Patient not found in this clinic');

    const doctor = await prisma.doctor.findFirst({ where: { id: doctorId, clinicId } });
    if (!doctor) throw new Error('Doctor not found in this clinic');

    const office = await prisma.office.findFirst({ where: { id: officeId, clinicId } });
    if (!office) throw new Error('Office not found in this clinic');

    return prisma.appointment.create({
      data: { 
        patientId, 
        doctorId, 
        officeId, 
        clinicId, 
        datetime, 
        duration,
        type,
        isConfirmed,
        notes,
        ...(status && { status }) 
      },
      include: { patient: true, doctor: true, office: true }
    });
  }

  async update(id: number, data: UpdateAppointmentDto, clinicId: number) {
    const existing = await prisma.appointment.findFirst({ where: { id, clinicId } });
    if (!existing) throw new Error('Appointment not found in this clinic');

    // Destructuring explícito: el clinicId del body es ignorado
    const { patientId, doctorId, officeId, datetime: rawDatetime, status, duration, type, isConfirmed, notes } = data;
    const datetime = rawDatetime ? new Date(rawDatetime) : undefined;

    // Validar referencias cruzadas de inquilinos si se actualizan
    if (patientId) {
      const patient = await prisma.patient.findFirst({ where: { id: patientId, clinicId } });
      if (!patient) throw new Error('Patient not found in this clinic');
    }
    if (doctorId) {
      const doctor = await prisma.doctor.findFirst({ where: { id: doctorId, clinicId } });
      if (!doctor) throw new Error('Doctor not found in this clinic');
    }
    if (officeId) {
      const office = await prisma.office.findFirst({ where: { id: officeId, clinicId } });
      if (!office) throw new Error('Office not found in this clinic');
    }

    return prisma.appointment.update({
      where: { id },
      data: { 
        patientId, 
        doctorId, 
        officeId, 
        duration,
        type,
        isConfirmed,
        notes,
        ...(datetime && { datetime }), 
        ...(status && { status }) 
      },
      include: { patient: true, doctor: true, office: true }
    });
  }

  async delete(id: number, clinicId: number) {
    const existing = await prisma.appointment.findFirst({ where: { id, clinicId } });
    if (!existing) throw new Error('Appointment not found in this clinic');
    return prisma.appointment.delete({ where: { id } });
  }
}

export const appointmentService = new AppointmentService();
