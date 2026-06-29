
TEST 1: Criar roteiro
curl -X POST http://localhost:3000/api/whatsapp/roteiros   -H 'Content-Type: application/json'   -d '{
    "name": "Teste Previdenciário",
    "description": "Roteiro de teste",
    "steps": [
      {"pergunta": "Qual seu nome?"},
      {"pergunta": "Qual sua situação?"},
      {"pergunta": "Qual seu CPF?"}
    ]
  }'


TEST 2: Listar roteiros
curl http://localhost:3000/api/whatsapp/roteiros


TEST 3: Iniciar conversa
curl -X POST http://localhost:3000/api/whatsapp/iniciar-roteiro   -H 'Content-Type: application/json'   -d '{
    "conversationId": "conv_123",
    "roteiroId": "<roteiro_id>"
  }'


TEST 4: Responder pergunta
curl -X POST http://localhost:3000/api/whatsapp/responder-pergunta   -H 'Content-Type: application/json'   -d '{
    "conversationId": "conv_123",
    "resposta": "João Silva"
  }'


TEST 5: Ver fila
curl http://localhost:3000/api/whatsapp/fila

