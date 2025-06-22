const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configurações do Supabase
const SUPABASE_URL = "https://fahkxnaolxvylqxmkqed.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // Você precisa configurar esta variável

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Erro: SUPABASE_SERVICE_KEY não configurada');
  console.log('📝 Para configurar:');
  console.log('1. Vá para https://supabase.com/dashboard');
  console.log('2. Selecione seu projeto');
  console.log('3. Vá para Settings > API');
  console.log('4. Copie a "service_role" key');
  console.log('5. Configure a variável de ambiente:');
  console.log('   export SUPABASE_SERVICE_KEY="sua-chave-aqui"');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setupDatabase() {
  try {
    console.log('🚀 Iniciando configuração do banco de dados...');
    
    // Ler o arquivo de migração
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '001_create_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Aplicando migração...');
    
    // Executar a migração
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Erro ao aplicar migração:', error);
      return;
    }
    
    console.log('✅ Migração aplicada com sucesso!');
    console.log('🎉 Banco de dados configurado!');
    console.log('');
    console.log('📋 Próximos passos:');
    console.log('1. Teste a sincronização no aplicativo');
    console.log('2. Verifique se as tabelas foram criadas no Supabase Dashboard');
    console.log('3. Teste a sincronização entre navegadores diferentes');
    
  } catch (error) {
    console.error('❌ Erro durante a configuração:', error);
  }
}

setupDatabase(); 