const { PrismaClient } = require('@prisma/client');
const ExecutionEngine = require('./src/engine/ExecutionEngine');
const MailSyncEngine = require('./src/engine/MailSyncEngine');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.gihuscbvgrugzaxowmur:Ch%40zakaria191169VME@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1'
    }
  }
});

async function verify() {
  try {
    const existingCount = await prisma.eventLog.count({ where: { eventType: 'LEGACY_EVENT' }});
    console.log('Legacy rows intact:', existingCount);

    const ee = new ExecutionEngine({});
    const eeLog = ee.emitEvent('MESSAGE_SENT', 'INFO', 'Test EE Sent', { mailboxId: '02cd3c50-a141-44b2-9339-27f2c0d3c3d2' });
    
    const mse = new MailSyncEngine(prisma);
    const mseLog = mse.emitEvent('MESSAGE_SYNCED', 'INFO', 'Test MSE Synced', { mailboxId: '02cd3c50-a141-44b2-9339-27f2c0d3c3d2' });

    // Wait for fire-and-forget DB saves
    await new Promise(r => setTimeout(r, 2000));

    const events = await prisma.eventLog.findMany({
      where: { id: { in: [eeLog.id, mseLog.id] } }
    });

    console.log('Test events found:', events.length);
    console.log('Events Data:', JSON.stringify(events, null, 2));

    await prisma.eventLog.deleteMany({
      where: { id: { in: [eeLog.id, mseLog.id] } }
    });
    console.log('Test events cleaned up.');
  } catch (e) {
    console.error('Verification failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}
verify();
