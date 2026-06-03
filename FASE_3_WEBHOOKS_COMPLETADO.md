# Fase 3: Webhooks + API Routes — ✅ COMPLETO

**Data:** 2026-06-03  
**Status:** ✅ IMPLEMENTADO  
**Tempo Estimado:** 3 horas (COMPLETADO)

---

## 📋 O Que Foi Criado

### 1. **Webhooks para 3 Plataformas WhatsApp** ✅

#### Z-API Webhook
**Arquivo:** `src/app/api/webhooks/whatsapp/zapi/route.ts`
- ✅ Recebe mensagens via POST
- ✅ Extrai dados: phone, name, message
- ✅ Valida integração ativa
- ✅ Cria/atualiza Lead
- ✅ Chama Super Agent
- ✅ Responde via Z-API

**Fluxo:**
```
WhatsApp (Z-API) 
  → POST /api/webhooks/whatsapp/zapi 
  → Processa mensagem 
  → Chama Super Agent 
  → Responde no WhatsApp
```

#### Meta Business API Webhook
**Arquivo:** `src/app/api/webhooks/whatsapp/meta/route.ts`
- ✅ Valida assinatura (webhook_secret)
- ✅ Valida token (GET request)
- ✅ Extrai mensagens de payload Meta
- ✅ Suporta contatos (name extraction)
- ✅ Integração com Super Agent
- ✅ Responde via Meta Graph API

**Fluxo:**
```
Meta Business API 
  → POST /api/webhooks/whatsapp/meta 
  → Valida assinatura 
  → Extrai mensagens 
  → Processa 
  → Responde
```

#### ManyChat Webhook
**Arquivo:** `src/app/api/webhooks/whatsapp/manychat/route.ts`
- ✅ Autenticação via Bearer token
- ✅ Processa eventos de mensagem
- ✅ Extrai subscriber_id + nome
- ✅ Limpa telefone (remove caracteres)
- ✅ Envia resposta via ManyChat API

**Fluxo:**
```
ManyChat 
  → POST /api/webhooks/whatsapp/manychat 
  → Valida API key 
  → Processa 
  → Responde
```

---

### 2. **Serviço Central de Processamento** ✅

**Arquivo:** `src/lib/whatsapp-service.ts`

Funções principais:
- **`processWhatsAppMessage()`** — Orquestra todo o fluxo
  1. Valida lead
  2. Busca histórico de conversa
  3. Carrega sistema de roteiros (system prompt)
  4. Chama Super Agent Python
  5. Salva/atualiza conversa no BD
  6. Cria ticket se transferido
  7. Retorna resposta + status

**Interface:**
```typescript
interface ProcessMessageParams {
  leadId: string;
  message: string;
  platform: "zapi" | "meta" | "manychat";
  platformContactId?: string;
  phoneNumber?: string;
}

interface ProcessMessageResult {
  response: string;
  status: "continued" | "transferred_to_human";
  reason?: string;
  ticketId?: string;
}
```

---

### 3. **CRUD de Roteiros (System Prompts)** ✅

#### GET `/api/whatsapp/routines`
**Arquivo:** `src/app/api/whatsapp/routines/route.ts`
- ✅ Lista todos os roteiros
- ✅ Retorna: id, legalArea, name, active, version, timestamps

#### POST `/api/whatsapp/routines`
- ✅ Cria novo roteiro
- ✅ Valida legal_area única
- ✅ Inicializa version = 1
- ✅ Status: ✅ 201 Created

#### GET `/api/whatsapp/routines/:id`
**Arquivo:** `src/app/api/whatsapp/routines/[id]/route.ts`
- ✅ Obtém roteiro por ID ou legal_area
- ✅ Retorna system_prompt completo

#### PATCH `/api/whatsapp/routines/:id`
- ✅ Atualiza system_prompt
- ✅ Incrementa version automaticamente
- ✅ Preserva histórico (soft-update)

#### DELETE `/api/whatsapp/routines/:id`
- ✅ Desativa roteiro (soft-delete)
- ✅ Preserva dados históricos
- ✅ Não afeta conversas existentes

**Exemplo de uso:**
```bash
# Listar todos
curl http://localhost:3000/api/whatsapp/routines

# Obter um
curl http://localhost:3000/api/whatsapp/routines/previdenciario

# Criar novo
curl -X POST http://localhost:3000/api/whatsapp/routines \
  -H "Content-Type: application/json" \
  -d '{
    "legalArea": "imobiliario",
    "name": "Direito Imobiliário",
    "systemPrompt": "Você é especialista em...",
    "tools": ["transfer_to_human", "search_jurisprudence"]
  }'

# Atualizar system prompt
curl -X PATCH http://localhost:3000/api/whatsapp/routines/previdenciario \
  -H "Content-Type: application/json" \
  -d '{
    "systemPrompt": "Novo system prompt aqui..."
  }'

# Desativar
curl -X DELETE http://localhost:3000/api/whatsapp/routines/previdenciario
```

