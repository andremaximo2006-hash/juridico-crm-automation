# IA de Atendimento — Arquitetura Técnica

## 1. Visão Geral

Sistema de atendimento automático que:
- ✅ Recebe leads **diretamente do WhatsApp** via integrações Z-API, Meta (Business API), e ManyChat
- ✅ Processa mensagens com **Claude Haiku** (IA jurídica especializada)
- ✅ Responde automaticamente em tempo real
- ✅ Cria/atualiza registros no Kanban de Leads
- ✅ Qualifica o lead automaticamente
- ✅ Integra com CRM para histórico

---

## 2. Fluxo de Dados

```
WhatsApp (Usuário)
    ↓
[Z-API / Meta Business API / ManyChat]
    ↓
[Webhook: POST /api/webhooks/whatsapp]
    ↓
[Extrair: nome, telefone, mensagem, platform_id]
    ↓
[Buscar/Criar Lead no BD]
    ↓
[Enviar para Claude Haiku + contexto jurídico]
    ↓
[IA gera resposta + classifica área jurídica]
    ↓
[Salvar conversação em table: WhatsAppConversation]
    ↓
[Responder via platform (Z-API/Meta/ManyChat)]
    ↓
[Atualizar Stage do Lead (se qualificado)]
```

---

## 3. Tabelas do Banco de Dados

### 3.1 `whatsapp_conversations`
```sql
CREATE TABLE whatsapp_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id),
  platform VARCHAR(50),  -- 'zapi', 'meta', 'manychat'
  platform_contact_id VARCHAR(255),  -- ID único do contato na plataforma
  phone_number VARCHAR(20),
  messages JSONB,  -- Array de mensagens
  legal_area VARCHAR(50),  -- Classificação automática
  qualified BOOLEAN DEFAULT FALSE,
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_conversations_lead ON whatsapp_conversations(lead_id);
CREATE INDEX idx_whatsapp_conversations_platform_contact ON whatsapp_conversations(platform, platform_contact_id);
```

### 3.2 `whatsapp_messages`
```sql
CREATE TABLE whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES whatsapp_conversations(id),
  role VARCHAR(20),  -- 'user', 'assistant'
  content TEXT,
  sender_name VARCHAR(255),
  metadata JSONB,  -- {status: 'sent', media: [...], etc}
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_messages_conversation ON whatsapp_messages(conversation_id);
```

### 3.3 `whatsapp_integrations`
```sql
CREATE TABLE whatsapp_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(50) NOT NULL,  -- 'zapi', 'meta', 'manychat'
  name VARCHAR(255),
  active BOOLEAN DEFAULT TRUE,
  api_key VARCHAR(500),  -- criptografado
  api_secret VARCHAR(500),  -- criptografado
  instance_id VARCHAR(255),  -- para Z-API, número da instância
  phone_number_id VARCHAR(255),  -- para Meta Business API
  manychat_channel_id VARCHAR(255),  -- para ManyChat
  webhook_url TEXT,
  webhook_secret VARCHAR(500),
  settings JSONB,
  last_sync_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 4. Integrações Específicas

### 4.1 Z-API

**Endpoint:** `https://api.z-api.io/`

**Autenticação:** Header `Authorization: Bearer {api_key}`

**Webhooks:**
```bash
POST https://api.z-api.io/instances/{instance_id}/webhook/set

{
  "url": "https://crm.gabriellenunes.com.br/api/webhooks/whatsapp/zapi",
  "events": [
    "MESSAGES_RECEIVED",
    "MESSAGES_SENT",
    "CONTACTS_CHANGED"
  ]
}
```

**Enviar mensagem:**
```bash
curl -X POST https://api.z-api.io/instances/{instance_id}/token/{apiKey}/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "5585988123456",
    "message": "Olá! Como posso ajudar?",
    "phoneRelay": false
  }'
```

### 4.2 Meta Business API (WhatsApp Cloud API)

**Endpoint:** `https://graph.instagram.com/v18.0/`

**Autenticação:** Query param `?access_token={accessToken}`

**Webhooks:**
```bash
POST https://graph.instagram.com/v18.0/{phoneNumberId}/subscribed_apps
  -d '{"subscribed_fields":"messages,message_echoes"}'
```

**Webhook de entrada (callback):**
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "ENTRY_ID",
    "changes": [{
      "field": "messages",
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "phone_number_id": "xxx",
          "display_phone_number": "55 85 98812-3456"
        },
        "messages": [{
          "from": "5585988123456",
          "id": "xxx",
          "timestamp": "1234567890",
          "text": { "body": "Oi tudo bem?" }
        }]
      }
    }]
  }]
}
```

**Enviar mensagem:**
```bash
curl -X POST https://graph.instagram.com/v18.0/{phoneNumberId}/messages \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "5585988123456",
    "type": "text",
    "text": { "preview_url": false, "body": "Olá!" }
  }'
```

### 4.3 ManyChat

**Endpoint:** `https://api.manychat.com/`

**Autenticação:** Header `Authorization: Bearer {accessToken}`

**Webhooks:**
```bash
POST https://api.manychat.com/v1/subscriber/setSubscriberField

{
  "subscriber_id": "xxx",
  "field_name": "webhook_url",
  "field_value": "https://crm.gabriellenunes.com.br/api/webhooks/whatsapp/manychat"
}
```

