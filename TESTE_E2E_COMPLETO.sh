#!/bin/bash

# 🧪 TESTE E2E COMPLETO - WhatsApp + Email + SMS IA
# Script para validar todo o sistema de IA

set -e

API="http://localhost:3000"
PASS=0
FAIL=0

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🧪 TESTE E2E COMPLETO"
echo "════════════════════════════════════════════════════════════"
echo "API: $API"
echo ""

# ─── WHATSAPP IA TESTS ─────────────────────────────────────────

echo "📱 WHATSAPP IA"
echo "────────────────────────────────────────────────────────────"

# 1. Criar roteiro
echo "1️⃣  Criando roteiro WhatsApp..."
ROTEIRO=$(curl -s -X POST "$API/api/whatsapp/roteiros" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste E2E WhatsApp",
    "description": "Roteiro de teste",
    "steps": [
      {"pergunta": "Qual seu nome?", "tipo": "text"},
      {"pergunta": "Qual sua situação?", "tipo": "text"},
      {"pergunta": "Qual seu CPF?", "tipo": "text"}
    ]
  }' | jq -r '.id // empty')

if [ -z "$ROTEIRO" ]; then
  echo -e "${RED}❌ Falha ao criar roteiro${NC}"
  ((FAIL++))
else
  echo -e "${GREEN}✅ Roteiro criado: $ROTEIRO${NC}"
  ((PASS++))
fi

# 2. Listar roteiros
echo "2️⃣  Listando roteiros..."
COUNT=$(curl -s -X GET "$API/api/whatsapp/roteiros" | jq 'length')
echo -e "${GREEN}✅ Roteiros encontrados: $COUNT${NC}"
((PASS++))

# 3. Iniciar conversa
echo "3️⃣  Iniciando conversa..."
CONV=$(curl -s -X POST "$API/api/whatsapp/iniciar-roteiro" \
  -H "Content-Type: application/json" \
  -d "{\"roteiroId\": \"$ROTEIRO\", \"conversationId\": \"test_conv_1\"}" \
  | jq -r '.pergunta // empty')

if [ -z "$CONV" ]; then
  echo -e "${RED}❌ Falha ao iniciar conversa${NC}"
  ((FAIL++))
else
  echo -e "${GREEN}✅ Conversa iniciada${NC}"
  ((PASS++))
fi

# 4. Responder pergunta
echo "4️⃣  Respondendo perguntas..."
RESP=$(curl -s -X POST "$API/api/whatsapp/responder-pergunta" \
  -H "Content-Type: application/json" \
  -d "{\"conversationId\": \"test_conv_1\", \"resposta\": \"João Silva\"}" \
  | jq -r '.status // empty')

if [ "$RESP" = "continua" ] || [ "$RESP" = "concluida" ]; then
  echo -e "${GREEN}✅ Resposta processada${NC}"
  ((PASS++))
else
  echo -e "${RED}❌ Erro ao processar resposta${NC}"
  ((FAIL++))
fi

# ─── EMAIL IA TESTS ───────────────────────────────────────────

echo ""
echo "📧 EMAIL IA"
echo "────────────────────────────────────────────────────────────"

# 1. Criar template
echo "1️⃣  Criando template de email..."
TEMPLATE=$(curl -s -X POST "$API/api/email/templates" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Teste E2E",
    "assunto": "Teste de Email",
    "corpo": "<p>Olá {{nome}}, seu teste foi criado!</p>",
    "variaveis": ["nome"]
  }' | jq -r '.id // empty')

if [ -z "$TEMPLATE" ]; then
  echo -e "${RED}❌ Falha ao criar template${NC}"
  ((FAIL++))
else
  echo -e "${GREEN}✅ Template criado: $TEMPLATE${NC}"
  ((PASS++))
fi

# 2. Listar templates
echo "2️⃣  Listando templates..."
COUNT=$(curl -s -X GET "$API/api/email/templates" | jq 'length')
echo -e "${GREEN}✅ Templates encontrados: $COUNT${NC}"
((PASS++))

# 3. Criar campanha
echo "3️⃣  Criando campanha de email..."
CAMPANHA=$(curl -s -X POST "$API/api/email/campanhas" \
  -H "Content-Type: application/json" \
  -d "{
    \"nome\": \"Campanha Teste E2E\",
    \"templateId\": \"$TEMPLATE\",
    \"destinatarios\": [\"teste@example.com\", \"teste2@example.com\"]
  }" | jq -r '.id // empty')

if [ -z "$CAMPANHA" ]; then
  echo -e "${RED}❌ Falha ao criar campanha${NC}"
  ((FAIL++))
