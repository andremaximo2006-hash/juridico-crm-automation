# 🚀 IA ATENDIMENTO - QUICK START GUIDE

**Começar daqui se você quer implementar a Fase 2 (Super Agent Python)**

---

## 1️⃣ Verificar o Que Já Foi Feito

```bash
# Campos adicionados ao banco
grep -n "IAConfiguration\|AIChat\|AIAnalytics" prisma/schema.prisma

# Tipos criados
ls -la src/types/ia.ts

# Componentes criados
ls -la src/components/ia/
ls -la src/app/ia/

# APIs criadas
ls -la src/app/api/ia/
```

---

## 2️⃣ Próximo Passo: Super Agent Python

### Criar estrutura de pasta
```bash
mkdir -p api/ia-server/tools
cd api/ia-server
```

### Criar arquivo principal
```python
# api/ia-server/main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import anthropic
import os

app = FastAPI(title="Super Agent IA - Jurídico")

# CORS para comunicação com Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

class ChatRequest(BaseModel):
    session_id: str
    message: str
    client_id: str = None

class ChatResponse(BaseModel):
    response: str
    tokens_used: int
    tools_used: list

@app.post("/chat")
async def chat(request: ChatRequest):
    # TODO: Implementar lógica de chat
    pass

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### Criar requirements.txt
```
anthropic>=0.7.0
fastapi>=0.104.0
uvicorn>=0.24.0
pydantic>=2.0.0
python-dotenv>=1.0.0
redis>=5.0.0
```

### Rodar em desenvolvimento
```bash
pip install -r requirements.txt
python main.py
```

### Testar conexão
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"session_id": "test_123", "message": "Olá"}'
```

---

## 3️⃣ Integrar Next.js com FastAPI

Atualizar `src/app/api/ia/super-agent/chat/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

const IA_SERVER_URL = process.env.IA_SERVER_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const { session_id, message } = await request.json();

    const response = await fetch(`${IA_SERVER_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id, message })
    });

    if (!response.ok) {
      throw new Error("Erro ao chamar Super Agent");
    }

    return NextResponse.json(await response.json());
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

---

## 4️⃣ Executar Migration Prisma

Quando banco local estiver rodando:
```bash
npx prisma migrate dev -n add_ia_atendimento_models
```

Verificar tabelas criadas:
```bash
npx prisma studio  # Interface gráfica
```

---

## 5️⃣ Verificar Acesso às Pages

```bash
# Iniciar servidor Next.js
npm run dev

# Acessar no browser
http://localhost:3000/ia/dashboard
http://localhost:3000/ia/super-agent  # (quando criar page.tsx)
http://localhost:3000/ia/configuracoes  # (quando criar)
```

---

## 6️⃣ Arquivo de Checklist Rápido

- [ ] Super Agent Python main.py criado
- [ ] requirements.txt com dependências
- [ ] GET /health funciona
- [ ] POST /chat mockado (retorna resposta)
- [ ] Next.js consegue chamar FastAPI
- [ ] AIChat sendo salvo no PostgreSQL
- [ ] AIConfiguration criado para user
- [ ] Dashboard mostrando stats reais
- [ ] Token counter funciona
- [ ] Histórico de conversas persiste

---

## 7️⃣ Troubleshooting

### "Connection refused" em localhost:8000
```bash
# FastAPI não está rodando
cd api/ia-server/
python main.py
```

### "DATABASE_URL não configurado"
```bash
# Verificar .env
cat .env | grep DATABASE_URL

# Se não tiver, adicionar
DATABASE_URL="postgresql://user:password@localhost:5432/juridico_crm"
```

### "Tabelas não encontradas"
```bash
# Executar migrations
npx prisma migrate deploy
```

### "API key inválida"
```bash
# Verificar ANTHROPIC_API_KEY
echo $ANTHROPIC_API_KEY

# Se vazio, adicionar a .env
ANTHROPIC_API_KEY="sk-ant-v3-..."
```

---

## 🎯 Objetivo Final

Quando tudo estiver integrado, fluxo será:

```
Frontend (SuperAgentChat.tsx)
  ↓
POST /api/ia/super-agent/chat (Next.js)
  ↓
POST /chat (FastAPI - Python)
  ↓
Claude API (Anthropic)
  ↓
Tools execution (buscar_ficha, analisar_caso, etc)
  ↓
Response volta para Frontend
  ↓
Saved em AIChat + AIAnalytics (PostgreSQL)
```

---

**Próximo:** Implementar tools em `api/ia-server/tools/`  
**Tempo:** 2-3 semanas para MVP completo  
**Deploy:** VPS Ubuntu com PM2

