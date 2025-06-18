#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🚀 Marketing Dashboard - Setup Script\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Criando arquivo .env.local...');
  
  if (fs.existsSync(envExamplePath)) {
    // Copy from example
    let envContent = fs.readFileSync(envExamplePath, 'utf8');
    
    // Generate encryption key
    const encryptionKey = crypto.randomBytes(16).toString('hex');
    envContent = envContent.replace('sua_chave_de_32_caracteres_aqui_', encryptionKey);
    
    // Generate cron secret
    const cronSecret = crypto.randomBytes(32).toString('base64');
    envContent = envContent.replace('sua_chave_secreta_cron_aqui', cronSecret);
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Arquivo .env.local criado com sucesso!');
    console.log('⚠️  Não esqueça de adicionar suas credenciais do Supabase!\n');
  } else {
    console.error('❌ Arquivo .env.example não encontrado!');
    process.exit(1);
  }
} else {
  console.log('✅ Arquivo .env.local já existe\n');
}

// Check Node version
const nodeVersion = process.versions.node;
const majorVersion = parseInt(nodeVersion.split('.')[0]);

if (majorVersion < 18) {
  console.error(`❌ Node.js ${nodeVersion} detectado. É necessário Node.js 18 ou superior.`);
  process.exit(1);
} else {
  console.log(`✅ Node.js ${nodeVersion} detectado\n`);
}

// Display next steps
console.log('📋 Próximos passos:\n');
console.log('1. Configure suas credenciais do Supabase no arquivo .env.local');
console.log('2. Execute as migrations no Supabase:');
console.log('   - Vá para o SQL Editor no dashboard do Supabase');
console.log('   - Execute o conteúdo de /supabase/migrations/001_initial_schema.sql');
console.log('   - Execute o conteúdo de /supabase/migrations/002_add_company_is_active.sql');
console.log('3. Instale as dependências: npm install');
console.log('4. Inicie o servidor de desenvolvimento: npm run dev\n');

console.log('🎉 Setup concluído!');