# Leitura do Projeto CRM SBCE + Checklist para Retomada

Documento gerado para situar a IA e o time no projeto e listar o que falta para retomar o desenvolvimento.

---

## 1. Regras e contexto (o que o projeto define)

### 1.1 CLAUDE.md (e claude.md)

- **Persona:** AIOS MASTER – orquestrador da SBCE Premium Software House.
- **Ecossistema:** 3 camadas – MacBook M5 (Poder), VPS Hostinger (Fábrica), Docker (Segurança).
- **Hierarquia de agentes:** ARCHITECT → DATA-ENG → PM/PO → DEV/UX → QA QUEEN.
- **Stack de desenvolvimento:** Next.js 15, Tailwind, ShadcnUI (referência nos docs; o código atual é **Vite + React + Tailwind**).
- **Segurança:** Deny list (`~/.ssh`, `~/Documents/Pessoal`, `~/Desktop/Financas_SBCE`, `.env`). Git `commit`/`push` permitidos. Preferir Docker/VPS.
- **Data Lake:** Novas features devem prever consistência para o Data Lake central; usar GitHub MCP entre CRM, FinOps e LMS.
- **Formato de resposta:** Problema → Arquitetura → Ação → Validação.

### 1.2 AGENTS.md (Synkra AIOS / Codex CLI)

- **Core:** Seguir `.aios-core/constitution.md`, CLI First → Observability → UI, trabalhar por stories em `docs/stories/`, não inventar requisitos fora dos artefatos.
- **Quality Gates:** `npm run lint`, `npm run typecheck`, `npm test`; atualizar checklist e file list da story.
- **Mapa:** Core em `.aios-core/`, CLI em `bin/`, pacotes em `packages/`, testes em `tests/`, docs em `docs/`.
- **Comandos:** `sync:ide`, `sync:ide:check`, `sync:skills:codex`, `validate:structure`, `validate:agents`.
- **Atalhos de agentes:** @architect, @dev, @qa, @pm, @po, @sm, @analyst, @devops, @data-engineer, @ux-design-expert, @squad-creator, @aios-master (arquivos em `.aios-core/development/agents/` ou `.codex/agents/`).

### 1.3 PLAYBOOK_MESTRE.md

- **Três camadas:** M5 (cérebro), VPS (fábrica 24/7, OpenClaw, Telegram), Docker (isolamento).
- **Setup:** UFW, Docker e OpenClaw na VPS; AntiGravity no Mac (Always Proceed, Browser Tools, Auto-Fix Lints); Cursor com Codebase Indexing High e GitHub MCP.
- **Deny list:** ~/.ssh, ~/Documents/Pessoal, ~/Desktop/Financas_SBCE, .env; **não** bloquear git commit/push.
- **Synkra AIOS:** `npx aios-core init` (greenfield) ou `npx aios-core install` (brownfield); `update`, `doctor`, `doctor --fix`.
- **11 agentes:** aios-master, aios-orchestrator, analyst, pm, architect, ux-expert, sm, po, dev, qa, devops.
- **7 Epics:** Worktree Manager, Migration V2→V3, Spec Pipeline, Execution Engine, Recovery, QA Evolution, Memory Layer.
- **Fluxo:** Spec Pipeline (@pm *gather-requirements, @architect *assess-complexity, etc.) → Execution → QA → Deploy; Brownfield: @architect *brownfield-discovery.

### 1.4 COMECE-AQUI.md

- Ponto de partida: COMECE-AQUI → `docs/stories/` → `docs/stories/INSTRUCOES-COMPLETAS-SQUAD-AUTONOMA.md`.
- Squad: colar a “instrução única” no Cursor (ou Claude Code); stories são as listadas na instrução.
- Telegram: só com VPS + OpenClaw + bot configurado.

### 1.5 Regras Cursor e AntiGravity

- **Cursor:** Regras em `.cursor/rules` (layout, AIOS, agentes). Workspace pode marcar CLAUDE.md/AGENTS.md como “sempre aplicado”.
- **AntiGravity:** Review Policy e Terminal = “Always Proceed”; Agent Auto-Fix Lints; Enable Browser Tools (Always Proceed para QA).
- **Deny list:** Idem PLAYBOOK (não acessar ~/.ssh, Pessoal, Financas_SBCE, .env).

