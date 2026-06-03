# Implementação IA Super Agent — Checklist Priorizado

## Fase 1: Banco de Dados & Schema (3 horas)

### 1.1 Migration do Prisma ✅
- [x] Criar arquivo: `prisma/migrations/whatsapp_integration_super_agent/migration.sql`
- [ ] Executar migration: `npx prisma migrate dev --name whatsapp_integration_super_agent`
- [ ] Atualizar `schema.prisma` com os modelos (ver abaixo)
- [ ] Verificar com `npx prisma studio`

**Modelos a adicionar em `prisma/schema.prisma`:**

```prisma
// Roteiros configuráveis (system prompts por área jurídica)
model WhatsAppRoutine {
  id              String    @id @default(cuid())
  legal_area      String    @unique  // familia, trabalhista, civil, etc
  name            String?
  system_prompt   String    // System prompt da IA (configurável)
  tools           Json?     // Tools disponíveis
  active          Boolean   @default(true)
  version         Int       @default(1)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  createdBy       User?     @relation(fields: [created_by_id], references: [id])
  created_by_id   String?

  @@index([legal_area])
  @@index([active])
  @@map("whatsapp_routines")
}

// Conversas WhatsApp
model WhatsAppConversation {
  id                          String   @id @default(cuid())
  lead_id                     String
  lead                        Lead     @relation(fields: [lead_id], references: [id], onDelete: Cascade)
  platform                    String?  // 'zapi', 'meta', 'manychat'
  platform_contact_id         String?  // ID do contato na plataforma
  phone_number                String?
  legal_area                  String?
  conversation_history        Json?    // [{"role": "user/assistant", "content": "..."}]
  status                      String   @default("active")  // active, transferred, completed, closed
  transferred_to_human_at     DateTime?
  transferred_to_attendant    User?    @relation("ConversationTransferredTo", fields: [transferred_to_attendant_id], references: [id])
  transferred_to_attendant_id String?
  attendant_notes             String?
  metadata                    Json?
  createdAt                   DateTime @default(now())
  updatedAt                   DateTime @updatedAt

  // Relações
  humanTickets                WhatsAppHumanTicket[]

  @@index([lead_id])
  @@index([status])
  @@index([transferred_to_attendant_id])
  @@map("whatsapp_conversations")
}

// Fila de atendimento humano
model WhatsAppHumanTicket {
  id                          String   @id @default(cuid())
  conversation_id             String
  conversation                WhatsAppConversation @relation(fields: [conversation_id], references: [id], onDelete: Cascade)
  lead_id                     String
  lead                        Lead     @relation(fields: [lead_id], references: [id], onDelete: Cascade)
  reason                      String?
  priority                    String   @default("normal")  // low, normal, high
  status                      String   @default("pending")  // pending, assigned, in_progress, resolved, cancelled
  assigned_to_attendant       User?    @relation("HumanTicketAssignedTo", fields: [assigned_to_attendant_id], references: [id])
  assigned_to_attendant_id    String?
  assigned_at                 DateTime?
  resolved_at                 DateTime?
  resolution_notes            String?
  createdAt                   DateTime @default(now())
  updatedAt                   DateTime @updatedAt

  @@index([status])
  @@index([assigned_to_attendant_id])
  @@index([priority])
  @@map("whatsapp_human_tickets")
}

// Configurações de integrações WhatsApp
model WhatsAppIntegration {
  id                String   @id @default(cuid())
  platform          String   // 'zapi', 'meta', 'manychat'
  name              String?
  active            Boolean  @default(true)
  api_key           String?  // criptografar em produção
  api_secret        String?
  instance_id       String?  // Z-API
  phone_number_id   String?  // Meta Business
  channel_id        String?  // ManyChat
  webhook_url       String?
  webhook_secret    String?
  settings          Json?
  last_sync_at      DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([platform, active])
  @@map("whatsapp_integrations")
}

// Adicionar ao modelo User:
model User {
  // ... campos existentes ...
  
  // Relações com IA
  created_routines            WhatsAppRoutine[]
  transferred_conversations   WhatsAppConversation[] @relation("ConversationTransferredTo")
  assigned_tickets            WhatsAppHumanTicket[]  @relation("HumanTicketAssignedTo")
}

// Adicionar ao modelo Lead:
model Lead {
  // ... campos existentes ...
  
  // Relações com WhatsApp IA
  whatsapp_conversations      WhatsAppConversation[]
  whatsapp_tickets            WhatsAppHumanTicket[]
}
```

### 1.2 Dados Iniciais (Seed)
- [ ] Criar arquivo: `prisma/seed.ts` com roteiros padrão
- [ ] Incluir roteiro para cada área jurídica:
  - Direito Previdenciário
  - Direito da Família
  - Direito Trabalhista
  - Direito Civil
  - Direito Penal
  - Direito do Consumidor
  - Direito Imobiliário
  - Outros

