# 🚨 QUICK REFERENCE - PROTOCOLO DE SEGURANÇA

## ⚠️ ANTES DE QUALQUER MUDANÇA:

1. **ANALISAR** dependências entre contextos
2. **VERIFICAR** se pode quebrar autenticação
3. **FAZER** mudança mínima e cirúrgica
4. **TESTAR** se autenticação persiste

## 🚫 NUNCA:
- Alterar múltiplos contextos
- Remover timeouts sem análise
- Fazer mudanças "rápidas"
- Assumir que é "seguro"

## ✅ SEMPRE:
- Análise prévia completa
- Mudança em 1 arquivo só
- Rollback disponível
- Teste de autenticação

## 🚨 EMERGÊNCIA:
```bash
git reset --hard [commit-anterior]
```

**AUTENTICAÇÃO É SAGRADA - NUNCA QUEBRAR**
