# Como usar os agentes e dar comandos

Funciona **no chat do Cursor** e **via CLI (Codex)**. Resumo:

---

## No chat do Cursor (aqui)

- **Só falar no chat:** a IA já segue as regras do **CLAUDE.md** e **AGENTS.md** (persona AIOS, hierarquia de agentes, segurança). Você pode pedir em português, por exemplo:
  - *“Cria uma spec para a feature X”*
  - *“Como o architect faria essa refatoração?”*
  - *“Segue o fluxo do PM e escreve as user stories no backlog”*
  - *“Revisa esse código como o QA”*

- **Mencionar o agente (opcional):** pode escrever coisas como *“como @dev”* ou *“na visão do @architect”* para a IA assumir aquela persona. O Cursor não interpreta literalmente `@architect` como no Codex, mas o contexto (CLAUDE + regras) já direciona o comportamento.

- **Squad autônoma (várias stories de uma vez):**
  1. Abra `docs/stories/INSTRUCOES-COMPLETAS-SQUAD-AUTONOMA.md`
  2. Edite a lista **“STORIES (ordem obrigatória)”** com os arquivos das stories que quer executar
  3. Copie o **“Texto para colar”** (a caixa com “Você é a Squad AIOS…”)
  4. Cole no **chat do Cursor** (Agent ou Chat) e envie
  5. A squad planeja, implementa e testa na ordem e devolve um resumo

Resumo: **no Cursor, é pelo chat** — você dá os comandos em linguagem natural ou colando a instrução da squad.

---

## Via CLI (Codex)

Se você usa o **Codex CLI** no terminal:

1. Ative um agente com atalho, por exemplo:
   - `@architect` ou `/architect`
   - `@dev`, `@qa`, `@pm`, `@po`, `@sm`, `@analyst`, `@devops`, `@data-engineer`, `@ux-design-expert`, `@squad-creator`, `@aios-master`
2. Ou use **Skills:** `/skills` e escolha `aios-architect`, `aios-dev`, etc. (vindos de `.codex/skills` após `npm run sync:ide`).
3. O Codex carrega a persona do agente a partir de `.aios-core/development/agents/<nome>.md` e você dá os comandos no terminal (ex.: `*create-plan`, `*execute-subtask 1.1`).

Ou seja: **via CLI é no terminal, com Codex e esses atalhos.**

---

## Resumo rápido

| Onde        | Como usar |
|------------|-----------|
| **Chat Cursor** | Falar em português, pedir tarefas, opcionalmente dizer “como @dev” / “como architect”; para várias stories, colar o texto de `INSTRUCOES-COMPLETAS-SQUAD-AUTONOMA.md`. |
| **CLI (Codex)** | No terminal: `@architect`, `@dev`, etc. ou `/skills` → `aios-*`; depois dar comandos (ex.: `*create-plan`, `*execute-subtask`). |
| **Telegram**    | Só se tiver VPS + OpenClaw + bot configurado (ver **PLAYBOOK_MESTRE.md**). |

Para o dia a dia no Cursor, **basta usar o chat** e, quando quiser a squad inteira em cima de uma lista de stories, **colar a instrução** de `docs/stories/INSTRUCOES-COMPLETAS-SQUAD-AUTONOMA.md`.

---

## Comando único para setup Supabase + schemas

Para fazer o **setup completo do Supabase + schemas** com um único comando (orquestrador comanda os demais e só volta quando estiver pronto):

1. Abra **`docs/COMANDO-SETUP-SUPABASE.md`**
2. Copie o **"Texto para colar no chat"** (bloco que começa com *"Você é o @aios-master..."*)
3. Cole no chat do Cursor e envie
4. Espere a resposta final com o resumo e o checklist do que você precisa fazer manualmente (criar projeto, .env, usuários)
