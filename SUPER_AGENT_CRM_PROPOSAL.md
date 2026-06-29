# 🤖 SUPER AGENT IA - INTEGRAÇÃO NO JURIDICO CRM

**Data:** 2026-06-29 | **Baseado em:** CLAUDE_1.md | **Status:** Proposta

---

## 📋 RESUMO EXECUTIVO

Integrar um **Super Agent Python** direto no seu CRM para automatizar tarefas jurídicas, analisar documentos, gerar relatórios e responder perguntas sobre os casos usando **Claude IA (Anthropic SDK)**.

```
ANTES (Manual):
  Advogado → Lê fichas → Analisa → Redige relatório (2-4 horas)

DEPOIS (Com Super Agent):
  Advogado → "Resuma este caso" → Agent lê ficha, analisa status, gera relatório (2 minutos)
```

---

## 🏗️ ARQUITETURA PROPOSTA

### Camada 1: SYSTEM_PROMPT (Persona do Agente)

```python
SYSTEM_PROMPT = """
Você é um Super Agent Jurídico especializado em Direito Previdenciário, Trabalhista e Consumidor.
Sua missão é ajudar advogados a gerenciar casos, analisar documentos e gerar insights.

CAPACIDADES:
- Analisar fichas operacionais (status, prazos, responsáveis)
- Resumir casos complexos em pontos-chave
- Identificar riscos e alertas automáticos
- Gerar minutas de petições básicas
- Buscar jurisprudência (web_search)
- Calcular prazos processuais
- Criar lembretes de vencimentos
- Gerar relatórios de produtividade

RESTRIÇÕES:
- Nunca invente jurisprudência — sempre use web_search
- Nunca recomende ações legais — apenas analise fatos
- Sempre cite a fonte de informações externas
- Mantenha sigilo de dados confidenciais de clientes
- Respeite limites éticos da profissão jurídica

ESTILO:
- Formal, preciso, objetivo
- Use termos jurídicos corretos
- Cite legislação aplicável
- Forneça exemplos práticos
- Reconheça limitações de IA
"""
```

---

### Camada 2: TOOLS (Ferramentas do Agente)

#### Tool 1: Buscar Ficha Operacional
```python
{
    "name": "buscar_ficha",
    "description": "Busca uma ficha operacional pelo ID ou nome do cliente. Use quando precisar recuperar detalhes de um caso específico.",
    "input_schema": {
        "type": "object",
        "properties": {
            "cliente_nome": {"type": "string", "description": "Nome do cliente ou ID da ficha"},
            "campos": {"type": "array", "description": "Quais campos retornar: todos, resumo, alertas, prazos"}
        },
        "required": ["cliente_nome"]
    }
}
```

**Implementação:**
```python
elif tool_name == "buscar_ficha":
    cliente = tool_input["cliente_nome"]
    campos = tool_input.get("campos", ["resumo"])
    
    # Query Prisma via API (não executar SQL direto)
    response = requests.get(
        "http://localhost:3000/api/operacional",
        params={"search": cliente},
        headers={"Authorization": f"Bearer {JWT_TOKEN}"}
    )
    ficha = response.json()["data"][0]
    
    # Formatar para IA
    return f"""
    Cliente: {ficha['nome']}
    Área: {ficha['area']}
    Benefício: {ficha['beneficio']}
    Status: {ficha['coluna']}
    Responsável: {ficha['responsavel']}
    Dias até DPP: {ficha['diasAte_DPP']}
    Alertas: {', '.join(ficha['alertas']) or 'Nenhum'}
    Última atualização: {ficha['updatedAt']}
    """
```

---

#### Tool 2: Analisar Caso
```python
{
    "name": "analisar_caso",
    "description": "Analisa um caso de forma completa, identificando riscos, oportunidades e próximos passos. Use quando precisar de uma visão estratégica do caso.",
    "input_schema": {
        "type": "object",
        "properties": {
            "cliente_id": {"type": "string", "description": "ID da ficha operacional"},
            "tipo_analise": {"type": "string", "enum": ["completa", "riscos", "oportunidades", "prazos"]}
        },
        "required": ["cliente_id"]
    }
}
```

