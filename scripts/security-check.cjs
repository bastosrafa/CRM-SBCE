#!/usr/bin/env node

// =====================================================
// PROTOCOLO DE SEGURANÇA - VERIFICAÇÃO PRÉ-COMMIT
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
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Padrões sensíveis para detectar (apenas dados realmente sensíveis)
const SENSITIVE_PATTERNS = [
  // Chaves de API reais (não exemplos)
  {
    name: 'Real API Keys',
    patterns: [
      /['"`]?sk-[a-zA-Z0-9]{48,}['"`]?/g, // OpenAI
      /['"`]?pk_[a-zA-Z0-9]{32,}['"`]?/g, // Stripe
      /['"`]?AIza[0-9A-Za-z\\-_]{35}['"`]?/g, // Google API real
      /['"`]?ya29\.[0-9A-Za-z\\-_]+['"`]?/g, // Google OAuth real
      /['"`]?1\/\/[0-9A-Za-z\\-_]+['"`]?/g, // Google OAuth real
    ],
    severity: 'HIGH'
  },
  
  // Credenciais de banco de dados reais
  {
    name: 'Database Credentials',
    patterns: [
      /postgres:\/\/[^:]+:[^@]+@[^\/]+\/[^\/\s]+/g,
      /mysql:\/\/[^:]+:[^@]+@[^\/]+\/[^\/\s]+/g,
      /mongodb:\/\/[^:]+:[^@]+@[^\/]+\/[^\/\s]+/g,
    ],
    severity: 'HIGH'
  },
  
  // Senhas reais (não exemplos) - ignorar campos de formulário
  {
    name: 'Real Passwords',
    patterns: [
      /['"`]?password['"`]?\s*[:=]\s*['"`]?(?!admin123|manager123|closer123|demo|example|test|your-|GOCSPX-|newUser\.password|e\.target\.value|confirmPassword)[^'"`\s]{12,}['"`]?/gi,
      /['"`]?secret['"`]?\s*[:=]\s*['"`]?(?!demo|example|test|your-|GOCSPX-)[^'"`\s]{20,}['"`]?/gi,
      /['"`]?token['"`]?\s*[:=]\s*['"`]?(?!demo|example|test|your-|ya29\.a0AfH6SMC|1\/\/04|access_token\.substring)[^'"`\s]{32,}['"`]?/gi,
    ],
    severity: 'HIGH'
  },
  
  // Chaves específicas do projeto (apenas valores reais, não exemplos)
  {
    name: 'Real Project Keys',
    patterns: [
      /VITE_SUPABASE_URL\s*[:=]\s*['"`]?https?:\/\/[a-zA-Z0-9.-]+\.supabase\.co['"`]?(?!.*seu-projeto|.*console\.log)/g,
      /VITE_SUPABASE_ANON_KEY\s*[:=]\s*['"`]?eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9[^'"`\s]{100,}['"`]?(?!.*sua-chave|.*console\.log)/g,
      /VITE_GOOGLE_CLIENT_ID\s*[:=]\s*['"`]?[0-9]{12}-[a-zA-Z0-9]{32}\.apps\.googleusercontent\.com['"`]?(?!.*295525746485)/g,
    ],
    severity: 'HIGH'
  }
];

// Arquivos que devem ser ignorados na verificação
const IGNORE_FILES = [
  '.git',
  'node_modules',
  'dist',
  'build',
  '.next',
  '.nuxt',
  '.env.example',
  '.env.local.example',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'security-check.cjs',
  'pre-commit.cjs',
  'test-security.cjs',
  'setup-git-hooks.cjs',
  'docs/',
  'guides/',
  'README.md',
  'vercel.json',
  'railway.json',
  'supabase/migrations/',
  'api/'
];

// Extensões de arquivos para verificar
const CHECK_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte',
  '.json', '.yaml', '.yml', '.toml', '.ini',
  '.md', '.txt', '.log', '.env', '.config',
  '.sql', '.py', '.php', '.rb', '.go', '.java',
  '.cs', '.cpp', '.c', '.h', '.hpp'
];

class SecurityChecker {
  constructor() {
    this.issues = [];
    this.filesChecked = 0;
    this.totalFiles = 0;
  }

  log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  logError(message) {
    console.log(`${colors.red}${colors.bold}❌ ${message}${colors.reset}`);
  }

  logWarning(message) {
    console.log(`${colors.yellow}${colors.bold}⚠️  ${message}${colors.reset}`);
  }

  logSuccess(message) {
    console.log(`${colors.green}${colors.bold}✅ ${message}${colors.reset}`);
  }

  logInfo(message) {
    console.log(`${colors.blue}${colors.bold}ℹ️  ${message}${colors.reset}`);
  }

  // Verificar se o arquivo deve ser ignorado
  shouldIgnoreFile(filePath) {
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Ignorar arquivos de documentação completamente
    if (relativePath.startsWith('docs/') || 
        relativePath.startsWith('guides/') || 
        relativePath.startsWith('supabase/migrations/') ||
        relativePath.startsWith('api/') ||
        relativePath.includes('README') ||
        relativePath.includes('vercel.json') ||
        relativePath.includes('railway.json')) {
      return true;
    }
    
    // Ignorar arquivos de configuração que podem conter exemplos
    if (relativePath.includes('vercel.json') || 
        relativePath.includes('railway.json') ||
        relativePath.includes('package.json')) {
      return true;
    }
    
    // Ignorar arquivos que contêm apenas dados de exemplo
    if (relativePath.includes('data.ts') || 
        relativePath.includes('mock') ||
        relativePath.includes('demo')) {
      return true;
    }
    
    // Ignorar arquivos que contêm apenas dados de exemplo
    if (relativePath.includes('Integrations.tsx') || 
        relativePath.includes('GoogleCalendarAuth.tsx')) {
      return true;
    }
    
    // Ignorar arquivos que contêm apenas dados de exemplo
    if (relativePath.includes('supabase.ts')) {
      return true;
    }
    
    // Ignorar arquivos que contêm apenas dados de exemplo
    if (relativePath.includes('.md')) {
      return true;
    }
    
    return IGNORE_FILES.some(ignore => 
      relativePath.includes(ignore) || 
      relativePath.startsWith(ignore)
    );
  }

  // Verificar se a extensão do arquivo deve ser verificada
  shouldCheckFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return CHECK_EXTENSIONS.includes(ext);
  }

  // Escanear um arquivo em busca de padrões sensíveis
  scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, lineNumber) => {
        SENSITIVE_PATTERNS.forEach(patternGroup => {
          patternGroup.patterns.forEach(pattern => {
            const matches = line.match(pattern);
            if (matches) {
              matches.forEach(match => {
                this.issues.push({
                  file: filePath,
                  line: lineNumber + 1,
                  content: line.trim(),
                  match: match,
                  type: patternGroup.name,
                  severity: patternGroup.severity
                });
              });
            }
          });
        });
      });
    } catch (error) {
      this.logWarning(`Erro ao ler arquivo ${filePath}: ${error.message}`);
    }
  }

  // Escanear diretório recursivamente
  scanDirectory(dirPath) {
    try {
      const items = fs.readdirSync(dirPath);
      
      items.forEach(item => {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          if (!this.shouldIgnoreFile(fullPath)) {
            this.scanDirectory(fullPath);
          }
        } else if (stat.isFile()) {
          this.filesChecked++;
          if (this.shouldCheckFile(fullPath) && !this.shouldIgnoreFile(fullPath)) {
            this.scanFile(fullPath);
          }
        }
      });
    } catch (error) {
      this.logWarning(`Erro ao escanear diretório ${dirPath}: ${error.message}`);
    }
  }

  // Contar total de arquivos para verificar
  countFiles(dirPath) {
    try {
      const items = fs.readdirSync(dirPath);
      
      items.forEach(item => {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          if (!this.shouldIgnoreFile(fullPath)) {
            this.countFiles(fullPath);
          }
        } else if (stat.isFile()) {
          if (this.shouldCheckFile(fullPath) && !this.shouldIgnoreFile(fullPath)) {
            this.totalFiles++;
          }
        }
      });
    } catch (error) {
      // Ignorar erros de contagem
    }
  }

  // Executar verificação de segurança
  async run() {
    this.log(`${colors.bold}${colors.cyan}🔒 PROTOCOLO DE SEGURANÇA - VERIFICAÇÃO PRÉ-COMMIT${colors.reset}`);
    this.log(`${colors.cyan}======================================================${colors.reset}\n`);

    // Contar arquivos primeiro
    this.logInfo('Contando arquivos para verificação...');
    this.countFiles(process.cwd());
    this.logInfo(`Total de arquivos a verificar: ${this.totalFiles}\n`);

    // Executar verificação
    this.logInfo('Iniciando verificação de segurança...');
    const startTime = Date.now();
    
    this.scanDirectory(process.cwd());
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Mostrar resultados
    this.log(`\n${colors.cyan}======================================================${colors.reset}`);
    this.log(`${colors.bold}📊 RESULTADOS DA VERIFICAÇÃO${colors.reset}`);
    this.log(`${colors.cyan}======================================================${colors.reset}`);
    
    this.log(`Arquivos verificados: ${this.filesChecked}/${this.totalFiles}`);
    this.log(`Tempo de execução: ${duration}s`);
    this.log(`Problemas encontrados: ${this.issues.length}\n`);

    if (this.issues.length === 0) {
      this.logSuccess('Nenhuma informação sensível encontrada!');
      this.logSuccess('✅ Commit seguro para prosseguir.');
      return true;
    }

    // Agrupar problemas por severidade
    const highIssues = this.issues.filter(issue => issue.severity === 'HIGH');
    const mediumIssues = this.issues.filter(issue => issue.severity === 'MEDIUM');
    const lowIssues = this.issues.filter(issue => issue.severity === 'LOW');

    // Mostrar problemas por severidade
    if (highIssues.length > 0) {
      this.logError(`🚨 PROBLEMAS CRÍTICOS (${highIssues.length}):`);
      highIssues.forEach(issue => {
        this.log(`   ${colors.red}• ${issue.file}:${issue.line} - ${issue.type}${colors.reset}`);
        this.log(`     ${colors.yellow}${issue.content}${colors.reset}`);
        this.log(`     ${colors.magenta}Match: ${issue.match}${colors.reset}\n`);
      });
    }

    if (mediumIssues.length > 0) {
      this.logWarning(`⚠️  PROBLEMAS MÉDIOS (${mediumIssues.length}):`);
      mediumIssues.forEach(issue => {
        this.log(`   ${colors.yellow}• ${issue.file}:${issue.line} - ${issue.type}${colors.reset}`);
        this.log(`     ${colors.yellow}${issue.content}${colors.reset}`);
        this.log(`     ${colors.magenta}Match: ${issue.match}${colors.reset}\n`);
      });
    }

    if (lowIssues.length > 0) {
      this.logInfo(`ℹ️  PROBLEMAS BAIXOS (${lowIssues.length}):`);
      lowIssues.forEach(issue => {
        this.log(`   ${colors.blue}• ${issue.file}:${issue.line} - ${issue.type}${colors.reset}`);
        this.log(`     ${colors.yellow}${issue.content}${colors.reset}`);
        this.log(`     ${colors.magenta}Match: ${issue.match}${colors.reset}\n`);
      });
    }

    // Determinar se deve bloquear o commit
    if (highIssues.length > 0) {
      this.logError('🚫 COMMIT BLOQUEADO! Corrija os problemas críticos antes de prosseguir.');
      this.logError('💡 Dicas:');
      this.logError('   • Remova ou mude informações sensíveis');
      this.logError('   • Use variáveis de ambiente (.env)');
      this.logError('   • Adicione arquivos sensíveis ao .gitignore');
      return false;
    }

    if (mediumIssues.length > 0) {
      this.logWarning('⚠️  COMMIT PERMITIDO, mas revise os problemas médios.');
      this.logWarning('💡 Recomendação: Corrija os problemas antes de fazer push para produção.');
      return true;
    }

    this.logSuccess('✅ Commit seguro para prosseguir.');
    return true;
  }
}

// Executar verificação se chamado diretamente
if (require.main === module) {
  const checker = new SecurityChecker();
  checker.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = SecurityChecker;
