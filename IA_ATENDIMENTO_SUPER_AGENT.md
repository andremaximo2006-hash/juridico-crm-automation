# IA de Atendimento — Super Agent Configurável + Handoff Humano

## 1. Visão Geral

Sistema de atendimento automático **baseado no padrão do Super Agent**, com:
- ✅ **System Prompt configurável** (armazenado no BD, editável via UI)
- ✅ **Roteiros editáveis** por área jurídica
- ✅ **Tool de transferência para humano** (com histórico preservado)
- ✅ **Integração com WhatsApp** (Z-API, Meta, ManyChat)
- ✅ **Loop agêntico** idêntico ao Super Agent

---

## 2. Arquitetura — 4 Camadas (padrão Super Agent)

### CAMADA 1 — SYSTEM PROMPT (CONFIGURÁVEL)

**Antes:** Hardcoded no código Python
**Agora:** Armazenado em `whatsapp_routines` no BD

```sql
CREATE TABLE whatsapp_routines (
  id UUID PRIMARY KEY,
  legal_area VARCHAR(50),  -- familia, trabalhista, civil, etc
  system_prompt TEXT,      -- System Prompt da IA
  tools JSONB,             -- Tools customizadas
  active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  created_by UUID REFERENCES users(id)
);
```

**Exemplo de System Prompt:**
```
Você é um assistente jurídico especializado em Direito Previdenciário.
Seu objetivo é:
1. Entender a situação do cliente
2. Oferecer orientação inicial
3. Qualificar se é um caso de BPC/LOAS, Aposentadoria, etc
4. Se qualificado, transferir para atendimento humano

Sempre seja amigável, profissional e concisos.
```

### CAMADA 2 — TOOLS (Tools Padrão + Handoff)

Tools disponíveis:
1. `search_jurisprudence` — Busca jurisprudência (Serper API)
2. `check_requirements` — Verifica requisitos do caso
3. `transfer_to_human` — **TRANSFERE PARA HUMANO** ⭐
4. `save_to_memory` — Salva no histórico da conversa
5. `classify_area` — Classifica área jurídica

**Tool crítica: `transfer_to_human`**
```json
{
  "name": "transfer_to_human",
  "description": "Use quando o cliente for qualificado, ou quando precisar de atendimento humano especializado. Pausa a IA e transfere para fila de atendentes.",
  "input_schema": {
    "type": "object",
    "properties": {
      "reason": {
        "type": "string",
        "description": "Motivo da transferência (ex: 'Cliente qualificado para BPC', 'Dúvida fora do escopo')"
      },
      "priority": {
        "type": "string",
        "enum": ["low", "normal", "high"],
        "description": "Prioridade do atendimento humano"
      }
    },
    "required": ["reason", "priority"]
  }
}
```

### CAMADA 3 — LOOP AGÊNTICO

```python
def run_agent_conversation(
    lead_id: str,
    user_message: str,
    conversation_history: list,
    legal_area: str
) -> tuple[str, list, str]:
    """
    Retorna: (resposta, histórico_atualizado, status)
    Status: 'continued' | 'transferred_to_human'
    """
    
    # Buscar roteiro configurado
    routine = db.query("SELECT * FROM whatsapp_routines WHERE legal_area = ?", legal_area)
    system_prompt = routine['system_prompt']
    tools = json.loads(routine['tools'])
    
    conversation_history.append({"role": "user", "content": user_message})
    
    while True:
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=4096,
            system=system_prompt,
            tools=tools,
            messages=conversation_history
        )
        
        if response.stop_reason == "tool_use":
            # IA quer usar uma tool
            conversation_history.append({"role": "assistant", "content": response.content})
            tool_results = []
            
            for block in response.content:
                if block.type == "tool_use":
                    # ⭐ TRANSFERÊNCIA PARA HUMANO
                    if block.name == "transfer_to_human":
                        reason = block.input.get("reason")
                        priority = block.input.get("priority", "normal")
                        
                        # Criar ticket de atendimento humano
                        ticket = create_human_ticket(
                            lead_id=lead_id,
                            reason=reason,
                            priority=priority,
                            conversation_history=conversation_history,
                            transferred_by="IA"
                        )
                        
                        # Notificar atendente
                        notify_attendant(ticket)
                        
                        return (
                            f"Transferindo para atendimento humano...\n{reason}",
                            conversation_history,
                            "transferred_to_human"
                        )
                    
                    # Executar outras tools
                    result = execute_tool(block.name, block.input)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": str(result)
                    })
            
            conversation_history.append({"role": "user", "content": tool_results})
            continue
        
        # end_turn
        final_text = "".join(b.text for b in response.content if hasattr(b, "text"))
        conversation_history.append({"role": "assistant", "content": final_text})
        
        return final_text, conversation_history, "continued"
```

