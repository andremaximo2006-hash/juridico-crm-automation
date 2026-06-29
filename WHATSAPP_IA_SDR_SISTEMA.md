# 📱 WhatsApp IA - Sistema SDR (Sales Development Representative)

**Data:** 2026-06-29 | **Status:** Design Executivo

---

## 🎯 OBJETIVO

WhatsApp IA que funciona como **SDR Automático**:
1. Inicia conversa com lead via WhatsApp
2. Segue roteiro de atendimento customizável
3. Qualifica lead automaticamente (scoring)
4. Coleta dados essenciais
5. Quando pronto: encaminha para humano fazer fechamento

---

## 🏗️ ARQUITETURA

```
WhatsApp Lead
    ↓
WhatsApp IA SDR (começa roteiro)
    ↓
[Pergunta 1] → O que você precisa?
    ↓
[Pergunta 2] → Qual área jurídica?
    ↓
[Pergunta 3] → Qual a situação?
    ↓
[Sistema de Scoring] → Viável? Score?
    ↓
├─ SIM (score > 70) → Encaminha para humano
└─ NÃO (score < 70) → Oferece alternativas
```

---

## 📋 SCHEMA PRISMA - ROTEIROS DE ATENDIMENTO

```prisma
// Configuração de roteiro
model WhatsAppRoteiro {
  id            String   @id @default(cuid())
  name          String   // "Roteiro Previdenciário", "Roteiro Família"
  description   String?
  
  // Ativação
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relações
  steps         WhatsAppRoteiroStep[]  // Passos do roteiro
  conversations WhatsAppConversation[] // Conversas que usam este roteiro
  
  @@map("whatsapp_roteiros")
}

// Passo do roteiro (pergunta do SDR)
model WhatsAppRoteiroStep {
  id            String   @id @default(cuid())
  roteiroId     String
  roteiro       WhatsAppRoteiro @relation(fields: [roteiroId], references: [id], onDelete: Cascade)
  
  // Ordem
  order         Int      // 1, 2, 3...
  
  // Pergunta
  pergunta      String   // "Qual é a sua área jurídica?"
  tipo          String   @default("text") // "text", "multiple_choice", "date", "phone"
  isRequired    Boolean  @default(true)
  
  // Respostas possíveis (se multiple_choice)
  respostas     Json?    // [{ label: "Família", value: "familia" }, ...]
  
  // Condições (ir para próximo passo ou branch)
  proximoStep   Int?     // Número do próximo passo (NULL = fim)
  condicoes     Json?    // Lógica de branching: { "if": "area == familia", "goto": 5 }
  
  // Validação
  regex         String?  // Para validar formato (ex: CPF)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@unique([roteiroId, order])
  @@map("whatsapp_roteiro_steps")
}

// Resposta do lead durante qualificação
model WhatsAppQualificacao {
  id            String   @id @default(cuid())
  conversationId String
  conversation  WhatsAppConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  
  // Dados coletados
  dados         Json     // { "area": "familia", "situacao": "divorcio", ... }
  
  // Scoring
  score         Int      @default(0)  // 0-100
  viabilidade   String   @default("pendente") // "viavel", "inviavel", "pendente"
  motivo        String?  // Por que é inviável?
  
  // Encaminhamento
  encaminhadoEm DateTime?
  encaminhadoPara String? // user_id do humano
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@map("whatsapp_qualificacoes")
}

// Tarefa do SDR (ações automáticas)
model WhatsAppTarefa {
  id            String   @id @default(cuid())
  conversationId String
  conversation  WhatsAppConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  
  // Tipo de tarefa
  tipo          String   // "enviar_documento", "agendar_reuniao", "coletar_cpf"
  descricao     String
  
  // Status
  status        String   @default("pendente") // "pendente", "completo", "erro"
  resultado     Json?
  
  createdAt     DateTime @default(now())
  completadoEm  DateTime?
  
  @@map("whatsapp_tarefas")
}
```

---

## 🎮 ROTEIRO DE EXEMPLO

### Roteiro: "Previdenciário"