---

## 2. Estrutura atual do projeto

### 2.1 O que existe na raiz

| Item | Status |
|------|--------|
| CLAUDE.md, claude.md | Existem (conteúdo alinhado) |
| AGENTS.md | Existe |
| PLAYBOOK_MESTRE.md | Existe |
| COMECE-AQUI.md | Existe |
| README.md | Existe |
| package.json | Existe (Vite, React, TypeScript, Supabase, Express, Tailwind) |
| src/ | Existe (components, services, hooks, contexts, utils, lib, api) |
| docs/ | Existe (vários .md; **não** tem `docs/stories/`) |
| supabase/migrations/ | Existe |
| api/, scripts/, guides/, public/ | Existem |
| eslint.config.js, vite.config.ts, tailwind, postcss, tsconfig* | Existem |

### 2.2 O que NÃO existe (referenciado por AGENTS/Playbook/COMECE-AQUI)

| Item | Referência | Impacto |
|------|------------|---------|
| `.cursor/` | COMECE-AQUI, regras Cursor | Regras e layout do Cursor não aplicados no projeto |
| `.aios-core/` | AGENTS.md (constitution, agents, commands) | Atalhos @architect, @dev, etc. e Epics não funcionam |
| `.codex/` | AGENTS.md (skills, agents) | Fallback de agentes e skills do Codex |
| `.claude/` | Playbook (settings.json, hooks) | Config Claude Code e automação |
| `.antigravity/` | Playbook | Config AntiGravity no projeto |
| `docs/stories/` | COMECE-AQUI, AGENTS.md | Onde deveriam estar as stories e a instrução da squad |
| `docs/stories/INSTRUCOES-COMPLETAS-SQUAD-AUTONOMA.md` | COMECE-AQUI | Instrução única para colar no Cursor |
| `docs/SETUP-TRES-PROJETOS-M5.md` | COMECE-AQUI | Guia 3 projetos M5 |
| `backlog.md` | CLAUDE, PLAYBOOK | Backlog central (opcional se usar só docs/stories) |
| `bin/` | AGENTS.md | CLI entrypoints (opcional se não usar Codex/AIOS CLI) |
| `packages/` | AGENTS.md | Shared packages (opcional em monorepo) |
| `tests/` | AGENTS.md | Pasta de testes automatizados |

### 2.3 Stack real vs documentação

- **Docs (CLAUDE/Playbook):** Next.js 15, Tailwind, ShadcnUI.
- **Código atual:** Vite, React 18, TypeScript, Tailwind, Lucide React, Supabase, Express (API).
- **Conclusão:** O app é Vite+React; Next.js 15 e ShadcnUI são alvo de evolução ou documentação futura. Novas features podem seguir o alvo (Next 15 + Shadcn) ou manter Vite conforme decisão do time.

---

## 3. O que falta para retomar o desenvolvimento

### 3.1 Instalações e scripts no package.json

| Necessidade | Situação atual | Ação sugerida |
|-------------|----------------|---------------|
| **typecheck** | Não existe script | Adicionar `"typecheck": "tsc --noEmit"` |
| **test** | Não existe script | Adicionar (ex.: Vitest) e script `"test": "vitest"` |
| **Vitest** | Não instalado | `npm i -D vitest @testing-library/react @testing-library/jest-dom jsdom` (ou equivalente) |
| **Playwright** (QA E2E) | Não instalado | Opcional: `npm i -D @playwright/test` e script `"test:e2e"` |
| **ShadcnUI** | Não instalado (só Lucide) | Se quiser alinhar à doc: configurar shadcn/ui no projeto (Vite+React) |

### 3.2 Estrutura de pastas e arquivos para “modo squad”

