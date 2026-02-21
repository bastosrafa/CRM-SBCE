# 🔒 PROTOCOLO DE SEGURANÇA PARA ALTERAÇÕES - CRM SBCE

## ⚠️ REGRAS OBRIGATÓRIAS - NUNCA QUEBRAR AUTENTICAÇÃO

### 🎯 PRINCÍPIO FUNDAMENTAL
**AUTENTICAÇÃO E INSTÂNCIAS SÃO SAGRADAS - NUNCA QUEBRAR**

---

## 📋 CHECKLIST OBRIGATÓRIO ANTES DE QUALQUER MUDANÇA

### 1. ANÁLISE PRÉVIA OBRIGATÓRIA
- [ ] Mapear TODAS as dependências entre contextos
- [ ] Identificar pontos de falha na cadeia: AuthContext → InstanceContext → useInstanceData
- [ ] Verificar useEffects que podem causar loops infinitos
- [ ] Analisar se mudança pode quebrar autenticação
- [ ] Verificar se mudança pode quebrar carregamento de instâncias

### 2. PROTOCOLO DE SEGURANÇA
- [ ] Mudança será mínima e cirúrgica?
- [ ] Rollback está disponível?
- [ ] Não altera múltiplos contextos simultaneamente?
- [ ] Não remove timeouts sem entender impacto completo?
- [ ] Não altera fallbacks sem verificar dependências?

### 3. IMPLEMENTAÇÃO SEGURA
- [ ] Alterar apenas 1 arquivo por vez
- [ ] Manter logs para debug
- [ ] Testar autenticação após mudança
- [ ] Verificar persistência de sessão
- [ ] Confirmar que não há loops infinitos

---

## 🚫 PROIBIÇÕES ABSOLUTAS

### NUNCA FAZER:
- ❌ Alterar múltiplos contextos simultaneamente
- ❌ Remover timeouts sem análise completa de dependências
- ❌ Alterar fallbacks sem verificar impacto
- ❌ Fazer mudanças "rápidas" sem análise prévia
- ❌ Assumir que "pequena mudança" é segura
- ❌ Tentar "corrigir" uma correção que causou loop

### SEMPRE FAZER:
- ✅ Análise completa antes de qualquer mudança
- ✅ Mudanças mínimas e cirúrgicas
- ✅ Manter rollback disponível
- ✅ Testar em ambiente isolado primeiro
- ✅ Verificar se não quebra autenticação

---

## 🎯 HIERARQUIA DE PRIORIDADES

1. **MANTER AUTENTICAÇÃO FUNCIONANDO** (nunca quebrar)
2. **MANTER INSTÂNCIAS FUNCIONANDO** (nunca quebrar)  
3. **MANTER DADOS CARREGANDO** (nunca quebrar)
4. Implementar nova funcionalidade
5. Otimizar código existente

---

## 🚨 PROTOCOLO DE EMERGÊNCIA

### Se qualquer mudança causar loop infinito:
1. **IMEDIATAMENTE** reverter para commit anterior
2. **NÃO** tentar "corrigir" a correção
3. Fazer hard reset e recomeçar análise
4. Aplicar abordagem mais conservadora

### Comandos de emergência:
```bash
git reset --hard [commit-anterior]
git restore [arquivo-problemático]
```

---

## 📝 LINGUAGEM DE COMUNICAÇÃO

### ✅ FRASES CORRETAS:
- "Vou analisar as dependências antes de fazer qualquer mudança"
- "Esta mudança pode afetar a autenticação, vou ser conservador"
- "Vou fazer uma mudança mínima e testar primeiro"
- "Vou verificar o fluxo AuthContext → InstanceContext → useInstanceData"

### ❌ FRASES PROIBIDAS:
- "Vou fazer uma correção rápida"
- "É só uma pequena mudança, não vai quebrar nada"
- "Vou otimizar isso rapidamente"
- "Vou resolver isso rapidinho"

---

## 🔍 ANÁLISE DE ARQUITETURA CRÍTICA

### Fluxo de Dependências:
```
AuthContext (loadProfile) 
    ↓ falha/timeout
    ↓ cria perfil genérico
    ↓
InstanceContext (onAuthStateChange)
    ↓ não encontra instâncias para usuário genérico
    ↓ currentInstance = null
    ↓
useInstanceData (useEffects)
    ↓ fetchLeads() chamado repetidamente
    ↓ aguarda currentInstance
    ↓ LOOP INFINITO
```

### Pontos de Falha Críticos:
- Timeout no `loadProfile` do AuthContext
- Fallback genérico sem associações de instância
- useEffects em `useInstanceData.ts` que reagem a mudanças
- Dependência entre `currentInstance` e `permissions`

---

## 📚 HISTÓRICO DE PROBLEMAS

### Problema 1: Loop Infinito (2x)
**Causa**: Alterações no AuthContext quebraram cadeia de dependências
**Solução**: Hard reset + análise mais conservadora
**Lição**: Nunca alterar timeouts/fallbacks sem análise completa

### Problema 2: Perfil Genérico
**Causa**: Timeout criava `usuario@exemplo.com` sem instâncias
**Solução**: Manter timeout mas melhorar fallback
**Lição**: Fallbacks devem usar dados reais do usuário

---

## ✅ CONFIRMAÇÃO DE PROTOCOLO

**Este protocolo deve ser seguido em TODAS as alterações futuras, sem exceção.**

**Data de criação**: 2024-12-19
**Status**: ATIVO
**Aplicação**: TODAS as mudanças no projeto CRM SBCE

---

*"A autenticação é sagrada. Nunca quebre o que está funcionando."*
