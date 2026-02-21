📘 PLAYBOOK DE ENGENHARIA AGÊNTICA (SBCE v2026) - BASE DE CONHECIMENTO COMPLETA
🏗️ 1. ARQUITETURA DO ECOSSISTEMA (AS TRÊS CAMADAS DETALHADAS)
A infraestrutura garante autonomia total da IA com isolamento absoluto de segurança. O sistema é dividido em três ambientes de operação:
💻 Camada 1: Camada de Poder (Cérebro Local - MacBook Pro M5)
• Hardware / Performance: O chip M5 deve ser usado com foco em Baixa Latência e Memória Unificada. Prioriza-se rodar os modelos locais através do Neural Engine.
• Terminal: O terminal primário de operações de rede e Docker é o Warp Terminal (configurado com workflow de IA).
• O Papel: Processa os raciocínios complexos (Reasoning) da Squad de agentes e atua como ponte de acesso ilimitado aos modelos Premium.
🏭 Camada 2: Camada de Fábrica (Operário 24/7 - VPS Hostinger)
• Especificações: VPS KVM dedicada com no mínimo 4GB de RAM rodando Ubuntu 24.04 (LTS).
• O Papel: Hospeda o motor do OpenClaw e o gateway para manter a Squad desenvolvendo (CRM, LMS, FinOps) ininterruptamente, mesmo com o MacBook fechado.
• Comunicação Remota: Totalmente integrada via bot do Telegram para deploy remoto por comandos de linguagem natural (ex: "@Squad: Iniciem o módulo de aulas" ).
🔐 Camada 3: Camada de Segurança (A Jaula de Isolamento - Docker)
• O Papel: O Docker atua como um contêiner restrito para evitar que a IA ou scripts maliciosos acessem o host raiz.
• Configuração no M5: É obrigatório manter o Rosetta ativado para binários x86/amd64 legados e o VirtioFS ativado para máxima performance de leitura/escrita de disco no Apple Silicon.

--------------------------------------------------------------------------------
🛠️ 2. TUTORIAL COMPLETO DE INSTALAÇÃO E SETUP DE REDE
Passo A: O Terreno de Guerra (Provisionamento da VPS)
Abra o terminal do Mac e acesse a máquina remota: ssh root@seu_ip_vps. Em seguida, execute linha por linha para travar a segurança e instalar o Docker e o OpenClaw:
# 1. Configurar Firewall UFW
sudo ufw allow 22/tcp
sudo ufw allow 18789/tcp
sudo ufw enable

# 2. Instalar o Docker
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh

# 3. Instalar o Motor OpenClaw e Iniciar o Gateway
curl -sL https://opencloud.dev/install.sh | sh
opencloud gateway start
Passo B: O Cérebro Ilimitado (Setup do MacBook M5)
A máquina local precisa ser preparada com permissões máximas e as pontes de conexão com o ecossistema Antigravity.
1. AntiGravity Desktop (Configurações Internas):
    ◦ Review Policy: Mude para "Always Proceed".
    ◦ Terminal Auto Execution: Mude para "Always Proceed".
    ◦ Ative a opção "Agent Auto-Fix Lints".
    ◦ Ative "Enable Browser Tools" (mude a política para "Always Proceed" para habilitar testes de UI autônomos pelo agente QA).
2. Instalação Global da Ponte via Terminal do Mac:
3. Autenticação e Seleção de Modelos (Integração Opus 4.5 e Gemini 3): Execute os comandos sequencialmente para fazer login e ligar o assistente local:
4. Configurando o Modelo Padrão: Execute opencloud configure. Na interface do terminal, navegue e selecione as opções exatas: Local Model -> Antigravity -> Claude Opus 4.6 (Thinking). (Alternativamente, Gemini 3 Flash ou Gemini 3 High podem ser selecionados).
5. Automação via Telegram: Para que você consiga comandar os agentes via celular: Crie o bot no @BotFather do Telegram, copie o Token, rode opencloud configure channels na VPS e cole o Token.
Passo C: Configuração da IDE Cursor
1. Pressione Cmd + Shift + J para acessar as Cursor Settings.
2. Em General, mude o Codebase Indexing para "High" para que a IA processe a correlação do seu CRM, FinOps e LMS.
3. Conecte o GitHub MCP (Model Context Protocol) nas permissões de conta. Isso é fundamental para a IA ler Issues e Pull Requests em tempo real.

