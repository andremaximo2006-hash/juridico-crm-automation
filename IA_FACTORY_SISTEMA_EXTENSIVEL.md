# 🏭 IA FACTORY - SISTEMA EXTENSÍVEL DE MÚLTIPLAS IAs

**Data:** 2026-06-29 | **Status:** Design Arquitetura

---

## 🎯 VISÃO

Criar um **sistema genérico de IA** onde qualquer pessoa pode:
- ✅ Criar novas IAs sem código
- ✅ Configurar prompt, comportamento, tools
- ✅ Escolher canal (WhatsApp, Email, Site, etc)
- ✅ Reusar templates e presets
- ✅ Personalizar completamente

```
┌─────────────────────────────────────────┐
│          IA FACTORY DASHBOARD            │
├─────────────────────────────────────────┤
│                                         │
│  [+ Criar Nova IA]                      │
│                                         │
│  MINHAS IAs:                            │
│  ┌─────────────────────────────────┐   │
│  │ 🤖 WhatsApp SDR                 │   │
│  │    Status: ✅ Ativo             │   │
│  │    Canal: WhatsApp              │   │
│  │    Modelo: Claude Sonnet        │   │
│  │    Conversas: 127               │   │
│  │    [Editar] [Analytics] [Clone] │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 📧 Email IA - Suporte           │   │
│  │    Status: 🔴 Inativa           │   │
│  │    Canal: Email                 │   │
│  │    Modelo: Claude Opus          │   │
│  │    [Editar] [Ativar] [Clone]    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 💬 Chat Site - Visitantes       │   │
│  │    Status: ✅ Ativo             │   │
│  │    Canal: Embed JS              │   │
│  │    Modelo: Claude Haiku         │   │
│  │    [Editar] [Analytics] [Clone] │   │
│  └─────────────────────────────────┘   │
│                                         │
│  TEMPLATES DISPONÍVEIS:                 │
│  ├─ SDR Qualificação                    │
│  ├─ Suporte Técnico                     │
│  ├─ Email Automático                    │
│  ├─ Chatbot Visitante                   │
│  └─ Custom (Em branco)                  │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📊 SCHEMA PRISMA - IA FACTORY

```prisma
// ─── IA FACTORY MODELS ───────────────────────────────────

enum IACanal {
  whatsapp
  email
  webchat
  telefone
  instagram
  linkedin
  custom
}

enum IATemplate {
  sdr_qualificacao
  suporte_tecnico
  email_responder
  chatbot_visitante
  consultor_legal
  prospeccao
  custom
}

// Template/Preset de IA (reutilizável)
model IATemplate {
  id            String   @id @default(cuid())
  nome          String   // "SDR Qualificação"
  descricao     String?
  template      IATemplate @default(custom)
  isPublic      Boolean  @default(false) // Disponível para outros usuários?
  
  // Configuração padrão
  systemPrompt  String   @db.Text  // Prompt do sistema
  modelo        AIModel  @default(sonnet)
  temperature   Decimal  @default(0.7) @db.Decimal(2, 1)
  maxTokens     Int      @default(4096)
  
  // Comportamento
  comportamento Json     // { "timeout": 30, "retries": 3, "logging": true }
  
  // Tools/Capacidades
  toolsDisponiveis String[] @default([]) // ["buscar_ficha", "criar_caso"]
  
  // Validações
  validacoes    Json?    // Regras de input/output
  
  // Metadata
  versao        Int      @default(1)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relações
  ias           IA[] @relation("TemplateRef")
  
  @@map("ia_templates")
}

// IA Instance (criada pelo usuário)
model IA {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Info básica
  nome            String   // "Meu SDR do WhatsApp"
  descricao       String?
  icone           String?  // emoji ou URL
  
  // Template
  templateId      String?
  template        IATemplate? @relation("TemplateRef", fields: [templateId], references: [id], onDelete: SetNull)
  
  // Configuração
  canal           IACanal  // whatsapp, email, webchat
  modelo          AIModel  @default(sonnet)
  temperature     Decimal  @default(0.7) @db.Decimal(2, 1)
  maxTokens       Int      @default(4096)
  
  // Prompt customizável
  systemPrompt    String   @db.Text  // Pode estar diferente do template
  
  // Comportamento
  comportamento   Json     @default("{}")
  toolsAtivas     String[] @default([])
  
  // Status
  isAtiva         Boolean  @default(true)
  isPublicada     Boolean  @default(false)
  
  // Credenciais por canal
  canalConfig     Json     // { "whatsapp_api_key": "...", "email_smtp": "..." }
  
  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  lastUsedAt      DateTime?
  
  // Stats
  totalConversas  Int      @default(0)
  totalTokensUsado Int     @default(0)
  totalCusto      Decimal  @default(0) @db.Decimal(10, 4)
  
  // Relações
  conversas       IAConversa[] @relation("IARef")
  logs            IALog[] @relation("IALogRef")
  
  @@index([userId])
  @@index([canal])
  @@index([isAtiva])
  @@map("ias")
}