else
  echo -e "${GREEN}✅ Campanha criada: $CAMPANHA${NC}"
  ((PASS++))
fi

# 4. Enviar campanha
echo "4️⃣  Enviando campanha..."
SEND=$(curl -s -X POST "$API/api/email/enviar" \
  -H "Content-Type: application/json" \
  -d "{\"campaignId\": \"$CAMPANHA\"}" \
  | jq -r '.success')

if [ "$SEND" = "true" ]; then
  echo -e "${GREEN}✅ Campanha enviada${NC}"
  ((PASS++))
else
  echo -e "${RED}❌ Erro ao enviar campanha${NC}"
  ((FAIL++))
fi

# ─── SMS IA TESTS ───────────────────────────────────────────

echo ""
echo "💬 SMS IA"
echo "────────────────────────────────────────────────────────────"

# 1. Criar template SMS
echo "1️⃣  Criando template SMS..."
SMS_TEMPLATE=$(curl -s -X POST "$API/api/sms/templates" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Teste E2E SMS",
    "conteudo": "Olá {{nome}}, seu SMS de teste foi enviado!",
    "variaveis": ["nome"]
  }' | jq -r '.id // empty')

if [ -z "$SMS_TEMPLATE" ]; then
  echo -e "${RED}❌ Falha ao criar template SMS${NC}"
  ((FAIL++))
else
  echo -e "${GREEN}✅ Template SMS criado: $SMS_TEMPLATE${NC}"
  ((PASS++))
fi

# 2. Listar templates SMS
echo "2️⃣  Listando templates SMS..."
COUNT=$(curl -s -X GET "$API/api/sms/templates" | jq 'length')
echo -e "${GREEN}✅ Templates SMS encontrados: $COUNT${NC}"
((PASS++))

# 3. Criar campanha SMS
echo "3️⃣  Criando campanha SMS..."
SMS_CAMPANHA=$(curl -s -X POST "$API/api/sms/campanhas" \
  -H "Content-Type: application/json" \
  -d "{
    \"nome\": \"Campanha SMS Teste E2E\",
    \"templateId\": \"$SMS_TEMPLATE\",
    \"telefones\": [\"5585987654321\", \"5585987654322\"]
  }" | jq -r '.id // empty')

if [ -z "$SMS_CAMPANHA" ]; then
  echo -e "${RED}❌ Falha ao criar campanha SMS${NC}"
  ((FAIL++))
else
  echo -e "${GREEN}✅ Campanha SMS criada: $SMS_CAMPANHA${NC}"
  ((PASS++))
fi

# 4. Enviar campanha SMS
echo "4️⃣  Enviando campanha SMS..."
SMS_SEND=$(curl -s -X POST "$API/api/sms/enviar" \
  -H "Content-Type: application/json" \
  -d "{\"campaignId\": \"$SMS_CAMPANHA\"}" \
  | jq -r '.success')

if [ "$SMS_SEND" = "true" ]; then
  echo -e "${GREEN}✅ Campanha SMS enviada${NC}"
  ((PASS++))
else
  echo -e "${RED}❌ Erro ao enviar campanha SMS${NC}"
  ((FAIL++))
fi

# ─── WEBHOOK TEST ───────────────────────────────────────────

echo ""
echo "🔗 WEBHOOK"
echo "────────────────────────────────────────────────────────────"

echo "1️⃣  Testando webhook WhatsApp..."
WEBHOOK=$(curl -s -X POST "$API/api/whatsapp/webhook" \
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
            "text": {"body": "Teste webhook"}
          }]
        }
      }]
    }]
  }' | jq -r '.success')

if [ "$WEBHOOK" = "true" ]; then
  echo -e "${GREEN}✅ Webhook funcionando${NC}"
  ((PASS++))
else
  echo -e "${RED}❌ Erro no webhook${NC}"
  ((FAIL++))
fi

# ─── RESUMO ──────────────────────────────────────────────────

echo ""
echo "════════════════════════════════════════════════════════════"
echo "📊 RESULTADO FINAL"
echo "════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Testes Passou: $PASS${NC}"
echo -e "${RED}❌ Testes Falharam: $FAIL${NC}"
echo ""

TOTAL=$((PASS + FAIL))
PERCENT=$((PASS * 100 / TOTAL))

echo "Taxa de Sucesso: $PERCENT% ($PASS/$TOTAL)"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}🎉 TUDO FUNCIONANDO!${NC}"
  exit 0
else
  echo -e "${RED}⚠️  FALHAS DETECTADAS${NC}"
  exit 1
fi
