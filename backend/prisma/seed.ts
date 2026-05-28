/**
 * XINAPSIS SEED SCRIPT
 * ─────────────────────────────────────────────────────────────────────
 * This script creates the initial SUPER_ADMIN user.
 * Run ONCE after the first migration on a new server.
 *
 * Usage:
 *   npx ts-node prisma/seed.ts
 *   (or: node -r ts-node/register prisma/seed.ts)
 *
 * ⚠️  IMPORTANT: Change the email and password before running in production!
 * ─────────────────────────────────────────────────────────────────────
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Running Xinapsis seed...\n');

  // 1. Ensure the SUPER_ADMIN role exists
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: {
      name: 'SUPER_ADMIN',
      permissions: { all: true }
    }
  });
  console.log(`✅ Role created/verified: ${superAdminRole.name}`);

  // 2. Also ensure the other operational roles exist
  for (const roleName of ['ADMIN', 'DOCTOR', 'ASSISTANT', 'LABORATORY', 'SUPER_DOCTOR']) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName }
    });
    console.log(`✅ Role created/verified: ${roleName}`);
  }

  // 3. Create the SUPER_ADMIN user
  const SUPER_ADMIN_EMAIL    = 'superadmin@xinapsis.com';  // ← Change this
  const SUPER_ADMIN_PASSWORD = 'Xinapsis2025!';            // ← Change this


  // Check if any SUPER_ADMIN user already exists to ensure only one exists globally
  const existingSuperAdmin = await prisma.user.findFirst({
    where: { role: { name: 'SUPER_ADMIN' } }
  });

  let superAdmin;
  if (existingSuperAdmin) {
    console.log(`\nℹ️  A SUPER_ADMIN user already exists: ${existingSuperAdmin.email}. Skipping creation to ensure exactly one global superuser.`);
    superAdmin = existingSuperAdmin;
  } else {
    const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 12);

    superAdmin = await prisma.user.create({
      data: {
        email: SUPER_ADMIN_EMAIL,
        password: hashedPassword,
        roleId: superAdminRole.id,
        clinicId: null,  // SUPER_ADMIN does not belong to any clinic
      }
    });

    console.log(`\n🚀 SUPER_ADMIN user ready:`);
    console.log(`   Email   : ${SUPER_ADMIN_EMAIL}`);
    console.log(`   Password: ${SUPER_ADMIN_PASSWORD}`);
    console.log(`   User ID : ${superAdmin.id}`);
    console.log(`\n⚠️  Remember to change the password after first login!\n`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
