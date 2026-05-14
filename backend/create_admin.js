const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create a Clinic
  const clinic = await prisma.clinic.create({
    data: {
      name: 'Clínica Central Xinapsis',
      address: 'Av. Principal 123',
      phone: '555-0101'
    }
  });

  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  const hashedPassword = await bcrypt.hash('admin123', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@xinapsis.com',
      password: hashedPassword,
      roleId: adminRole.id,
      clinicId: clinic.id
    }
  });

  console.log('✅ Clinic and ADMIN created:');
  console.log(`   Email: admin@xinapsis.com`);
  console.log(`   Password: admin123`);
  console.log(`   Clinic: ${clinic.name}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
