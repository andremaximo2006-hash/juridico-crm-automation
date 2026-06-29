#!/bin/bash

echo "🧪 TESTE E2E - FLUXO COMPLETO"
echo "===================================="
echo ""

SERVER="http://localhost:3000"

# PASSO 1: Criar roteiro
echo "PASSO 1: Criando roteiro..."
ROTEIRO=$(curl -s -X POST $SERVER/api/whatsapp/roteiros \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Teste E2E",
    "description": "Roteiro de teste end-to-end",
    "steps": [
      {"pergunta": "Qual seu nome?"},
      {"pergunta": "Qual sua situação?"},
      {"pergunta": "Qual seu CPF?"}
    ]
  }' | jq '.id' -r)

if [ -z "$ROTEIRO" ]; then
  echo "❌ Erro ao criar roteiro"
  exit 1
fi

echo "✅ Roteiro criado: $ROTEIRO"
echo ""

# PASSO 2: Iniciar conversa
echo "PASSO 2: Iniciando conversa..."
CONV_ID="conv_e2e_$(date +%s)"
CONVERSA=$(curl -s -X POST $SERVER/api/whatsapp/iniciar-roteiro \
  -H 'Content-Type: application/json' \
  -d "{\"conversationId\": \"$CONV_ID\", \"roteiroId\": \"$ROTEIRO\"}" | jq '.pergunta' -r)

echo "✅ Conversa iniciada"
echo "Primeira pergunta: $CONVERSA"
echo ""

# PASSO 3: Responder pergunta 1
echo "PASSO 3: Respondendo pergunta 1..."
curl -s -X POST $SERVER/api/whatsapp/responder-pergunta \
  -H 'Content-Type: application/json' \
  -d "{\"conversationId\": \"$CONV_ID\", \"resposta\": \"João Silva\"}" > /dev/null

echo "✅ Resposta 1 enviada"
echo ""

# PASSO 4: Responder pergunta 2
echo "PASSO 4: Respondendo pergunta 2..."
curl -s -X POST $SERVER/api/whatsapp/responder-pergunta \
  -H 'Content-Type: application/json' \
  -d "{\"conversationId\": \"$CONV_ID\", \"resposta\": \"Aposentadoria\"}" > /dev/null

echo "✅ Resposta 2 enviada"
echo ""

# PASSO 5: Responder pergunta 3 (CPF)
echo "PASSO 5: Respondendo pergunta 3 (CPF)..."
RESULTADO=$(curl -s -X POST $SERVER/api/whatsapp/responder-pergunta \
  -H 'Content-Type: application/json' \
  -d "{\"conversationId\": \"$CONV_ID\", \"resposta\": \"123.456.789-00\"}" | jq '.')

echo "✅ Teste E2E concluído!"
echo ""
echo "RESULTADO:"
echo $RESULTADO | jq '.'
echo ""

# PASSO 6: Verificar fila
echo "PASSO 6: Verificando fila..."
FILA=$(curl -s $SERVER/api/whatsapp/fila | jq 'length')
echo "✅ Leads na fila: $FILA"

echo ""
echo "===================================="
echo "✅ TESTE E2E COMPLETO"
echo "===================================="
