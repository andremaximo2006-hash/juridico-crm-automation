# 🎨 GUIA VISUAL — Páginas do CRM

**Domínio:** crm.gabriellenunes.com.br  
**Status:** 🟢 LIVE

---

## 🗺️ MAPA DE NAVEGAÇÃO

```
https://crm.gabriellenunes.com.br
│
├─ Dashboard Principal
│
├─ 📚 Módulos do CRM
│  ├─ Leads
│  ├─ Clientes
│  ├─ Operacional
│  ├─ Financeiro
│  ├─ Marketing
│  └─ Gerencial
│
└─ 🤖 IA ATENDIMENTO (NOVO!)
   ├─ /ia/roteiros
   ├─ /ia/conversas
   └─ /ia/atendimento-humano
```

---

## 📱 PÁGINAS IA (3 PÁGINAS PRINCIPAIS)

### **1️⃣ ROTEIROS** — Editor de System Prompts

**URL:** https://crm.gabriellenunes.com.br/ia/roteiros

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  Roteiros de IA                                 │
│  Configure os system prompts por área jurídica  │
├─────────┬───────────────────────────────────────┤
│         │                                       │
│ SIDEBAR │              EDITOR                   │
│ (Lista) │  ┌─────────────────────────────────┐ │
│         │  │ Direito Previdenciário      v1  │ │
│ • Prev  │  │ Área: previdenciario            │ │
│ • Fam   │  │ Status: ✅ Ativo               │ │
│ • Trab  │  │                                 │ │
│ • Civil │  │ System Prompt:                  │ │
│ • Crim  │  │ ┌───────────────────────────────┐ │
│ • Cons  │  │ │ Você é um especialista em... │ │
│ • Inv   │  │ │ (12 linhas de prompt)        │ │
│ • Outro │  │ │                              │ │
│         │  │ └───────────────────────────────┘ │
│ [+] Novo│  │                                 │ │
│         │  │ Tools Disponíveis:              │ │
│         │  │ [transfer_to_human] [search]   │ │
│         │  │ [check_requirements] [save]    │ │
│         │  │                                 │ │
│         │  │ [Reverter] [Salvar]            │ │
│         │  └─────────────────────────────────┘ │
└─────────┴───────────────────────────────────────┘
```

**O que você pode fazer:**
- ✅ Listar todas as 8 especialidades
- ✅ Selecionar um roteiro
- ✅ Editar o system prompt
- ✅ Ver versão atual
- ✅ Clicar "Salvar" (incrementa versão)
- ✅ Ver tools disponíveis
- ✅ Criar novo roteiro
- ✅ Toggle ativo/inativo

---

### **2️⃣ CONVERSAS** — Histórico com Cliente

**URL:** https://crm.gabriellenunes.com.br/ia/conversas

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  Conversas de IA                                │
│  (5 conversas atualmente)                       │
├──────────────────────────────────────────────────┤
│ [Buscar...] [Status: Todas] [Status: Ativas]   │
├─────────────────┬──────────────────────────────┤
│                 │                              │
│  LISTA          │     CHAT PREVIEW             │
│  (conversas)    │  ┌──────────────────────────┐│
│                 │  │ João Silva               ││
│ • João Silva    │  │ 5585988123456            ││
│   5585988***    │  │ Previdenciário           ││
│   Prev - Ativa  │  │                          ││
│   ✅ Ativa      │  │ User: "Tenho 68 anos..."││
│                 │  │ IA:   "Bem-vindo..."    ││
│ • Maria Santos  │  │ User: "Contribuí 35..." ││
│   5585987***    │  │ IA:   "Você está..."    ││
│   Fam - Trans   │  │ User: "Posso aposentar?"││
│   🔄 Transferida│  │ IA:   "Vou transferir..."│
│                 │  │                          ││
│ • Pedro Costa   │  │ Criada: 03/06 15:30     ││
│   5585986***    │  │ Mensagens: 4            ││
│   Trab - Conc   │  │                          ││
│   ✅ Concluída  │  └──────────────────────────┘│
│                 │                              │
└─────────────────┴──────────────────────────────┘
```

**O que você pode fazer:**
- ✅ Buscar conversa por nome ou telefone
- ✅ Filtrar por status (Todas/Ativas/Transferidas/Concluídas)
- ✅ Ver lista de clientes
- ✅ Clicar para ver histórico completo
- ✅ Ver toda a conversa (user ↔ IA alternados)
- ✅ Ver info: data criação, número de mensagens
- ✅ Ver status da conversa (ativa, transferida, concluída)

---

### **3️⃣ ATENDIMENTO HUMANO** — Fila de Tickets

