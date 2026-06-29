# 🤖 MENU E CONFIGURAÇÕES - IA ATENDIMENTO

**Data:** 2026-06-29 | **Status:** Proposta de Implementação

---

## 📋 ESTRUTURA DO MENU

### Sidebar Navigation (novo item)

```
┌─ CRM Jurídico
├─ 📊 Dashboard
├─ 👥 Leads
├─ 👤 Clientes
├─ 📁 Operacional
├─ 💰 Financeiro
├─ 🎨 Configurações
│
├─ 🤖 IA Atendimento ⭐ NOVO
│  ├─ 💬 Super Agent Jurídico
│  ├─ 📱 WhatsApp IA
│  ├─ 📈 Marketing IA
│  ├─ ⚙️ Configurações Globais
│  └─ 📊 Analytics de IA
│
├─ 📋 Agenda
└─ 🚪 Sair
```

---

## 🎯 PÁGINAS DO MÓDULO IA

### 1. Dashboard de IA Atendimento
**Rota:** `/ia/dashboard`

```
┌─ IA ATENDIMENTO - DASHBOARD
├─ Stats Overview (3 cards)
│  ├─ Total de Conversas: 1.245
│  ├─ Chats Hoje: 47
│  └─ Satisfação: 4.8/5.0
│
├─ Seletor de IA
│  ├─ [ ] Super Agent Jurídico
│  ├─ [ ] WhatsApp IA
│  └─ [ ] Marketing IA
│
├─ Quick Actions
│  ├─ [▶️ Iniciar Chat]
│  ├─ [⚙️ Configurar]
│  ├─ [📊 Analytics]
│  └─ [📝 Histórico]
│
└─ Últimas Conversas (tabela)
   ├─ Cliente | IA | Assunto | Data | Status
```

---

### 2. Interface de Chat (Super Agent Jurídico)
**Rota:** `/ia/super-agent`

```
┌─ SUPER AGENT JURÍDICO
├─ Header
│  ├─ "🤖 Super Agent - Assistente Jurídico"
│  ├─ Status: ✅ Online
│  └─ Modelo: claude-sonnet-4-6
│
├─ Chat Area (principal)
│  └─ Histórico de mensagens (scrollável)
│
├─ Tools Display (opcional)
│  └─ Mostra se está usando: 🔍 Busca | 📊 Análise | ⚡ Criando alerta
│
├─ Input Area
│  ├─ Textarea: "Faça uma pergunta..."
│  ├─ Botões:
│  │  ├─ [Send]
│  │  ├─ [Attach File]
│  │  └─ [Templates]
│  └─ Token counter: "1,245 / 200,000 tokens"
│
└─ Sidebar Context
   ├─ Cliente atual (se selecionado)
   ├─ Ficha resumida
   ├─ Quick actions
   └─ Histórico desta conversa
```

---

### 3. WhatsApp IA
**Rota:** `/ia/whatsapp`

```
┌─ WHATSAPP IA - ATENDIMENTO
├─ Tabs
│  ├─ 🔴 [Fila] (5 mensagens aguardando)
│  ├─ 🟢 [Conversas Ativas] (12 chats)
│  ├─ 🟡 [Aguardando Resposta] (8 chats)
│  └─ 📋 [Histórico]
│
├─ Fila Area (se Fila selecionada)
│  ├─ Mensagem 1: "Oi, tudo bem?"
│  │  ├─ De: +55 11 98765-4321 | João Silva
│  │  ├─ Hora: 14:32
│  │  ├─ [Ver Ficha] [Responder] [Escalar]
│  │
│  ├─ Mensagem 2: ...
│  └─ [Auto-responder] | [Escalar Tudo]
│
└─ Editor de Resposta
   ├─ Resposta rápida (pre-written)
   ├─ Template selector
   ├─ IA sugestão (auto-complete)
   └─ [Enviar] [Agendar] [Escalar]
```

---

### 4. Marketing IA
**Rota:** `/ia/marketing`

```
┌─ MARKETING IA - ANÁLISE DE CAMPANHAS
├─ Input Area
│  ├─ "Cole dados da campanha ou pergunta sobre ROI"
│  └─ Suporte: CSV, JSON, texto livre
│
├─ Output Area
│  ├─ Análise
│  ├─ Recomendações
│  ├─ Gráficos (Recharts)
│  └─ [Exportar Relatório]
│
└─ Histórico de Análises
   ├─ Data | Campanha | Resultado
```

