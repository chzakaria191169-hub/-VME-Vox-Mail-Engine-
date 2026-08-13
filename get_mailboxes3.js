const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://postgres.gihuscbvgrugzaxowmur:Ch%40zakaria191169VME@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1' } } });
async function getMailboxes() {
  const mailboxes = await prisma.$queryRawUnsafe(`SELECT * FROM "Mailbox"`);
  console.log(JSON.stringify(mailboxes, null, 2));
  await prisma.$disconnect();
}
getMailboxes().catch(console.error);
