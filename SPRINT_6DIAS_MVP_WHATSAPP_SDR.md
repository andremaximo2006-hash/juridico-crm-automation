# 🔥 SPRINT 6 DIAS - WhatsApp IA SDR MVP FUNCIONAL

**Data:** 2026-06-29 (Seg) até 2026-07-05 (Dom)  
**Objetivo:** WhatsApp IA SDR totalmente funcional e testável  
**Status:** 🚀 Pronto para começar

---

## 📅 PLANO DIÁRIO

### 🌅 DIA 1 - SEGUNDA 29/06 (Database + Seed)
**Tempo:** 3-4 horas | **Entrega:** Banco pronto

#### Tarefas
```
1. [ ] Executar Migration Prisma
   → npx prisma migrate deploy

2. [ ] Verificar tabelas criadas
   → npx prisma db execute
   
3. [ ] Seed de Templates
   → Criar 2 templates: SDR + Suporte
   
4. [ ] Gerar Prisma Client
   → npm run build
```

#### Verificação
```bash
# Verificar tabelas
npx prisma db execute --stdin < verificar.sql

# Testar conexão
npm run dev
# Abrir: http://localhost:3000
```

#### Critério de Sucesso
- ✅ Tabelas criadas no PostgreSQL
- ✅ Prisma Client gerado
- ✅ Sem erros de build

---

### 🌅 DIA 2 - TERÇA 30/06 (Endpoints + Scoring)
**Tempo:** 4-5 horas | **Entrega:** APIs funcionando

#### Tarefas
```
1. [ ] POST /api/whatsapp/roteiros (criar)
   → Recebe nome, descricao, steps
   → Retorna id da IA

2. [ ] GET /api/whatsapp/roteiros (listar)
   → Retorna todas as IAs do usuário

3. [ ] POST /api/whatsapp/iniciar-roteiro
   → Recebe conversationId, roteiroId
   → Retorna primeira pergunta

4. [ ] POST /api/whatsapp/responder-pergunta
   → Recebe conversationId, resposta
   → Retorna próxima pergunta OU scoring

5. [ ] Lógica de Scoring
   → calcularScore() function
   → Atualizar status de qualificação
```

#### Código Template

```typescript
// src/app/api/whatsapp/roteiros/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { nome, descricao, steps } = await request.json();
  
  const roteiro = await prisma.whatsAppRoteiro.create({
    data: { 
      name: nome,
      description: descricao,
      is_active: true,
      steps: {
        create: steps.map((s, i) => ({
          order: i + 1,
          pergunta: s.pergunta,
          tipo: s.tipo || "text",
          is_required: true
        }))
      }
    },
    include: { steps: true }
  });
  
  return NextResponse.json(roteiro);
}
```

#### Teste Manual
```bash
# 1. Criar roteiro
curl -X POST http://localhost:3000/api/whatsapp/roteiros \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "SDR Previdenciário",
    "descricao": "Qualifica leads",
    "steps": [
      {"pergunta": "Qual seu nome?"},
      {"pergunta": "Qual área?"},
      {"pergunta": "Qual CPF?"}
    ]
  }'

# 2. Listar roteiros
curl http://localhost:3000/api/whatsapp/roteiros

# 3. Iniciar conversa
curl -X POST http://localhost:3000/api/whatsapp/iniciar-roteiro \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "conv_123",
    "roteiroId": "roteiro_abc"
  }'

# 4. Responder pergunta
curl -X POST http://localhost:3000/api/whatsapp/responder-pergunta \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "conv_123",
    "resposta": "João Silva"
  }'
```

#### Critério de Sucesso
- ✅ POST /roteiros funciona
- ✅ GET /roteiros retorna lista
- ✅ Iniciar roteiro retorna primeira pergunta
- ✅ Responder pergunta funciona
- ✅ Scoring calcula corretamente

---

### 🌅 DIA 3 - QUARTA 01/07 (UI Básica)
**Tempo:** 3-4 horas | **Entrega:** Pages funcionando

#### Tarefas
```
1. [ ] Page: /ia/whatsapp/roteiros
   → Listar roteiros
   → Botão [+ Novo Roteiro]
   → Stats básicas

2. [ ] Page: /ia/whatsapp/roteiros/novo
   → Form para criar roteiro
   → Array dinâmico de steps
   → Botão [Criar]

3. [ ] Page: /ia/whatsapp/roteiros/[id]/editar
   → Editar roteiro existente
   → Deletar
   → Clonar

4. [ ] Component: <RoteiroForm>
   → Reutilizável
   → Validação básica
```

#### Código Template