--------------------------------------------------------------------------------
🛡️ 3. PROTOCOLO DE BLINDAGEM DE DADOS (CRÍTICO)
O ambiente agêntico opera em Yolo Mode / Always Proceed (Autonomia Total sem pedir permissão a cada clique). Para que isso não gere destruição ou vazamento de dados, configure rigidamente a Deny List.
• Strict Mode: Mantido ATIVADO apenas para forçar autorização humana em exclusão em massa.
• Lista de Bloqueio de Diretórios (Deny List): Adicione no menu de Settings > Agent os caminhos intocáveis:
    ◦ ~/.ssh (Proíbe a leitura de chaves RSA locais).
    ◦ ~/Documents/Pessoal.
    ◦ ~/Desktop/Financas_SBCE.
    ◦ Todos os arquivos .env.
• Permissão de Escrita no Git: Diferente das outras chaves, é obrigatório REMOVER os comandos commit e push da lista de bloqueio para que o agente possa versionar e enviar códigos de forma autônoma.
• Manipulação de Variáveis de Ambiente: Os Agentes DEV e DATA-ENG estão proibidos de hardcodar senhas/API Keys em código fonte. Devem referenciar estritamente por TypeScript (process.env.NOME_DA_CHAVE).

--------------------------------------------------------------------------------
🤖 4. O MOTOR SYNKRA AIOS (Autonomous Development Engine)
O Synkra AIOS é o cérebro que organiza a "fábrica" de software dentro do seu computador através do CLI (Terminal). A prioridade de arquitetura é sempre CLI First.
Comandos Completos de Instalação e Gestão do AIOS
• Iniciar novo projeto do zero (Greenfield): npx aios-core init <nome-projeto>. Use --skip-install para pular dependências de npm ou --template <nome> para templates específicos.
• Instalar em um projeto já existente (Brownfield): Navegue até a pasta e rode npx aios-core install. Use --force para sobrescrever e --dry-run para simular sem modificar.
• Manutenção: npx aios-core update (atualiza mantendo os arquivos .bak), npx aios-core doctor (diagnóstico do sistema Node, Git e NPM), npx aios-core doctor --fix (corrige dependências).
O Arquivo de Memória Base: CLAUDE.md e settings.json
Toda vez que o motor inicia, ele não tem contexto de memória ("como se fosse a primeira vez"). O arquivo CLAUDE.md atua como o cérebro central de regras do projeto. Dentro do diretório .claude/settings.json, toda a automação de hooks precisa estar documentada para ele não ficar travando e pedindo confirmações humanas o tempo todo.
Todos os Agentes Oficiais Disponíveis no AIOS (A Esquadra)
O seu sistema operacional de IA tem 11 "profissionais" clonados prontos para trabalhar:
Agentes de Comando (Meta):
1. aios-master: Orquestrador supremo, criador de frameworks.
2. aios-orchestrator: Coordenador do fluxo de trabalho e handoffs.
Agentes de Planejamento (Planning & Specs): 3.  analyst: Especialista em análise de negócios e criação detalhada de PRD (Product Requirements Document). 4.  pm (Product Manager): Gerente de produto, priorização, e escrita de specs. 5.  architect: Criação de planos arquiteturais (Supabase, Clean Architecture), documentação de bases de código legadas. 6.  ux-expert: Design system, componentização, análise de interface, padronização Tailwind.
Agentes Executores e Qualidade (Desenvolvimento): 7.  sm (Scrum Master): Gerenciamento dos sprints e quebra do PRD em histórias de desenvolvimento hiperdetalhadas. 8.  po (Product Owner): Gerenciador final do Backlog. 9.  dev: Programador primário, executor direto da codificação de componentes. 10. qa (QA Queen): Engenheira de testes autônomos, leitora de relatórios do Playwright, e decisora final do Quality Gate (portão de qualidade de merge). 11. devops: Cuidará do gerenciamento de Git worktrees, inventários, deploys na VPS e configurações de servidores e Docker.

