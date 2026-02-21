# Setup: três projetos SBCE no MacBook M5

Guia para manter **CRM**, **FinOps** e **LMS** no mesmo Mac (M5) com a **mesma estrutura de agentes e stories**, permitindo que a Squad AIOS opere em qualquer um dos três repositórios.

---

## 1. Estrutura de pastas sugerida

```
Desktop/
├── CRM SBCE/          # CRM (este projeto)
├── SBCE FinOps/       # FinOps
└── [LMS]/             # LMS (nome da pasta conforme seu repo)
```

Cada projeto deve ter:

- **CLAUDE.md** e **AGENTS.md** na raiz (regras AIOS e atalhos de agentes).
- **.aios-core/** (constitution, agents, tasks) – instalado com `npx aios-core install --quiet --merge`.
- **docs/stories/** com stories e **INSTRUCOES-COMPLETAS-SQUAD-AUTONOMA.md**.
- **.cursor/rules/** com regra que referencia CLAUDE/AGENTS (ex.: `aios-workspace.mdc`).
- Scripts **lint**, **typecheck**, **test** no `package.json`; **sync:ide**, **sync:ide:check**, **validate:structure**, **validate:agents** se usar AIOS.

---

## 2. Replicar estrutura no CRM ou no LMS

1. **No projeto de destino (ex.: CRM ou LMS):**
   - Garantir que existam: `CLAUDE.md`, `AGENTS.md`, `docs/stories/`, `.cursor/rules/`, `.env.example`.
   - Rodar: `npx aios-core install --quiet --merge` (brownfield).
   - Adicionar ao `package.json` os scripts do AGENTS.md: `lint`, `typecheck`, `test`, e opcionalmente `sync:ide`, `sync:ide:check`, `validate:structure`, `validate:agents`.

2. **Stories e instrução da squad:**
   - Copiar ou adaptar `docs/stories/README.md` e `docs/stories/INSTRUCOES-COMPLETAS-SQUAD-AUTONOMA.md` do FinOps ou do CRM para o outro projeto.
   - A lista “STORIES (ordem obrigatória)” fica dentro da instrução única; cada projeto pode ter suas próprias stories em `docs/stories/*.md`.

3. **Cursor:**
   - Codebase Indexing em **High** (Settings > General) para os três projetos.
   - GitHub MCP conectado para cruzar contexto entre CRM, FinOps e LMS.

---

## 3. Ordem de trabalho entre projetos

- **Backlog central:** pode ser mantido em um dos repos (ex.: FinOps `docs/stories/`) ou em cada um.
- **Data Lake:** novas funcionalidades em qualquer projeto devem prever consistência com o Data Lake central da SBCE (CLAUDE.md).
- **Comandos remotos (Telegram):** exigem VPS + OpenClaw configurados (ver **PLAYBOOK_MESTRE.md**).

---

## 4. Referências

- **COMECE-AQUI.md** (na raiz de cada projeto) – como usar a squad e a instrução única.
- **PLAYBOOK_MESTRE.md** – ecossistema M5, VPS, Docker, agentes.
- **docs/LEITURA-PROJETO-E-CHECKLIST-RETOMADA.md** (CRM) – leitura do projeto e checklist de retomada.
