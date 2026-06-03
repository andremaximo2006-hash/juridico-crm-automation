# 🚀 Phase 5: Próximos Passos — Testes End-to-End

**Status Atual:** Phase 4 (UI) ✅ COMPLETO  
**Próxima Fase:** Phase 5 (Testes) — 2 horas de trabalho  
**Data Estimada:** 2026-06-04 (amanhã)

---

## 📋 O Que Falta (Phase 5 — 2 horas)

### Task 1️⃣ **Conectar Backend Python Real** (~1 hora)

**Problema Atual:**
```typescript
// src/lib/whatsapp-service.ts — linha 80
// Simula resposta da IA (não chama API real)
const response = `Simular resposta do Super Agent...`;
```

**O Que Fazer:**
1. Iniciar servidor Python em `localhost:8000`
   ```bash
   cd backend
   python -m uvicorn ia_agent.super_agent_whatsapp:app --reload --port 8000
   ```

2. Atualizar `callSuperAgent()` em `src/lib/whatsapp-service.ts`
   ```typescript
   // Antes (simulado):
   const response = `Simular resposta...`;
   
   // Depois (real):
   const res = await fetch('http://localhost:8000/process-message', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       lead_id: leadId,
       message: userMessage,
       legal_area: routine.legalArea,
       conversation_history: existingHistory,
       system_prompt: routine.systemPrompt,
     }),
   });
   
   const { response, status, reason } = await res.json();
   ```

3. Criar endpoint em backend: `POST /process-message`
   - Recebe: lead_id, message, legal_area, conversation_history, system_prompt
   - Retorna: { response, status: "continued"|"transferred", reason?, priority? }

4. Testar:
   - Webhook Z-API recebe mensagem
   - Python processa via Super Agent
   - Resposta volta para WhatsApp

---

### Task 2️⃣ **Testes de Webhook** (~30 minutos)

#### Teste 1: Z-API Webhook
```bash
curl -X POST http://localhost:3000/api/webhooks/whatsapp/zapi \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "5585988123456",
    "name": "João Silva",
    "message": "Olá, tenho 68 anos e contribuí 35 anos ao INSS",
    "timestamp": 1234567890,
    "instanceId": "123456"
  }'
```

**Esperado:**
- ✅ Cria Lead em BD
- ✅ Cria/atualiza Conversa
- ✅ Carrega Roteiro (previdenciário)
- ✅ Chama Super Agent Python
- ✅ Salva resposta em histórico
- ✅ Conversa visível em `/ia/conversas`

#### Teste 2: Transfer para Humano
```bash
# Webhook envia mensagem que ativa transfer_to_human
curl -X POST http://localhost:3000/api/webhooks/whatsapp/zapi \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "5585988123456",
    "name": "João Silva",
    "message": "Preciso falar com um atendente agora",
    ...
  }'
```

**Esperado:**
- ✅ Super Agent chama tool `transfer_to_human`
- ✅ Ticket criado em BD
- ✅ Ticket visível em `/ia/atendimento-humano`
- ✅ Conversa marcada com status "transferred"

---

### Task 3️⃣ **Testes de UI** (~30 minutos)

#### Teste 1: Página Roteiros
```
Ação: Ir para /ia/roteiros
✅ Lista 8 roteiros
✅ Selecionar um roteiro
✅ Ver system prompt
✅ Editar texto
✅ Clicar Salvar
✅ Version incrementa
✅ Toggle ativo/inativo
✅ Criar novo roteiro
```

#### Teste 2: Página Conversas
```
Ação: Após receber mensagem via webhook
✅ Ir para /ia/conversas
✅ Conversa aparece na lista
✅ Clicar na conversa
✅ Ver histórico completo
✅ Filtrar por status
✅ Buscar por nome
```

#### Teste 3: Página Atendimento Humano
```
Ação: Após transferência de ticket
✅ Ir para /ia/atendimento-humano
✅ Ticket aparece na fila
✅ Clicar ticket
✅ Ver info do lead
✅ Clicar "Atribuir a"
✅ Selecionar atendente
✅ Status muda para "assigned"
✅ Clicar "Iniciar Atendimento"
✅ Status muda para "in_progress"
✅ Clicar "Marcar como Resolvido"
✅ Status muda para "resolved"
✅ Ticket some da fila
```

---

## 🔍 Checklist de Validação (Phase 5)

### Backend
- [ ] Servidor Python rodando em `localhost:8000`
- [ ] Endpoint `/process-message` respondendo
- [ ] Super Agent processando mensagens
- [ ] Histórico preservado em BD

### Webhooks
- [ ] Z-API webhook recebendo mensagens
- [ ] Meta Business webhook funcionando
- [ ] ManyChat webhook funcionando
- [ ] Leads criados automaticamente

### Conversas
- [ ] Histórico de conversa salvo
- [ ] Status correto (active/transferred/completed)
- [ ] `/ia/conversas` exibindo conversas
- [ ] Filtros funcionando
- [ ] Chat preview mostrando histórico