---

### 4. **Gerenciamento de Fila Humana** ✅

#### GET `/api/whatsapp/human-tickets`
**Arquivo:** `src/app/api/whatsapp/human-tickets/route.ts`
- ✅ Lista tickets com filtros
- ✅ Filtros: status, priority, assignedTo
- ✅ Ordena por prioridade + criação
- ✅ Inclui dados do lead + conversa

**Filtros:**
```bash
# Tickets pendentes
GET /api/whatsapp/human-tickets?status=pending

# Apenas alta prioridade
GET /api/whatsapp/human-tickets?priority=high

# Atribuídos a um atendente
GET /api/whatsapp/human-tickets?assignedTo=user-id
```

#### POST `/api/whatsapp/human-tickets`
- ✅ Cria novo ticket
- ✅ Vincula a conversa
- ✅ Define prioridade
- ✅ Status inicial: "pending"

#### GET `/api/whatsapp/human-tickets/:id`
**Arquivo:** `src/app/api/whatsapp/human-tickets/[id]/route.ts`
- ✅ Obtém ticket completo
- ✅ Inclui histórico de conversa
- ✅ Dados do lead + atendente

#### PATCH `/api/whatsapp/human-tickets/:id`
- ✅ Atribui a atendente
- ✅ Altera status (pending → assigned → in_progress → resolved)
- ✅ Adiciona notas de resolução
- ✅ Auto-marca resolvedAt quando resolved

**Estados do ticket:**
- **pending** — Aguardando atendente
- **assigned** — Atribuído a alguém
- **in_progress** — Sendo atendido
- **resolved** — Concluído
- **cancelled** — Cancelado

#### DELETE `/api/whatsapp/human-tickets/:id`
- ✅ Cancela ticket
- ✅ Marca resolvedAt
- ✅ Status: cancelled

**Exemplo:**
```bash
# Listar pendentes
curl http://localhost:3000/api/whatsapp/human-tickets?status=pending

# Atribuir a mim
curl -X PATCH http://localhost:3000/api/whatsapp/human-tickets/ticket-id \
  -H "Content-Type: application/json" \
  -d '{
    "assignedToAttendantId": "my-user-id",
    "status": "assigned"
  }'

# Resolver com notas
curl -X PATCH http://localhost:3000/api/whatsapp/human-tickets/ticket-id \
  -H "Content-Type: application/json" \
  -d '{
    "status": "resolved",
    "resolutionNotes": "Cliente precisa enviar documentação..."
  }'
```

---

### 5. **Logger Estruturado** ✅

**Arquivo:** `src/lib/logger.ts`
- ✅ Info, Warn, Error, Debug
- ✅ Formato: [timestamp] [LEVEL] message { context }
- ✅ Context estruturado (JSON)
- ✅ Debug condicional (DEBUG=true)

**Exemplo de logs:**
```
[2026-06-03T15:30:00.123Z] [INFO] Webhook recebido { phone: "5585988123456", message: "Olá..." }
[2026-06-03T15:30:01.456Z] [INFO] Novo lead criado { leadId: "clv...", phone: "5585988123456" }
[2026-06-03T15:30:02.789Z] [INFO] Roteiro carregado { legalArea: "previdenciario" }
[2026-06-03T15:30:03.012Z] [INFO] Ticket criado { ticketId: "clv...", reason: "Cliente qualificado" }
```

---

## 🔌 Fluxo Completo (End-to-End)

```
Cliente (WhatsApp)
    ↓
[Z-API / Meta / ManyChat] (escolher uma)
    ↓
Webhook recebe POST
    ↓
Extrai dados (phone, name, message)
    ↓
Busca/cria Lead
    ↓
Busca conversa existente
    ↓
Carrega roteiro (system prompt do BD)
    ↓
Chama Super Agent Python
    ↓
┌─────────────────────────────┐
│ Super Agent processa:       │
│ - System Prompt (do BD)     │
│ - Tools (4 tools)           │
│ - Loop agêntico             │
│ - Histórico preservado      │
└─────────────────────────────┘
    ↓
┌──────────────────────────────┐
│ IA decide:                   │
│ 1. Continuar (end_turn)      │
│ 2. Transferir (tool_use)     │
└──────────────────────────────┘
    ↓
    ├─ Continuar:
    │   └─ Responde ao cliente
    │   └─ Salva conversa
    │   └─ Status: active
    │
    └─ Transferir:
        └─ Cria ticket automático
        └─ Salva conversa
        └─ Status: transferred
        └─ Atendente vê fila
        └─ Continua com histórico intacto
```