---

## Fase 2: Backend Python — Super Agent (6 horas)

### 2.1 Setup do Agente
- [ ] Criar arquivo: `backend/ia_agent/super_agent_whatsapp.py`
- [ ] Estrutura:

```python
# super_agent_whatsapp.py

import os
import json
import asyncio
from anthropic import Anthropic
from datetime import datetime
from database import (
    get_conversation,
    save_conversation,
    create_human_ticket,
    get_routine_by_area
)

MODEL = "claude-opus-4-6"
client = Anthropic()

# ============ TOOLS ============

TOOLS = [
    {
        "name": "transfer_to_human",
        "description": "Use quando o cliente for qualificado ou precisar de atendimento humano especializado. Pausa a IA e transfere para fila de atendentes.",
        "input_schema": {
            "type": "object",
            "properties": {
                "reason": {
                    "type": "string",
                    "description": "Motivo da transferência"
                },
                "priority": {
                    "type": "string",
                    "enum": ["low", "normal", "high"],
                    "description": "Prioridade do atendimento"
                }
            },
            "required": ["reason", "priority"]
        }
    },
    {
        "name": "search_jurisprudence",
        "description": "Busca jurisprudência brasileira relevante para o caso",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Tema/termo para buscar (ex: 'BPC/LOAS requisitos')"
                }
            },
            "required": ["query"]
        }
    },
    {
        "name": "check_requirements",
        "description": "Verifica requisitos e documentação necessária para um tipo de caso",
        "input_schema": {
            "type": "object",
            "properties": {
                "case_type": {
                    "type": "string",
                    "description": "Tipo de caso (ex: 'aposentadoria', 'bpc')"
                }
            },
            "required": ["case_type"]
        }
    },
    {
        "name": "save_to_memory",
        "description": "Salva informação importante do cliente para referência futura",
        "input_schema": {
            "type": "object",
            "properties": {
                "key": {"type": "string", "description": "Chave (ex: 'cliente_idade')"},
                "value": {"type": "string", "description": "Valor a salvar"}
            },
            "required": ["key", "value"]
        }
    }
]

# ============ EXECUTOR DE TOOLS ============

def execute_tool(tool_name: str, tool_input: dict, lead_id: str) -> str:
    """Executa uma tool e retorna resultado como string"""
    
    print(f"[Tool] Executando: {tool_name}")
    
    if tool_name == "transfer_to_human":
        reason = tool_input.get("reason")
        priority = tool_input.get("priority", "normal")
        
        # Criar ticket na BD
        ticket = create_human_ticket(
            lead_id=lead_id,
            reason=reason,
            priority=priority
        )
        
        print(f"[Tool] ✓ Ticket criado: {ticket['id']}")
        return f"Transferência criada. Ticket: {ticket['id']}"
    
    elif tool_name == "search_jurisprudence":
        query = tool_input.get("query")
        # TODO: Integrar com Serper API ou banco jurídico
        return f"[Jurisprudência] Busca: {query}\nResultados...(implementar integração Serper)"
    
    elif tool_name == "check_requirements":
        case_type = tool_input.get("case_type")
        # TODO: Retornar requisitos específicos
        return f"Requisitos para {case_type}:\n1. Documento X\n2. Documento Y\n..."
    
    elif tool_name == "save_to_memory":
        key = tool_input.get("key")
        value = tool_input.get("value")
        # TODO: Salvar em memória (Redis ou variável session)
        return f"Salvo: {key} = {value}"
    
    else:
        return f"[Erro] Tool não encontrada: {tool_name}"

# ============ LOOP AGÊNTICO ============

def run_agent_conversation(
    lead_id: str,
    user_message: str,
    legal_area: str,
    platform: str = "zapi"
) -> tuple[str, str]:
    """
    Executa o loop agêntico e retorna:
    - (resposta_texto, status) onde status = 'continued' ou 'transferred_to_human'
    """
    
    # 1. Buscar roteiro (system prompt)
    routine = get_routine_by_area(legal_area)
    if not routine:
        print(f"[Erro] Roteiro não encontrado para: {legal_area}")
        return "Desculpe, não consegui localizar a configuração. Tente novamente.", "error"
    
    system_prompt = routine['system_prompt']
    
    # 2. Buscar conversa existente (histórico)
    conversation_data = get_conversation(lead_id, platform)
    conversation_history = conversation_data.get('history', []) if conversation_data else []
    
    # 3. Adicionar mensagem do usuário
    conversation_history.append({
        "role": "user",
        "content": user_message
    })
    
    print(f"[Agente] Iniciando loop para lead: {lead_id}")
    
    # 4. LOOP AGÊNTICO (idêntico ao padrão Super Agent)
    while True:
        response = client.messages.create(
            model=MODEL,
            max_tokens=4096,
            system=system_prompt,
            tools=TOOLS,
            messages=conversation_history
        )
        
        print(f"[Agente] Stop reason: {response.stop_reason}")
        
        # Tool use?
        if response.stop_reason == "tool_use":
            conversation_history.append({
                "role": "assistant",
                "content": response.content
            })
            
            tool_results = []
            
            for block in response.content:
                if block.type == "tool_use":
                    tool_name = block.name
                    tool_input = block.input
                    
                    # ⭐ TRANSFERÊNCIA PARA HUMANO
                    if tool_name == "transfer_to_human":
                        reason = tool_input.get("reason")
                        priority = tool_input.get("priority", "normal")
                        
                        # Criar ticket
                        ticket = create_human_ticket(
                            lead_id=lead_id,
                            conversation_history=conversation_history,
                            reason=reason,
                            priority=priority
                        )
                        
                        print(f"[Agente] ✓ Transferido para humano: {reason}")
                        
                        # Salvar conversa com status transferido
                        save_conversation(
                            lead_id=lead_id,
                            platform=platform,
                            legal_area=legal_area,
                            history=conversation_history,
                            status="transferred",
                            ticket_id=ticket['id']
                        )
                        
                        return (
                            f"Estou transferindo você para um atendente especializado...\n{reason}",
                            "transferred_to_human"
                        )
                    
                    # Executar outras tools
                    result = execute_tool(tool_name, tool_input, lead_id)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,  # ← ID dinâmico!
                        "content": str(result)
                    })
            
            conversation_history.append({
                "role": "user",
                "content": tool_results
            })
            continue
        
        # End turn
        final_text = "".join(
            b.text for b in response.content
            if hasattr(b, "text")
        )
        
        conversation_history.append({
            "role": "assistant",
            "content": final_text
        })
        
        # Salvar conversa
        save_conversation(
            lead_id=lead_id,
            platform=platform,
            legal_area=legal_area,
            history=conversation_history,
            status="active"
        )
        
        print(f"[Agente] ✓ Conversa finalizada")
        return final_text, "continued"

# ============ TESTES ============

if __name__ == "__main__":
    # Teste local
    lead_id = "test-lead-123"
    user_msg = "Olá, eu tenho 68 anos e contribui ao INSS por 30 anos. Posso me aposentar?"
    legal_area = "previdenciario"
    
    response, status = run_agent_conversation(lead_id, user_msg, legal_area)
    print(f"\n[Resultado]\nStatus: {status}\nResposta: {response}")
```

