#!/usr/bin/env node

// =====================================================
// HOOK PRE-COMMIT - EXECUTAR VERIFICAÇÃO DE SEGURANÇA
// =====================================================

const { execSync } = require('child_process');
const path = require('path');

// Cores para output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  console.log(`${colors.red}${colors.bold}❌ ${message}${colors.reset}`);
}

function logSuccess(message) {
  console.log(`${colors.green}${colors.bold}✅ ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.blue}${colors.bold}ℹ️  ${message}${colors.reset}`);
}

async function runSecurityCheck() {
  try {
    log(`${colors.bold}${colors.cyan}🔒 EXECUTANDO VERIFICAÇÃO DE SEGURANÇA...${colors.reset}`);
    
    // Executar verificação de segurança
    const securityScript = path.join(__dirname, 'security-check.cjs');
    execSync(`node "${securityScript}"`, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    logSuccess('Verificação de segurança concluída com sucesso!');
    return true;
    
  } catch (error) {
    logError('Falha na verificação de segurança!');
    logError(`Erro: ${error.message}`);
    return false;
  }
}

async function main() {
  log(`${colors.bold}${colors.cyan}🚀 HOOK PRE-COMMIT - SBCE CRM${colors.reset}`);
  log(`${colors.cyan}========================================${colors.reset}\n`);
  
  // Executar verificação de segurança
  const securityPassed = await runSecurityCheck();
  
  if (!securityPassed) {
    logError('\n🚫 COMMIT CANCELADO!');
    logError('Corrija os problemas de segurança antes de prosseguir.');
    process.exit(1);
  }
  
  logSuccess('\n✅ COMMIT APROVADO!');
  logSuccess('Todas as verificações de segurança passaram.');
  process.exit(0);
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(error => {
    logError(`Erro inesperado: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runSecurityCheck };