---

### 5. Configurações Globais de IA
**Rota:** `/ia/configuracoes`

```
┌─ CONFIGURAÇÕES DE IA - SETUP
├─ Abas
│  ├─ 🔑 API Keys
│  ├─ 📐 Modelos
│  ├─ 🎯 Comportamento
│  ├─ 🔒 Privacidade
│  └─ 📊 Monitoramento
│
├─ ABA: API Keys
│  ├─ ANTHROPIC_API_KEY
│  │  ├─ Input: [••••••••••••••••••] [👁️ Mostrar]
│  │  ├─ Status: ✅ Válida
│  │  └─ Testado em: 2026-06-29 14:32
│  │
│  ├─ SERPER_API_KEY
│  │  ├─ Input: [••••••••••••••••••] [👁️ Mostrar]
│  │  ├─ Status: ✅ Válida
│  │  └─ [Test] [Regenerate]
│  │
│  └─ [Salvar] [Cancelar]
│
├─ ABA: Modelos
│  ├─ Selecionar modelo padrão:
│  │  ├─ [ ] claude-haiku-4-5 (rápido, barato)
│  │  ├─ [●] claude-sonnet-4-6 (equilibrado) ← selecionado
│  │  └─ [ ] claude-opus-4-8 (máxima capacidade)
│  │
│  ├─ Max tokens:
│  │  ├─ Label: "Limite de tokens por resposta"
│  │  ├─ Input: [4096]
│  │  └─ Info: "Máximo: 200.000 por conversa"
│  │
│  ├─ Temperature:
│  │  ├─ Slider: [───●─────] 0.7
│  │  └─ Info: "0 = determinístico, 1 = criativo"
│  │
│  └─ [Salvar] [Restaurar padrão]
│
├─ ABA: Comportamento
│  ├─ Per-IA Settings:
│  │
│  │  Super Agent Jurídico:
│  │  ├─ ☑️ Ativar
│  │  ├─ ☑️ Buscar jurisprudência automaticamente
│  │  ├─ ☑️ Criar alertas automáticos
│  │  └─ ☑️ Gerar relatórios
│  │
│  │  WhatsApp IA:
│  │  ├─ ☑️ Ativar
│  │  ├─ ☑️ Auto-responder mensagens
│  │  ├─ ⚠️ Requer aprovação humana: [Input]
│  │  └─ Delay antes de escalar: [30] segundos
│  │
│  │  Marketing IA:
│  │  ├─ ☑️ Ativar
│  │  ├─ Modelos de análise:
│  │  │  ├─ ☑️ ROI
│  │  │  ├─ ☑️ Funnel
│  │  │  ├─ ☑️ CAC
│  │  │  └─ ☑️ ROAS
│  │
│  └─ [Salvar]
│
├─ ABA: Privacidade
│  ├─ ☑️ Registrar conversas (audit log)
│  ├─ ☑️ Anonimizar dados sensíveis
│  ├─ ☑️ Criptografar histórico em repouso
│  ├─ Data retention: [90] dias
│  ├─ [ ] Enviar para Anthropic (para treino)
│  └─ [Salvar]
│
└─ ABA: Monitoramento
   ├─ Rate Limiting:
   │  ├─ Max chamadas/hora: [100]
   │  ├─ Max tokens/dia: [1.000.000]
   │  └─ Alert se exceeder: ☑️
   │
   ├─ Error Monitoring:
   │  ├─ ☑️ Registrar erros
   │  ├─ Alert em Slack: ☑️
   │  └─ Retry automático: ☑️ (max [3] vezes)
   │
   ├─ Usage Dashboard:
   │  ├─ Tokens usados hoje: 45.320 / 1.000.000
   │  ├─ Conversas hoje: 47
   │  ├─ Tempo médio resposta: 2.3s
   │  └─ Custo estimado: $3.45
   │
   └─ [Export Logs] [View Errors]
```

---

### 6. Analytics de IA
**Rota:** `/ia/analytics`