```
PASSO 1 (Saudação)
├─ Pergunta: "Olá! Bem-vindo à Jurídico CRM. Qual é o seu nome?"
├─ Tipo: text
├─ Próximo: Passo 2

PASSO 2 (Área)
├─ Pergunta: "Qual área jurídica você procura?"
├─ Tipo: multiple_choice
├─ Opções:
│  ├─ Previdenciário
│  ├─ Trabalhista
│  ├─ Civil
│  ├─ Família
│  └─ Outro
├─ Próximo: Passo 3

PASSO 3 (Situação - Branch por área)
├─ SE area == "Previdenciário":
│  └─ "Qual sua situação? (aposentadoria, pensão, BPC?)"
│  └─ Próximo: Passo 4
├─ SE area == "Família":
│  └─ "Qual sua situação? (divórcio, guarda, pensão?)"
│  └─ Próximo: Passo 4
└─ SE area == "Outro":
   └─ "Desculpe, não atendemos essa área. Deixo seu contato?"
   └─ Próximo: Passo FINAL

PASSO 4 (Detalhamento)
├─ Pergunta: "Conte um pouco sobre sua situação..."
├─ Tipo: text
├─ Próximo: Passo 5

PASSO 5 (Contato)
├─ Pergunta: "Qual seu CPF? (para análise de viabilidade)"
├─ Tipo: text
├─ Regex: CPF format validation
├─ Próximo: Passo 6

PASSO 6 (Scoring & Decisão)
├─ SISTEMA CALCULA SCORE:
│  ├─ Área viável? +25
│  ├─ Situação comum? +20
│  ├─ CPF válido? +15
│  ├─ Descrição clara? +20
│  └─ Contato completo? +20
│
├─ SE score >= 70:
│  ├─ "Ótimo! Seu caso é viável!"
│  ├─ "Vou encaminhar para nosso time jurídico analisar"
│  ├─ "Um especialista entrará em contato em breve"
│  └─ STATUS: ENCAMINHAR_PARA_HUMANO
│
├─ SE score < 70:
│  ├─ "Sua situação requer análise especializada"
│  ├─ "Vou marcar uma reunião consultiva com nosso advogado?"
│  └─ STATUS: ENCAMINHAR_COM_RESSALVA
```

---

## 🤖 LÓGICA DE QUALIFICAÇÃO (Scoring)

```typescript
interface ScoringCriteria {
  areaViavel: number;        // +25 se área é viável
  situacaoComum: number;     // +20 se situação é comum/viável
  documentosCompletos: number; // +20 se tem CPF/contato
  descricaoClara: number;    // +20 se descrição é clara
  urgencia: number;          // +15 se é urgente
  clientePotencial: number;  // +5 se parece ser cliente de verdade
}

interface LeadScore {
  totalScore: number;        // 0-100
  viabilidade: "viavel" | "inviavel" | "talvez";
  motivo: string;
  proximosPassos: string[];
  recomendacaoEncaminhamento: "imediato" | "com_ressalva" | "nao_viavel";
}

// EXEMPLO DE SCORING:
// Area: Previdenciário (+25) ✅
// Situação: Aposentadoria (+20) ✅
// CPF válido (+15) ✅
// Descrição clara (+20) ✅
// = 80 pontos → VIÁVEL → Encaminhar
```

---

## 📊 FLUXO DE DADOS

```
1. NOVO LEAD CHEGA NO WHATSAPP
   └─ WhatsAppConversation criada

2. SDR IA INICIA ROTEIRO
   ├─ Pega WhatsAppRoteiro (ex: "Previdenciário")
   ├─ Começa WhatsAppRoteiroStep 1

3. PARA CADA PERGUNTA
   ├─ IA envia mensagem (pergunta)
   ├─ Lead responde
   ├─ Resposta validada e armazenada
   ├─ Score atualizado
   └─ Va para próximo passo

4. QUALIFICAÇÃO CONTÍNUA
   ├─ Após cada resposta:
   │  ├─ Calcula score parcial
   │  ├─ Verifica se atende critérios mínimos
   │  └─ Decide se continua ou encaminha antes
   └─ WhatsAppQualificacao atualizada

5. ENCAMINHAMENTO PARA HUMANO
   ├─ Se score >= 70:
   │  ├─ Cria WhatsAppHumanTicket
   │  ├─ Atribui a um advogado
   │  ├─ Avisa o cliente: "Especialista entrará em contato"
   │  └─ Status: PRONTO_PARA_VENDA
   │
   └─ Se score < 70:
      ├─ Oferece alternativa
      ├─ Tenta qualificar mais
      └─ Se persistir: "Agradeça e ofereça contato"

6. HUMANO FECHA CONTRATO
   ├─ WhatsAppHumanTicket → resolved
   ├─ Lead → Client (se fechar)
   ├─ Cria Case e FeeAgreement
   └─ Histórico completo disponível
```

---

## 🎨 INTERFACE DE CONFIGURAÇÃO (UI/UX)

### Página: `/ia/whatsapp/roteiros`