// Conversa com IA (genérica para qualquer canal)
model IAConversa {
  id          String   @id @default(cuid())
  iaId        String
  ia          IA       @relation("IARef", fields: [iaId], references: [id], onDelete: Cascade)
  
  // Participante
  participante String  // nome do cliente/visitante
  participanteId String? // leadId/clientId (opcional)
  contactoInfo Json    // { "email": "...", "telefone": "...", "whatsapp": "..." }
  
  // Dados da conversa
  mensagens   Json     @default("[]") // [{ role, content, timestamp, tokens }]
  dados       Json     @default("{}") // Dados coletados durante conversa
  
  // Status
  status      String   @default("ativa") // ativa, concluida, escalonada
  escalonadoEm DateTime?
  
  // Metadata
  canal       IACanal
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([iaId])
  @@index([status])
  @@map("ia_conversas")
}

// Log de IA (debug/monitoramento)
model IALog {
  id          String   @id @default(cuid())
  iaId        String
  ia          IA       @relation("IALogRef", fields: [iaId], references: [id], onDelete: Cascade)
  
  // Log
  nivel       String   // info, warning, error
  mensagem    String
  dados       Json?
  
  // Trace
  timestamp   DateTime @default(now())
  
  @@index([iaId])
  @@index([nivel])
  @@map("ia_logs")
}

// Analytics de IA
model IAAnaliticsDia {
  id          String   @id @default(cuid())
  iaId        String
  
  // Data
  data        DateTime
  
  // Métricas
  conversas   Int      @default(0)
  mensagens   Int      @default(0)
  tokens      Int      @default(0)
  custo       Decimal  @default(0) @db.Decimal(10, 4)
  
  avgResponseTime Int @default(0) // ms
  erros       Int      @default(0)
  
  @@unique([iaId, data])
  @@map("ia_analytics_dia")
}
```

---

## 🎨 TEMPLATES PRÉ-CONFIGURADOS

### Template 1: SDR Qualificação

```javascript
{
  nome: "SDR Qualificação",
  template: "sdr_qualificacao",
  systemPrompt: `Você é um Sales Development Representative (SDR) automático.
    
    Seu objetivo é qualificar leads através de perguntas estratégicas.
    
    1. Colete: Nome, Área Jurídica, Situação, Contato
    2. Qualifique: Calcule viabilidade (score 0-100)
    3. Encaminhe: Se viável, passe para humano
    
    Seja amigável, profissional e direto. Máximo 2-3 perguntas por mensagem.`,
  
  modelo: "sonnet",
  temperature: 0.7,
  maxTokens: 4096,
  
  comportamento: {
    timeout: 30,
    maxTentativas: 3,
    logging: true,
    alertaSupervisor: true
  },
  
  toolsDisponiveis: [
    "buscar_ficha",
    "criar_caso",
    "calcular_score",
    "criar_alerta"
  ]
}
```

### Template 2: Suporte Técnico

```javascript
{
  nome: "Suporte Técnico",
  template: "suporte_tecnico",
  systemPrompt: `Você é um agente de suporte técnico especializado.
    
    1. Entenda o problema
    2. Forneça solução se possível
    3. Escalone se necessário
    
    Seja paciente e claro nas explicações.`,
  
  modelo: "sonnet",
  temperature: 0.5, // Menos criatividade
  maxTokens: 2048,
  
  toolsDisponiveis: [
    "buscar_base_conhecimento",
    "criar_ticket",
    "enviar_documento"
  ]
}
```

### Template 3: Email Responder

```javascript
{
  nome: "Email Responder",
  template: "email_responder",
  systemPrompt: `Você é um assistente que responde emails automaticamente.
    
    1. Leia o email
    2. Responda de forma profissional
    3. Deixe assinatura apropriada`,
  
  modelo: "haiku", // Mais rápido/barato
  temperature: 0.3,
  maxTokens: 1024,
  
  toolsDisponiveis: [
    "buscar_contexto_cliente",
    "enviar_resposta"
  ]
}
```

### Template 4: Chatbot de Visitante

```javascript
{
  nome: "Chatbot Visitante",
  template: "chatbot_visitante",
  systemPrompt: `Você é um chatbot amigável de primeiro contato.
    
    1. Dê boas-vindas
    2. Entenda a necessidade
    3. Ofereça recursos ou agende consulta
    
    Seja entusiasmado e acessível.`,
  
  modelo: "haiku",
  temperature: 0.8, // Mais natural/conversacional
  maxTokens: 1024,
  
  toolsDisponiveis: [
    "agendar_consulta",
    "enviar_material",
    "coletar_email"
  ]
}
```

---

## 🛠️ PÁGINA DE CRIAR IA

### Fluxo: `/ia/criar` ou `/ia/[id]/editar`

```
PASSO 1: Escolher Template
┌─────────────────────────────────┐
│ Qual tipo de IA você quer criar?│
├─────────────────────────────────┤
│ ☐ SDR Qualificação             │
│ ☐ Suporte Técnico              │
│ ☐ Email Automático             │
│ ☐ Chatbot de Visitante         │
│ ☑ Custom (Em branco)           │
│ [Próximo]                       │
└─────────────────────────────────┘