```
┌─ ANALYTICS - IA ATENDIMENTO
├─ Period Selector: [Last 7 days ▼]
├─ Filter: [All IAs ▼] [All Users ▼]
│
├─ Overview Cards (4)
│  ├─ Total Conversations: 1.245
│  ├─ Avg Response Time: 2.3s
│  ├─ Avg Satisfaction: 4.8/5.0
│  └─ Cost (this period): $23.45
│
├─ Graphs
│  ├─ 📈 Conversations over time (line chart)
│  ├─ 🥧 IA usage breakdown (pie chart)
│  │  ├─ Super Agent: 45%
│  │  ├─ WhatsApp: 35%
│  │  └─ Marketing: 20%
│  ├─ 📊 Token usage (bar chart)
│  └─ ⭐ Satisfaction trend (line chart)
│
├─ Tables
│  ├─ Top conversations by length
│  ├─ Most used tools
│  ├─ Errors & retries
│  └─ Cost breakdown by IA
│
└─ [Export CSV] [Export PDF] [Schedule Report]
```

---

## 🗄️ DATABASE SCHEMA

### Tabela: AIChat (histórico de conversas)

```sql
CREATE TABLE AIChat (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES User(id),
  ia_type ENUM('super_agent', 'whatsapp_ia', 'marketing_ia') NOT NULL,
  
  -- Conversação
  messages JSONB NOT NULL DEFAULT '[]', -- [{role, content, timestamp, tokens}]
  session_id STRING UNIQUE,
  
  -- Metadados
  total_tokens INT DEFAULT 0,
  total_cost DECIMAL(10, 4) DEFAULT 0,
  status ENUM('active', 'archived', 'escalated') DEFAULT 'active',
  
  -- Timestamps
  started_at TIMESTAMP DEFAULT now(),
  ended_at TIMESTAMP NULL,
  last_message_at TIMESTAMP DEFAULT now(),
  
  -- Cliente associado (opcional)
  client_id UUID NULL REFERENCES Client(id),
  
  -- Tags e categorização
  tags TEXT[] DEFAULT '{}',
  notes TEXT NULL,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Índices
CREATE INDEX idx_AIChat_user_id ON AIChat(user_id);
CREATE INDEX idx_AIChat_ia_type ON AIChat(ia_type);
CREATE INDEX idx_AIChat_client_id ON AIChat(client_id);
CREATE INDEX idx_AIChat_created_at ON AIChat(created_at DESC);
```

---

### Tabela: AIConfiguration (config por usuário)

```sql
CREATE TABLE AIConfiguration (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL REFERENCES User(id),
  
  -- API Keys (encriptados)
  anthropic_api_key_encrypted STRING,
  serper_api_key_encrypted STRING,
  last_key_update TIMESTAMP,
  
  -- Modelo padrão
  default_model ENUM('haiku', 'sonnet', 'opus') DEFAULT 'sonnet',
  max_tokens INT DEFAULT 4096,
  temperature DECIMAL(2, 1) DEFAULT 0.7,
  
  -- Comportamento por IA
  super_agent_enabled BOOLEAN DEFAULT true,
  super_agent_auto_search BOOLEAN DEFAULT true,
  super_agent_auto_alerts BOOLEAN DEFAULT true,
  
  whatsapp_ia_enabled BOOLEAN DEFAULT true,
  whatsapp_ia_auto_respond BOOLEAN DEFAULT true,
  whatsapp_ia_approval_required BOOLEAN DEFAULT false,
  whatsapp_ia_escalate_delay_seconds INT DEFAULT 30,
  
  marketing_ia_enabled BOOLEAN DEFAULT true,
  marketing_ia_analysis_models TEXT[] DEFAULT '["roi", "funnel", "cac", "roas"]',
  
  -- Privacidade
  log_conversations BOOLEAN DEFAULT true,
  anonymize_sensitive_data BOOLEAN DEFAULT true,
  encrypt_at_rest BOOLEAN DEFAULT true,
  data_retention_days INT DEFAULT 90,
  
  -- Monitoramento
  max_calls_per_hour INT DEFAULT 100,
  max_tokens_per_day INT DEFAULT 1000000,
  rate_limit_alert BOOLEAN DEFAULT true,
  error_alert_slack BOOLEAN DEFAULT false,
  auto_retry_enabled BOOLEAN DEFAULT true,
  auto_retry_max_attempts INT DEFAULT 3,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_AIConfiguration_user_id ON AIConfiguration(user_id);
```

---

### Tabela: AIAnalytics (métricas de uso)

