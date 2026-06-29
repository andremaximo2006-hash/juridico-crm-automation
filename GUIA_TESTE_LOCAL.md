# 📖 GUIA DE TESTE - SANDBOX LOCAL

## ✅ Pré-requisitos

```bash
npm run dev          # Terminal 1: Iniciar servidor Next.js
```

Servidor roda em: `http://localhost:3000`

## 🧪 TESTE 1: Via Curl (API)

### 1. Criar roteiro

```bash
curl -X POST http://localhost:3000/api/whatsapp/roteiros \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Local",
    "description": "Meu roteiro de teste",
    "steps": [
      {"pergunta": "Qual seu nome?"},
      {"pergunta": "Qual sua situação?"},
      {"pergunta": "Qual seu CPF?"}
    ]
  }'
```

Copie o `id` retornado.

### 2. Listar roteiros

```bash
curl http://localhost:3000/api/whatsapp/roteiros | jq .
```

### 3. Iniciar conversa

```bash
curl -X POST http://localhost:3000/api/whatsapp/iniciar-roteiro \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "conv_test_123",
    "roteiroId": "<copie-o-id-acima>"
  }'
```

### 4. Responder perguntas

```bash
# Pergunta 1: Nome
curl -X POST http://localhost:3000/api/whatsapp/responder-pergunta \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "conv_test_123",
    "resposta": "João Silva"
  }'

# Pergunta 2: Situação
curl -X POST http://localhost:3000/api/whatsapp/responder-pergunta \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "conv_test_123",
    "resposta": "Aposentadoria"
  }'

# Pergunta 3: CPF (vai finalizar)
curl -X POST http://localhost:3000/api/whatsapp/responder-pergunta \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "conv_test_123",
    "resposta": "123.456.789-00"
  }'
```

Resultado terá: score, viabilidade, mensagem

### 5. Ver fila

```bash
curl http://localhost:3000/api/whatsapp/fila | jq .
```

## 🌐 TESTE 2: Via UI (Browser)

1. Abra: `http://localhost:3000/ia/whatsapp/roteiros`
2. Clique: "+ Novo Roteiro"
3. Preencha nome e perguntas
4. Clique: "Criar Roteiro"
5. Clique: "Testar"
6. Responda as perguntas
7. Veja resultado do scoring

## 📊 TESTE 3: Fluxo Completo (Script)

```bash
chmod +x TESTE_FLUXO_COMPLETO.sh
./TESTE_FLUXO_COMPLETO.sh
```

Vai criar roteiro, fazer conversa e mostrar score automaticamente.

## ✅ O que você testou

- ✅ Criar roteiros com N perguntas
- ✅ Iniciar conversas
- ✅ Responder perguntas sequencialmente
- ✅ Scoring automático (0-100)
- ✅ Qualificação (viável/inviável)
- ✅ Fila de qualificação
- ✅ Persistência em banco de dados

## 🐛 Troubleshooting

**Erro: "Cannot POST /api/whatsapp/roteiros"**
→ Verificar se servidor está rodando: `npm run dev`

**Erro: "Cannot find roteiro"**
→ Usar o `id` correto do roteiro criado

**Erro: "Unauthorized"**
→ Implementar middleware de auth / remover validação de teste

## 🚀 Próximo

Amanhã (Terça): Deploy na VPS com endpoints de produção!
