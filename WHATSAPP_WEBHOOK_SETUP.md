# 🔗 Configuração WhatsApp Business Webhook

**Status:** Endpoint criado, aguardando integração com WhatsApp Business API

---

## 📋 Pré-requisitos

1. **Conta Meta/Facebook Business**
2. **WhatsApp Business App** criado
3. **Número WhatsApp Business** para teste
4. **Token de acesso** da Meta
5. **VPS com HTTPS** (obrigatório para webhooks)

---

## 🔧 Configuração do Webhook

### 1. Variáveis de Ambiente

Adicione ao seu `.env.local`:

```env
WHATSAPP_WEBHOOK_TOKEN=seu_token_seguro_aqui
WHATSAPP_WEBHOOK_SIGNATURE=seu_token_de_assinatura
WHATSAPP_BUSINESS_PHONE_ID=12345678910
WHATSAPP_BUSINESS_ACCOUNT_ID=98765432101
WHATSAPP_ACCESS_TOKEN=EAABsZC...
```

### 2. Configurar Webhook no Painel Meta

1. Vá para: **Meta for Developers** → **Apps** → **Seu App WhatsApp**
2. Navegue até: **Configuration** → **Webhooks**
3. **Clique em "Edit"** e configure:

```
Webhook URL: https://crm.gabriellenunes.com.br/api/whatsapp/webhook
Verify Token: seu_token_seguro_aqui
```

4. **Clique em "Verify and Save"**
   - O sistema enviará um GET request para validação
   - O endpoint responderá com o challenge para confirmar

### 3. Inscrever em Eventos

Depois de salvar, inscreva-se nos seguintes eventos:

- ✅ **messages** - Receber mensagens de clientes
- ✅ **message_status** - Rastrear entrega/leitura
- ✅ **message_template_status_update** - Templates
- ✅ **phone_number_status_update** - Status do número

---

## 📨 Formato das Mensagens Recebidas

### Exemplo de Webhook Recebido

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "123456789",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "5585987654321",
              "phone_number_id": "102230129..."
            },
            "contacts": [
              {
                "profile": {
                  "name": "João Silva"
                },
                "wa_id": "558799999999"
              }
            ],
            "messages": [
              {
                "from": "558799999999",
                "id": "wamid.xxx",
                "timestamp": "1672531200",
                "type": "text",
                "text": {
                  "body": "Olá, gostaria de informações sobre..."
                }
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

---

## 🤖 Integração com IA

O endpoint recebe mensagens e você pode integrar com:

1. **Claude IA** - Via Anthropic SDK
2. **Sistema de Scoring** - Qualificar automaticamente
3. **Roteiros** - Executar roteiros pré-configurados
4. **Respostas Automáticas** - Enviar respostas via API

### Exemplo de Processamento

```typescript
// No endpoint /api/whatsapp/webhook

if (type === "text" && textContent) {
  // 1. Buscar roteiro associado
  const roteiro = await prisma.whatsAppRoteiro.findFirst({
    where: { isAtivo: true }
  });

  // 2. Processar com IA
  const resposta = await processarComIA(textContent, roteiro);

  // 3. Enviar resposta via WhatsApp API
  await enviarMensagemWhatsApp(from, resposta);

  // 4. Salvar conversa
  await prisma.whatsAppConversation.create({
    data: { /* ... */ }
  });
}
```

---

## 📞 Enviando Mensagens via API

Para responder mensagens, use:

```bash
curl -X POST \
  https://graph.instagram.com/v18.0/{PHONE_ID}/messages \
  -H "Authorization: Bearer $WHATSAPP_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "558799999999",
    "type": "text",
    "text": {
      "body": "Obrigado por sua mensagem!"
    }
  }'
```

---

## ✅ Checklist de Implementação

- [ ] Endpoint `/api/whatsapp/webhook` criado
- [ ] Variáveis de ambiente configuradas
- [ ] Webhook registrado no painel Meta
- [ ] Eventos inscritos (messages, message_status, etc)
- [ ] HTTPS configurado na VPS
- [ ] Teste de recebimento de mensagem
- [ ] Integração com IA para respostas automáticas
- [ ] Rastreamento de status (entregue, lido)
- [ ] Rate limiting implementado
- [ ] Error handling e retry logic

---

## 🧪 Teste Local

Para testar localmente sem webhooks reais:

```bash
# Simular webhook
curl -X POST http://localhost:3000/api/whatsapp/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "changes": [{
        "field": "messages",
        "value": {
          "messages": [{
            "from": "5585987654321",
            "type": "text",
            "text": { "body": "Olá!" }
          }]
        }
      }]
    }]
  }'
```

---

## 🔒 Segurança

### Verificação de Assinatura

O webhook inclui header `x-hub-signature-256`. Sempre verificar:

```typescript
const signature = req.headers.get("x-hub-signature-256");
const payload = JSON.stringify(req.body);
const expectedSignature = crypto
  .createHmac("sha256", WEBHOOK_SIGNATURE_TOKEN)
  .update(payload)
  .digest("hex");

if (signature !== `sha256=${expectedSignature}`) {
  throw new Error("Invalid signature");
}
```

### Rate Limiting

Implementar rate limiting:

```bash
# Max 10 req/segundo por número de telefone
WHATSAPP_RATE_LIMIT=10
```

---

## 📚 Recursos

- **Meta WhatsApp API Docs:** https://developers.facebook.com/docs/whatsapp/cloud-api
- **Webhook Reference:** https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks
- **Best Practices:** https://developers.facebook.com/docs/whatsapp/cloud-api/support/troubleshooting

---

## 🚀 Próximos Passos

1. **Segunda (30/06):** Testes do endpoint webhook
2. **Terça (01/07):** Integração com IA para respostas automáticas
3. **Quarta (02/07):** Rastreamento de status de mensagens
4. **Quinta (03/07):** Testes E2E completos
5. **Domingo (05/07):** Deploy em produção

---

**Última atualização:** 2026-06-30  
**Status:** 🟢 Endpoint pronto, aguardando setup Meta
