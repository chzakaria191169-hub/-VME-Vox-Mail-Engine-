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
    const enums = await prisma.$queryRawUnsafe(`
      SELECT t.typname, e.enumlabel
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      WHERE t.typname = 'LogLevel';
    `);

    const triggers = await prisma.$queryRawUnsafe(`
      SELECT trigger_name 
      FROM information_schema.triggers 
      WHERE event_object_table = 'EventLog';
    `);

    const views = await prisma.$queryRawUnsafe(`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = 'public' 
      AND view_definition ILIKE '%EventLog%';
    `);

    console.log(JSON.stringify({ enums, triggers, views }, null, 2));
  } catch(e) { console.error(e); } finally { await prisma.$disconnect(); }
}
audit();