**Implementação:**
```python
elif tool_name == "analisar_caso":
    ficha = get_ficha(tool_input["cliente_id"])
    tipo = tool_input.get("tipo_analise", "completa")
    
    analise = {
        "cliente": ficha["nome"],
        "resumo": f"Caso de {ficha['beneficio']} na área {ficha['area']}",
        "status_atual": ficha["coluna"],
        "tempo_decorrido": calculate_days(ficha["dataEntrada"]),
        "tempo_restante": ficha["diasAte_DPP"],
        "responsavel": ficha["responsavel"],
        "riscos": [
            "DPP próxima" if ficha["diasAte_DPP"] < 30 else None,
            "Sem retorno há 7+ dias" if "sem retorno" in ficha["observacoes"] else None,
            "Documentação incompleta" if ficha["cadSenha"] != "OK" else None,
        ],
        "proximas_acoes": [
            "Entrar em contato com cliente",
            "Enviar documentação faltante",
            "Preparar petição inicial"
        ]
    }
    
    return json.dumps(analise, ensure_ascii=False, indent=2)
```

---

#### Tool 3: Gerar Relatório
```python
{
    "name": "gerar_relatorio",
    "description": "Gera um relatório formatado sobre um ou múltiplos casos. Use para documentação e gestão.",
    "input_schema": {
        "type": "object",
        "properties": {
            "clientes": {"type": "array", "description": "Lista de IDs de clientes"},
            "formato": {"type": "string", "enum": ["texto", "html", "markdown"]},
            "tipo": {"type": "string", "enum": ["resumo", "detalhado", "jurisprudência"]}
        },
        "required": ["clientes", "formato"]
    }
}
```

---

#### Tool 4: Buscar Jurisprudência
```python
{
    "name": "buscar_jurisprudencia",
    "description": "Busca jurisprudência e legislação sobre um tema jurídico específico. Use quando precisar de referências legais.",
    "input_schema": {
        "type": "object",
        "properties": {
            "tema": {"type": "string", "description": "Tema jurídico a pesquisar"},
            "tipo": {"type": "string", "enum": ["lei", "jurisprudencia", "ambos"]},
            "tribunal": {"type": "string", "description": "Tribunal específico (STF, TRF, etc)"}
        },
        "required": ["tema"]
    }
}
```

**Implementação (com Serper):**
```python
elif tool_name == "buscar_jurisprudencia":
    tema = tool_input["tema"]
    tipo = tool_input.get("tipo", "ambos")
    
    # Buscar com Serper (requer SERPER_API_KEY)
    import requests, os
    
    query = f"{tema} jurisprudência site:stf.jus.br OR site:trf1.jus.br"
    response = requests.post(
        "https://google.serper.dev/search",
        json={"q": query, "num": 5, "hl": "pt-br"},
        headers={"X-API-KEY": os.getenv("SERPER_API_KEY")},
        timeout=10
    )
    
    resultados = response.json().get("organic", [])[:3]
    return "\n".join(f"- {r['title']}: {r['link']}\n  {r['snippet']}" for r in resultados)
```

---

#### Tool 5: Criar Tarefa/Alerta
```python
{
    "name": "criar_alerta",
    "description": "Cria um alerta ou tarefa no sistema para o advogado. Use quando identificar algo que precisa atenção.",
    "input_schema": {
        "type": "object",
        "properties": {
            "cliente_id": {"type": "string"},
            "titulo": {"type": "string", "description": "Título do alerta"},
            "descricao": {"type": "string"},
            "prioridade": {"type": "string", "enum": ["baixa", "normal", "alta", "urgente"]},
            "data_vencimento": {"type": "string", "format": "date"}
        },
        "required": ["cliente_id", "titulo", "prioridade"]
    }
}
```

---

#### Tool 6: Calcular Prazo
```python
{
    "name": "calcular_prazo",
    "description": "Calcula prazos processuais segundo CPC, leis de previdência, etc. Use para determinar vencimentos.",
    "input_schema": {
        "type": "object",
        "properties": {
            "tipo_prazo": {"type": "string", "enum": ["recurso", "apelacao", "revisao", "rrf", "dpp", "retorno_cliente"]},
            "data_inicial": {"type": "string", "format": "date"},
            "area": {"type": "string", "enum": ["Previdenciario", "Trabalhista", "Civil", "Familia"]}
        },
        "required": ["tipo_prazo", "data_inicial"]
    }
}
```

