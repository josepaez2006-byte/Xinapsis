import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../db/prisma';
import { RegisterDto, LoginDto, AllowedRole } from '../types/dtos';

// Roles que se pueden crear por API. SUPER_ADMIN solo se crea vía seed.
const ALLOWED_ROLES: AllowedRole[] = ['ADMIN', 'DOCTOR', 'ASSISTANT', 'LABORATORY', 'SUPER_DOCTOR'];

export class AuthService {
  async register(data: RegisterDto, requestingUserRole?: string) {
    const { email, password, roleName, doctorData, assistantData } = data;

    if (!email || !password || !roleName) {
      throw new Error('Email, password and roleName are required');
    }

    if (roleName as string === 'SUPER_ADMIN') {
      throw new Error('SUPER_ADMIN users cannot be created through the API');
    }

    // Validar que el rol solicitado está en la whitelist
    if (!ALLOWED_ROLES.includes(roleName)) {
      throw new Error(`Invalid role. Allowed roles: ${ALLOWED_ROLES.join(', ')}`);
    }

    // Solo SUPER_ADMIN puede crear otro ADMIN
    if (roleName === 'ADMIN' && requestingUserRole !== 'SUPER_ADMIN') {
      throw new Error('Only SUPER_ADMIN can create ADMIN users');
    }

    // Validar que roles como DOCTOR/ASSISTANT/SUPER_DOCTOR requieren contexto de clínica
    if (roleName === 'DOCTOR' || roleName === 'ASSISTANT' || roleName === 'SUPER_DOCTOR') {
      throw new Error(`Cannot create ${roleName} without a clinic context. Use registerForClinic instead.`);
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error('User already exists');

    let role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
      role = await prisma.role.create({ data: { name: roleName } });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          roleId: role!.id,
          clinicId: null,
        },
        include: { role: true }
      });

      return newUser;
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async registerForClinic(data: RegisterDto, clinicId: number, requestingUserRole: string) {
    const { email, password, roleName, doctorData, assistantData } = data;

    if (!email || !password || !roleName) {
      throw new Error('Email, password and roleName are required');
    }

    if (roleName as string === 'SUPER_ADMIN') {
      throw new Error('SUPER_ADMIN users cannot be created through the API');
    }

    // Validar que el rol solicitado está en la whitelist
    if (!ALLOWED_ROLES.includes(roleName)) {
      throw new Error(`Invalid role. Allowed roles: ${ALLOWED_ROLES.join(', ')}`);
    }

    // Solo SUPER_ADMIN puede crear otro ADMIN
    if (roleName === 'ADMIN' && requestingUserRole !== 'SUPER_ADMIN') {
      throw new Error('Only SUPER_ADMIN can create ADMIN users');
    }

    // Verificar que la clínica existe y está activa
    const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
    if (!clinic) throw new Error('Clinic not found');
    if (!clinic.isActive) throw new Error('Clinic is inactive');

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error('User already exists');

    let role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
      role = await prisma.role.create({ data: { name: roleName } });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          roleId: role!.id,
          clinicId, // clinicId viene del token del admin autenticado, no del body
        },
        include: { role: true }
      });

      if (roleName === 'DOCTOR' || roleName === 'SUPER_DOCTOR') {
        if (!doctorData?.firstName || !doctorData?.lastName || !doctorData?.specialty || !doctorData?.medicalLicense) {
          throw new Error('Doctor profile data is incomplete');
        }

        await tx.doctor.create({
          data: {
            userId: newUser.id,
            clinicId,
            firstName: doctorData.firstName,
            lastName: doctorData.lastName,
            specialty: doctorData.specialty,
            medicalLicense: doctorData.medicalLicense,
            otherSpecialties: doctorData.otherSpecialties,
            rif: doctorData.rif,
            phone: doctorData.phone,
            contactEmail: doctorData.contactEmail
          }
        });
      }
      
      if (roleName === 'ASSISTANT') {
        if (!assistantData?.firstName || !assistantData?.lastName || !assistantData?.dni) {
          throw new Error('Assistant profile data is incomplete');
        }

        await tx.assistant.create({
          data: {
            userId: newUser.id,
            clinicId,
            firstName: assistantData.firstName,
            lastName: assistantData.lastName,
            dni: assistantData.dni,
            phone: assistantData.phone,
            schedule: assistantData.schedule
          }
        });
      }

      if (roleName === 'LABORATORY') {
        if (!data.laboratoryStaffData?.firstName || !data.laboratoryStaffData?.lastName) {
          throw new Error('Laboratory profile data is incomplete');
        }

        await tx.laboratoryStaff.create({
          data: {
            userId: newUser.id,
            clinicId,
            firstName: data.laboratoryStaffData.firstName,
            lastName: data.laboratoryStaffData.lastName,
            phone: data.laboratoryStaffData.phone
          }
        });
      }

      return newUser;
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(data: LoginDto) {
    const { email, password } = data;

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { 
        role: true,
        doctor: { select: { id: true, firstName: true, lastName: true } },
        assistant: { select: { id: true, firstName: true, lastName: true } },
        laboratoryStaff: { select: { id: true, firstName: true, lastName: true } }
      }
    });
    if (!user) throw new Error('Invalid credentials');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error('Invalid credentials');

    const secret = process.env.JWT_SECRET!;
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role.name,
        clinicId: user.clinicId ?? null,
        doctorId: user.doctor?.id || null,
        assistantId: user.assistant?.id || null,
        laboratoryStaffId: user.laboratoryStaff?.id || null,
      },
      secret,
      { expiresIn: '1d' }
    );

    let firstName = null;
    let lastName = null;
    if (user.doctor) {
      firstName = user.doctor.firstName;
      lastName = user.doctor.lastName;
    } else if (user.assistant) {
      firstName = user.assistant.firstName;
      lastName = user.assistant.lastName;
    } else if (user.laboratoryStaff) {
      firstName = user.laboratoryStaff.firstName;
      lastName = user.laboratoryStaff.lastName;
    }

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role.name,
        clinicId: user.clinicId ?? null,
        doctorId: user.doctor?.id || null,
        assistantId: user.assistant?.id || null,
        laboratoryStaffId: user.laboratoryStaff?.id || null,
        firstName,
        lastName
      }
    };
  }
}

export const authService = new AuthService();