```sql
CREATE TABLE AIAnalytics (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES User(id),
  
  -- Data (agregada por dia)
  date DATE NOT NULL,
  ia_type ENUM('super_agent', 'whatsapp_ia', 'marketing_ia') NOT NULL,
  
  -- Métricas
  total_conversations INT DEFAULT 0,
  total_messages INT DEFAULT 0,
  total_tokens_used INT DEFAULT 0,
  total_cost DECIMAL(10, 4) DEFAULT 0,
  
  avg_response_time_ms INT DEFAULT 0,
  avg_satisfaction_score DECIMAL(3, 1) DEFAULT 0,
  
  errors_count INT DEFAULT 0,
  retries_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE UNIQUE INDEX idx_AIAnalytics_unique ON AIAnalytics(user_id, date, ia_type);
CREATE INDEX idx_AIAnalytics_date ON AIAnalytics(date DESC);
```

---

## 🛠️ API ENDPOINTS

### Chat Endpoints

```bash
# Super Agent Jurídico
POST   /api/ia/super-agent/chat
GET    /api/ia/super-agent/history/:session_id
DELETE /api/ia/super-agent/history/:session_id

# WhatsApp IA
GET    /api/ia/whatsapp/queue
POST   /api/ia/whatsapp/respond/:chat_id
POST   /api/ia/whatsapp/escalate/:chat_id
GET    /api/ia/whatsapp/history/:client_id

# Marketing IA
POST   /api/ia/marketing/analyze
GET    /api/ia/marketing/history

# Configuration
GET    /api/ia/config
PUT    /api/ia/config
POST   /api/ia/config/test-key/:key_type

# Analytics
GET    /api/ia/analytics/summary
GET    /api/ia/analytics/breakdown/:ia_type
GET    /api/ia/analytics/export/:format (csv|pdf)
```

---

## ⚙️ IMPLEMENTAÇÃO - COMPONENTES REACT

### 1. Sidebar Update

```typescript
// src/components/layout/Sidebar.tsx

const MENU_ITEMS = [
  // ... existing items ...
  {
    label: "🤖 IA Atendimento",
    icon: Bot,
    submenu: [
      { href: "/ia/dashboard", icon: BarChart3, label: "Dashboard" },
      { href: "/ia/super-agent", icon: Brain, label: "Super Agent Jurídico" },
      { href: "/ia/whatsapp", icon: MessageCircle, label: "WhatsApp IA" },
      { href: "/ia/marketing", icon: TrendingUp, label: "Marketing IA" },
      { href: "/ia/configuracoes", icon: Settings, label: "Configurações" },
      { href: "/ia/analytics", icon: BarChart2, label: "Analytics" },
    ]
  },
  // ... other items ...
]
```

---

### 2. Super Agent Chat Component

