# Comece aqui – SBCE FinOps e a Squad

Guia curto para **não se perder** na raiz do projeto e **saber como pedir à squad** para fazer as coisas. Uma página só.

**Replicar esta estrutura no CRM ou no LMS?** Veja **docs/SETUP-TRES-PROJETOS-M5.md** (3 projetos no M5, mesma estrutura de agentes e stories).

---

## 1. O que é cada coisa na raiz (só o que importa para você)

Na raiz há muitos arquivos. Para **usar a squad e desenvolver**, importa isto:

| O que você vê | O que é | Você precisa? |
|---------------|--------|----------------|
| **COMECE-AQUI.md** | Este guia. Ponto de partida. | ✅ Leia primeiro. |
| **docs/stories/** | Onde ficam as **stories** (o que a squad vai fazer). | ✅ É aqui que você aponta “faça essas”. |
| **docs/stories/INSTRUCOES-COMPLETAS-SQUAD-AUTONOMA.md** | Instrução única para colar no Cursor (ou Claude Code); a squad faz tudo e devolve resumo. | ✅ Use isso para “pedir à squad”. |
| **claude.md** | Regras em texto para a IA (persona AIOS, segurança, formato de resposta). | ⚪ Referência; a IDE pode usar. |
| **PLAYBOOK_MESTRE.md** | Manual do ecossistema (M5, VPS, Docker, Telegram, comandos dos agentes). | ⚪ Quando quiser usar VPS/Telegram ou aprofundar. |
| **AGENTS.md** | Instruções para o Codex CLI (atalhos @architect, @dev, etc.). | ⚪ Só se for usar Codex no terminal. |
| **.cursor/** | Regras e comandos que o **Cursor** usa (layout, AIOS, agentes). | ⚪ A IDE carrega sozinho. |
| **.claude/** | Config do Claude Code (permissões, comandos). | ⚪ Só se for usar Claude Code. |
| **.agent/**, **.antigravity/**, **.aios-core/**, **.codex/**, **.gemini/**, **.github/** | Configurações para outras ferramentas (Antigravity, AIOS, Codex, Gemini, GitHub). | ❌ Pode ignorar no dia a dia. |
| **src/** | Código da aplicação (DRE, alunos, etc.). | ✅ Onde a squad mexe quando implementa. |

**Resumo:** Para **começar**, foque em: **COMECE-AQUI.md** → **docs/stories/** → **docs/stories/INSTRUCOES-COMPLETAS-SQUAD-AUTONOMA.md**. O resto a IDE e as ferramentas usam por baixo dos panos.

---

## 2. A IDE está usando o Playbook e o claude.md?

- **Cursor** usa principalmente:
  - As regras em **.cursor/rules** (incluindo layout global, etc.).
  - O que o workspace marca como “sempre aplicado”: trechos de **CLAUDE.md** (e referências a ele) e **AGENTS.md**.
- O **PLAYBOOK_MESTRE** não é “carregado” automaticamente como regra da IDE; é o **manual para você** (como usar VPS, Telegram, fluxo dos agentes). A IA pode seguir o mesmo espírito (hierarquia de agentes, segurança) se isso estiver resumido no **claude.md** ou nas regras do Cursor.
- O **claude.md** na raiz é o “mega prompt” (persona AIOS, protocolo SBCE, segurança). O Cursor pode usar isso via regras do workspace. Ou seja: **sim**, a IDE usa regras que vêm do **claude.md** (e do AGENTS.md); o **Playbook** é o manual humano e para setup VPS/Telegram.

---

## 3. Como a squad sabe quais são os “próximos” stories?

A squad **não descobre sozinha** qual é o “próximo” story. **Você** diz de uma destas formas:

- **Opção A (recomendada):** Na **instrução única** (em INSTRUCOES-COMPLETAS-SQUAD-AUTONOMA.md) já está escrito quais stories fazer: as 3 de Contas a Pagar (001, 002, 003). Você só cola a instrução e envia; a squad segue essa lista.
- **Opção B:** Você quer outras stories no futuro. Então:
  1. Crie ou edite os arquivos em **docs/stories/** (ex.: STORY-XYZ-004-nova-funcionalidade.md).
  2. Na **mesma instrução única**, troque a lista “STORIES (ordem obrigatória)” pela nova lista (paths dos .md), ou abra INSTRUCOES-COMPLETAS-SQUAD-AUTONOMA.md e edite a seção “Texto para colar” com os novos caminhos.
  3. Assim a squad “identifica” os próximos stories pelo que você colocou na instrução.

Ou seja: **os próximos stories são os que você listar na instrução** (ou no arquivo que você mandar a squad ler). O “backlog” é a pasta **docs/stories/**; a “ordem” é a que você passar no prompt.

---

## 4. Posso mandar esse comando pelo Telegram?

**Sim, mas só** se você tiver a **Fábrica** ligada (VPS Hostinger + OpenClaw + bot do Telegram), como no **PLAYBOOK_MESTRE.md**.

- **Sem VPS/OpenClaw:** não há comando pelo Telegram; você usa **Cursor** ou **Claude Code** no seu Mac (cola a instrução e envia).
- **Com VPS/OpenClaw/Telegram configurados:** você manda pelo Telegram a ordem (ex.: “Implementar as stories de Contas a Pagar do DRE” ou o texto da instrução única); a squad roda na VPS e pode te avisar quando terminar.

Resumo: **Telegram = sim, desde que o Playbook (VPS + OpenClaw + Telegram) esteja configurado.** Senão, use Cursor ou Claude Code.

---

## 5. Como começar a usar (passo a passo)

1. **Abra o projeto no Cursor** (este repositório).
2. **Abra o arquivo:**  
   `docs/stories/INSTRUCOES-COMPLETAS-SQUAD-AUTONOMA.md`
3. **Copie o “Texto para colar”** (a caixa com a instrução longa, a partir de “Você é a Squad AIOS…”).
4. **No Cursor:** abra um **novo chat** (Agent ou Chat) e **cole** esse texto. Envie.
5. **Deixe a sessão aberta.** A squad vai planejar, implementar e testar as 3 stories e, no **fim**, vai responder com um **resumo** (o que foi feito, o que testar, se está tudo funcionando). Você não precisa ficar dando mais nenhum comando.
6. Quando aparecer a resposta final, leia o resumo e teste na aplicação o que ela indicar.

Para **outras stories** no futuro: coloque os .md em **docs/stories/** e **mude a lista de stories na instrução** (no mesmo arquivo ou no prompt que você colar) para incluir os novos arquivos. Assim a squad “identifica” os próximos stories.

---

## 6. Resumo em uma frase

**“Abra o Cursor, cole a instrução de docs/stories/INSTRUCOES-COMPLETAS-SQUAD-AUTONOMA.md no chat, envie e espere a resposta final.”**  
Para comando pelo Telegram, use a VPS + OpenClaw (Playbook).
