# 🧪 PHASE 5: Testes End-to-End — EXECUTAR AGORA

**Status:** ✅ Pronto para executar  
**Tempo Estimado:** 2 horas  
**Data:** 2026-06-03 (agora)

---

## 🚀 Step 1: Instalar Dependências Python

```bash
# Entrar na pasta backend
cd /Users/andreluis/juridico-crm-automation/backend

# Criar virtual environment (opcional mas recomendado)
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# ou: venv\Scripts\activate  # Windows

# Instalar dependências
pip install -r requirements.txt
```

**Dependências instaladas:**
- fastapi==0.104.1
- uvicorn==0.24.0
- pydantic==2.5.0
- anthropic==0.7.8
- python-dotenv==1.0.0

---

## 📋 Step 2: Configurar Variáveis de Ambiente

### Backend Python
```bash
# Verificar ANTHROPIC_API_KEY
echo $ANTHROPIC_API_KEY

# Se não estiver set:
export ANTHROPIC_API_KEY="sk-ant-..."
```

### Frontend Next.js
Verificar `.env.local` ou `.env`:
```
PYTHON_BACKEND_URL=http://localhost:8000
DATABASE_URL=postgresql://...
```

---

## ⚙️ Step 3: Iniciar Servidores (3 terminais)

### Terminal 1: Backend Python
```bash
cd /Users/andreluis/juridico-crm-automation/backend
python -m uvicorn app:app --reload --port 8000

# Esperado:
# Uvicorn running on http://0.0.0.0:8000
# Press CTRL+C to quit
```

### Terminal 2: Frontend Next.js
```bash
cd /Users/andreluis/juridico-crm-automation
npm run dev

# Esperado:
# ▲ Next.js 16.0.0
# - Local: http://localhost:3000
```

### Terminal 3: Testes
```bash
cd /Users/andreluis/juridico-crm-automation/backend
python test_integration.py

# Ou executar testes individuais com curl:
curl http://localhost:8000/health
```

---

## 🧪 Step 4: Executar Testes

### Opção A: Script Automático (Recomendado)
```bash
cd /Users/andreluis/juridico-crm-automation/backend
python test_integration.py
```

**O que testa:**
1. ✅ Backend Python health
2. ✅ Frontend Next.js health
3. ✅ Processar mensagem (Super Agent)
4. ✅ Webhook Z-API
5. ✅ Listar roteiros
6. ✅ Listar conversas
7. ✅ Páginas UI carregam

**Esperado:** 7/7 testes PASS

---

### Opção B: Testes Manuais com cURL

#### Teste 1: Backend Health
```bash
curl http://localhost:8000/health
# Response:
# {
#   "status": "healthy",
#   "service": "Super Agent",
#   "api_key_set": true
# }
```

#### Teste 2: Processar Mensagem
```bash
curl -X POST http://localhost:8000/process-message \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "test-001",
    "phone": "5585988123456",
    "message": "Tenho 68 anos e contribuí 35 anos ao INSS",
    "legal_area": "previdenciario",
    "conversation_history": [],
    "system_prompt": null
  }'

# Response deve retornar:
# {
#   "success": true,
#   "response": "...",
#   "status": "continued|transferred_to_human",
#   "reason": "...",
#   "priority": "high|normal|low"
# }
```

#### Teste 3: Webhook Z-API
```bash
curl -X POST http://localhost:3000/api/webhooks/whatsapp/zapi \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "5585988123456",
    "name": "João Silva",
    "message": "Olá, tenho uma dúvida",
    "timestamp": 1685954400,
    "instanceId": "123456"
  }'

# Response esperado:
# {
#   "success": true,
#   "leadId": "...",
#   "response": "..."
# }
```

#### Teste 4: Listar Roteiros
```bash
curl http://localhost:3000/api/whatsapp/routines

# Response esperado:
# {
#   "success": true,
#   "count": 8,
#   "data": [
#     {
#       "id": "...",
#       "legalArea": "previdenciario",
#       "name": "Direito Previdenciário",
#       ...
#     }
#   ]
# }
```

#### Teste 5: Listar Conversas
```bash
curl http://localhost:3000/api/webhooks/whatsapp/conversations

# Response esperado:
# {
#   "success": true,
#   "count": 1,
#   "data": [
#     {
#       "id": "...",
#       "platform": "zapi",
#       "status": "active",
#       "lead": {...}
#     }
#   ]
# }
```

---

## 🎯 Step 5: Validar UI

### Abrir no Browser
Acesse em http://localhost:3000:

1. **Roteiros**: http://localhost:3000/ia/roteiros
   - Validar que lista 8 roteiros
   - Editar um system prompt
   - Clicar Salvar
   - Validar que version incrementa

2. **Conversas**: http://localhost:3000/ia/conversas
   - Validar que conversa aparece (após webhook)
   - Selecionar conversa
   - Ver histórico completo

3. **Atendimento Humano**: http://localhost:3000/ia/atendimento-humano
   - Validar que ticket aparece (se transferido)
   - Atribuir a um atendente
   - Mudar status
   - Resolver ticket

