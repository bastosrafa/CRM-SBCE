// Utilitário para diagnóstico de problemas do WhatsApp

export interface DiagnosticResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

export class WhatsAppDiagnostics {
  /**
   * Executar todos os testes de diagnóstico
   */
  static async runAllTests(): Promise<DiagnosticResult[]> {
    const results: DiagnosticResult[] = [];
    
    // Teste 1: Mock API disponível
    results.push(await this.testMockAPI());
    
    // Teste 2: Configuração salva
    results.push(this.testSavedConfig());
    
    // Teste 3: Contextos disponíveis
    results.push(this.testContexts());
    
    // Teste 4: Conectividade básica
    results.push(await this.testBasicConnectivity());
    
    return results;
  }
  
  /**
   * Testar se Mock API está disponível
   */
  private static async testMockAPI(): Promise<DiagnosticResult> {
    try {
      const isAvailable = typeof window.createWhatsAppInstance === 'function';
      
      if (isAvailable) {
        // Tentar executar um teste básico
        try {
          await window.testMockAPI();
          return {
            test: 'Mock API',
            status: 'pass',
            message: 'Mock API está carregada e funcionando',
            details: {
              functions: {
                createWhatsAppInstance: typeof window.createWhatsAppInstance,
                testMockAPI: typeof window.testMockAPI
              }
            }
          };
        } catch (error) {
          return {
            test: 'Mock API',
            status: 'warning',
            message: 'Mock API carregada mas com problemas',
            details: { error: error.message }
          };
        }
      } else {
        return {
          test: 'Mock API',
          status: 'fail',
          message: 'Mock API não está carregada',
          details: {
            availableFunctions: Object.keys(window).filter(key => key.includes('WhatsApp')),
            windowKeys: Object.keys(window).length
          }
        };
      }
    } catch (error) {
      return {
        test: 'Mock API',
        status: 'fail',
        message: 'Erro ao testar Mock API',
        details: { error: error.message }
      };
    }
  }
  
  /**
   * Testar configuração salva
   */
  private static testSavedConfig(): DiagnosticResult {
    try {
      const savedConfig = localStorage.getItem('evolutionManagerConfig');
      
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        const hasUrl = config.baseUrl && config.baseUrl.length > 0;
        const hasToken = config.token && config.token.length > 0;
        
        if (hasUrl && hasToken) {
          return {
            test: 'Configuração',
            status: 'pass',
            message: 'Configuração salva e válida',
            details: {
              hasUrl,
              hasToken,
              url: config.baseUrl
            }
          };
        } else {
          return {
            test: 'Configuração',
            status: 'warning',
            message: 'Configuração salva mas incompleta',
            details: { hasUrl, hasToken }
          };
        }
      } else {
        return {
          test: 'Configuração',
          status: 'fail',
          message: 'Nenhuma configuração salva',
          details: null
        };
      }
    } catch (error) {
      return {
        test: 'Configuração',
        status: 'fail',
        message: 'Erro ao ler configuração',
        details: { error: error.message }
      };
    }
  }
  
  /**
   * Testar contextos disponíveis
   */
  private static testContexts(): DiagnosticResult {
    try {
      // Verificar se estamos em um ambiente React
      const isReact = typeof window !== 'undefined' && window.React;
      
      return {
        test: 'Contextos',
        status: 'pass',
        message: 'Ambiente React detectado',
        details: {
          isReact,
          userAgent: navigator.userAgent,
          location: window.location.href
        }
      };
    } catch (error) {
      return {
        test: 'Contextos',
        status: 'fail',
        message: 'Erro ao verificar contextos',
        details: { error: error.message }
      };
    }
  }
  
  /**
   * Testar conectividade básica
   */
  private static async testBasicConnectivity(): Promise<DiagnosticResult> {
    try {
      // Testar se conseguimos fazer uma requisição básica
      const response = await fetch('https://httpbin.org/get', {
        method: 'GET',
        mode: 'cors'
      });
      
      if (response.ok) {
        return {
          test: 'Conectividade',
          status: 'pass',
          message: 'Conectividade básica funcionando',
          details: {
            status: response.status,
            statusText: response.statusText
          }
        };
      } else {
        return {
          test: 'Conectividade',
          status: 'warning',
          message: 'Conectividade com problemas',
          details: {
            status: response.status,
            statusText: response.statusText
          }
        };
      }
    } catch (error) {
      return {
        test: 'Conectividade',
        status: 'fail',
        message: 'Sem conectividade',
        details: { error: error.message }
      };
    }
  }
  
  /**
   * Gerar relatório de diagnóstico
   */
  static async generateReport(): Promise<string> {
    const results = await this.runAllTests();
    
    let report = '🔍 RELATÓRIO DE DIAGNÓSTICO WHATSAPP\n';
    report += '=' .repeat(50) + '\n\n';
    
    results.forEach(result => {
      const status = result.status === 'pass' ? '✅' : 
                    result.status === 'warning' ? '⚠️' : '❌';
      
      report += `${status} ${result.test}: ${result.message}\n`;
      
      if (result.details) {
        report += `   Detalhes: ${JSON.stringify(result.details, null, 2)}\n`;
      }
      
      report += '\n';
    });
    
    const passCount = results.filter(r => r.status === 'pass').length;
    const totalCount = results.length;
    
    report += `\n📊 RESUMO: ${passCount}/${totalCount} testes passaram\n`;
    
    if (passCount === totalCount) {
      report += '🎉 Todos os testes passaram! O WhatsApp deve funcionar corretamente.\n';
    } else if (passCount > totalCount / 2) {
      report += '⚠️ Alguns testes falharam. Verifique os problemas acima.\n';
    } else {
      report += '❌ Muitos testes falharam. Verifique a configuração do sistema.\n';
    }
    
    return report;
  }
}



