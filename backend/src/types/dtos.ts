// ─────────────────────────────────────────────────────────────────────────────
// DTOs — Data Transfer Objects
// Tipado explícito de los datos de entrada para cada servicio.
// Esto previene que campos como `clinicId` en el body sobreescriban
// el valor seguro extraído del JWT.
// ─────────────────────────────────────────────────────────────────────────────

// ── Auth ──────────────────────────────────────────────────────────────────────

export type AllowedRole = 'ADMIN' | 'DOCTOR' | 'ASSISTANT' | 'LABORATORY' | 'SUPER_DOCTOR';

export interface RegisterDto {
  email: string;
  password: string;
  roleName: AllowedRole;
  doctorData?: {
    firstName: string;
    lastName: string;
    specialty: string;
    medicalLicense: string;
    otherSpecialties?: string;
    rif?: string;
    phone?: string;
    contactEmail?: string;
  };
  assistantData?: {
    firstName: string;
    lastName: string;
    dni: string;
    phone?: string;
    schedule?: string;
  };
  laboratoryStaffData?: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
}

export interface LoginDto {
  email: string;
  password: string;
}

// ── Patient ───────────────────────────────────────────────────────────────────

export interface CreatePatientDto {
  firstName: string;
  lastName: string;
  dni: string;
  dateOfBirth: string; // ISO string, se convierte a Date en el servicio
  sex: 'MASCULINO' | 'FEMENINO';
  phone?: string;
  email?: string;
}

export interface UpdatePatientDto {
  firstName?: string;
  lastName?: string;
  dni?: string;
  dateOfBirth?: string;
  sex?: 'MASCULINO' | 'FEMENINO';
  phone?: string;
  email?: string;
}

// ── Appointment ───────────────────────────────────────────────────────────────

export interface CreateAppointmentDto {
  patientId: number;
  doctorId: number;
  officeId: number;
  datetime: string; // ISO string
  duration?: number;
  type?: 'PRIMERA_VEZ' | 'CONTROL' | 'EMERGENCIA' | 'PROCEDIMIENTO';
  status?: 'PENDIENTE' | 'COMPLETADO' | 'CANCELADO';
  isConfirmed?: boolean;
  notes?: string;
}

export interface UpdateAppointmentDto {
  patientId?: number;
  doctorId?: number;
  officeId?: number;
  datetime?: string;
  duration?: number;
  type?: 'PRIMERA_VEZ' | 'CONTROL' | 'EMERGENCIA' | 'PROCEDIMIENTO';
  status?: 'PENDIENTE' | 'COMPLETADO' | 'CANCELADO';
  isConfirmed?: boolean;
  notes?: string;
}

// ── Consultation ──────────────────────────────────────────────────────────────

export interface CreateConsultationDto {
  patientId: number;
  doctorId: number;
  appointmentId?: number;
  datetime?: string;
  weight?: number;
  height?: number;
  bloodPressure?: string;
  heartRate?: number;
  occupation?: string;
  reason: string;
  symptoms?: string;
  findings?: { description: string }[];
  diagnoses?: { description: string; codeCIE10?: string }[];
  treatments?: { medication: string; dosage?: string; instructions?: string }[];
  exams?: { name: string; type?: 'LABORATORIO' | 'IMAGENES' | 'OTROS'; referenceValues?: string }[];
}

export interface UpdateConsultationDto {
  datetime?: string;
  weight?: number;
  height?: number;
  bloodPressure?: string;
  heartRate?: number;
  occupation?: string;
  reason?: string;
  symptoms?: string;
  findings?: { id?: number; description: string }[];
  diagnoses?: { id?: number; description: string; codeCIE10?: string }[];
  treatments?: { id?: number; medication: string; dosage?: string; instructions?: string }[];
  exams?: { id?: number; name: string; type?: 'LABORATORIO' | 'IMAGNES' | 'OTROS'; referenceValues?: string }[];
}

// ── Office ────────────────────────────────────────────────────────────────────

export interface CreateOfficeDto {
  name: string;
  location?: string;
}

export interface UpdateOfficeDto {
  name?: string;
  location?: string;
}

// ── Clinic ────────────────────────────────────────────────────────────────────

export interface CreateClinicDto {
  name: string;
  address?: string;
  rif?: string;
  phone?: string;
}

export interface UpdateClinicDto {
  name?: string;
  address?: string;
  rif?: string;
  phone?: string;
  isActive?: boolean;
}

export interface CreateClinicAdminDto {
  email: string;
  password: string;
}

// ── Exam ──────────────────────────────────────────────────────────────────────

export interface CreateExamDto {
  requestedInConsultationId: number;
  name: string;
  type?: 'LABORATORIO' | 'IMAGENES' | 'OTROS';
  status?: string;
  referenceValues?: string;
  labExamDetailId?: number;
}

export interface UpdateExamDto {
  name?: string;
  type?: 'LABORATORIO' | 'IMAGENES' | 'OTROS';
  analyzedInConsultationId?: number;
  status?: string;
  referenceValues?: string;
  results?: string;
  labExamDetailId?: number;
}

// ── LabExamTemplate ───────────────────────────────────────────────────────────

export interface CreateLabExamDetailDto {
  name: string;
  referenceValue: string;
}

export interface CreateLabExamTemplateDto {
  name: string;
  details: CreateLabExamDetailDto[];
}

export interface UpdateLabExamTemplateDto {
  name?: string;
  details?: { id?: number; name: string; referenceValue: string }[];
}