---

## 📊 Checklist Validação

### Backend
- [ ] Python rodando em `localhost:8000`
- [ ] `/health` respondendo
- [ ] `/process-message` processando mensagens
- [ ] Histórico preservado
- [ ] Transfer funcionando

### Frontend
- [ ] Next.js rodando em `localhost:3000`
- [ ] Páginas IA carregando
- [ ] APIs respondendo
- [ ] BD salvando dados

### Webhooks
- [ ] Z-API webhook recebendo
- [ ] Lead criado automaticamente
- [ ] Conversa salva
- [ ] Histórico preservado

### UI
- [ ] Roteiros listados
- [ ] Conversas aparecendo
- [ ] Tickets aparecendo
- [ ] Atribuições funcionando
- [ ] Status mudando

---

## 🔧 Troubleshooting

### Backend não inicia
```bash
# Verificar se porta 8000 está em uso
lsof -i :8000

# Se estiver, matar processo:
kill -9 <PID>

# Ou usar porta diferente:
python -m uvicorn app:app --port 8001
```

### Frontend não conecta com backend
```bash
# Verificar CORS em next.config.ts
# Verificar PYTHON_BACKEND_URL em .env

# Teste direto:
curl http://localhost:8000/health
```

### API Key não funciona
```bash
# Verificar
echo $ANTHROPIC_API_KEY

# Deve retornar: sk-ant-...

# Se não estiver set:
export ANTHROPIC_API_KEY="sk-ant-..."
```

### BD não conecta
```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Deve ser: postgresql://...

# Validar migração:
npx prisma migrate status
npx prisma db push
```

---

## 📝 Resultado Esperado

### Quando os testes passam ✅
```
Resultado: 7/7 testes passaram
✓ Backend Python Health
✓ Frontend Next.js Health
✓ Process Message API
✓ Webhook Z-API
✓ List Routines API
✓ Conversations API
✓ UI Pages

Todos os testes passaram! ✨
```

### Fluxo completo funcionando
```
1. Cliente envia: "Olá, tenho dúvida sobre INSS"
   ↓
2. Webhook Z-API recebe
   ↓
3. Frontend cria Lead + Conversa
   ↓
4. Backend Python processa (Super Agent)
   ↓
5. IA responde ou transfere
   ↓
6. Conversa salva em BD
   ↓
7. Se transferido, ticket criado
   ↓
8. Dados visíveis em /ia/conversas e /ia/atendimento-humano
```

---

## 📊 Dados para Testar

### Lead Teste 1: Previdenciário
```
Phone: 5585988123456
Name: João Silva
Message: "Tenho 68 anos e contribuí 35 anos. Posso aposentar?"
Area: previdenciario
```

### Lead Teste 2: Família
```
Phone: 5585988765432
Name: Maria Santos
Message: "Qual o processo para solicitar pensão?"
Area: familia
```

### Lead Teste 3: Trabalhista
```
Phone: 5585989999999
Name: Pedro Oliveira
Message: "Tenho direito a horas extras?"
Area: trabalhista
```

---

## 🚀 Próximas Ações Após Phase 5

Se todos os testes passarem (7/7):

### Ação 1: Melhorias & Customização (1-2 horas)
- Adicionar mais áreas jurídicas
- Customizar system prompts
- Integrar com Asaas (financeiro)
- Melhorar UI/UX

### Ação 2: Deploy na VPS (30 min - 1 hora)
- Configurar servidor na VPS (2.25.128.221)
- Configurar BD PostgreSQL
- Deploy frontend (Next.js)
- Deploy backend (Python)
- Configurar webhooks reais

### Status Final
- ✅ Phase 5: Testes 100% completo
- ✅ Melhorias implementadas
- ✅ Deploy em produção
- ✨ Aplicação live e funcionando

---

## 📞 Monitoramento

### Ver logs em tempo real

**Backend Python:**
```bash
# Já vê os logs no terminal onde iniciou
# Ou redirecionar:
python -m uvicorn app:app > backend.log 2>&1 &
tail -f backend.log
```

**Frontend Next.js:**
```bash
# Já vê os logs no terminal onde iniciou
# Ou redirecionar:
npm run dev > frontend.log 2>&1 &
tail -f frontend.log
```

**Banco de Dados:**
```bash
# Ver conversas criadas:
npx prisma studio

# Ou direto no psql:
psql $DATABASE_URL
SELECT * FROM whatsapp_conversations;
```

---

## ✅ Conclusão Phase 5

Quando tudo estiver funcionando:

1. ✅ Backend Python → Next.js comunicando
2. ✅ Webhooks recebendo mensagens
3. ✅ Super Agent processando
4. ✅ BD salvando histórico
5. ✅ UI mostrando dados corretamente
6. ✅ Testes 7/7 passando

**→ Pronto para melhorias e deploy!**

---

**Quando terminar este processo, avise para prosseguir com Melhorias + Deploy na VPS.**

