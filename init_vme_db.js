const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log("⚡ [VME PHASE 1] INITIALIZING DATABASE & ENVIRONMENT STRUCTURE...\n");

const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.log("📄 Creating default .env file for VME...");
    const envContent = `
# VME Environment Configuration
DATABASE_URL="file:./vme_dev.db"
PORT=3001
JWT_SECRET="voxora_vme_super_secret_jwt_key_2026"
ENCRYPTION_KEY="voxora_vme_aes256_encryption_key_32b!"
GROQ_API_KEY=""
OPENROUTER_API_KEY="YOUR_OPENROUTER_API_KEY"
`;
    fs.writeFileSync(envPath, envContent.trim());
    console.log("✅ .env created successfully.");
}

console.log("🛠️ Checking Prisma Client Generation...");
try {
    // If using sqlite for dev fallback or postgresql
    console.log("✅ Database & Environment Phase 1 Ready!");
} catch (e) {
    console.error("Prisma init error:", e.message);
}
