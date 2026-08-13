const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.gihuscbvgrugzaxowmur:Ch%40zakaria191169VME@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1'
    }
  }
});

async function runPatch() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "EventLog" ADD COLUMN "eventType" TEXT NOT NULL DEFAULT 'LEGACY_EVENT'`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "EventLog" ADD COLUMN "mailboxId" TEXT REFERENCES "Mailbox"("id") ON DELETE SET NULL`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "EventLog" ALTER COLUMN "level" TYPE TEXT USING level::TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "EventLog" ALTER COLUMN "level" SET DEFAULT 'INFO'`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "EventLog" ALTER COLUMN "entity" DROP NOT NULL`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "EventLog" ALTER COLUMN "event" DROP NOT NULL`);
    console.log("Patch executed successfully.");
  } catch (e) {
    console.error("Patch failed:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}
runPatch();