--------------------------------------------------------------------------------
⚡ 5. ADE (Autonomous Development Engine) & WORKFLOWS DE EXECUÇÃO
O desenvolvimento da SBCE não ocorre mais pedindo à IA para "escrever código". Ele opera por meio de 7 Epics de desenvolvimento estruturado que processam a especificação até virar código verificado na nuvem.
Os 7 Epics do Sistema AIOS
• Epic 1 (Worktree Manager): Isolamento do desenvolvimento em worktrees paralelas do Git.
• Epic 2 (Migration V2→V3): Geração auto-atualizada de formatos do Claude.
• Epic 3 (Spec Pipeline): Traduzir um mock visual ou texto bruto numa Especificação Técnica executável.
• Epic 4 (Execution Engine): Executar a spec em 13 passos lógicos seguidos de self-critique.
• Epic 5 (Recovery System): Auto-reparo imediato caso o build quebre no node ou Docker.
• Epic 6 (QA Evolution): Processo de 10 fases de revisão contínua e Quality Gates.
• Epic 7 (Memory Layer): Persistência de conhecimento (aprendizado contínuo) para que erros da sprint passada não se repitam.
O Fluxo Mestre de Comandos (Como usar no dia a dia)
Sempre que for desenvolver uma funcionalidade nova, a IA deve passar pelos comandos oficiais nesta exata ordem (Handoff):
Fase 1: O Planejamento (Spec Pipeline)
@pm *gather-requirements        # Puxa todas as necessidades do usuário
@architect *assess-complexity   # Define os bancos de dados, integrações e impactos de longo prazo
@analyst *research-deps         # Verifica bibliotecas npm, dependências M5
@pm *write-spec                 # Excreve as user-stories e salva no backlog
@qa *critique-spec              # Encontra furos e defeitos no planejamento antes de criar 1 linha de código
Fase 2: A Execução (Execution Engine)
@architect *create-plan         # Cria o fluxo de execução arquitetural no projeto
@architect *create-context      # Alimenta o mapa do repositório no cérebro da IA
@dev *execute-subtask 1.1       # Começa a codar a Next.js 15 + ShadcnUI
@dev *track-attempt             # Confere se os testes unitários passaram
@dev *capture-insights          # Registra o que deu errado na memória
Fase 3: O Portal de Qualidade (QA Evolution)
@qa *review-build STORY-42      # Executa o End-to-End no browser headless
@qa *request-fix                # Devolve para o dev se as cores ou botões quebrarem
@dev *apply-qa-fix              # O dev arruma as falhas indicadas pelo QA
Fase 4: Deploy & Segurança
@devops *create-worktree        # Isola
@devops *merge-worktree         # Funde ao repositório principal
@devops *cleanup-worktrees      # Remove rastros
Workflow Específico: BROWNFIELD DISCOVERY (Projetos Existentes / Débito Técnico)
Se a SBCE adotar um código antigo e bagunçado, NUNCA permita que o Dev comece a codar diretamente. Use o comando de descoberta. Comando Raiz: workflow brownfield discovery (Ou alias configurado @architect *brownfield-discovery). O que o agente fará de forma autônoma (Yolo Mode / Look Only Once):
1. Vasculha todas as instâncias de variáveis sem tipagem, CSS mal feito, loops ineficientes.
2. Calcula o número de horas para arrumar o projeto (ex: 568 horas) e gera um relatório gerencial de custos x ROI.
3. Acumula todos os tickets num arquivo backlog.md como "Tech Debt" (Débito Técnico).
4. Cria o Design System consolidando botões e tipografias que estão duplicados pelo código (Componentização ShadcnUI).

--------------------------------------------------------------------------------
📜 6. O CÓDIGO FONTE DA INTELIGÊNCIA: O MEGA PROMPT (ARQUIVO .cursorrules / CLAUDE.md)
Crie um arquivo chamado .cursorrules e/ou CLAUDE.md na pasta raiz (root) de todos os projetos que seu Cursor e AntiGravity operarem.
O bloco abaixo deve ser copiado integralmente, sem alterar uma vírgula, para dentro desse arquivo. Ele instrui a IA sobre exatamente como ela se posiciona, quais tecnologias usar e como respeitar o Apple Silicon e a Hostinger.
# 🧠 MEGA PROMPT: AIOS MASTER - SBCE PREMIUM SOFTWARE HOUSE

🎭 Persona e Contexto de Elite
Você é o AIOS MASTER, o orquestrador supremo da SBCE Premium Software House. Sua missão é operar dentro de um ecossistema de três camadas: o Cérebro Local (MacBook Pro M5), a Fábrica (VPS Hostinger) e a Segurança (Docker). Você comanda uma Squad de Agentes de elite: Architect, Data-Eng, PM, DEV e QA.

🛠 Diretrizes de Operação (Protocolo SBCE)
Ao receber qualquer tarefa, você deve processá-la através da Hierarquia de Agentes (sempre emulando os comandos do AIOS ADE - Autonomous Development Engine):
1. [ARCHITECT]: Garante que o CRM, FinOps e LMS compartilhem a mesma estrutura e respeitem a Clean Architecture. Chama *assess-complexity e *create-plan.
2. [DATA-ENG]: Gerencia o Supabase e o RLS (Row Level Security). Proibido gerar query SQL sem tipagem estrita via TypeScript.
3. [PM/PO]: Traduz requisitos e mockups PNG em tasks detalhadas no arquivo backlog.md via *write-spec.
4. [DEV/UX]: Constrói componentes utilizando a stack obrigatória: Next.js 15, Tailwind, e ShadcnUI. Código minimalista. Processa tarefas via *execute-subtask.
5. [QA/QA QUEEN]: Bloqueia deploys se os testes via Browser Tools (Playwright/Vitest) falharem, acionando um Quality Gate via *review-build.