**URL:** https://crm.gabriellenunes.com.br/ia/atendimento-humano

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  Atendimento Humano                             │
│  (12 tickets na fila)                           │
├──────────────────────────────────────────────────┤
│ [Buscar...] [Status: Pendentes] [Prio: Todas]  │
├─────────────────┬──────────────────────────────┤
│                 │                              │
│  FILA           │     DETALHES DO TICKET       │
│  (tickets)      │  ┌──────────────────────────┐│
│                 │  │ João Silva               ││
│ • João Silva    │  │ Precisa aposentadoria    ││
│   "Aposentar"   │  │ [ALTA] [PENDENTE]        ││
│   [ALTA]        │  │                          ││
│   [PEND]        │  │ Informações:             ││
│   ⏰ 15:30      │  │ 📱 5585988123456         ││
│                 │  │ 📧 joao@email.com       ││
│ • Maria Santos  │  │                          ││
│   "Divórcio"    │  │ Timeline:                ││
│   [NORMAL]      │  │ ⏰ Criado: 03/06 15:30  ││
│   [ATRIB]       │  │ 👤 Atrib: Ana Silva     ││
│   ⏰ 14:20      │  │                          ││
│                 │  │ Ações:                   ││
│ • Pedro Costa   │  │ [Iniciar Atendimento]   ││
│   "Horas Extras"│  │ [Marcar Resolvido]      ││
│   [BAIXA]       │  │ [Cancelar]               ││
│   [EM PROG]     │  │                          ││
│   ⏰ 13:15      │  │                          ││
│                 │  └──────────────────────────┘│
│                 │                              │
└─────────────────┴──────────────────────────────┘
```

**O que você pode fazer:**
- ✅ Ver fila de tickets
- ✅ Filtrar por status (Pendentes/Atribuídos/Em Progresso)
- ✅ Filtrar por prioridade (Alta/Normal/Baixa)
- ✅ Buscar por cliente
- ✅ Ver detalhes do ticket
- ✅ Ver informações do lead (nome, telefone, email)
- ✅ Atribuir ticket a atendente
- ✅ Mudar status do ticket
- ✅ Ver timeline (quando foi criado, atribuído, etc)

---

## 🎨 DESIGN & TEMA

### **Cores**
```
Dark Mode:
├─ Background:    #0f172a (slate-950)
├─ Cards:         #1e293b (slate-900)
├─ Primary:       #0066cc (blue-600)
├─ Status Ativa:  #22c55e (green-400)
├─ Status Trans:  #eab308 (yellow-400)
├─ Status Conc:   #3b82f6 (blue-400)
├─ Prioridade Alta:   #dc2626 (red-400)
├─ Prioridade Normal: #f59e0b (amber-400)
└─ Prioridade Baixa:  #3b82f6 (blue-400)
```

### **Responsividade**
```
✅ Desktop (1280px+)   → 3 colunas
✅ Tablet  (768px)     → 2 colunas
✅ Mobile  (<768px)    → 1 coluna (empilhado)
```

---

## 🔧 FUNCIONALIDADES ATIVAS

### **Sidebar Menu IA**
```
IA Atendimento (expandível)
├─ 📋 Roteiros
├─ 💬 Conversas
└─ 👥 Atendimento Humano
```

### **Dark Mode Toggle**
- Localizado no topo do sidebar
- Toggle sun/moon icon
- Salva preferência no localStorage

### **Busca & Filtros**
- Busca em tempo real (while you type)
- Filtros cascata
- Sem página de reload

### **Dados Reais**
- Conectado ao banco PostgreSQL
- APIs reais respondendo
- Histórico completo de conversas
- Tickets reais na fila

---

## 🚀 COMO NAVEGAR

### **Passo 1: Abra o CRM**
```
https://crm.gabriellenunes.com.br
```

### **Passo 2: No Sidebar, procure "IA Atendimento"**
```
Clique no menu "IA Atendimento" para expandir
Você verá:
- 📋 Roteiros
- 💬 Conversas
- 👥 Atendimento Humano
```

### **Passo 3: Explore cada página**

**Roteiros:**
- Veja 8 especialidades
- Clique em uma para editar
- Veja o system prompt
- Clique "Salvar" para versionar

**Conversas:**
- Veja histórico de clientes
- Filtrar por status
- Buscar por nome/telefone
- Ver chat completo

**Atendimento Humano:**
- Ver fila de tickets
- Atribuir a atendentes
- Mudar status
- Ver timeline

---

## ✨ PRIMEIRO USO

### **Teste 1: Ver Roteiros**
1. Abra: https://crm.gabriellenunes.com.br
2. Sidebar → IA Atendimento → Roteiros
3. Clique em "Direito Previdenciário"
4. Veja o system prompt customizado

### **Teste 2: Simular Conversa**
1. Ir para: /ia/conversas
2. Você deve ver conversas criadas
3. Clique em uma conversa
4. Veja o histórico completo

### **Teste 3: Gerenciar Tickets**
1. Ir para: /ia/atendimento-humano
2. Você deve ver tickets na fila
3. Clique em um ticket
4. Atribua a um atendente
5. Mude o status

---

## 🔗 TODAS AS URLs

```
Dashboard Principal:
https://crm.gabriellenunes.com.br

IA Pages:
https://crm.gabriellenunes.com.br/ia/roteiros
https://crm.gabriellenunes.com.br/ia/conversas
https://crm.gabriellenunes.com.br/ia/atendimento-humano

APIs:
https://crm.gabriellenunes.com.br/api/health
https://crm.gabriellenunes.com.br/api/whatsapp/routines
https://crm.gabriellenunes.com.br/api/analytics/metrics
```

---

## 📊 DADOS DEMO (Se houver seed)

**8 Roteiros Jurídicos:**
1. ✅ Previdenciário
2. ✅ Família
3. ✅ Trabalhista
4. ✅ Civil
5. ✅ Criminal
6. ✅ Consumidor
7. ✅ Inventário
8. ✅ Outro

---

## 🎉 TUDO PRONTO!

Sua aplicação está **100% LIVE** e pronta para usar! 

**Próximas ações:**
1. Explore as 3 páginas IA
2. Customize os system prompts
3. Configure webhooks WhatsApp
4. Teste primeira mensagem

---

**Domínio:** crm.gabriellenunes.com.br  
**Status:** 🟢 PRODUCTION  
**Data:** 2026-06-03