---

### Camada 3: LOOP AGÊNTICO

```python
def run_agent(user_message: str, conversation_history: list) -> tuple[str, list]:
    """Loop agêntico canônico para Super Agent Jurídico"""
    
    conversation_history.append({"role": "user", "content": user_message})
    
    while True:
        # Chamar Claude com ferramentas disponíveis
        response = client.messages.create(
            model="claude-sonnet-4-6",  # Melhor custo/benefício
            max_tokens=4096,
            system=SYSTEM_PROMPT,
            tools=TOOLS,
            messages=conversation_history
        )
        
        # Se Claude quer usar tool
        if response.stop_reason == "tool_use":
            conversation_history.append({"role": "assistant", "content": response.content})
            
            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    try:
                        result = execute_tool(block.name, block.input)
                        tool_results.append({
                            "type": "tool_result",
                            "tool_use_id": block.id,
                            "content": str(result)
                        })
                    except Exception as e:
                        tool_results.append({
                            "type": "tool_result",
                            "tool_use_id": block.id,
                            "content": f"[Erro] {block.name}: {str(e)}"
                        })
            
            conversation_history.append({"role": "user", "content": tool_results})
            continue
        
        # Fim da conversa
        final_text = "".join(b.text for b in response.content if hasattr(b, "text"))
        conversation_history.append({"role": "assistant", "content": final_text})
        return final_text, conversation_history
```

---

### Camada 4: HISTÓRICO

```python
# Cada conversa começa com histórico vazio
conversation_history = []

# User faz pergunta
user_msg = "Qual é o status do caso da Maria Silva?"
response, conversation_history = run_agent(user_msg, conversation_history)
print(response)

# Agent respondeu, histórico agora tem 4 mensagens:
# 1. {"role": "user", "content": "...pergunta..."}
# 2. {"role": "assistant", "content": [...tool_use...]}
# 3. {"role": "user", "content": [...tool_result...]}
# 4. {"role": "assistant", "content": "...resposta final..."}

# User faz follow-up
user_msg = "Quais os riscos deste caso?"
response, conversation_history = run_agent(user_msg, conversation_history)
# Agent TEM CONTEXTO da pergunta anterior

# Para persistir entre sessões:
# Salvar em SQLite: UPDATE conversations SET history = JSON(conversation_history) WHERE id = session_id
```

---

## 🔗 INTEGRAÇÃO COM NEXT.JS

### Endpoint REST (FastAPI ou Express.js)

```python
# super_agent_server.py
from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer
import os

app = FastAPI()
security = HTTPBearer()

# Memória em produção → SQLite
conversation_store = {}  # {session_id: conversation_history}

@app.post("/api/agent/chat")
async def agent_chat(
    session_id: str,
    message: str,
    credentials = Depends(security)
):
    """Endpoint para o frontend chamar o agente"""
    
    # Validar JWT
    user_id = validate_token(credentials.credentials)
    
    # Recuperar histórico da conversa
    history = conversation_store.get(session_id, [])
    
    try:
        # Executar agente
        response, updated_history = run_agent(message, history)
        
        # Salvar histórico
        conversation_store[session_id] = updated_history
        
        return {
            "success": True,
            "response": response,
            "session_id": session_id,
            "turn": len(updated_history)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Executar
# uvicorn super_agent_server:app --host 0.0.0.0 --port 8001
```

### Frontend (React Component)