```
┌─────────────────────────────────────────┐
│ WHATSAPP IA - ROTEIROS DE ATENDIMENTO   │
├─────────────────────────────────────────┤
│                                         │
│ [+ Novo Roteiro]                        │
│                                         │
│ ROTEIROS ATIVOS:                        │
├─────────────────────────────────────────┤
│                                         │
│ 📋 Roteiro Previdenciário               │
│    Status: ✅ Ativo                     │
│    Passos: 6                            │
│    Conversas: 127                       │
│    Taxa Qualificação: 73%               │
│    [Editar] [Clonar] [Preview] [Stats]  │
│                                         │
│ 📋 Roteiro Família                      │
│    Status: ✅ Ativo                     │
│    Passos: 5                            │
│    Conversas: 89                        │
│    Taxa Qualificação: 65%               │
│    [Editar] [Clonar] [Preview] [Stats]  │
│                                         │
│ 📋 Roteiro Trabalhista                  │
│    Status: 🔴 Inativo                   │
│    Passos: 7                            │
│    [Ativar] [Editar]                    │
│                                         │
└─────────────────────────────────────────┘
```

### Editor de Roteiro: `/ia/whatsapp/roteiros/[id]/editar`

```
┌─────────────────────────────────────────────┐
│ EDITAR ROTEIRO: Previdenciário              │
├─────────────────────────────────────────────┤
│                                             │
│ Nome: [Previdenciário               ]       │
│ Descrição: [Roteiro para casos...   ]       │
│ Status: [✅ Ativo]                          │
│                                             │
│ ─────────────────────────────────────────   │
│ PASSOS DO ROTEIRO:                          │
│ ─────────────────────────────────────────   │
│                                             │
│ PASSO 1 ↕️ ▼                                 │
│ ├─ Pergunta: "Qual é seu nome?"             │
│ ├─ Tipo: [Text ▼]                           │
│ ├─ Obrigatória: [✓]                         │
│ ├─ Próximo passo: [2 ▼]                     │
│ └─ [Editar] [Clonar] [Deletar]              │
│                                             │
│ PASSO 2 ↕️ ▼                                 │
│ ├─ Pergunta: "Qual área jurídica?"          │
│ ├─ Tipo: [Multiple Choice ▼]                │
│ ├─ Obrigatória: [✓]                         │
│ ├─ Opções:                                  │
│ │  ├─ ☑ Previdenciário                     │
│ │  ├─ ☑ Trabalhista                        │
│ │  ├─ ☑ Família                            │
│ │  └─ ☑ Outro                              │
│ ├─ Próximo passo: [3 ▼]                     │
│ └─ [Editar] [Clonar] [Deletar]              │
│                                             │
│ PASSO 3 ↕️ ▼                                 │
│ ├─ Pergunta: "Qual sua situação?"           │
│ ├─ Tipo: [Text ▼]                           │
│ ├─ Condições (Branching):                   │
│ │  ├─ Se [area == "Familia"]                │
│ │  │  └─ Próximo passo: [4 ▼]              │
│ │  └─ Se [area == "Previdenciario"]         │
│ │     └─ Próximo passo: [5 ▼]              │
│ └─ [Editar] [Clonar] [Deletar]              │
│                                             │
│ [+ Adicionar Passo] [Preview] [Salvar]     │
│                                             │
└─────────────────────────────────────────────┘
```

### Fila de Qualificação: `/ia/whatsapp/fila`

```
┌──────────────────────────────────────────┐
│ WHATSAPP IA - FILA DE QUALIFICAÇÃO       │
├──────────────────────────────────────────┤
│                                          │
│ Filtro: [Todas ▼] [Score ↓]              │
│                                          │
│ 🔴 CRÍTICO (Score 85-100)                │
│ ├─ João Silva                            │
│ │  ├─ Área: Previdenciário               │
│ │  ├─ Score: 92/100 🟢                   │
│ │  ├─ Status: Pronto para venda           │
│ │  └─ [Ver Conversa] [Assinar]            │
│ │                                        │
│ └─ Maria Santos                          │
│    ├─ Área: Família                      │
│    ├─ Score: 88/100 🟢                   │
│    ├─ Status: Pronto para venda           │
│    └─ [Ver Conversa] [Assinar]            │
│                                          │
│ 🟡 MÉDIO (Score 70-84)                   │
│ ├─ Pedro Costa                           │
│ │  ├─ Área: Trabalhista                  │
│ │  ├─ Score: 76/100 🟡                   │
│ │  ├─ Status: Possível com ressalva       │
│ │  └─ [Ver Conversa] [Analisar]           │
│                                          │
│ 🟢 SUGESTÃO (Score <70)                  │
│ ├─ Você não tem leads não qualificados   │
│                                          │
│ Total: 12 leads aguardando ação humana   │
│                                          │
└──────────────────────────────────────────┘
```

---

## 💻 COMPONENTES REACT

