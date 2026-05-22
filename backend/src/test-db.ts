import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Attempting to connect to the database...');
  try {
    const roles = await prisma.role.findMany();
    console.log('Connection successful! Roles found:', roles);
  } catch (error) {
    console.error('Database connection failed with error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
