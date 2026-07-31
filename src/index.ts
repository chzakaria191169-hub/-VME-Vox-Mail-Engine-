// src/index.ts — VME Entry Point

import dotenv from 'dotenv';
dotenv.config();

import { MailEngine } from './core/engine/MailEngine';

const engine = new MailEngine();

async function main() {
  console.log('');
  console.log('██╗   ██╗███╗   ███╗███████╗');
  console.log('██║   ██║████╗ ████║██╔════╝');
  console.log('██║   ██║██╔████╔██║█████╗  ');
  console.log('╚██╗ ██╔╝██║╚██╔╝██║██╔══╝  ');
  console.log(' ╚████╔╝ ██║ ╚═╝ ██║███████╗');
  console.log('  ╚═══╝  ╚═╝     ╚═╝╚══════╝');
  console.log('  Voxora Mail Engine (VME)    ');
  console.log('');

  await engine.start();

  // Graceful shutdown on SIGINT / SIGTERM
  process.on('SIGINT', async () => {
    console.log('\n[VME] 🛑 SIGINT received. Shutting down gracefully...');
    await engine.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n[VME] 🛑 SIGTERM received. Shutting down gracefully...');
    await engine.stop();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error('[VME] Fatal startup error:', err);
  process.exit(1);
});