**Webhook de entrada:**
```json
{
  "event": "message",
  "subscriber": {
    "id": "5085988123456",
    "first_name": "João",
    "last_name": "Silva",
    "phone": "+55 85 98812-3456",
    "avatar": "..."
  },
  "message": {
    "id": "msg_xxx",
    "type": "text",
    "text": "Oi tudo bem?",
    "created_at": 1234567890
  }
}
```

**Enviar mensagem:**
```bash
curl -X POST https://api.manychat.com/v1/subscriber/sendText \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "subscriber_id": "5085988123456",
    "text": "Olá! Como posso ajudar?"
  }'
```

---

## 5. Rotas de API

### 5.1 Webhook para Receber Mensagens

**Endpoints:**
- `POST /api/webhooks/whatsapp/zapi` — Z-API
- `POST /api/webhooks/whatsapp/meta` — Meta Business API
- `POST /api/webhooks/whatsapp/manychat` — ManyChat

**Lógica:**
1. Validar assinatura (webhook_secret)
2. Extrair: phone, name, message, timestamp
3. Buscar lead existente por phone
4. Se não existe → criar novo lead (stage: "initial_screening")
5. Salvar mensagem em `whatsapp_messages`
6. Enviar para Claude Haiku (specializada em direito)
7. Gerar resposta + classificação de área jurídica
8. Responder via plataforma
9. Atualizar `legal_area` do lead
10. Se qualificado → atualizar para stage "meeting"

### 5.2 Enviar Mensagem

**Endpoint:** `POST /api/whatsapp/send`

```json
{
  "lead_id": "uuid",
  "message": "Texto da mensagem",
  "platform": "zapi|meta|manychat"
}
```

### 5.3 Listar Conversas

**Endpoint:** `GET /api/whatsapp/conversations?lead_id=uuid`

```json
{
  "data": [{
    "id": "conv_id",
    "lead_id": "lead_id",
    "platform": "zapi",
    "qualified": true,
    "legal_area": "previdenciario",
    "messages": [
      { "role": "user", "content": "...", "timestamp": "..." },
      { "role": "assistant", "content": "...", "timestamp": "..." }
    ],
    "last_message_at": "2026-06-03T14:30:00Z"
  }]
}
```

### 5.4 Gerenciar Integrações

**Endpoint:** `GET|POST /api/whatsapp/integrations`

```json
{
  "platform": "zapi",
  "name": "Instância Principal",
  "active": true,
  "api_key": "encrypted...",
  "instance_id": "123456",
  "webhook_url": "https://crm.gabriellenunes.com.br/api/webhooks/whatsapp/zapi"
}
```

---

## 6. Prompt para Claude Haiku

```
Você é um assistente jurídico especializado em direito brasileiro.
Você está atendendo um possível cliente via WhatsApp.

CONTEXTO DO CLIENTE:
- Nome: {lead_name}
- Telefone: {phone}
- Primeira mensagem: {message}
- Histórico de conversas: {conversation_history}

INSTRUÇÕES:
1. Responda de forma amigável e profissional
2. Classifique automaticamente a área jurídica (familia, trabalhista, civil, criminal, consumidor, inventario, previdenciario, outro)
3. Se a consulta for fora das especialidades, indique isso
4. Ofereça uma breve orientação inicial
5. Ao final, qualifique o lead (é uma oportunidade real? SIM/NÃO)

RESPONDA COM JSON:
{
  "response": "Texto da resposta para o cliente",
  "legal_area": "area_identificada",
  "qualified": true/false,
  "confidence": 0.85,
  "notes": "Observações internas para o atendente"
}
```

---

## 7. Configuração do CRM

### Página: `/configuracoes/integrações/whatsapp`

- [ ] Adicionar integração Z-API
- [ ] Adicionar integração Meta Business API
- [ ] Adicionar integração ManyChat
- [ ] Configurar webhook URLs
- [ ] Testar conexão
- [ ] Habilitar/desabilitar por plataforma
- [ ] Ver histórico de sincronizações

---

## 8. Status de Implementação

| Componente | Status | Responsável |
|------------|--------|-------------|
| Tabelas do BD | ⏳ Pendente | Dev |
| Z-API Webhook | ⏳ Pendente | Dev |
| Meta Webhook | ⏳ Pendente | Dev |
| ManyChat Webhook | ⏳ Pendente | Dev |
| Claude Haiku Integration | ⏳ Pendente | Dev |
| UI de Configurações | ⏳ Pendente | Dev |
| UI de Conversas | ⏳ Pendente | Dev |
| Testes | ⏳ Pendente | Dev |

---

## 9. Próximos Passos

1. **Criar migrations do Prisma**
   ```bash
   npx prisma migrate dev --name add_whatsapp_integration
   ```

2. **Implementar webhooks** em `/api/webhooks/whatsapp/`

3. **Criar serviço de integração** em `/lib/whatsapp-service.ts`

4. **Implementar UI de conversas** em `/ia/page.tsx`

5. **Testes de integração** com cada plataforma

---

**Última atualização:** 2026-06-03
**Versão:** 1.0 (Arquitetura)