### 2.2 Integrações WhatsApp
- [ ] Criar arquivo: `backend/ia_agent/whatsapp_integrations.py`
- [ ] Implementar:
  - Z-API: webhook receiver + send message
  - Meta Business API: webhook receiver + send message
  - ManyChat: webhook receiver + send message

**Template:**
```python
# whatsapp_integrations.py

import requests
import hmac
import hashlib
from typing import dict

class ZapiIntegration:
    def __init__(self, api_key: str, instance_id: str):
        self.api_key = api_key
        self.instance_id = instance_id
        self.base_url = "https://api.z-api.io"
    
    def send_message(self, phone: str, message: str) -> dict:
        """Envia mensagem via Z-API"""
        url = f"{self.base_url}/instances/{self.instance_id}/token/{self.api_key}/send-message"
        payload = {
            "phone": phone,
            "message": message,
            "phoneRelay": False
        }
        response = requests.post(url, json=payload)
        return response.json()
    
    def validate_webhook(self, signature: str, body: str, secret: str) -> bool:
        """Valida assinatura do webhook"""
        expected = hmac.new(
            secret.encode(),
            body.encode(),
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(signature, expected)

class MetaIntegration:
    def __init__(self, access_token: str, phone_number_id: str):
        self.access_token = access_token
        self.phone_number_id = phone_number_id
        self.base_url = "https://graph.instagram.com/v18.0"
    
    def send_message(self, to: str, message: str) -> dict:
        """Envia mensagem via Meta Business API"""
        url = f"{self.base_url}/{self.phone_number_id}/messages"
        headers = {"Authorization": f"Bearer {self.access_token}"}
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to,
            "type": "text",
            "text": {"preview_url": False, "body": message}
        }
        response = requests.post(url, json=payload, headers=headers)
        return response.json()

class ManychatIntegration:
    def __init__(self, access_token: str):
        self.access_token = access_token
        self.base_url = "https://api.manychat.com"
    
    def send_message(self, subscriber_id: str, message: str) -> dict:
        """Envia mensagem via ManyChat"""
        url = f"{self.base_url}/v1/subscriber/sendText"
        headers = {"Authorization": f"Bearer {self.access_token}"}
        payload = {
            "subscriber_id": subscriber_id,
            "text": message
        }
        response = requests.post(url, json=payload, headers=headers)
        return response.json()
```