### CAMADA 4 — HISTÓRICO (Persistido no BD)

```sql
CREATE TABLE whatsapp_conversations (
  id UUID PRIMARY KEY,
  lead_id UUID REFERENCES leads(id),
  platform VARCHAR(50),  -- 'zapi', 'meta', 'manychat'
  legal_area VARCHAR(50),
  conversation_history JSONB,  -- [{"role": "user/assistant", "content": "..."}]
  status VARCHAR(50),          -- 'active', 'transferred_to_human', 'completed'
  transferred_to_human_at TIMESTAMP,
  transferred_to_attendant_id UUID REFERENCES users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 3. Tabelas do Banco de Dados

### 3.1 `whatsapp_routines` (Roteiros Editáveis)

```sql
CREATE TABLE whatsapp_routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_area VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255),
  system_prompt TEXT NOT NULL,
  tools JSONB,
  active BOOLEAN DEFAULT TRUE,
  version INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  created_by_name VARCHAR(255)
);

CREATE INDEX idx_routines_legal_area ON whatsapp_routines(legal_area);
CREATE INDEX idx_routines_active ON whatsapp_routines(active);
```

### 3.2 `whatsapp_conversations` (Conversas)

```sql
CREATE TABLE whatsapp_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id),
  platform VARCHAR(50),  -- 'zapi', 'meta', 'manychat'
  platform_contact_id VARCHAR(255),
  phone_number VARCHAR(20),
  legal_area VARCHAR(50),
  conversation_history JSONB,
  status VARCHAR(50) DEFAULT 'active',  -- 'active', 'transferred', 'completed', 'closed'
  transferred_to_human_at TIMESTAMP,
  transferred_to_attendant_id UUID REFERENCES users(id),
  attendant_notes TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conversations_lead ON whatsapp_conversations(lead_id);
CREATE INDEX idx_conversations_status ON whatsapp_conversations(status);
CREATE INDEX idx_conversations_transferred ON whatsapp_conversations(transferred_to_attendant_id);
```

### 3.3 `whatsapp_human_tickets` (Fila de Atendimento Humano)

```sql
CREATE TABLE whatsapp_human_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES whatsapp_conversations(id),
  lead_id UUID NOT NULL REFERENCES leads(id),
  reason TEXT,
  priority VARCHAR(50) DEFAULT 'normal',  -- 'low', 'normal', 'high'
  status VARCHAR(50) DEFAULT 'pending',   -- 'pending', 'assigned', 'in_progress', 'resolved', 'cancelled'
  assigned_to_attendant_id UUID REFERENCES users(id),
  assigned_at TIMESTAMP,
  resolved_at TIMESTAMP,
  resolution_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tickets_status ON whatsapp_human_tickets(status);