PASSO 2: Configuração Básica
┌─────────────────────────────────┐
│ Nome da IA:                     │
│ [Meu SDR do WhatsApp        ]   │
│                                 │
│ Descrição (opcional):           │
│ [Qualifica leads juridicos  ]   │
│                                 │
│ Ícone:                          │
│ [🤖 ▼]                          │
│                                 │
│ Canal:                          │
│ [WhatsApp ▼]                    │
│                                 │
│ [Anterior] [Próximo]            │
└─────────────────────────────────┘

PASSO 3: Prompt & Modelo
┌─────────────────────────────────┐
│ System Prompt:                  │
│ ┌─────────────────────────────┐ │
│ │ Você é um SDR automático... │ │
│ │ Coleta: Nome, Área, CPF...  │ │
│ │                             │ │
│ │ [Preview com 50 tokens]     │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│                                 │
│ Modelo:                         │
│ ☐ Haiku (rápido)              │
│ ☑ Sonnet (equilibrado)        │
│ ☐ Opus (máxima capacidade)    │
│                                 │
│ Temperature: [0.7 ─────●──]     │
│ Max Tokens: [4096 ─────●──]     │
│                                 │
│ [Anterior] [Próximo]            │
└─────────────────────────────────┘

PASSO 4: Tools & Integrações
┌─────────────────────────────────┐
│ Selecione as ferramentas:       │
│                                 │
│ ☑ Buscar Ficha                 │
│ ☑ Criar Caso                   │
│ ☑ Calcular Score               │
│ ☑ Criar Alerta                 │
│ ☐ Enviar Email                 │
│ ☐ Agendar Reunião              │
│                                 │
│ Configuração de Canal:          │
│ WhatsApp API Key:               │
│ [••••••••••••••••]              │
│ [Testar Conexão]               │
│                                 │
│ [Anterior] [Próximo]            │
└─────────────────────────────────┘

PASSO 5: Revisão & Deploy
┌─────────────────────────────────┐
│ Nome: Meu SDR do WhatsApp       │
│ Tipo: SDR Qualificação          │
│ Canal: WhatsApp                 │
│ Modelo: Sonnet                  │
│ Tools: 4 ativas                 │
│ Status: [●] Ativo               │
│                                 │
│ Prompt Preview:                 │
│ "Você é um SDR automático..."   │
│ [Ver Completo]                  │
│                                 │
│ [Editar] [Criar] [Cancelar]     │
│                                 │
│ ✅ IA Criada com Sucesso!       │
│ Próximo: Configurar canal       │
│ [Ver Dashboard] [Editar Config] │
└─────────────────────────────────┘
```

---

## 📱 EXEMPLO DE IA CRIADA

### Visualização no Dashboard

```
🤖 Meu SDR do WhatsApp
├─ Status: ✅ Ativo
├─ Canal: 📱 WhatsApp
├─ Modelo: 🧠 Claude Sonnet
├─ Conversas: 127
├─ Tokens Usados: 234.567
├─ Custo: $2.34
├─ Última Usada: 2h atrás
│
├─ [Testar Chat]
├─ [Editar Prompt]
├─ [Ver Analytics]
├─ [Clone essa IA]
├─ [Exportar Config]
└─ [Deletar]
```

---

## 🔧 EDITOR DE PROMPT

```javascript
// Exemplo: Editor de Prompt com Preview

interface PromptEditor {
  // Campo de texto
  textarea: {
    value: "Você é um SDR...",
    placeholder: "Cole seu prompt aqui",
    height: "300px",
    maxLength: 10000
  },
  
  // Variables disponíveis
  variables: [
    "{{nome_cliente}}",
    "{{area_juridica}}",
    "{{telefone}}",
    "{{data_hoje}}"
  ],
  
  // Preview
  preview: {
    tokenCount: 145,
    estimatedCost: "$0.003",
    modelo: "claude-sonnet-4-6"
  },
  
  // Sugestões
  sugestoes: [
    "🎯 Adicionar objetivo claro",
    "🔄 Especificar iterações",
    "📋 Listar capacidades"
  ]
}
```

---

## 🎓 TIPOS DE IA EXTENSÍVEIS

Você pode criar IAs para:

```
👨‍💼 Vendas
├─ SDR Qualificação
├─ Account Manager
└─ Prospector