### Tickets
- [ ] Ticket criado ao chamar `transfer_to_human`
- [ ] Ticket visível em `/ia/atendimento-humano`
- [ ] Atribuição funciona
- [ ] Transições de status funcionam
- [ ] Histórico preservado no ticket

### UI
- [ ] Sidebar mostrando menu "IA Atendimento"
- [ ] 3 páginas carregando sem erro
- [ ] Responsividade OK (mobile/tablet/desktop)
- [ ] Dark mode funciona
- [ ] APIs respondendo corretamente

---

## 📊 Fluxo de Teste Completo

```
1. Iniciar Python backend
   $ cd backend && python -m uvicorn ia_agent.super_agent_whatsapp:app --reload

2. Enviar webhook Z-API
   $ curl -X POST http://localhost:3000/api/webhooks/whatsapp/zapi \
     -d '{"phone": "5585988123456", "name": "João", "message": "Olá..."}'

3. Verificar em /ia/conversas
   → Conversa deve aparecer na lista
   → Histórico deve estar completo

4. Simular transfer
   $ curl -X POST http://localhost:3000/api/webhooks/whatsapp/zapi \
     -d '{"phone": "5585988123456", ..., "message": "transferir"}'

5. Verificar em /ia/atendimento-humano
   → Ticket deve aparecer
   → Atribuir a atendente
   → Iniciar atendimento
   → Resolver ticket

6. Verificar em /ia/conversas
   → Status deve ser "transferred"
   → Histórico deve estar intacto
```

---

## 🔧 Comandos Úteis (Phase 5)

### Iniciar Tudo
```bash
# Terminal 1: Backend Python
cd /Users/andreluis/juridico-crm-automation/backend
python -m uvicorn ia_agent.super_agent_whatsapp:app --reload --port 8000

# Terminal 2: Frontend Next.js
cd /Users/andreluis/juridico-crm-automation
npm run dev

# Terminal 3: Testar webhooks
curl -X POST http://localhost:3000/api/webhooks/whatsapp/zapi ...
```

### Limpar Base de Dados (se necessário)
```bash
# Reset Prisma (cuidado!)
cd /Users/andreluis/juridico-crm-automation
npx prisma db push --force-reset
npx prisma db seed
```

### Verificar Logs
```bash
# Logs da aplicação
tail -f /Users/andreluis/juridico-crm-automation/logs/*.log

# Console Python
# Verificar stdout do servidor Python
```

---

## 📝 O Que Documentar após Testes

- [ ] Screenshot de `/ia/roteiros`
- [ ] Screenshot de `/ia/conversas`
- [ ] Screenshot de `/ia/atendimento-humano`
- [ ] Log da conversa completa (webhook → conversa → ticket → resolução)
- [ ] Resultado dos testes (PASS/FAIL)
- [ ] Problemas encontrados (se houver)

---

## 🚀 Ordem de Execução (Phase 5)

1. **Hora 1 (0:00-1:00):** Conectar Backend Python Real
   - Iniciar servidor Python
   - Atualizar `callSuperAgent()` em `whatsapp-service.ts`
   - Teste simples: enviar mensagem via webhook

2. **Hora 1.5 (1:00-1:30):** Testes de Webhook
   - Z-API, Meta, ManyChat
   - Validar conversas criadas

3. **Hora 2 (1:30-2:00):** Testes de UI + Tickets
   - Testar todas as 3 páginas
   - Transfer → Tickets
   - Atribuição e resolução

---

## ✅ Quando Phase 5 Estiver Pronto

- Webhook recebendo mensagens ✅
- Conversas sendo salvas com histórico ✅
- Tickets criados ao transferir ✅
- Atendentes conseguindo atribuir/resolver ✅
- UI mostrando dados corretos ✅

**→ Aplicação pronta para PRODUÇÃO** 🎉

---

## 📞 Suporte/Troubleshooting

### Se webhook não funciona:
1. Verificar se servidor rodando: `curl http://localhost:3000/api/whatsapp/routines`
2. Verificar CORS em `next.config.ts`
3. Verificar logs em `/logs/`

### Se Python não processa:
1. Verificar se backend rodando: `curl http://localhost:8000/docs`
2. Verificar imports em `backend/ia_agent/super_agent_whatsapp.py`
3. Verificar ANTHROPIC_API_KEY

### Se conversa não salva:
1. Verificar DATABASE_URL em `.env`
2. Verificar se migração rodou: `npx prisma migrate status`
3. Verificar BD diretamente: `npx prisma studio`

---

## 🎯 Resumo

**Phase 4 (UI):** ✅ COMPLETO (4 horas)  
**Phase 5 (Testes):** ⏳ PRÓXIMA (2 horas)

Tudo está pronto para começar Phase 5. Basta:
1. Iniciar backend Python
2. Enviar webhook de teste
3. Verificar se conversas e tickets aparecem
4. Testar UI das 3 páginas

**Tempo total:** 2 horas  
**Status:** Pronto para começar amanhã (2026-06-04)

---

**👉 Próximo passo:** Executar Phase 5 quando autorizado

