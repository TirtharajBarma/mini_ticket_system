import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error'], // Only log errors, no query logs
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;