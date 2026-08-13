const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const raw = await prisma.$queryRawUnsafe("SELECT column_name FROM information_schema.columns WHERE table_name = 'EventLog'");
  console.log(raw);
  process.exit(0);
}
run();
