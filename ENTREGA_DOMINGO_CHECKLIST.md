# ✅ CHECKLIST - ENTREGA DOMINGO 05/07

**Objetivo:** WhatsApp IA SDR 100% funcional  
**Prazos:** 6 dias de trabalho  
**Status:** 🚀 Em andamento

---

## 📅 CRONOGRAMA RESUMIDO

```
SEG 29 ✓ Database
TER 30 ✓ APIs
QUA 01 ✓ UI
QUI 02 ✓ Chat
SEX 03 ✓ Testes
SAB 04 ✓ Docs
DOM 05 ✓ ENTREGA
```

---

## 🎯 O QUE PRECISA ESTAR PRONTO ATÉ DOMINGO

### ✅ BANCO DE DADOS
- [x] Schema Prisma criado (já feito)
- [ ] Migration executada
- [ ] Seed com 2 templates
- [ ] Sem errors no build

### ✅ APIs (5 Endpoints)
- [ ] POST /api/whatsapp/roteiros
- [ ] GET /api/whatsapp/roteiros
- [ ] POST /api/whatsapp/iniciar-roteiro
- [ ] POST /api/whatsapp/responder-pergunta
- [ ] GET /api/whatsapp/fila

### ✅ PÁGINAS (4 Pages)
- [ ] /ia/whatsapp/roteiros (listar)
- [ ] /ia/whatsapp/roteiros/novo (criar)
- [ ] /ia/whatsapp/roteiros/[id]/editar
- [ ] /ia/whatsapp/conversar/[roteiroId] (chat)
- [ ] /ia/whatsapp/fila (qualificação)

### ✅ FUNCIONALIDADES
- [ ] Criar roteiro com steps
- [ ] Executar roteiro (fazer perguntas)
- [ ] Coletar respostas
- [ ] Calcular score automático
- [ ] Mostrar resultado (viável/inviável)
- [ ] Salvar em fila de qualificação

### ✅ TESTES
- [ ] Fluxo completo funciona
- [ ] Scoring correto
- [ ] Sem bugs visíveis
- [ ] Dados persistem no BD
- [ ] Performance OK

### ✅ DOCUMENTAÇÃO
- [ ] README de uso
- [ ] Screenshots/GIF
- [ ] Exemplos prontos
- [ ] Próximos passos

---

## 🔥 PRIORIDADE MÁXIMA HOJE (SEGUNDA)

### AGORA (Próximas 3 horas)

**TAREFA 1: Executar Migration**
```bash
cd /Users/andreluis/juridico-crm-automation

# Verificar banco
echo $DATABASE_URL

# Executar migration
npx prisma migrate deploy

# Verificar
npx prisma studio  # Abrir UI do Prisma
```

**Se erro:** 
- Verificar .env com DATABASE_URL
- Ping do banco: `psql $DATABASE_URL -c "SELECT 1"`

---

**TAREFA 2: Seed de Templates**

Criar arquivo: `prisma/seed.ts`

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Template SDR
  await prisma.whatsAppRoteiro.create({
    data: {
      name: "Previdenciário",
      description: "Qualifica leads de previdência",
      is_active: true,
      steps: {
        create: [
          {
            order: 1,
            pergunta: "Qual é o seu nome?",
            tipo: "text",
            is_required: true
          },
          {
            order: 2,
            pergunta: "Qual sua situação? (aposentadoria/pensão/BPC)",
            tipo: "text",
            is_required: true
          },
          {
            order: 3,
            pergunta: "Qual seu CPF?",
            tipo: "text",
            is_required: true,
            regex: "^[0-9]{3}\\.[0-9]{3}\\.[0-9]{3}-[0-9]{2}$"
          }
        ]
      }
    }
  });
  
  console.log("✅ Seed completo!");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
```

Execute:
```bash
npx ts-node prisma/seed.ts
```

---

**TAREFA 3: Verificar Build**

```bash
npm run build

# Deve retornar: "✓ Ready in X seconds"
```

---

## ✅ VERIFICAÇÃO DE HOJE

```
[ ] Migration passou (npx prisma migrate deploy)
[ ] Seed executado (npx ts-node prisma/seed.ts)
[ ] Sem erros de build (npm run build)
[ ] Prisma Studio abre (npx prisma studio)
[ ] git push feito
```

---

## 📋 PRÓXIMAS TAREFAS (TERÇA)

**Quando Monday começar:**

1. Criar 5 endpoints em `src/app/api/whatsapp/`
2. Testar cada um com curl
3. Commit

Ver arquivo: `SPRINT_6DIAS_MVP_WHATSAPP_SDR.md` para código

---

## 🚨 SE ALGO DER ERRADO

### Erro: "Can't reach database"
```bash
# Verificar URL
cat .env | grep DATABASE

# Testar conexão
psql $DATABASE_URL -c "SELECT 1"

# Se não funcionar, atualizar .env com URL correta
```

### Erro: "Unknown table"
```bash
# Migrations não aplicadas
npx prisma migrate deploy

# Ou criar manualmente
npx prisma migrate dev --name fix
```

### Erro: "Cannot find module"
```bash
# Gerar Prisma Client
npx prisma generate

# Rebuild
npm run build
```

---

## 📊 STATUS REAL-TIME

### Hoje (Seg 29)
```
Banco de dados: 🔴 ⏳ (executando agora)
Código: 🟢 ✅ (pronto para usar)
Documentação: 🟢 ✅ (completa)
```

### Amanhã (Ter 30)
```
APIs: 🔴 ⏳ (a fazer)
Testes: 🔴 ⏳ (depois dos endpoints)
```

### Quarta (01)
```
UI: 🔴 ⏳ (próxima semana)
Pages: 🔴 ⏳ (próxima semana)
```

---

## 🎁 VOCÊ JÁ TEM (Não refazer!)

✅ Schema Prisma completo  
✅ Types TypeScript  
✅ Documentação de cada passo  
✅ Código de exemplo  
✅ Checklist detalhado  

**Apenas implemente, não reinvente!**

---

## 🚀 COMEÇAR AGORA

```bash
# 1. Abra terminal
cd /Users/andreluis/juridico-crm-automation

# 2. Verifique banco
echo $DATABASE_URL

# 3. Execute migration
npx prisma migrate deploy

# 4. Rode seed
npx ts-node prisma/seed.ts

# 5. Build
npm run build

# 6. Se tudo OK
git add -A
git commit -m "feat: Database migration e seed de templates"
git push
```

**Tempo estimado: 30-45 minutos**

---

## 💬 MENSAGEM FINAL

Você tem **6 dias** para entregar um sistema **totalmente funcional**.

Não é sobre perfeição, é sobre **funcionalidade**.

```
Funcional > Bonito
MVP > Polido
Pronto > Perfeito
```

Cada dia:
1. Faça as tarefas
2. Teste
3. Commit
4. Próximo dia

**Você consegue! 🚀**

---

**Última atualização:** 2026-06-29 19:00 UTC  
**Commit:** ed17471  
**Status:** 🟢 Ready to start