### 1. RoteiroEditor.tsx
```typescript
interface RoteiroEditorProps {
  roteiroId?: string;
  onSave: (roteiro: WhatsAppRoteiro) => void;
}

export function RoteiroEditor({ roteiroId, onSave }: RoteiroEditorProps) {
  const [steps, setSteps] = useState<WhatsAppRoteiroStep[]>([]);
  
  return (
    <div className="space-y-6">
      {/* Editor de passos */}
      {steps.map((step, i) => (
        <StepEditor
          key={i}
          step={step}
          onUpdate={(updated) => {
            const newSteps = [...steps];
            newSteps[i] = updated;
            setSteps(newSteps);
          }}
        />
      ))}
      <button onClick={() => setSteps([...steps, newStep()])}>
        + Adicionar Passo
      </button>
    </div>
  );
}
```

### 2. QualificacaoPanel.tsx
```typescript
interface QualificacaoPanelProps {
  conversationId: string;
  qualificacao: WhatsAppQualificacao;
}

export function QualificacaoPanel({ conversationId, qualificacao }: QualificacaoPanelProps) {
  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Score de Qualificação</h3>
        <ScoreBadge score={qualificacao.score} />
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Viabilidade</span>
            <span className={qualificacao.viabilidade === 'viavel' ? 'text-green-600' : 'text-red-600'}>
              {qualificacao.viabilidade.toUpperCase()}
            </span>
          </div>
          <ProgressBar value={qualificacao.score} max={100} />
        </div>
        
        <div className="text-sm text-gray-600">
          {qualificacao.motivo && (
            <p>Motivo: {qualificacao.motivo}</p>
          )}
        </div>
      </div>
      
      {qualificacao.score >= 70 && (
        <button className="mt-4 w-full bg-green-600 text-white py-2 rounded">
          Encaminhar para Humano
        </button>
      )}
    </div>
  );
}
```

---

## 🔧 API ENDPOINTS

```
# Roteiros
GET    /api/ia/whatsapp/roteiros
POST   /api/ia/whatsapp/roteiros
GET    /api/ia/whatsapp/roteiros/:id
PUT    /api/ia/whatsapp/roteiros/:id
DELETE /api/ia/whatsapp/roteiros/:id

# Execução de roteiro
POST   /api/ia/whatsapp/iniciar-roteiro/:conversationId
POST   /api/ia/whatsapp/responder-pergunta/:conversationId
GET    /api/ia/whatsapp/proxima-pergunta/:conversationId

# Qualificação
GET    /api/ia/whatsapp/qualificacao/:conversationId
PUT    /api/ia/whatsapp/qualificacao/:conversationId/score

# Fila de qualificação
GET    /api/ia/whatsapp/fila
GET    /api/ia/whatsapp/fila/stats
POST   /api/ia/whatsapp/encaminhar/:conversationId/:userId
```

---

## 📈 ANALYTICS DO SDR

```
Dashboard: `/ia/whatsapp/analytics`

Métricas:
├─ Total de conversas iniciadas: 542
├─ Taxa de conclusão de roteiro: 87%
├─ Score médio: 76
├─ Leads viáveis (score ≥70): 312 (57%)
├─ Leads encaminhados: 289
├─ Taxa de conversão (lead→cliente): 45%
├─ Tempo médio de qualificação: 8min
├─ Satisfação do lead: 4.2/5

Gráficos:
├─ Conversas por hora
├─ Distribuição de scores
├─ Taxa de conclusão por roteiro
├─ Tempo de atendimento
└─ Conversões por área jurídica
```

---

## 🚀 PRÓXIMAS FASES

### Fase 1: Banco de Dados ✅
- [ ] Criar tabelas (Roteiro, RoteiroStep, Qualificacao, Tarefa)
- [ ] Relações com WhatsAppConversation

### Fase 2: Backend Logic
- [ ] Executor de roteiro (run_roteiro_flow)
- [ ] Sistema de scoring automático
- [ ] Lógica de branching condicional

### Fase 3: Interface Web
- [ ] Editor de roteiros drag-and-drop
- [ ] Fila de qualificação em tempo real
- [ ] Analytics dashboard

### Fase 4: WhatsApp Integration
- [ ] Enviar perguntas via WhatsApp
- [ ] Coletar respostas via webhook
- [ ] Auto-qualificar em tempo real

### Fase 5: Handoff to Human
- [ ] Criar ticket automático
- [ ] Atribuir advogado
- [ ] Transferir contexto completo

---

**Próximo:** Implementar schema no Prisma + endpoints de CRUD  
**Tempo:** 1 semana  
**Impacto:** Sistema completo de qualificação automática

