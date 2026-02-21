#!/usr/bin/env node

// =====================================================
// TESTE DO PROTOCOLO DE SEGURANÇA
// =====================================================

const SecurityChecker = require('./security-check.js');

async function testSecurity() {
  console.log('🧪 Testando protocolo de segurança...\n');
  
  const checker = new SecurityChecker();
  const result = await checker.run();
  
  if (result) {
    console.log('\n✅ Teste passou! Protocolo funcionando corretamente.');
  } else {
    console.log('\n❌ Teste falhou! Verifique a configuração.');
  }
  
  return result;
}

if (require.main === module) {
  testSecurity().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { testSecurity };
