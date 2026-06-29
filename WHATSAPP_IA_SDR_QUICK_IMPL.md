# 🚀 WhatsApp IA SDR - Quick Implementation

**Como implementar o sistema de SDR no WhatsApp IA**

---

## 1️⃣ Roteiro de Implementação (5 Semanas)

### SEMANA 1: Schema + Tipos
- ✅ Prisma schema (tabelas criadas)
- ✅ TypeScript types (whatsapp-sdr.ts)
- [ ] Migration Prisma deploy
- [ ] Gerar Prisma Client

### SEMANA 2: Backend APIs
- [ ] POST `/api/ia/whatsapp/roteiros` (CRUD)
- [ ] POST `/api/ia/whatsapp/iniciar-roteiro`
- [ ] POST `/api/ia/whatsapp/responder-pergunta`
- [ ] POST `/api/ia/whatsapp/calcular-score`

### SEMANA 3: Frontend
- [ ] Componente `RoteiroEditor.tsx` (drag-and-drop)
- [ ] Componente `QualificacaoPanel.tsx`
- [ ] Página `/ia/whatsapp/roteiros` (CRUD)
- [ ] Página `/ia/whatsapp/roteiros/[id]/editar`

### SEMANA 4: Integração WhatsApp
- [ ] Receber mensagem via webhook
- [ ] Executar roteiro
- [ ] Enviar pergunta via WhatsApp
- [ ] Coletar resposta e validar

### SEMANA 5: Fila + Analytics
- [ ] Página `/ia/whatsapp/fila`
- [ ] Página `/ia/whatsapp/analytics`
- [ ] Dashboard em tempo real
- [ ] Testes E2E

---

## 2️⃣ Primeiro Roteiro (30 min)

Criar roteiro padrão via API:

```bash
curl -X POST http://localhost:3000/api/ia/whatsapp/roteiros \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Roteiro Previdenciário",
    "description": "Qualifica leads na área de previdência",
    "steps": [
      {
        "order": 1,
        "pergunta": "Qual é o seu nome?",
        "tipo": "text",
        "isRequired": true,
        "proximoStep": 2
      },
      {
        "order": 2,
        "pergunta": "Qual área jurídica você procura?",
        "tipo": "multiple_choice",
        "isRequired": true,
        "respostas": [
          {"label": "Previdenciário", "value": "previdenciario"},
          {"label": "Trabalhista", "value": "trabalhista"},
          {"label": "Família", "value": "familia"}
        ],
        "proximoStep": 3
      },
      {
        "order": 3,
        "pergunta": "Qual é sua situação?",
        "tipo": "text",
        "isRequired": true,
        "proximoStep": 4
      },
      {
        "order": 4,
        "pergunta": "Qual seu CPF?",
        "tipo": "text",
        "regex": "^[0-9]{3}\\.[0-9]{3}\\.[0-9]{3}-[0-9]{2}$",
        "proximoStep": null
      }
    ]
  }'
```

---

## 3️⃣ Lógica de Scoring (TypeScript)

```typescript
// src/lib/scoring.ts

export function calcularScore(dados: Record<string, any>): LeadScore {
  let score = 0;
  
  // Area viable? (+25)
  const areasViaveis = ["previdenciario", "trabalhista", "civil", "familia"];
  if (areasViaveis.includes(dados.area)) {
    score += 25;
  }
  
  // Situacao comum? (+20)
  const situacoesComuns = ["aposentadoria", "pensao", "divorcio", "heranca"];
  if (situacoesComuns.includes(dados.situacao?.toLowerCase())) {
    score += 20;
  }
  
  // CPF valido? (+15)
  if (dados.cpf && isValidCPF(dados.cpf)) {
    score += 15;
  }
  
  // Descricao clara? (+20)
  if (dados.descricao && dados.descricao.length > 50) {
    score += 20;
  }
  
  // Contato completo? (+20)
  if (dados.telefone && dados.email) {
    score += 20;
  }
  
  // Resultado
  const viabilidade = score >= 70 ? "viavel" : score >= 50 ? "talvez" : "inviavel";
  const motivo = score < 70 
    ? "Sua situação requer análise especializada. Vamos agendar uma reunião consultiva?"
    : "Seu caso é viável! Vou encaminhar para nosso time analisar.";
  
  return {
    totalScore: score,
    viabilidade,
    motivo,
    proximosPassos: viabilidade === "viavel" 
      ? ["Encaminhar para advogado", "Agendar reunião"]
      : ["Consulta adicional", "Oferecer alternativa"],
    recomendacaoEncaminhamento: viabilidade === "viavel" ? "imediato" : "com_ressalva"
  };
}

function isValidCPF(cpf: string): boolean {
  // Simples validação
  const numbers = cpf.replace(/\D/g, "");
  return numbers.length === 11;
}
```

---

## 4️⃣ API Endpoint de Resposta

