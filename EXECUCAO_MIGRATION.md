# Executar Migration + Seed — Super Agent IA

**Status:** Pronto para executar  
**Data:** 2026-06-03

---

## ⚠️ PRÉ-REQUISITO: Configurar DATABASE_URL

### Opção 1: Supabase (Recomendado)
```bash
# 1. Ir em https://app.supabase.com
# 2. Selecionar seu projeto
# 3. Settings → Database → URI
# 4. Copiar a string (ela começa com postgresql://)
# 5. Editar .env:

DATABASE_URL="postgresql://postgres:sua_senha_real@db.seu_id.supabase.co:5432/postgres"
```

### Opção 2: PostgreSQL Local
```bash
# Se tiver PostgreSQL instalado localmente:
DATABASE_URL="postgresql://postgres:password@localhost:5432/juridico_crm"
```

### Opção 3: PostgreSQL Remoto (VPS)
```bash
# Se tiver banco no seu VPS:
DATABASE_URL="postgresql://user:password@2.25.128.221:5432/juridico_crm"
```

---

## 🚀 EXECUÇÃO (4 passos)

### PASSO 1: Editar .env
```bash
# Abrir arquivo
cat .env

# Se ainda estiver como placeholder:
# DATABASE_URL="postgresql://postgres:%5BSUA-SENHA%5D@db.[SEU-ID].supabase.co:5432/postgres"

# Substituir pela URL REAL (copiada do Supabase/seu banco)
# Salvar arquivo
```

### PASSO 2: Executar Migration
```bash
# Ir para a raiz do projeto
cd /Users/andreluis/juridico-crm-automation

# Executar migration
npx prisma migrate dev --name whatsapp_integration_super_agent

# Esperado:
# - Cria 4 tabelas (whatsapp_routines, conversations, human_tickets, integrations)
# - Cria 4 ENUMs (WhatsAppPlatform, WhatsAppConversationStatus, etc)
# - Cria índices e foreign keys
# - Resultado: "✔ Generated Prisma Client"
```

### PASSO 3: Executar Seed (Popular roteiros iniciais)
```bash
# Verificar que prisma/seed.ts existe
cat prisma/seed.ts

# Executar seed
npx prisma db seed

# Esperado:
# ✅ [Seed] Roteiro criado: Direito Previdenciário
# ✅ [Seed] Roteiro criado: Direito da Família
# ✅ [Seed] Roteiro criado: Direito Trabalhista
# ✅ [Seed] Seed completado com sucesso!
```

### PASSO 4: Verificar no Prisma Studio
```bash
# Abrir interface gráfica
npx prisma studio

# Será aberto em http://localhost:5555
# Verificar:
# - Tabela whatsapp_routines (3+ registros)
# - Tabela whatsapp_integrations (vazia, pronta)
# - Tabelas whatsapp_conversations e whatsapp_human_tickets (vazias)
```

---

## 🐍 PASSO 5 (OPCIONAL): Testar Super Agent Python

```bash
# Se tiver Python 3.9+ instalado:
pip install anthropic

# Rodar teste
cd /Users/andreluis/juridico-crm-automation
python3 backend/ia_agent/super_agent_whatsapp.py

# Esperado:
# [Agente] Iniciando conversa para lead: test-lead-001
# [Agente] Área jurídica: previdenciario
# [Tool] Executando: check_requirements
# [Agente] ✓ Conversa finalizada. Resposta: XXX chars
# 
# Status: continued
# Resposta da IA: [texto sobre aposentadoria]
```

---

## ✅ Checklist Execução

- [ ] DATABASE_URL configurada em .env
- [ ] `npx prisma migrate dev` executado com sucesso
- [ ] `npx prisma db seed` executado (8 roteiros criados)
- [ ] `npx prisma studio` abre e mostra tabelas
- [ ] Tabelas no PostgreSQL: 4 criadas, 8 roteiros inseridos
- [ ] (Opcional) Python test rodou sem erros

---

## 🔧 Troubleshooting

### Erro: "database connection failed"
**Causa:** DATABASE_URL incorreta ou banco indisponível  
**Solução:**
```bash
# Testar conexão
psql postgresql://seu_user:senha@host:5432/database

# Se falhar, revisar DATABASE_URL
cat .env | grep DATABASE_URL
```

### Erro: "P3014: Migrations have failed, and the database is in an inconsistent state"
**Causa:** Migration anterior falhou  
**Solução:**
```bash
# Resetar banco (⚠️ apaga tudo)
npx prisma migrate reset

# Depois executar novamente
npx prisma migrate dev
```

### Erro: "relation "whatsapp_routines" does not exist"
**Causa:** Migration não foi executada  
**Solução:** Executar `npx prisma migrate dev` novamente

---

## 📊 Resultado Esperado Após Execução

### Tabelas criadas:
```
whatsapp_routines           (8 registros: os 8 roteiros)
whatsapp_conversations      (0 registros, pronto)
whatsapp_human_tickets      (0 registros, pronto)
whatsapp_integrations       (0 registros, pronto)
```

### Schema Prisma:
```
✅ WhatsAppRoutine
✅ WhatsAppConversation
✅ WhatsAppHumanTicket
✅ WhatsAppIntegration
✅ Relações com User e Lead
```

### Próximo:
- Implementar webhooks (Fase 3)
- Criar UI (Fase 4)
- Testes (Fase 5)

---

## 📝 Notas Importantes

1. **DATABASE_URL nunca commit**: Adicionar a `.gitignore` se já não estiver
2. **Seed idempotent**: Pode rodar múltiplas vezes, não cria duplicatas
3. **Roteiros editáveis**: Podem ser atualizados depois via UI
4. **Histórico preservado**: conversation_history em JSON (não SQL)

---

## 🎯 Após Completar

Quando terminar a execução, você terá:
- ✅ BD pronto com schema completo
- ✅ 8 roteiros iniciais (Previdenciário, Família, Trabalhista, Civil, Penal, Consumidor, Inventário, Outros)
- ✅ Pronto para Fase 3 (Webhooks + API Routes)

**Tempo estimado:** 5-10 minutos

---

**Próximo arquivo a ler:** `IMPLEMENTACAO_IA_SUPER_AGENT.md` (Fase 3 em diante)
