# Comando único: setup completo Supabase + schemas

Use o **@aios-master** (orquestrador). No chat do Cursor, **cole o texto abaixo** e envie. A IA vai coordenar architect + data-engineer (e dev/qa se precisar), fazer tudo o que for automatizável no código e na documentação, e **só responder quando tiver um resumo final** com o que você ainda precisa fazer manualmente (criar projeto no dashboard, preencher .env, criar usuários).

---

## Texto para colar no chat

```
Você é o @aios-master (orquestrador AIOS). Sua missão é fazer o setup completo do Supabase + schemas para o CRM SBCE e só responder aqui quando tudo estiver pronto ou documentado.

COMANDO: Setup completo Supabase + schemas.

Faça na ordem (comandando os papéis internos Architect, Data-Eng, Dev, QA conforme necessário):

1. [ARCHITECT/DATA-ENG] Revisar as migrations em supabase/migrations/ (ordem: 20250629144213_dusty_recipe.sql, 20250629150639_rapid_lagoon.sql, 20260221140000_sbce_multi_tenant_and_app_schema.sql). Garantir guia único em docs/CONFIGURACAO-SUPABASE-COMPLETA.md com: (a) criar projeto no Dashboard, (b) rodar as três migrations no SQL Editor na ordem, (c) .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY, (d) criar os 3 usuários demo no Auth, (e) executar create_missing_profiles() e check_demo_users(), (f) executar create_default_instance('admin@sbce.com') para instância Matriz, (g) npm run dev e testar login.

2. [DEV] Garantir que a app não quebra quando .env está vazio: em main.tsx, se VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não existirem, renderizar apenas a tela de setup (ex.: SetupEnvPage) em vez de carregar App (usar dynamic import de App só quando as variáveis existirem para não executar supabase.ts sem config). Manter supabase.ts validando e lançando erro só quando alguém importar com vars ausentes em outro contexto.

3. [QA] Rodar npm run lint, npm run typecheck, npm test e confirmar que passam.

4. [AIOS-MASTER] Ao final, responder UM ÚNICO resumo com: (i) o que foi feito (arquivos criados/alterados e doc), (ii) checklist do que o HUMANO precisa fazer manualmente (criar projeto, colar URL/key no .env, criar 3 usuários no Auth, rodar as funções SQL), (iii) um comando ou passo a passo mínimo para testar (ex.: npm run dev, abrir localhost, fazer login com admin@sbce.com / admin123). Não entregar resumo até ter executado os passos 1–3 e ter o guia e o código prontos.
```

---

Depois de colar e enviar, espere a resposta final. O agente vai orquestrar os outros papéis e só responder quando tiver o resumo e o checklist para você.