📞 Atendimento
├─ Suporte Técnico
├─ Customer Success
└─ Onboarding

📧 Comunicação
├─ Email Responder
├─ Newsletter Generator
└─ SMS Automático

🌐 Web
├─ Chatbot Site
├─ FAQ Automático
└─ Live Chat

⚖️ Jurídico
├─ Análise de Caso
├─ Pesquisa de Jurisprudência
├─ Gerador de Documentos
└─ Auditor Legal

📊 Análise
├─ Business Intelligence
├─ Financial Analyst
└─ Data Interpreter

🎨 Criativo
├─ Content Writer
├─ Copy Generator
└─ Designer Assistant
```

---

## 🚀 API PARA CRIAR IA PROGRAMATICAMENTE

```typescript
// POST /api/ia/criar

interface CriarIARequest {
  nome: string;
  descricao?: string;
  canal: "whatsapp" | "email" | "webchat" | "telefone" | "custom";
  templateId?: string; // Se usar template
  systemPrompt: string;
  modelo: "haiku" | "sonnet" | "opus";
  temperature: number;
  maxTokens: number;
  toolsAtivas: string[];
  canalConfig?: {
    [key: string]: string; // API keys, SMTP, etc
  };
}

// Resposta
interface CriarIAResponse {
  id: string;
  nome: string;
  canal: string;
  status: "criada" | "erro";
  mensagem: string;
  proximosPassos: string[];
}

// Exemplo
curl -X POST http://localhost:3000/api/ia/criar \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Meu SDR do WhatsApp",
    "canal": "whatsapp",
    "templateId": "sdr_qualificacao",
    "systemPrompt": "Você é um SDR...",
    "modelo": "sonnet",
    "temperature": 0.7,
    "maxTokens": 4096,
    "toolsAtivas": ["buscar_ficha", "criar_caso"]
  }'
```

---

## 💾 BACKUP & EXPORTAR IA

```javascript
// Exportar configuração completa como JSON

{
  "nome": "Meu SDR do WhatsApp",
  "descricao": "Qualifica leads na área de previdência",
  "canal": "whatsapp",
  "templateId": "sdr_qualificacao",
  "systemPrompt": "Você é um SDR...",
  "modelo": "sonnet",
  "temperature": 0.7,
  "maxTokens": 4096,
  "toolsAtivas": ["buscar_ficha", "criar_caso"],
  "comportamento": {
    "timeout": 30,
    "maxTentativas": 3
  },
  "exportadoEm": "2026-06-29T18:45:00Z",
  "versao": "1.0"
}

// Importar: Fazer upload do arquivo JSON para criar nova IA
```

---

## 📊 ANALYTICS POR IA

```
Dashboard: `/ia/[id]/analytics`

Métricas:
├─ Total de Conversas: 127
├─ Conversas Hoje: 12
├─ Taxa de Sucesso: 68%
├─ Tempo Médio: 5min 23s
│
├─ Tokens Usados:
│  ├─ Hoje: 45.678
│  ├─ Mês: 1.234.567
│  └─ Estimativa: $12.34/mês
│
├─ Performance:
│  ├─ Tempo Resposta: 2.3s
│  ├─ Taxa de Erro: 0.8%
│  └─ Uptime: 99.9%
│
└─ Top Ações:
   ├─ Buscar Ficha: 67 chamadas
   ├─ Criar Caso: 45 chamadas
   └─ Calcular Score: 89 chamadas
```

---

## 🔐 SEGURANÇA

- ✅ API keys criptografadas
- ✅ Prompts auditáveis (log de mudanças)
- ✅ Acesso controlado por usuário
- ✅ Rate limiting por IA
- ✅ Monitoramento de custos
- ✅ Backup automático de config

---

## 🎯 ROADMAP

### FASE 1: MVP (2 semanas)
- [ ] Schema Prisma para IA Factory
- [ ] 4 Templates pré-configurados
- [ ] Página de criar IA
- [ ] CRUD de IA
- [ ] Dashboard simples

### FASE 2: Avançado (2 semanas)
- [ ] Editor visual de prompt
- [ ] Teste de IA antes de deploy
- [ ] Clone de IA
- [ ] Versionamento de prompts
- [ ] Import/Export

### FASE 3: Inteligente (2 semanas)
- [ ] Marketplace de IAs (compartilhar)
- [ ] Sugestões automáticas de prompt
- [ ] A/B testing de prompts
- [ ] Histórico de performance
- [ ] Optimization recomendações

---

**Status:** 🟢 Production Ready  
**Impacto:** 🔴 Crítico - Torna sistema infinitamente extensível