CREATE INDEX idx_tickets_assigned_to ON whatsapp_human_tickets(assigned_to_attendant_id);
CREATE INDEX idx_tickets_priority ON whatsapp_human_tickets(priority);
```

### 3.4 `whatsapp_integrations` (Configurações de Integrações)

```sql
CREATE TABLE whatsapp_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(50) NOT NULL,  -- 'zapi', 'meta', 'manychat'
  name VARCHAR(255),
  active BOOLEAN DEFAULT TRUE,
  api_key VARCHAR(500),  -- criptografado
  api_secret VARCHAR(500),
  instance_id VARCHAR(255),
  phone_number_id VARCHAR(255),
  channel_id VARCHAR(255),
  webhook_url TEXT,
  webhook_secret VARCHAR(500),
  settings JSONB,
  last_sync_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 4. Rotas de API

### 4.1 Webhook para Receber Mensagens

**POST `/api/webhooks/whatsapp/{platform}`**

```python
@app.post("/api/webhooks/whatsapp/{platform}")
async def receive_whatsapp_message(platform: str, payload: dict):
    # 1. Validar assinatura
    # 2. Extrair: phone, name, message
    # 3. Buscar/criar lead
    # 4. Buscar legal_area do lead
    # 5. Carregar roteiro da IA
    # 6. Chamar run_agent_conversation()
    # 7. Se status == "transferred_to_human":
    #    - Notificar atendentes
    #    - Colocar na fila
    # 8. Responder via plataforma
    # 9. Salvar conversa no BD
```

### 4.2 Enviar Mensagem

**POST `/api/whatsapp/send`**

```json
{
  "conversation_id": "uuid",
  "message": "texto",
  "from": "ia" | "human"
}
```

### 4.3 Listar Conversas da IA

**GET `/api/whatsapp/conversations?status=active|transferred|completed`**

### 4.4 Configurar Roteiros (CRUD)

**GET `/api/whatsapp/routines`** — Listar roteiros

**GET `/api/whatsapp/routines/{legal_area}`** — Ver roteiro

**POST `/api/whatsapp/routines`** — Criar roteiro
```json
{
  "legal_area": "previdenciario",
  "name": "Roteiro - Direito Previdenciário",
  "system_prompt": "Você é um assistante...",
  "tools": [...],
  "active": true
}
```

**PATCH `/api/whatsapp/routines/{id}`** — Editar roteiro

**DELETE `/api/whatsapp/routines/{id}`** — Desativar roteiro

### 4.5 Fila de Atendimento Humano

**GET `/api/whatsapp/human-tickets?status=pending`** — Ver tickets pendentes

**PATCH `/api/whatsapp/human-tickets/{id}`** — Atualizar ticket
```json
{
  "assigned_to_attendant_id": "uuid",
  "status": "in_progress",
  "notes": "Cliente precisa documentação..."
}
```

### 4.6 Configurar Integrações

**GET `/api/whatsapp/integrations`** — Listar integrações

**POST `/api/whatsapp/integrations`** — Adicionar integração
```json
{
  "platform": "zapi",
  "name": "Z-API Instância 1",
  "api_key": "xxx",
  "instance_id": "123456"
}
```

**POST `/api/whatsapp/integrations/{id}/test`** — Testar conexão

---

## 5. UI — Componentes Necessários

### 5.1 Página: `/ia/conversas` (Conversas Ativas)

- [ ] Lista de conversas por status (Ativa, Transferida, Concluída)
- [ ] Filtro por área jurídica
- [ ] Filtro por plataforma (Z-API, Meta, ManyChat)
- [ ] Painel de conversa com histórico completo
- [ ] Botão: "Pausar IA e Continuar Manualmente" (usa tool `transfer_to_human`)
- [ ] Indicador visual: quando IA está processando vs aguardando

### 5.2 Página: `/ia/configuracoes/roteiros` (Editar Roteiros)

- [ ] Lista de roteiros por área jurídica
- [ ] Editor de System Prompt (textarea grande)
- [ ] Seletor de Tools (checkboxes)
- [ ] Botões: Salvar, Histórico de Versões, Reverter
- [ ] Preview: "Como a IA responderá?" (testar prompt)
- [ ] Auditoria: quem criou/editou, quando