```typescript
// src/app/ia/whatsapp/roteiros/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Roteiro {
  id: string;
  name: string;
  is_active: boolean;
}

export default function RoteirosPage() {
  const [roteiros, setRoteiros] = useState<Roteiro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/whatsapp/roteiros")
      .then(r => r.json())
      .then(data => {
        setRoteiros(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Roteiros de Atendimento</h1>
        <Link 
          href="/ia/whatsapp/roteiros/novo"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Novo Roteiro
        </Link>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="space-y-4">
          {roteiros.map(r => (
            <div key={r.id} className="bg-white p-4 rounded border">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold">{r.name}</h3>
                  <p className="text-sm text-gray-600">
                    Status: {r.is_active ? "✅ Ativo" : "🔴 Inativo"}
                  </p>
                </div>
                <div className="space-x-2">
                  <Link 
                    href={`/ia/whatsapp/roteiros/${r.id}/editar`}
                    className="text-blue-600 hover:underline"
                  >
                    Editar
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

#### Critério de Sucesso
- ✅ Page /roteiros lista roteiros
- ✅ Form cria roteiro novo
- ✅ Edição funciona
- ✅ UI responsiva (não precisa ser bonita, só funcional)

---

### 🌅 DIA 4 - QUINTA 02/07 (Chat + Fila)
**Tempo:** 4-5 horas | **Entrega:** Fluxo completo testável

#### Tarefas
```
1. [ ] Page: /ia/whatsapp/conversar/[roteiroId]
   → Interface de chat
   → Iniciar roteiro automaticamente
   → Exibir pergunta
   → Input para resposta
   → Histórico de mensagens

2. [ ] Page: /ia/whatsapp/fila
   → Listar conversas em qualificação
   → Filtro por score
   → Ver detalhes da conversa
   → Botão [Encaminhar para Humano]

3. [ ] Component: <ChatWindow>
   → Exibir mensagens
   → Input de resposta
   → Send button
   → Auto-scroll

4. [ ] Dashboard simples
   → Total de conversas
   → Leads viáveis
   → Score médio
```

#### Código Template

```typescript
// src/app/ia/whatsapp/conversar/[roteiroId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Mensagem {
  role: "user" | "assistant";
  content: string;
}

