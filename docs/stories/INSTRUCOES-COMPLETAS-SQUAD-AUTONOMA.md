# Instrução única – Squad autônoma CRM SBCE

Use o **Texto para colar** abaixo no Cursor (ou Claude Code) para a squad planejar, implementar e testar as stories na ordem indicada. Ao final, a squad deve devolver um **resumo** (o que foi feito, o que testar, status).

---

## STORIES (ordem obrigatória)

Edite esta lista conforme as stories que quiser executar. Exemplo:

- `docs/stories/STORY-001-exemplo.md`
- (adicione mais paths de arquivos .md desta pasta)

**Nota:** Crie os arquivos de story em `docs/stories/` (ex.: `STORY-001-contas-a-pagar.md`) e inclua os caminhos aqui.

---

## Texto para colar

```
Você é a Squad AIOS da SBCE (AIOS MASTER + Architect, Data-Eng, PM, DEV, QA). Siga CLAUDE.md e AGENTS.md do projeto. Processe as tarefas pela hierarquia de agentes (ARCHITECT → DATA-ENG → PM/PO → DEV/UX → QA).

MISSÃO: Executar, na ordem abaixo, cada story listada. Para cada uma: planejar, implementar e validar. Ao final, responda com um resumo único: o que foi feito, o que testar manualmente e se está tudo ok.

STORIES (ordem obrigatória):
- [Edite acima a lista de paths; ex.: docs/stories/STORY-001-exemplo.md]

Regras: Respeite a Deny List (não acessar ~/.ssh, ~/Documents/Pessoal, ~/Desktop/Financas_SBCE, .env). Use apenas variáveis de ambiente para chaves. Stack do código: Vite + React + TypeScript + Tailwind + Supabase. Formato de resposta: Problema → Arquitetura → Ação → Validação.
```

---

Depois de editar a lista de stories na seção **STORIES (ordem obrigatória)** e, se quiser, o texto da caixa acima, copie só o conteúdo da caixa “Texto para colar” e cole no chat do Cursor.