```typescript
// src/app/api/ia/whatsapp/responder-pergunta/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calcularScore } from "@/lib/scoring";

export async function POST(request: NextRequest) {
  try {
    const { conversationId, resposta } = await request.json();
    
    // Buscar conversa e qualificação
    const conversation = await prisma.whatsAppConversation.findUnique({
      where: { id: conversationId },
      include: { 
        qualificacao: true,
        roteiro: { include: { steps: true } }
      }
    });

    if (!conversation?.qualificacao) {
      return NextResponse.json(
        { error: "Qualificação não encontrada" },
        { status: 404 }
      );
    }

    // Atualizar dados coletados
    const novoDados = {
      ...conversation.qualificacao.dados,
      [`passo_${conversation.qualificacao.dados.currentStep || 1}`]: resposta
    };

    // Descobrir próximo passo
    const roteiroSteps = conversation.roteiro?.steps || [];
    const currentOrder = conversation.qualificacao.dados.currentStep || 1;
    const proximaOrdem = currentOrder + 1;
    const proximoPasso = roteiroSteps.find(s => s.order === proximaOrdem);

    // Se não há próximo passo, finalizar roteiro
    if (!proximoPasso) {
      const score = calcularScore(novoDados);
      
      await prisma.whatsAppQualificacao.update({
        where: { id: conversation.qualificacao.id },
        data: {
          dados: novoDados,
          score: score.totalScore,
          viabilidade: score.viabilidade as any,
          motivo: score.motivo
        }
      });

      // Se viável, encaminhar para humano
      if (score.viabilidade === "viavel") {
        await prisma.whatsAppHumanTicket.create({
          data: {
            conversationId,
            leadId: conversation.leadId,
            reason: "Qualificação concluída via SDR",
            priority: "high"
          }
        });
      }

      return NextResponse.json({
        status: "finalizado",
        score: score.totalScore,
        viabilidade: score.viabilidade,
        mensagem: score.motivo
      });
    }

    // Atualizar dado e retornar próxima pergunta
    await prisma.whatsAppQualificacao.update({
      where: { id: conversation.qualificacao.id },
      data: {
        dados: { ...novoDados, currentStep: proximaOrdem }
      }
    });

    return NextResponse.json({
      status: "continua",
      pergunta: proximoPasso.pergunta,
      tipo: proximoPasso.tipo,
      respostas: proximoPasso.respostas,
      passo: proximaOrdem,
      totalPassos: roteiroSteps.length
    });

  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json(
      { error: "Erro ao processar resposta" },
      { status: 500 }
    );
  }
}
```

---

## 5️⃣ Componente de Editor de Roteiro

```typescript
// src/components/whatsapp/RoteiroEditor.tsx

"use client";

import { useState } from "react";
import { Trash2, Plus, Copy } from "lucide-react";
import { WhatsAppRoteiro, WhatsAppRoteiroStep } from "@/types/whatsapp-sdr";

interface RoteiroEditorProps {
  roteiro?: WhatsAppRoteiro;
  onSave: (roteiro: any) => Promise<void>;
}

export function RoteiroEditor({ roteiro, onSave }: RoteiroEditorProps) {
  const [name, setName] = useState(roteiro?.name || "");
  const [description, setDescription] = useState(roteiro?.description || "");
  const [steps, setSteps] = useState<WhatsAppRoteiroStep[]>(roteiro?.steps || []);
  const [saving, setSaving] = useState(false);

  const addStep = () => {
    const novoStep: WhatsAppRoteiroStep = {
      id: `temp_${Date.now()}`,
      roteiroId: roteiro?.id || "",
      order: steps.length + 1,
      pergunta: "",
      tipo: "text",
      isRequired: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setSteps([...steps, novoStep]);
  };

  const updateStep = (index: number, updatedStep: WhatsAppRoteiroStep) => {
    const newSteps = [...steps];
    newSteps[index] = updatedStep;
    setSteps(newSteps);
  };

  const deleteStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ name, description, steps });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="space-y-4">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nome do roteiro"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Descrição do roteiro"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
          rows={2}
        />
      </div>

      {/* Steps */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Passos do Roteiro</h3>
        
        {steps.map((step, index) => (
          <div key={index} className="bg-white border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-600">
                Passo {step.order}
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => deleteStep(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <input
              type="text"
              value={step.pergunta}
              onChange={e => updateStep(index, { ...step, pergunta: e.target.value })}
              placeholder="Pergunta para o lead"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            />

            <select
              value={step.tipo}
              onChange={e => updateStep(index, { ...step, tipo: e.target.value as any })}
              className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="text">Texto</option>
              <option value="multiple_choice">Múltipla Escolha</option>
              <option value="date">Data</option>
              <option value="phone">Telefone</option>
            </select>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={step.isRequired}
                onChange={e => updateStep(index, { ...step, isRequired: e.target.checked })}
              />
              <span className="text-sm text-gray-600">Obrigatória</span>
            </label>
          </div>
        ))}

        <button
          onClick={addStep}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <Plus size={18} /> Adicionar Passo
        </button>
      </div>

      {/* Save Button */}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Salvar Roteiro"}
        </button>
      </div>
    </div>
  );
}
```

---

## 6️⃣ Testar Fluxo Completo

```bash
# 1. Criar roteiro
curl -X POST http://localhost:3000/api/ia/whatsapp/roteiros \
  -H "Content-Type: application/json" \
  -d '{"name": "Previdenciário", ...}'

# 2. Iniciar conversa
curl -X POST http://localhost:3000/api/ia/whatsapp/iniciar-roteiro \
  -H "Content-Type: application/json" \
  -d '{"conversationId": "abc123", "roteiroId": "def456"}'

# 3. Responder pergunta 1
curl -X POST http://localhost:3000/api/ia/whatsapp/responder-pergunta \
  -H "Content-Type: application/json" \
  -d '{"conversationId": "abc123", "resposta": "João Silva"}'

# 4. Responder pergunta 2
curl -X POST http://localhost:3000/api/ia/whatsapp/responder-pergunta \
  -H "Content-Type: application/json" \
  -d '{"conversationId": "abc123", "resposta": "previdenciario"}'
```

---

## 7️⃣ Próximas Tarefas

- [ ] Executar migration Prisma
- [ ] Implementar 4 endpoints principais
- [ ] Criar componente RoteiroEditor
- [ ] Testar fluxo end-to-end
- [ ] Integrar com webhook WhatsApp
- [ ] Deploy em staging

---

**Tempo Total:** 5 semanas para MVP completo  
**Prioridade:** 🔴 Crítico para conversão de leads