export default function ConversarPage() {
  const params = useParams();
  const roteiroId = params.roteiroId as string;
  
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [input, setInput] = useState("");
  const [conversationId] = useState(`conv_${Date.now()}`);
  const [loading, setLoading] = useState(false);

  // Iniciar roteiro
  useEffect(() => {
    fetch("/api/whatsapp/iniciar-roteiro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, roteiroId })
    })
      .then(r => r.json())
      .then(data => {
        setMensagens([{
          role: "assistant",
          content: data.pergunta
        }]);
      });
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    setMensagens(prev => [...prev, { role: "user", content: input }]);
    setInput("");
    setLoading(true);

    // Send response
    const response = await fetch("/api/whatsapp/responder-pergunta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, resposta: input })
    });

    const data = await response.json();

    if (data.status === "continua") {
      // Next question
      setMensagens(prev => [...prev, {
        role: "assistant",
        content: data.proximaPergunta
      }]);
    } else if (data.status === "finalizado") {
      // Show result
      setMensagens(prev => [...prev, {
        role: "assistant",
        content: `Score: ${data.score}/100\nViabilidade: ${data.viabilidade}\n${data.mensagem}`
      }]);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto h-screen flex flex-col p-4">
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 bg-gray-100 p-4 rounded">
        {mensagens.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs px-4 py-2 rounded ${
              msg.role === "user" 
                ? "bg-blue-600 text-white" 
                : "bg-white text-gray-900"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === "Enter" && handleSend()}
          placeholder="Digite sua resposta..."
          className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
```

#### Critério de Sucesso
- ✅ Chat funciona end-to-end
- ✅ Perguntas aparecem sequencialmente
- ✅ Scoring calcula ao final
- ✅ Fila mostra leads qualificados
- ✅ Score/viabilidade corretos

---

### 🌅 DIA 5 - SEXTA 03/07 (Testes + Refinements)
**Tempo:** 3-4 horas | **Entrega:** Sistema testado e bug-free

#### Tarefas
```
1. [ ] Testar fluxo completo
   ├─ Criar roteiro
   ├─ Fazer conversa completa
   ├─ Verificar scoring
   └─ Checar fila

2. [ ] Bugs & Refinements
   ├─ Corrigir edge cases
   ├─ Validação de input
   ├─ Tratamento de erro
   ├─ Melhorar UX

3. [ ] Performance
   ├─ Queries otimizadas
   ├─ Sem N+1 queries
   ├─ Load times aceitáveis

4. [ ] Deploy em staging
   ├─ Push para VPS
   ├─ Executar migrations lá
   ├─ Testar em staging
```

#### Checklist de Testes

```
TESTE MANUAL:
☐ Criar roteiro com 3 perguntas
☐ Iniciar conversa
☐ Responder todas as perguntas
☐ Verificar scoring automático
☐ Ver resultado em fila
☐ Score deve estar entre 0-100
☐ Viabilidade deve estar correto
☐ Dados coletados devem estar salvos

TESTES DE EDGE CASE:
☐ Resposta vazia
☐ Caracteres especiais
☐ Muito texto
☐ Abrir 2 chats simultâneos
☐ Voltar para anterior
☐ Deletar roteiro com conversas

PERFORMANCE:
☐ Primeira pergunta < 1s
☐ Resposta < 2s
☐ Listar roteiros < 500ms
☐ Fila < 500ms
```

#### Critério de Sucesso
- ✅ Nenhum erro visível para usuário
- ✅ Fluxo completo funciona
- ✅ Scoring sempre correto
- ✅ Dados salvos corretamente
- ✅ Performance aceitável

---

### 🌅 DIA 6 - SÁBADO 04/07 (Demo + Docs)
**Tempo:** 2-3 horas | **Entrega:** Pronto para apresentar

#### Tarefas
```
1. [ ] Documentação Quick Start
   └─ Como usar o sistema
   
2. [ ] Exemplos prontos
   ├─ Template "Previdenciário"
   ├─ Template "Família"
   └─ Dados de teste

3. [ ] Screenshots/GIFs
   └─ Fluxo visual do sistema

4. [ ] Lista do que funciona
   ├─ O que está pronto
   ├─ O que falta
   └─ Próximos passos
```

#### Documento de Entrega

```markdown
# WhatsApp IA SDR - MVP Funcional

## O que está pronto
- ✅ Criar roteiros de atendimento
- ✅ Executar roteiro via chat
- ✅ Scoring automático 0-100
- ✅ Qualificação de leads
- ✅ Fila de qualificação
- ✅ Histórico de conversas

## Como usar
1. Acesse /ia/whatsapp/roteiros
2. Clique "+ Novo Roteiro"
3. Adicione perguntas
4. Clique "Conversar" para testar
5. Complete o fluxo
6. Veja resultado em "Fila"

## Dados de teste
- Roteiro: "Previdenciário"
- 4 perguntas
- Funciona em browser

## Próximas fases
- Integração real com WhatsApp
- Encaminhamento automático
- Webhooks de WhatsApp
- Mobile app
```

---

### 🎯 DOMINGO 05/07 (Entrega Final)
**Status:** Sistema pronto!

---

## 📊 CHECKLIST DIÁRIO

### ✅ Segunda 29/06
- [ ] Prisma migrado
- [ ] Sem erros de build
- [ ] Tabelas verificadas

### ✅ Terça 30/06
- [ ] 5 endpoints testados
- [ ] Scoring funciona
- [ ] Curl tests passam

### ✅ Quarta 01/07
- [ ] 3 pages funcionando
- [ ] Form de criação funciona
- [ ] UI básica pronta

### ✅ Quinta 02/07
- [ ] Chat end-to-end funciona
- [ ] Fila mostra dados
- [ ] Dashboard básico

### ✅ Sexta 03/07
- [ ] Nenhum bug crítico
- [ ] Fluxo completo testado
- [ ] Deploy em staging

### ✅ Sábado 04/07
- [ ] Documentação pronta
- [ ] Exemplos funcionando
- [ ] Screenshots

### ✅ Domingo 05/07
- [ ] Entrega final
- [ ] Sistema testado
- [ ] Pronto para usar

---

## 🚀 COMO EXECUTAR

### Setup Inicial (Hoje)
```bash
cd /Users/andreluis/juridico-crm-automation

# Pull latest
git pull

# Install deps
npm install

# Run dev
npm run dev
```

### Cada dia
```bash
# 1. Criar arquivo: src/app/api/[tarefa]
# 2. Testar com curl
# 3. Commit
# 4. Next task
```

---

## ⚡ PRIORIDADE MÁXIMA

```
🔴 CRÍTICO (FAZER HOJE):
- Prisma migration
- Endpoints básicos

🟠 MUITO IMPORTANTE (2-3 dias):
- UI de criar roteiro
- Chat funcionando

🟡 IMPORTANTE (4-5 dias):
- Fila qualificação
- Testes

🟢 NICE-TO-HAVE:
- Styling avançado
- Analytics gráficos
```

---

## 💡 DICAS IMPORTANTES

1. **Não tente ser perfeito**
   - Funcional > bonito
   - MVP não precisa de CSS avançado
   - Foco no fluxo

2. **Teste a cada passo**
   - curl tests imediatos
   - Não deixe acumular bugs

3. **Commit diariamente**
   - Final de cada dia: git push

4. **Mantenha foco**
   - WhatsApp SDR first
   - Ignore IA Factory por enquanto

5. **Se travar, pule**
   - Não gaste > 1h em um problema
   - Volte depois

---

**Status:** 🟢 Pronto para Sprint  
**Entrega:** Domingo 05/07  
**MVP:** WhatsApp IA SDR 100% funcional

Let's go! 🚀