```typescript
// src/components/ia/SuperAgentChat.tsx
"use client";

import { useState } from "react";
import { Loader2, Send, Bot } from "lucide-react";

interface Message {
  role: "user" | "agent";
  content: string;
  timestamp: Date;
}

export function SuperAgentChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(generateSessionId());

  const handleSend = async () => {
    if (!input.trim()) return;

    // Adicionar mensagem do user
    const userMsg: Message = {
      role: "user",
      content: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Chamar agent
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          message: input
        })
      });

      const data = await res.json();

      // Adicionar resposta do agent
      const agentMsg: Message = {
        role: "agent",
        content: data.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, agentMsg]);
    } catch (error) {
      console.error("Erro ao chamar agent:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat history */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-900 border border-gray-200"
              }`}
            >
              {msg.role === "agent" && (
                <div className="flex items-center gap-2 mb-2">
                  <Bot size={16} />
                  <span className="text-xs font-semibold">Super Agent</span>
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {msg.timestamp.toLocaleTimeString("pt-BR")}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="animate-spin" size={16} />
              <span className="text-sm">Agente pensando...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t p-4 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === "Enter" && handleSend()}
            placeholder="Faça uma pergunta sobre seus casos..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
```

---

## 💬 CASOS DE USO NO CRM

### 1. Resumir um Caso
```
User: "Resuma o caso do João Silva em 3 pontos-chave"

Agent:
1. Busca ficha do João Silva com buscar_ficha
2. Analisa status e informações relevantes
3. Retorna:
   - Processo Inicial de Pensão por Morte
   - Status: Aguardando decisão (45 dias sem retorno)
   - Risco: Prazo de recurso vence em 12 dias
```

---

### 2. Gerar Alerta Automático
```
User: "Revise todos os meus casos e alerte-me sobre riscos"

Agent:
1. Busca todas as fichas do advogado
2. Para cada ficha, analisa riscos
3. Para cada risco, cria_alerta com prioridade
4. Retorna: "Criei 5 alertas: 2 urgentes, 3 normais"
```

---

### 3. Pesquisar Jurisprudência
```
User: "Encontre decisões recentes sobre Pensão por Morte no TRF1"

Agent:
1. Chama buscar_jurisprudencia com:
   - tema: "Pensão por Morte"
   - tribunal: "TRF1"
2. Retorna 3 acórdãos mais relevantes com links
```

---

### 4. Calcular Prazo
```
User: "Qual é o prazo de recurso ordinário para este processo previdenciário que sentenciou hoje?"

Agent:
1. Chama calcular_prazo com:
   - tipo_prazo: "recurso"
   - data_inicial: "2026-06-29"
   - area: "Previdenciario"
2. Retorna: "Prazo: 15 dias úteis = vence em 2026-07-16"
3. Cria automaticamente um alerta com esta data
```

---

### 5. Gerar Relatório de Produtividade
```
User: "Qual é minha produtividade este mês?"

Agent:
1. Busca todas as fichas do advogado
2. Calcula: total de casos, casos concluídos, taxa de sucesso
3. Identifica área com mais casos
4. Gera relatório formatado em Markdown
```

---

## 🛠️ IMPLEMENTAÇÃO TÉCNICA

### Stack
```
Backend:
  Python 3.9+
  FastAPI (ou Express.js adicional)
  anthropic SDK
  SQLite (ou PostgreSQL se precisar)

Frontend:
  React 19 (que você já tem)
  Tailwind CSS (que você já tem)
  SuperAgentChat component

Infrastructure:
  VPS Ubuntu (que você já tem)
  screen -S super-agent (background process)
  ou supervisor/systemd para auto-restart
```

### Setup
```bash
# 1. Instalar dependências
pip install anthropic fastapi uvicorn requests python-dotenv

# 2. Configurar .env
ANTHROPIC_API_KEY=sk-ant-...
SERPER_API_KEY=...  # Para web_search (opcional)
JWT_SECRET=...

# 3. Rodar em background
screen -S super-agent
cd /var/www/juridico-crm-automation
python3 super_agent_server.py

# 4. Conectar no Next.js
# Endpoint: http://localhost:8001/api/agent/chat
```

---

## 📊 CUSTO ESTIMADO

| Modelo | Custo por 1M tokens | Uso mensal | Custo/mês |
|--------|-------------------|-----------|-----------|
| claude-haiku-4-5 | $0.80 | 10M | $8 |
| claude-sonnet-4-6 | $3 | 10M | $30 |
| claude-opus-4-8 | $15 | 10M | $150 |

**Recomendação:** Começar com **Sonnet** (melhor custo/benefício). Se precisar mais capacidade, subir para Opus.

---

## 🚀 ROADMAP

### Fase 1: MVP (2-3 semanas)
- [x] Estrutura base do Super Agent
- [ ] Tool: buscar_ficha
- [ ] Tool: analisar_caso
- [ ] FastAPI endpoint básico
- [ ] Component React simples
- [ ] Deploy em VPS

### Fase 2: Features Core (3-4 semanas)
- [ ] Tool: buscar_jurisprudencia (com Serper)
- [ ] Tool: gerar_relatorio
- [ ] Tool: criar_alerta
- [ ] Tool: calcular_prazo
- [ ] Persistência de histórico (SQLite)
- [ ] Testes automatizados

### Fase 3: Avançado (4-6 semanas)
- [ ] Multi-agente (cada agente tem SYSTEM_PROMPT diferente)
- [ ] Integração com Asaas (agent pode buscar status de pagamentos)
- [ ] Geração automática de petições (templates básicas)
- [ ] Escalonamento para advogado humano
- [ ] Analytics de uso do agente

---

## ⚙️ CONFIGURAÇÃO INICIAL

### Arquivo super_agent_claude.py
```python
import os
import json
from anthropic import Anthropic

# ========== CONFIGURAÇÃO ==========
MODEL = "claude-sonnet-4-6"
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
client = Anthropic()

# ========== SYSTEM PROMPT ==========
SYSTEM_PROMPT = """
Você é um Super Agent Jurídico especializado em Direito Previdenciário.
[... resto do prompt ...]
"""

# ========== TOOLS ==========
TOOLS = [
    # buscar_ficha
    {
        "name": "buscar_ficha",
        "description": "Busca uma ficha operacional do CRM",
        "input_schema": {...}
    },
    # ... mais tools
]

# ========== EXECUTE_TOOL ==========
def execute_tool(tool_name: str, tool_input: dict) -> str:
    if tool_name == "buscar_ficha":
        # implementação
        pass
    # ... mais tools
    return "Resultado"

# ========== RUN_AGENT ==========
def run_agent(user_message: str, conversation_history: list) -> tuple[str, list]:
    """Loop agêntico canônico"""
    # ... implementação como acima
    pass

# ========== MAIN ==========
if __name__ == "__main__":
    history = []
    
    print("🤖 Super Agent Jurídico - Digite 'sair' para encerrar")
    print("-" * 50)
    
    while True:
        user_input = input("\nVocê: ").strip()
        if user_input.lower() == "sair":
            break
        
        response, history = run_agent(user_input, history)
        print(f"\n🤖 Agent: {response}")
```

---

## 🔐 SEGURANÇA

**Dados sensíveis do cliente:**
- ❌ Nunca enviar para APIs externas (Serper OK, mas não dados de cliente)
- ✅ Filtrar informações sensíveis antes de exibir
- ✅ Usar JWT tokens para autenticação
- ✅ Log de auditoria de cada chamada ao agent

**Prompt Injection:**
- ✅ Validar input do usuário antes de enviar para Claude
- ✅ Usar tool descriptions claras (Claude não faz o que não está na descrição)
- ✅ Rate limiting por usuário (máx 100 chamadas/hora)

---

## 📞 SUPORTE

**Documentação:**
- Anthropic Tool Use: https://docs.anthropic.com/en/docs/tool-use
- FastAPI: https://fastapi.tiangolo.com/
- Serper API: https://serper.dev/

**Troubleshooting:**
| Problema | Solução |
|----------|---------|
| Agent não usa tools | Verificar stop_reason == "tool_use" |
| Loop infinito | Adicionar log de stop_reason |
| Erro 400 roles | Revisar histórico (user/assistant alternando) |
| API overloaded | Retry com exponential backoff |

---

## ✨ VISÃO FINAL

Com este Super Agent integrado, seu CRM terá uma **IA assistente jurídica** que:

✅ Entende o contexto de cada caso  
✅ Busca legislação e jurisprudência automaticamente  
✅ Gera relatórios e análises em segundos  
✅ Cria alertas inteligentes sobre riscos  
✅ Calcula prazos processuais corretamente  
✅ Responde perguntas mantendo histórico da conversa  

**Resultado:** Advogados ganham 2-4 horas/dia em tarefas administrativas.

---

**Documento:** SUPER_AGENT_CRM_PROPOSAL.md  
**Status:** Pronto para implementação  
**Próximo passo:** Começar Fase 1 (MVP)

