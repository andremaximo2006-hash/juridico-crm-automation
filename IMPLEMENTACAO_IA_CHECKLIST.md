# Checklist de Implementação — IA de Atendimento WhatsApp

## 🎯 Objetivo
Transformar a IA de Atendimento de um simples chat (Claude Haiku) para um **sistema completo de atendimento automático via WhatsApp** que:
- Recebe leads diretamente do WhatsApp
- Integra com Z-API, Meta Business API, ManyChat
- Qualifica automaticamente
- Atualiza o Kanban de Leads em tempo real

---

## 📋 Fases de Implementação

### **FASE 1: Banco de Dados** (1-2 horas)
- [ ] Criar migration Prisma para `whatsapp_conversations`
- [ ] Criar migration Prisma para `whatsapp_messages`
- [ ] Criar migration Prisma para `whatsapp_integrations`
- [ ] Adicionar indexes no BD
- [ ] Atualizar schema.prisma

**Arquivo:** `prisma/migrations/[timestamp]_add_whatsapp.sql`

---

### **FASE 2: Serviços de Integração** (3-4 horas)

#### Z-API
- [ ] `lib/whatsapp/zapi.service.ts` — Cliente Z-API
  - Função: `sendMessage(instanceId, phone, message)`
  - Função: `validateWebhook(signature, payload)`
  - Função: `getContactInfo(phone)`

#### Meta Business API
- [ ] `lib/whatsapp/meta.service.ts` — Cliente Meta
  - Função: `sendMessage(phoneNumberId, to, message)`
  - Função: `validateWebhook(signature, payload)`
  - Função: `markAsRead(messageId)`

#### ManyChat
- [ ] `lib/whatsapp/manychat.service.ts` — Cliente ManyChat
  - Função: `sendMessage(subscriberId, message)`
  - Função: `validateWebhook(signature, payload)`
  - Função: `getSubscriber(subscriberId)`

#### Gerenciador Unificado
- [ ] `lib/whatsapp/manager.ts` — Orquestra todas integrações
  - `async receiveMessage(platform, payload)`
  - `async sendMessage(leadId, message, platform)`
  - `async findOrCreateLead(phone, name, platform)`

---

### **FASE 3: Webhooks** (2-3 horas)

- [ ] `src/app/api/webhooks/whatsapp/route.ts` — Rota unificada
- [ ] `src/app/api/webhooks/whatsapp/zapi/route.ts` — Webhook Z-API
- [ ] `src/app/api/webhooks/whatsapp/meta/route.ts` — Webhook Meta
- [ ] `src/app/api/webhooks/whatsapp/manychat/route.ts` — Webhook ManyChat

**Lógica de cada webhook:**
```
1. Validar assinatura
2. Extrair: phone, name, message, platform_id
3. Buscar/criar lead
4. Chamar Claude Haiku (especializado em direito)
5. Salvar mensagem
6. Responder via plataforma
7. Atualizar legal_area do lead
8. Se qualificado → atualizar stage
```

---

### **FASE 4: Claude Haiku Juridista** (1-2 horas)

- [ ] `lib/claude-juridico.ts` — Wrapper especializado
  - Função: `analyzeConsultation(message, conversationHistory)`
  - Retorna: `{ response, legal_area, qualified, confidence, notes }`
  - Usa system prompt jurídico customizado

**System Prompt:**
```
Você é um assistente jurídico especializado em direito brasileiro.
Você atende pessoas que buscam orientação jurídica via WhatsApp.
Seja amigável, profissional e eficiente.

Ao responder:
1. Classifique a área jurídica automaticamente
2. Ofereça orientação inicial prática
3. Qualifique o cliente (é uma oportunidade real?)
4. Responda em JSON com: { response, legal_area, qualified, confidence }
```

---

### **FASE 5: Rotas de API** (2-3 horas)

#### GET /api/whatsapp/conversations
```
Retorna todas as conversas de um lead
Query: ?lead_id=uuid
Response: { data: [...], total, page }
```

#### POST /api/whatsapp/send
```
Envia mensagem para um cliente via WhatsApp
Body: { lead_id, message, platform? }
Response: { success, message_id, platform }
```

#### GET /api/whatsapp/integrations
```
Lista integrações configuradas
Response: { data: [...] }
```

#### POST /api/whatsapp/integrations
```
Adiciona nova integração
Body: { platform, api_key, instance_id?, ... }
Response: { success, integration_id, test_result }
```

#### POST /api/whatsapp/integrations/{id}/test
```
Testa conexão com plataforma
Response: { connected: true, message: "Conexão OK" }
```

---

### **FASE 6: UI de Conversas** (2-3 horas)