### 5.3 Página: `/ia/atendimento-humano` (Fila de Humanos)

- [ ] Tabela de tickets: Lead, Motivo, Prioridade, Status, Atendente
- [ ] Filtros: Status (Pendente, Atribuído, Em Progresso), Prioridade
- [ ] Ações: Atribuir a mim, Resolver, Adicionar notas
- [ ] Chat dentro do ticket para continuar conversa com cliente

### 5.4 Página: `/configuracoes/integrações/whatsapp` (Setup de Plataformas)

- [ ] Abas: Z-API, Meta Business API, ManyChat
- [ ] Campos: API Key, Instance ID, etc
- [ ] Botão: Conectar, Testar, Salvar
- [ ] Status: ✓ Conectado, ✗ Erro, ⏳ Testando
- [ ] Últimas sincronizações

---

## 6. Fluxo Completo — Visão de Produto

```
Cliente envia msg no WhatsApp
        ↓
Webhook recebe (Z-API/Meta/ManyChat)
        ↓
Sistema busca Lead + legal_area
        ↓
Carrega System Prompt do BD (roteiro)
        ↓
Claude processa com Loop Agêntico
        ↓
┌─────────────────────────────────────┐
│ IA decide:                          │
│ 1. Continuar conversando (end_turn) │
│ 2. Usar tool de transferência       │
└─────────────────────────────────────┘
        ↓
    ┌───────────┴───────────┐
    ↓                       ↓
[Continua IA]     [Transfere para Humano]
    ↓                       ↓
Responde cliente    Cria ticket na fila
    ↓                       ↓
Salva em BD         Notifica atendente
    ↓                       ↓
Status: active      Status: transferred
                            ↓
                    Atendente pega e responde
                            ↓
                    Status: in_progress → resolved
```

---

## 7. Exemplo: Roteiro de Direito Previdenciário

**`whatsapp_routines` entry:**

```json
{
  "legal_area": "previdenciario",
  "name": "Roteiro - Direito Previdenciário",
  "system_prompt": "Você é um assistente jurídico especializado em Direito Previdenciário.\n\nSeu objetivo:\n1. Entender a situação do cliente (idade, contribuição, último emprego)\n2. Identificar se é caso de: BPC/LOAS, Aposentadoria, Auxílio Doença, etc\n3. Oferecer orientação inicial sobre documentos necessários\n4. Se qualificado, SEMPRE use a tool 'transfer_to_human' com motivo claro\n5. Se fora do escopo, use 'transfer_to_human' com prioridade 'low'\n\nSeja amigável, profissional e conciso. Máximo 3 parágrafos por resposta.",
  "tools": [
    "search_jurisprudence",
    "check_requirements", 
    "transfer_to_human",
    "save_to_memory",
    "classify_area"
  ],
  "active": true
}
```

---

## 8. Segurança & Compliance

- ✅ API keys criptografadas no BD
- ✅ Webhooks validam assinatura
- ✅ Rate limiting por plataforma
- ✅ LGPD: histórico anônimo após 90 dias
- ✅ Auditoria: quem respondeu, quando, qual resposta
- ✅ Atendentes não veem conversations.conversation_history raw

---

## 9. Status de Implementação

| Componente | Status |
|------------|--------|
| Schema BD | ⏳ Pendente |
| Loop agêntico (Python) | ⏳ Pendente |
| Webhooks (Z-API/Meta/ManyChat) | ⏳ Pendente |
| Tool: transfer_to_human | ⏳ Pendente |
| API routes | ⏳ Pendente |
| UI: Roteiros editáveis | ⏳ Pendente |
| UI: Conversas ativas | ⏳ Pendente |
| UI: Fila de humanos | ⏳ Pendente |
| Testes | ⏳ Pendente |

---

**Versão:** 2.0 (Super Agent + Handoff Humano)  
**Padrão:** Baseado em `super_agent_claude.py`  
**Data:** 2026-06-03
