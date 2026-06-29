# 🚀 DEPLOY NA VPS - AGORA

**Para fazer TUDO direto na VPS em 10 minutos**

---

## ⚡ COMANDO ÚNICO

Execute este comando agora mesmo (tudo é automático):

```bash
cd /Users/andreluis/juridico-crm-automation
bash deploy-vps.sh
```

Pronto! O script vai:

```
✅ Git pull (pega últimas mudanças)
✅ npm install (instala dependências)
✅ Prisma migrate (cria tabelas)
✅ Seed templates (popula 2 roteiros)
✅ npm run build (faz build)
✅ pm2 restart (reinicia servidor)
✅ Health check (verifica tudo OK)
```

---

## 📋 O QUE O SCRIPT FAZ

```
PASSO 1: Git Pull
  └─ git pull origin main
  └─ Traz últimas mudanças

PASSO 2: Install Dependencies
  └─ npm install --legacy-peer-deps
  └─ Instala pacotes

PASSO 3: Prisma Migration
  └─ npx prisma migrate deploy
  └─ Cria tabelas no PostgreSQL

PASSO 4: Seed Templates
  └─ npx ts-node prisma/seed.ts
  └─ Popula 2 roteiros prontos:
     ├─ Previdenciário (4 perguntas)
     └─ Família (4 perguntas)

PASSO 5: Build Next.js
  └─ npm run build
  └─ Compila TypeScript/React

PASSO 6: Restart PM2
  └─ pm2 restart juridico-crm
  └─ Reinicia servidor na VPS

PASSO 7: Health Check
  └─ pm2 list
  └─ Verifica status
```

---

## ✅ VERIFICAÇÃO

Depois que terminar, o servidor estará em:

```
🌐 https://crm.gabriellenunes.com.br
```

Teste com curl:

```bash
# No seu computador
curl https://crm.gabriellenunes.com.br

# Ou acesse no browser
https://crm.gabriellenunes.com.br
```

---

## 🔍 SE ALGO DER ERRADO

### Erro de SSH
```
Se error "Permission denied"
→ Verifique SSH key setup
→ Ou use: ssh root@2.25.128.221 (senha: @Advprev@2026)
```

### Erro de Migration
```
Se error "Can't connect to database"
→ SSH para VPS e verifique:
ssh root@2.25.128.221
psql -U juridico_user -d juridico_crm
```

### Erro de Build
```
Se error "Build failed"
→ Verifique logs na VPS:
ssh root@2.25.128.221
tail -100 ~/.pm2/logs/juridico-crm-err.log
```

---

## 🗂️ ESTRUTURA DA VPS

```
VPS: 2.25.128.221
  ├─ /root/juridico-crm-automation/
  │  ├─ src/ (código)
  │  ├─ prisma/ (BD)
  │  ├─ node_modules/ (dependências)
  │  └─ .next/ (build)
  │
  ├─ PostgreSQL (localhost:5432)
  │  └─ juridico_crm (banco)
  │
  └─ PM2 (processo)
     └─ juridico-crm (rodando)
```

---

## 📊 TIMELINE

```
✅ Hoje (Seg 29): Deploy base + seed
🔴 Terça 30: Criar 5 endpoints
🔴 Quarta 01: UI pages
🔴 Quinta 02: Chat funcional
🔴 Sexta 03: Testes + refinement
✅ Domingo 05: ENTREGA
```

---

## 🚀 PRÓXIMOS PASSOS

Depois que rodar o script:

```
1. Esperar 10-15 minutos para build
2. Acessar https://crm.gabriellenunes.com.br
3. Verificar se carrega (pode estar lentão na primeira vez)
4. Amanhã (TER): Adicionar 5 endpoints em src/app/api/whatsapp/
5. Usar mesmo script depois (vai fazer git pull + build + restart)
```

---

## 💡 SCRIPT MANUAL (Se precisar)

Se o script falhar, conecte SSH e faça manual:

```bash
ssh root@2.25.128.221
cd /root/juridico-crm-automation

# 1. Pull
git pull origin main

# 2. Deps
npm install --legacy-peer-deps

# 3. Migration
npx prisma migrate deploy

# 4. Seed (ver deploy-vps.sh para código)
npx ts-node prisma/seed.ts

# 5. Build
npm run build

# 6. Restart
pm2 restart juridico-crm

# 7. Logs
tail -20 ~/.pm2/logs/juridico-crm-out.log
```

---

## 🎯 RESUMO

| Ação | Status |
|------|--------|
| Schema Prisma | ✅ Pronto |
| Script Deploy | ✅ Criado |
| VPS Acesso | ✅ Configurado |
| Seed Templates | ✅ Pronto |
| **Próximo:** | **RODAR SCRIPT** |

---

**Tempo:** 10 minutos  
**Complexidade:** Baixa (script automático)  
**Risco:** Mínimo (rollback via git)

**VAMOS!** 🚀

```bash
bash deploy-vps.sh
```