- [ ] Refatorar `/app/ia/page.tsx`
  - [ ] Adicionar filtro por plataforma (Z-API, Meta, ManyChat)
  - [ ] Mostrar badge de plataforma
  - [ ] Mostrar legal_area identificada
  - [ ] Mostrar score de qualificação
  - [ ] Botão: "Qualificar" / "Desqualificar"

- [ ] Criar componente `<WhatsAppMessage />`
  - Mostrar avatar + nome
  - Status de entrega (enviado, lido, etc)
  - Timestamp formatado
  - Indicador de plataforma

---

### **FASE 7: UI de Configurações** (2-3 horas)

**Página: `/configuracoes/integrações/whatsapp`**

- [ ] Seção: Z-API
  - Campo: Instance ID
  - Campo: API Key (input senha)
  - Botão: Conectar
  - Botão: Testar

- [ ] Seção: Meta Business API
  - Campo: Phone Number ID
  - Campo: Access Token (input senha)
  - Botão: Conectar
  - Botão: Testar

- [ ] Seção: ManyChat
  - Campo: Channel ID
  - Campo: Access Token (input senha)
  - Botão: Conectar
  - Botão: Testar

- [ ] Tabela: Integrações Ativas
  - Coluna: Platform
  - Coluna: Status (Verde ✓ / Vermelho ✗)
  - Coluna: Último sync
  - Ação: Desabilitar / Remover

---

### **FASE 8: Testes** (3-4 horas)

#### Testes Unitários
- [ ] Z-API: validação de webhook
- [ ] Meta: validação de webhook
- [ ] ManyChat: validação de webhook
- [ ] Claude Juridico: análise de consultas

#### Testes de Integração
- [ ] Receber mensagem → Salvar no BD ✓
- [ ] Chamar Claude → Obter resposta ✓
- [ ] Responder via plataforma ✓
- [ ] Atualizar lead no Kanban ✓

#### Teste Manual (em Produção)
- [ ] Enviar mensagem via Z-API WhatsApp
- [ ] Enviar mensagem via Meta WhatsApp
- [ ] Enviar mensagem via ManyChat WhatsApp
- [ ] Verificar se chegou resposta
- [ ] Verificar se criou/atualizou lead

---

## 📊 Timeline Estimado

| Fase | Horas | Data |
|------|-------|------|
| 1. Banco de Dados | 2 | 03/06 |
| 2. Serviços | 4 | 03-04/06 |
| 3. Webhooks | 3 | 04/06 |
| 4. Claude | 2 | 04/06 |
| 5. APIs | 3 | 05/06 |
| 6. UI Conversas | 3 | 05/06 |
| 7. UI Config | 3 | 06/06 |
| 8. Testes | 4 | 06-07/06 |
| **TOTAL** | **24 horas** | **7/06** |

---

## 🚀 Como Começar

### Passo 1: Review da Documentação
Leia completamente: `IA_ATENDIMENTO_ARQUITETURA.md`

### Passo 2: Criar Schema no Prisma
```bash
# Adicione ao prisma/schema.prisma:
model WhatsAppConversation { ... }
model WhatsAppMessage { ... }
model WhatsAppIntegration { ... }

# Rode a migration:
npx prisma migrate dev --name add_whatsapp_integration
```

### Passo 3: Implementar Serviços
Comece por `lib/whatsapp/` services

### Passo 4: Implementar Webhooks
Crie as rotas em `src/app/api/webhooks/whatsapp/`

### Passo 5: Testar com Postman
Simule webhooks usando payloads reais de cada plataforma

### Passo 6: Integrar UI
Atualize `/app/ia/page.tsx` e crie `/configuracoes/integrações/whatsapp`

---

## ⚠️ Considerações Importantes

1. **Segurança**
   - Criptografar API keys no BD (usar `lib/encryption.ts`)
   - Validar webhooks (verificar assinatura)
   - Rate limiting nos webhooks

2. **Performance**
   - Cache de leads recentes
   - Fila de mensagens (Redis/Bull.js) para grandes volumes
   - Async/await para não bloquear

3. **Observabilidade**
   - Log cada integração (entrada/saída)
   - Metrics: mensagens recebidas/respondidas/erros
   - Alertas para falhas de integração

4. **Compliance**
   - LGPD: política de dados pessoais
   - Auditoria: quem respondi o quê

---

## ✅ Checklist Final

Antes de considerar pronto:
- [ ] Todas as 3 plataformas funcionando
- [ ] Claude Haiku respondendo corretamente
- [ ] Leads sendo criados/atualizados automaticamente
- [ ] Stage do Kanban mudando quando qualificado
- [ ] Testes automáticos passando
- [ ] Documentação do usuário criada
- [ ] Deploy para produção bem-sucedido

---

**Criado:** 2026-06-03
**Status:** Arquitetura Definida — Pronto para Implementação