```typescript
// src/components/ia/SuperAgentChat.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Send, Bot, AlertCircle } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  tokens?: number;
  toolsUsed?: string[];
}

export function SuperAgentChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(generateSessionId());
  const [tokenCount, setTokenCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ia/super-agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          message: input
        })
      });

      const data = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        tokens: data.tokens_used,
        toolsUsed: data.tools_used
      };

      setMessages(prev => [...prev, assistantMessage]);
      setTokenCount(prev => prev + data.tokens_used);
    } catch (error) {
      console.error("Erro ao chamar Super Agent:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
              <Bot className="text-white" size={24} />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">Super Agent Jurídico</h1>
              <p className="text-sm text-gray-500">claude-sonnet-4-6 • ✅ Online</p>
            </div>
          </div>
          <div className="text-right text-sm text-gray-600">
            <div>Token Counter</div>
            <div className="font-mono text-indigo-600">{tokenCount} / 200,000</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-md px-4 py-3 rounded-lg ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-900 border border-gray-200"
              }`}
            >
              {msg.role === "assistant" && msg.toolsUsed && (
                <div className="text-xs opacity-70 mb-2">
                  🔧 Usando: {msg.toolsUsed.join(", ")}
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <p className="text-xs opacity-70 mt-2">
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
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Pergunte algo sobre seus casos..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none"
            rows={3}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-indigo-600 text-white px-6 rounded-lg hover:bg-indigo-700 disabled:opacity-50 self-end"
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

### 3. IA Configuration Component

```typescript
// src/components/ia/ConfiguradorIA.tsx

"use client";

import { useState } from "react";
import { Settings, AlertCircle, CheckCircle } from "lucide-react";

interface IAConfig {
  anthropic_api_key: string;
  serper_api_key: string;
  default_model: "haiku" | "sonnet" | "opus";
  max_tokens: number;
  temperature: number;
  super_agent_enabled: boolean;
  super_agent_auto_search: boolean;
  super_agent_auto_alerts: boolean;
  whatsapp_ia_enabled: boolean;
  whatsapp_ia_auto_respond: boolean;
  marketing_ia_enabled: boolean;
}

const TABS = [
  { id: "keys", label: "🔑 API Keys" },
  { id: "models", label: "📐 Modelos" },
  { id: "behavior", label: "🎯 Comportamento" },
  { id: "privacy", label: "🔒 Privacidade" },
  { id: "monitoring", label: "📊 Monitoramento" }
];

export function ConfiguradorIA() {
  const [activeTab, setActiveTab] = useState("keys");
  const [config, setConfig] = useState<IAConfig>({
    anthropic_api_key: "",
    serper_api_key: "",
    default_model: "sonnet",
    max_tokens: 4096,
    temperature: 0.7,
    super_agent_enabled: true,
    super_agent_auto_search: true,
    super_agent_auto_alerts: true,
    whatsapp_ia_enabled: true,
    whatsapp_ia_auto_respond: true,
    marketing_ia_enabled: true
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/ia/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        setStatus("success");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings size={24} className="text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Configurações de IA</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === tab.id
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        {activeTab === "keys" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                ANTHROPIC_API_KEY
              </label>
              <input
                type="password"
                value={config.anthropic_api_key}
                onChange={e => setConfig({...config, anthropic_api_key: e.target.value})}
                placeholder="sk-ant-..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              <p className="text-xs text-gray-500 mt-1">Obtenha em console.anthropic.com</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                SERPER_API_KEY (opcional)
              </label>
              <input
                type="password"
                value={config.serper_api_key}
                onChange={e => setConfig({...config, serper_api_key: e.target.value})}
                placeholder="Para busca de jurisprudência"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              <p className="text-xs text-gray-500 mt-1">Obtenha em serper.dev</p>
            </div>

            <button
              className="text-indigo-600 text-sm hover:underline"
              onClick={() => alert("Abrindo teste de conexão...")}
            >
              🧪 Testar conexão
            </button>
          </div>
        )}

        {activeTab === "models" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Modelo Padrão
              </label>
              <div className="space-y-2">
                {["haiku", "sonnet", "opus"].map(model => (
                  <label key={model} className="flex items-center gap-3">
                    <input
                      type="radio"
                      checked={config.default_model === model}
                      onChange={() => setConfig({...config, default_model: model as any})}
                      className="w-4 h-4"
                    />
                    <span className="capitalize text-sm text-gray-900">
                      claude-{model}-4-6
                    </span>
                    <span className="text-xs text-gray-500">
                      {model === "haiku" && "(Rápido, barato)"}
                      {model === "sonnet" && "(Equilibrado) ✅"}
                      {model === "opus" && "(Máxima capacidade)"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Max Tokens: {config.max_tokens}
              </label>
              <input
                type="range"
                min="1024"
                max="200000"
                value={config.max_tokens}
                onChange={e => setConfig({...config, max_tokens: parseInt(e.target.value)})}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Temperature: {config.temperature}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.temperature}
                onChange={e => setConfig({...config, temperature: parseFloat(e.target.value)})}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">0 = determinístico, 1 = criativo</p>
            </div>
          </div>
        )}

        {activeTab === "behavior" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Super Agent Jurídico</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.super_agent_enabled}
                    onChange={e => setConfig({...config, super_agent_enabled: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-900">Ativar</span>
                </label>
                <label className="flex items-center gap-2 ml-6">
                  <input
                    type="checkbox"
                    checked={config.super_agent_auto_search}
                    onChange={e => setConfig({...config, super_agent_auto_search: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-900">Buscar jurisprudência automaticamente</span>
                </label>
                <label className="flex items-center gap-2 ml-6">
                  <input
                    type="checkbox"
                    checked={config.super_agent_auto_alerts}
                    onChange={e => setConfig({...config, super_agent_auto_alerts: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-900">Criar alertas automáticos</span>
                </label>
              </div>
            </div>

            <hr className="my-4" />

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">WhatsApp IA</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.whatsapp_ia_enabled}
                    onChange={e => setConfig({...config, whatsapp_ia_enabled: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-900">Ativar</span>
                </label>
                <label className="flex items-center gap-2 ml-6">
                  <input
                    type="checkbox"
                    checked={config.whatsapp_ia_auto_respond}
                    onChange={e => setConfig({...config, whatsapp_ia_auto_respond: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-900">Auto-responder mensagens</span>
                </label>
              </div>
            </div>

            <hr className="my-4" />

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Marketing IA</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.marketing_ia_enabled}
                    onChange={e => setConfig({...config, marketing_ia_enabled: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-900">Ativar</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs content... */}
      </div>

      {/* Status Message */}
      {status === "success" && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 mb-4">
          <CheckCircle size={20} />
          Configurações salvas com sucesso!
        </div>
      )}
      {status === "error" && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 mb-4">
          <AlertCircle size={20} />
          Erro ao salvar configurações
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
      >
        {saving ? "Salvando..." : "Salvar Configurações"}
      </button>
    </div>
  );
}
```

---

## 📦 ESTRUTURA DE PASTAS

```
src/
├── app/
│   ├── ia/                          ⭐ NOVO
│   │   ├── layout.tsx
│   │   ├── page.tsx                 (Dashboard)
│   │   ├── dashboard/page.tsx
│   │   ├── super-agent/
│   │   │   └── page.tsx
│   │   ├── whatsapp/
│   │   │   └── page.tsx
│   │   ├── marketing/
│   │   │   └── page.tsx
│   │   ├── configuracoes/
│   │   │   └── page.tsx
│   │   └── analytics/
│   │       └── page.tsx
│   └── api/
│       ├── ia/                      ⭐ NOVO
│       │   ├── super-agent/
│       │   │   └── chat/route.ts
│       │   ├── whatsapp/
│       │   │   ├── queue/route.ts
│       │   │   ├── respond/[id]/route.ts
│       │   │   └── escalate/[id]/route.ts
│       │   ├── marketing/
│       │   │   └── analyze/route.ts
│       │   ├── config/
│       │   │   └── route.ts
│       │   └── analytics/
│       │       ├── summary/route.ts
│       │       ├── breakdown/[type]/route.ts
│       │       └── export/[format]/route.ts
│       │
│       └── ia-server/               (Python server - FastAPI/uvicorn)
│           ├── super_agent_claude.py
│           ├── requirements.txt
│           └── run.sh
│
├── components/
│   └── ia/                          ⭐ NOVO
│       ├── SuperAgentChat.tsx
│       ├── ConfiguradorIA.tsx
│       ├── WhatsAppQueuePanel.tsx
│       ├── MarketingAnalyzer.tsx
│       ├── IADashboard.tsx
│       ├── AnalyticsPanel.tsx
│       └── TokenCounter.tsx
│
└── types/
    └── ia.ts                        ⭐ NOVO
        (Interfaces: AIChat, AIConfiguration, AIAnalytics)
```

---

## 🚀 ROADMAP DE IMPLEMENTAÇÃO

### Semana 1: Setup Básico
- [ ] Criar estrutura de pasta `/ia`
- [ ] Implementar componente `SuperAgentChat.tsx`
- [ ] Criar endpoint `POST /api/ia/super-agent/chat`
- [ ] Conectar Python Super Agent

### Semana 2: Banco de Dados
- [ ] Criar migrações Prisma (AIChat, AIConfiguration)
- [ ] Implementar persistência de histórico
- [ ] Setup de criptografia de API keys

### Semana 3: Configurações
- [ ] Implementar `ConfiguradorIA.tsx`
- [ ] Endpoints de GET/PUT `/api/ia/config`
- [ ] Test de API keys

### Semana 4: WhatsApp + Marketing
- [ ] Queue panel para WhatsApp
- [ ] Marketing analyzer
- [ ] Endpoints específicos

### Semana 5: Analytics
- [ ] Dashboard de analytics
- [ ] Export CSV/PDF
- [ ] Gráficos e estatísticas

---

**Documento:** IA_ATENDIMENTO_MENU_CONFIG.md  
**Status:** Pronto para implementação  
**Impacto:** Sistema completo de IA integrado ao CRM