| Item | Ação sugerida |
|------|----------------|
| **docs/stories/** | Criar pasta |
| **docs/stories/README.md** | Criar com explicação de como usar stories + instrução única |
| **docs/stories/INSTRUCOES-COMPLETAS-SQUAD-AUTONOMA.md** | Criar (ou copiar de outro repo SBCE) com o “Texto para colar” e lista de stories |
| **backlog.md** (opcional) | Criar na raiz se quiser backlog central além de docs/stories |

### 3.3 Regras Cursor (IDE)

| Item | Ação sugerida |
|------|----------------|
| **.cursor/rules/** | Criar e adicionar regras (ex.: layout global, AIOS, referência a CLAUDE.md/AGENTS.md) |
| Workspace | Garantir que CLAUDE.md e/ou AGENTS.md estejam marcados como “sempre aplicados” no Cursor |

### 3.4 AIOS / Codex (se for usar agentes e Epics)

| Item | Ação sugerida |
|------|----------------|
| **.aios-core/** | Rodar `npx aios-core install` na raiz (brownfield) para gerar constitution, agents, commands |
| **.codex/** | Criar/gerar se usar Codex CLI (skills, agents) |
| **bin/** | Só necessário se houver CLI customizado no repo |

### 3.5 Ambiente e segredos

| Item | Situação | Ação |
|------|----------|------|
| **.env** | Não versionado (certo) | Manter; usar `.env.example` com variáveis sem valores (README já descreve) |
| **.env.example** | Não encontrado no repo | Criar com lista de variáveis (VITE_SUPABASE_*, etc.) para quem for desenvolver |

### 3.6 Documentação faltante

| Arquivo | Ação |
|---------|------|
| **docs/SETUP-TRES-PROJETOS-M5.md** | Criar ou remover referência no COMECE-AQUI.md |

---

## 4. Resumo executivo

- **Regras e playbook:** CLAUDE.md, AGENTS.md, PLAYBOOK_MESTRE.md e COMECE-AQUI estão claros: persona AIOS, 3 camadas, hierarquia de agentes, segurança, Data Lake, formato de resposta.
- **Cursor/AntiGravity:** Regras e deny list estão descritas; **.cursor/rules** foi criado com regra AIOS; config do AntiGravity no projeto é opcional.
- **Multiagentes AIOS:** AGENTS.md e Playbook definem 11 agentes e 7 Epics; a estrutura que os suporta (`.aios-core/`, `.codex/`) **não está instalada** no CRM; retomar com “modo squad” exige pelo menos `docs/stories/` + instrução única, e opcionalmente `npx aios-core install`.
- **O que faltava e foi feito na retomada:**
  1. ✅ Scripts **typecheck** e **test** + Vitest (e teste smoke em `src/utils/data.spec.ts`).
  2. ✅ Pasta **docs/stories/** com **INSTRUCOES-COMPLETAS-SQUAD-AUTONOMA.md** e README.
  3. ✅ **.cursor/rules** (regra `aios-workspace.mdc`) para o Cursor.
  4. ✅ **.env.example** com variáveis do projeto.
- **Concluído:** **npx aios-core install** foi executado (`.aios-core/` com constitution, agents, tasks); **docs/SETUP-TRES-PROJETOS-M5.md** criado; scripts **sync:ide**, **sync:ide:check**, **validate:structure**, **validate:agents** adicionados ao `package.json`. Lint (0 erros), typecheck e test passando.

---

## 5. Próximos passos sugeridos (ordem prática)

| # | Ação | Status |
|---|------|--------|
| 1 | Adicionar `typecheck` e `test` ao `package.json` + Vitest | ✅ Feito |
| 2 | Criar `docs/stories/` e `INSTRUCOES-COMPLETAS-SQUAD-AUTONOMA.md` | ✅ Feito |
| 3 | Criar `.cursor/rules` com regra CLAUDE/AGENTS | ✅ Feito |
| 4 | Rodar `npx aios-core install` (atalhos @architect, @dev, etc.) | ✅ Feito |
| 5 | Criar `.env.example` | ✅ Feito |
| 6 | Criar `docs/SETUP-TRES-PROJETOS-M5.md` | ✅ Feito |

Com isso, o projeto fica alinhado às regras, ao playbook e ao “modo squad”, e com quality gates (lint + typecheck + test) utilizáveis pelo agente de QA e pela retomada do desenvolvimento.