---

## Fase 3: API Routes (3 horas)

### 3.1 Webhooks para receber mensagens
- [ ] `src/app/api/webhooks/whatsapp/zapi/route.ts`
- [ ] `src/app/api/webhooks/whatsapp/meta/route.ts`
- [ ] `src/app/api/webhooks/whatsapp/manychat/route.ts`

**Template:**
```typescript
// src/app/api/webhooks/whatsapp/zapi/route.ts

import { NextRequest, NextResponse } from "next/server";
import { runAgentConversation } from "@/lib/ia-agent";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();
        
        // 1. Extrair dados
        const { phone, senderName: name, message } = payload;
        
        // 2. Buscar/criar lead
        let lead = await prisma.lead.findFirst({
            where: { phone }
        });
        
        if (!lead) {
            lead = await prisma.lead.create({
                data: {
                    phone,
                    name,
                    stage: "INITIAL_SCREENING",
                    source: "whatsapp_zapi"
                }
            });
        }
        
        // 3. Chamar IA
        const { response, status } = await runAgentConversation({
            lead_id: lead.id,
            message,
            legal_area: lead.legal_area || "geral",
            platform: "zapi"
        });
        
        // 4. Responder
        // ... enviar response via Z-API ...
        
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("[Webhook] Erro:", error);
        return NextResponse.json({ error: "Erro ao processar" }, { status: 500 });
    }
}
```

### 3.2 CRUD de Roteiros
- [ ] `src/app/api/whatsapp/routines/route.ts` (GET, POST)
- [ ] `src/app/api/whatsapp/routines/[id]/route.ts` (GET, PATCH, DELETE)

### 3.3 Fila de Atendimento Humano
- [ ] `src/app/api/whatsapp/human-tickets/route.ts`
- [ ] `src/app/api/whatsapp/human-tickets/[id]/route.ts`

### 3.4 Conversas
- [ ] `src/app/api/whatsapp/conversations/route.ts`

---

## Fase 4: UI — Componentes (4 horas)

### 4.1 Roteiros (Editar System Prompts)
- [ ] `src/app/ia/roteiros/page.tsx` — Listar roteiros
- [ ] `src/app/ia/roteiros/[legal_area]/page.tsx` — Editor de system prompt
  - [ ] Textarea grande para system prompt
  - [ ] Preview de como a IA responde
  - [ ] Histórico de versões
  - [ ] Botão: Salvar, Reverter

### 4.2 Conversas Ativas
- [ ] `src/app/ia/conversas/page.tsx`
  - [ ] Lista por status (Ativa, Transferida, Concluída)
  - [ ] Filtro por área jurídica
  - [ ] Painel de conversa com histórico
  - [ ] Botão: "Pausar IA e Continuar"

### 4.3 Fila de Atendimento Humano
- [ ] `src/app/ia/atendimento-humano/page.tsx`
  - [ ] Tabela de tickets
  - [ ] Filtro por status/prioridade
  - [ ] Ações: Atribuir, Resolver, Adicionar notas
  - [ ] Chat dentro do ticket

### 4.4 Configuração de Integrações
- [ ] `src/app/configuracoes/whatsapp/page.tsx`
  - [ ] Abas: Z-API, Meta, ManyChat
  - [ ] Campos de configuração
  - [ ] Botão: Testar conexão

---

## Fase 5: Testes & Validação (2 horas)

- [ ] Testar webhook Z-API (enviar msg de teste)
- [ ] Testar webhook Meta (enviar msg de teste)
- [ ] Testar webhook ManyChat (enviar msg de teste)
- [ ] Testar transfer_to_human (verificar ticket criado)
- [ ] Testar edição de roteiros (verificar system_prompt atualizado)
- [ ] Testar UI de conversas (histórico preservado)

---

## Status Geral

| Fase | Componente | Status | Tempo |
|------|------------|--------|-------|
| 1 | Banco de dados | ⏳ AGORA | 3h |
| 2 | Super Agent (Python) | ⏳ Próximo | 6h |
| 3 | API Routes | ⏳ Depois | 3h |
| 4 | UI | ⏳ Depois | 4h |
| 5 | Testes | ⏳ Final | 2h |
| **TOTAL** | | | **18h** |

---

## Próximo Passo Imediato

```bash
# 1. Executar migration
npx prisma migrate dev --name whatsapp_integration_super_agent

# 2. Verificar schema
npx prisma studio

# 3. Criar seed data (roteiros iniciais)
npx prisma db seed
```

Após isso, começamos a **Fase 2: Backend Python do Super Agent** 🚀

---

**Versão:** 1.0  
**Data:** 2026-06-03  
**Status:** Pronto para execução
