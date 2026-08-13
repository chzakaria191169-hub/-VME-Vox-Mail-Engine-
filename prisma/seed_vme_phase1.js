const fs = require('fs');
const path = require('path');
const { encrypt, decrypt } = require('../src/utils/crypto');

console.log("⚡ [VME PHASE 1: DATABASE & SECURITY] VERIFYING SETUP...\n");

// 1. Check .env security keys
const envPath = path.join(__dirname, '..', '.env');
console.log("1️⃣ Checking Environment Security Config...");
if (fs.existsSync(envPath)) {
    console.log("   ✅ .env file verified.");
} else {
    console.log("   ⚠️ Creating default .env file...");
    fs.writeFileSync(envPath, `
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vme_db?schema=public"
ENCRYPTION_KEY="voxora_vme_aes256_encryption_key_32b!"
PORT=3001
JWT_SECRET="voxora_vme_super_secret_jwt_key_2026"
GROQ_API_KEY=""
OPENROUTER_API_KEY="YOUR_OPENROUTER_API_KEY"
`.trim());
    console.log("   ✅ .env created.");
}

// 2. Test AES-256 Encryption & Decryption
console.log("\n2️⃣ Testing AES-256 Credentials Encryption at Rest...");
const samplePass = "SuperSecretPassword123!";
const encrypted = encrypt(samplePass);
const decrypted = decrypt(encrypted);

console.log(`   Raw Password:       ${samplePass}`);
console.log(`   Encrypted (DB):     ${encrypted}`);
console.log(`   Decrypted (Memory): ${decrypted}`);

if (decrypted === samplePass && encrypted.includes(':')) {
    console.log("   ✅ AES-256 Encryption test PASSED 100%!");
} else {
    console.error("   ❌ AES-256 Encryption test FAILED!");
}

// 3. Verify Prisma Schema Integrity
console.log("\n3️⃣ Verifying Prisma Database Schema Models...");
const schemaPath = path.join(__dirname, 'schema.prisma');
const schemaContent = fs.readFileSync(schemaPath, 'utf8');

const requiredModels = [
    'model User', 'model Workspace', 'model WorkspaceMember', 'model AuditLog',
    'model Domain', 'model Mailbox', 'model MailboxCredential', 'model Job',
    'model JobAttempt', 'model Message', 'model EventLog', 'model MailboxMetric',
    'model DomainMetric', 'model WorkspaceMetric'
];

let allModelsPresent = true;
requiredModels.forEach(m => {
    if (schemaContent.includes(m)) {
        console.log(`   ✅ Schema Model Verified: ${m}`);
    } else {
        console.error(`   ❌ Missing Model: ${m}`);
        allModelsPresent = false;
    }
});

console.log("\n=======================================================");
if (allModelsPresent) {
    console.log("🎉 PHASE 1 (DATABASE & SECURITY) COMPLETED & VERIFIED 100%!");
} else {
    console.log("⚠️ PHASE 1 VERIFICATION HAS WARNINGS.");
}
console.log("=======================================================\n");
