const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.gihuscbvgrugzaxowmur:Ch%40zakaria191169VME@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1'
    }
  }
});

async function audit() {
  try {
    const columns = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'EventLog'
    `);
    
    const constraints = await prisma.$queryRawUnsafe(`
      SELECT tc.constraint_name, tc.constraint_type, kcu.column_name 
      FROM information_schema.table_constraints tc 
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name 
      WHERE tc.table_name = 'EventLog'
    `);

    const indexes = await prisma.$queryRawUnsafe(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'EventLog'
    `);

    const rowCountRes = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as cnt FROM "EventLog"`);
    const count = Number(rowCountRes[0].cnt);

    let sample = [];
    if (count > 0) {
      sample = await prisma.$queryRawUnsafe(`SELECT * FROM "EventLog" LIMIT 2`);
    }

    console.log(JSON.stringify({ columns, constraints, indexes, count, sample }, null, 2));
  } catch (e) {
    console.error(e.message);
  } finally {
    await prisma.$disconnect();
  }
}
audit();