---

## 🧪 Como Testar os Webhooks

### Teste 1: Z-API Webhook

```bash
curl -X POST http://localhost:3000/api/webhooks/whatsapp/zapi \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "5585988123456",
    "name": "João Silva",
    "message": "Olá, tenho 68 anos e contribuí 35 anos ao INSS. Posso me aposentar?",
    "timestamp": 1234567890,
    "instanceId": "123456"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "leadId": "clv...",
  "response": "Simular resposta da IA..."
}
```

### Teste 2: Meta Webhook (Validação)

```bash
# Primeiro, validar webhook
curl "http://localhost:3000/api/webhooks/whatsapp/meta?hub.mode=subscribe&hub.challenge=test_challenge&hub.verify_token=your_token"

# Resposta esperada: test_challenge
```

### Teste 3: Listar Roteiros

```bash
curl http://localhost:3000/api/whatsapp/routines
```

**Resposta:**
```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "id": "routine-previdenciario",
      "legalArea": "previdenciario",
      "name": "Direito Previdenciário",
      "active": true,
      "version": 1
    },
    ...
  ]
}
```

### Teste 4: Criar Ticket

```bash
curl -X POST http://localhost:3000/api/whatsapp/human-tickets \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "clv...",
    "leadId": "clv...",
    "reason": "Cliente qualificado para aposentadoria",
    "priority": "high"
  }'
```

### Teste 5: Listar Tickets Pendentes

```bash
curl http://localhost:3000/api/whatsapp/human-tickets?status=pending&priority=high
```

---

## 📊 Status de Fase 3

| Componente | Status |
|-----------|--------|
| Z-API Webhook | ✅ PRONTO |
| Meta Business Webhook | ✅ PRONTO |
| ManyChat Webhook | ✅ PRONTO |
| WhatsApp Service | ✅ PRONTO |
| CRUD Roteiros | ✅ PRONTO |
| Fila Humana API | ✅ PRONTO |
| Logger | ✅ PRONTO |
| Documentação | ✅ PRONTO |

---

## 🚀 Próximas Etapas (Fase 4 — UI)

Agora que os webhooks e APIs estão prontos, próximo passo é criar a UI:

### UI Necessária:
1. **Página: `/ia/roteiros`** — Listar e editar system prompts
2. **Página: `/ia/conversas`** — Ver conversas ativas com histórico
3. **Página: `/ia/atendimento-humano`** — Fila de tickets para atendentes
4. **Componentes:** Forms, dialogs, tabelas, filtros

**Tempo estimado:** 4 horas

---

## 📁 Arquivos Criados (Fase 3)

```
src/
├── app/api/
│   └── webhooks/whatsapp/
│       ├── zapi/route.ts ..................... Webhook Z-API
│       ├── meta/route.ts ..................... Webhook Meta
│       └── manychat/route.ts ................. Webhook ManyChat
│
│   └── whatsapp/
│       ├── routines/
│       │   ├── route.ts ...................... GET/POST roteiros
│       │   └── [id]/route.ts ................. GET/PATCH/DELETE roteiros
│       │
│       └── human-tickets/
│           ├── route.ts ...................... GET/POST tickets
│           └── [id]/route.ts ................. GET/PATCH/DELETE tickets
│
└── lib/
    ├── whatsapp-service.ts ................... Serviço central
    └── logger.ts ............................ Logger estruturado
```

---

## ✅ Checklist Fase 3

- [x] Webhooks Z-API implementado
- [x] Webhook Meta Business implementado
- [x] Webhook ManyChat implementado
- [x] Serviço central (processWhatsAppMessage)
- [x] CRUD de roteiros
- [x] Gerenciamento de fila humana
- [x] Logger estruturado
- [x] Documentação

---

## 🎯 Total de Progresso

| Fase | Tarefa | Status |
|------|--------|--------|
| 1 | Banco de Dados | ✅ COMPLETO (3h) |
| 2 | Backend Python | ✅ COMPLETO (6h) |
| 3 | **Webhooks + API** | ✅ **COMPLETO (3h)** |
| 4 | UI | ⏳ PRÓXIMO (4h) |
| 5 | Testes | ⏳ FINAL (2h) |

**Total completado:** 12/18 horas (67%)  
**Tempo restante:** 6 horas

---

**Próxima ação:** Começar Fase 4 (UI) — Criar páginas de roteiros, conversas e fila humana

🚀 **Bora implementar a UI?**
