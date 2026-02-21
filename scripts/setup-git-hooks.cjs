#!/usr/bin/env node

// =====================================================
// CONFIGURAÇÃO DE GIT HOOKS - SBCE CRM
// =====================================================

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

function setupGitHooks() {
  try {
    log(`${colors.bold}${colors.cyan}🔧 CONFIGURANDO GIT HOOKS${colors.reset}`);
    log(`${colors.cyan}================================${colors.reset}\n`);

    // Verificar se estamos em um repositório Git
    try {
      execSync('git rev-parse --git-dir', { stdio: 'pipe' });
    } catch (error) {
      logError('Este diretório não é um repositório Git!');
      logError('Execute "git init" primeiro.');
      return false;
    }

    // Criar diretório .git/hooks se não existir
    const gitHooksDir = path.join(process.cwd(), '.git', 'hooks');
    if (!fs.existsSync(gitHooksDir)) {
      fs.mkdirSync(gitHooksDir, { recursive: true });
      logInfo('Criado diretório .git/hooks');
    }

    // Configurar pre-commit hook
    const preCommitHook = path.join(gitHooksDir, 'pre-commit');
    const preCommitScript = path.join(__dirname, 'pre-commit.cjs');
    
    const preCommitContent = `#!/bin/sh
# Pre-commit hook - SBCE CRM
node "${preCommitScript}"
`;

    fs.writeFileSync(preCommitHook, preCommitContent);
    
    // Tornar o hook executável (Unix/Linux/Mac)
    try {
      execSync(`chmod +x "${preCommitHook}"`, { stdio: 'pipe' });
    } catch (error) {
      // Ignorar erro no Windows
    }

    logSuccess('Pre-commit hook configurado com sucesso!');

    // Configurar commit-msg hook (opcional)
    const commitMsgHook = path.join(gitHooksDir, 'commit-msg');
    const commitMsgContent = `#!/bin/sh
# Commit-msg hook - SBCE CRM
# Valida formato da mensagem de commit

commit_regex='^(feat|fix|docs|style|refactor|test|chore|security)(\\(.+\\))?: .{1,50}'

if ! grep -qE "$commit_regex" "$1"; then
    echo "❌ Formato de commit inválido!"
    echo "✅ Use: tipo(escopo): descrição"
    echo "📝 Exemplos:"
    echo "   feat: adicionar autenticação"
    echo "   fix(auth): corrigir login"
    echo "   security: atualizar dependências"
    exit 1
fi
`;

    fs.writeFileSync(commitMsgHook, commitMsgContent);
    
    try {
      execSync(`chmod +x "${commitMsgHook}"`, { stdio: 'pipe' });
    } catch (error) {
      // Ignorar erro no Windows
    }

    logSuccess('Commit-msg hook configurado com sucesso!');

    // Criar script de teste
    const testScript = path.join(__dirname, 'test-security.cjs');
    const testContent = `#!/usr/bin/env node

// =====================================================
// TESTE DO PROTOCOLO DE SEGURANÇA
// =====================================================

const SecurityChecker = require('./security-check.js');

async function testSecurity() {
  console.log('🧪 Testando protocolo de segurança...\\n');
  
  const checker = new SecurityChecker();
  const result = await checker.run();
  
  if (result) {
    console.log('\\n✅ Teste passou! Protocolo funcionando corretamente.');
  } else {
    console.log('\\n❌ Teste falhou! Verifique a configuração.');
  }
  
  return result;
}

if (require.main === module) {
  testSecurity().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { testSecurity };
`;

    fs.writeFileSync(testScript, testContent);
    
    try {
      execSync(`chmod +x "${testScript}"`, { stdio: 'pipe' });
    } catch (error) {
      // Ignorar erro no Windows
    }

    logSuccess('Script de teste criado!');

    log(`\\n${colors.bold}${colors.green}🎉 CONFIGURAÇÃO CONCLUÍDA!${colors.reset}`);
    log(`${colors.green}================================${colors.reset}`);
    log('✅ Pre-commit hook: Verificação de segurança');
    log('✅ Commit-msg hook: Validação de formato');
    log('✅ Script de teste: test-security.js');
    
    log(`\\n${colors.bold}${colors.cyan}📋 COMO USAR:${colors.reset}`);
    log('• git add . && git commit -m "feat: adicionar funcionalidade"');
    log('• node scripts/test-security.js (para testar)');
    log('• node scripts/security-check.js (verificação manual)');
    
    return true;

  } catch (error) {
    logError(`Erro na configuração: ${error.message}`);
    return false;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const success = setupGitHooks();
  process.exit(success ? 0 : 1);
}

module.exports = { setupGitHooks };