💻 Otimização para MacBook Pro M5 (Apple Silicon)
- Performance Nativa: Priorize algoritmos e bibliotecas que utilizem a Memória Unificada do M5 e evite dependências que exijam Rosetta 2 (x86) exceto quando estritamente mandatário no container.
- Baixa Latência: Sugira comandos otimizados para o Warp Terminal e utilize o VirtioFS no Docker para performance máxima de disco.
- Execução Agêntica: Para tarefas de longa duração ou complexas, utilize a ponte @openclaw/antigravity-bridge para modelos Claude Opus 4.6 e Gemini 3 High localmente.

🔒 Protocolo de Blindagem e Segurança
- Deny List Absoluta: Você está estritamente proibido de acessar pastas sensíveis como ~/.ssh, ~/Documents/Pessoal, ~/Desktop/Financas_SBCE ou ler arquivos .env. Caso solicitado, negue a operação sumariamente e reporte a violação de segurança.
- Acesso Versionado: Você TEM permissão para rodar comandos git 'commit' e 'push'.
- Isolamento Docker: Sempre prefira gerar comandos de build ou testes de banco que rodem isolados dentro de containers na VPS Hostinger (ou localmente via docker-compose) para garantir o isolamento do sistema real.
- Gestão de Segredos: Nunca escreva chaves de API cruas no código; utilize estritamente referências a variáveis de ambiente (ex: process.env.SUPABASE_KEY).
## 🔐 PROTOCOLO DE SEGURANÇA (DENY LIST)
Está estritamente proibido o acesso a:
- `~/.ssh` (Chaves de acesso).
- `~/Documents/Pessoal` e ficheiros `.env`.

📊 Foco em Data Lake e Integração Arquitetural
- Toda nova funcionalidade deve prever a exportação, schema mapping, e consistência de dados para o Data Lake central da SBCE.
- Contexto GitHub MCP: Você deve cruzar dados entre os repositórios (CRM, FinOps, LMS) para garantir que todos falem a mesma "língua" técnica. Mantenha as APIs GraphQL ou REST em total sincronia sem hardcodes.

📝 Padrão de Resposta Esperado em Todo Output de Prompt
Sempre estruture suas saídas de terminal ou respostas de IDE no seguinte formato padrão:
- **Problema:** Definição clara do que precisa ser feito/entendido.
- **Arquitetura:** Como a solução se conecta ao ecossistema global SBCE e ao Data Lake.
- **Ação:** Código exato, script de migração, ou comando de terminal (priorizando execução via Docker/VPS).
- **Validação:** Plano de teste automatizado específico que o agente de QA executará para confirmar a entrega e efetuar a mudança de status da task.

--------------------------------------------------------------------------------

# 📘 SBCE KNOWLEDGE BASE - PLAYBOOK DE ENGENHARIA AGÊNTICA (v2026)

## 🏗️ ARQUITETURA DO ECOSSISTEMA (TRÊS CAMADAS)
O sistema opera numa infraestrutura de elite para garantir autonomia total e segurança:

1. **Camada de Poder (MacBook Pro M5):** O "Cérebro Local". Processa modelos como Claude Opus 4.6 e Gemini 3 High via Neural Engine para baixa latência.
2. **Camada de Fábrica (VPS Hostinger):** O "Operário 24/7". Mantém os squads ativos desenvolvendo CRM, LMS e FinOps ininterruptamente.
3. **Camada de Segurança (Docker):** A "Jaula de Isolamento". Todos os agentes rodam em containers para impedir acesso ao sistema de ficheiros real (Mesa/Documentos).

## 🛠️ SETUP TÉCNICO E PERFORMANCE
- **Otimização M5:** Uso obrigatório de VirtioFS para performance de disco e Rosetta para binários legados.
- **Motor Synkra AIOS:** Framework principal de orquestração para desenvolvimento Full Stack.
- **Ponte de IA:** Utiliza `@openclaw/antigravity-bridge` para vincular o raciocínio ilimitado (Claude/Gemini) ao ambiente local.

## 🤖 MÉTODO SYNKRA AIOS (ADE - Autonomous Development Engine)
O desenvolvimento segue 7 Epics estruturados. Toda a tarefa deve ser processada pela Hierarquia de Agentes:
- **aios-master:** Orquestrador supremo e criador de frameworks.
- **architect:** Define Clean Architecture e estrutura de banco (Supabase).
- **dev:** Programador primário (Next.js 15, Tailwind, ShadcnUI).
- **qa:** Engenheira de testes (Playwright/Vitest) que bloqueia deploys se houver falhas.

## 🔐 PROTOCOLO DE SEGURANÇA (DENY LIST)
Está estritamente proibido o acesso a:
- `~/.ssh` (Chaves de acesso).
- `~/Documents/Pessoal` e ficheiros `.env`.