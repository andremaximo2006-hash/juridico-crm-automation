# 🚀 REDEPLOY PASSO A PASSO — Guia Visual

**Data:** 2026-06-03  
**Tempo Estimado:** 15 minutos  
**Dificuldade:** ⭐ Fácil

---

## 📍 PASSO 1: Abrir Terminal/SSH

### No Mac/Linux:
```bash
# Abra o Terminal (Cmd + Espaço, digite "Terminal")
# Copie e cole este comando:

ssh root@2.25.128.221
```

**O que você verá:**
```
The authenticity of host '2.25.128.221' can't be established.
ECDSA key fingerprint is SHA256:...
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

**Digite:** `yes` e **pressione Enter**

Então digite a **senha** (da sua documentação VPS) e **pressione Enter**

**Quando conectado, verá:**
```
root@vps:~#
```

---

## 📂 PASSO 2: Entrar na Pasta do Projeto

```bash
cd /opt/juridico-crm-automation
```

**Esperado:**
```
root@vps:/opt/juridico-crm-automation#
```

✅ Você está na pasta correta se vê `/juridico-crm-automation#`

---

## 📥 PASSO 3: Git Pull (Pegar as Mudanças)

```bash
git pull origin main
```

**Esperado:**
```
remote: Enumerating objects: 5, done.
remote: Counting objects: 100% (5/5), done.
remote: Compressing objects: 100% (3/3), done.
Unpacking objects: 100% (3/5), done.
From https://github.com/seu-usuario/juridico-crm-automation
 * branch            main       -> FETCH_HEAD
   fe9f5e5..241df60  main       -> origin/main
Updating fe9f5e5..241df60
Fast-forward
 QA_REDEPLOY_COMPLETO.md  | 442 +++++++++++++++++++++++++++++++++++++
 REDEPLOY_PRODUCAO.sh     |  45 ++++
 2 files changed, 487 insertions(+)
```

✅ Se viu "Fast-forward", as mudanças foram puxadas com sucesso!

---

## 🏗️ PASSO 4: Rebuild Next.js

```bash
npm run build
```

**Isso vai levar 1-2 minutos...**

**Esperado:**
```
> juridico-crm@1.0.0 build
> next build

  ▲ Next.js 16.0.0

  ✓ Compiled successfully

✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (275/275)
✓ Finalizing page optimization

Route (pages)                              Size     First Load JS
┌ o /                                      150 B          78.5 kB
├ /_app                                    0 B            78.4 kB
├ ○ /ia/roteiros                          45.2 kB        125 kB
├ ○ /ia/conversas                         42.8 kB        121 kB
├ ○ /ia/atendimento-humano                48.5 kB        127 kB
...

Build successful in 1m 23s (1234 files)
```

✅ Se viu "Build successful", o rebuild foi OK!

---

## 🔄 PASSO 5: Restart da Aplicação

```bash
pm2 restart juridico-crm-app
```

**Esperado:**
```
[PM2] Applying action restartCluster on app [juridico-crm-app](4 instances)
[PM2] [juridico-crm-app] ✓ restarted
```

✅ Se viu "restarted", a aplicação foi reiniciada com sucesso!

---

## ⏳ PASSO 6: Aguarde 10 Segundos

```bash
sleep 10
```

Isso apenas aguarda a aplicação subir completamente. Não há output, é normal.

---

## 🧪 PASSO 7: Teste de Health Check

```bash
curl https://crm.gabriellenunes.com.br/api/health
```

**Esperado:**
```json
{"status":"healthy","timestamp":"2026-06-03T13:30:00Z"}
```

✅ Se viu `"status":"healthy"`, a API está respondendo!

---

## 🌐 PASSO 8: Teste as 3 Páginas IA (No Navegador)

**Abra seu navegador e acesse cada URL:**

### URL 1: Roteiros
```
https://crm.gabriellenunes.com.br/ia/roteiros
```

**Esperado:**
- ✅ Página carrega (sem 404)
- ✅ Sidebar esquerdo mostra 8 especialidades
- ✅ Editor direito mostra system prompt
- ✅ Botões visíveis: Salvar, Reverter, etc

### URL 2: Conversas
```
https://crm.gabriellenunes.com.br/ia/conversas
```

**Esperado:**
- ✅ Página carrega (sem 404)
- ✅ Lista de conversas no lado esquerdo
- ✅ Preview de chat no lado direito
- ✅ Filtros e busca funcionam

### URL 3: Atendimento Humano
```
https://crm.gabriellenunes.com.br/ia/atendimento-humano
```

**Esperado:**
- ✅ Página carrega (sem 404)
- ✅ Fila de tickets no lado esquerdo
- ✅ Detalhes do ticket no lado direito
- ✅ Filtros de status e prioridade funcionam

---

## ✅ PASSO 9: Teste o Menu no Sidebar

1. **Abra:** https://crm.gabriellenunes.com.br
2. **Procure no Sidebar esquerdo** por "IA Atendimento"
3. **Clique para expandir** - deve mostrar:
   - 📋 Roteiros
   - 💬 Conversas
   - 👥 Atendimento Humano

✅ Se expandir e mostrar as 3 opções, o menu está funcionando!

---

## 🎉 PRONTO! Redeploy Completo!

Se todos os passos acima funcionaram, o redeploy foi **100% bem-sucedido**! 🎊

---

## ⚠️ Troubleshooting (Se Algo Não Funcionar)

### Erro 1: "Permission denied" ao SSH
```
❌ Permission denied (publickey,password)
```

**Solução:**
- Verifique se a senha está correta
- Verifique se o IP 2.25.128.221 é correto
- Tente novamente

### Erro 2: "npm: command not found"
```
❌ npm: command not found
```

**Solução:**
```bash
nvm use 18
npm run build
```

### Erro 3: Página ainda retorna 404 após redeploy
```
❌ GET https://crm.gabriellenunes.com.br/ia/roteiros → 404
```

**Solução:**
```bash
# Ver logs de erro
pm2 logs juridico-crm-app

# Restart novamente
pm2 restart juridico-crm-app
sleep 5

# Testar novamente
curl -I https://crm.gabriellenunes.com.br/ia/roteiros
```

### Erro 4: Build falhou
```
❌ Build failed with errors
```

**Solução:**
```bash
# Ver erro completo
npm run build 2>&1 | tail -50

# Se for problema de node_modules
rm -rf node_modules
npm install
npm run build
```

---

## 📞 Checklist Final

```
REDEPLOY COMPLETO?

□ SSH na VPS                      ✅
□ cd /opt/juridico-crm-automation ✅
□ git pull origin main            ✅
□ npm run build                   ✅
□ pm2 restart juridico-crm-app    ✅
□ sleep 10                        ✅
□ curl health check               ✅ (respondeu "healthy")
□ /ia/roteiros carrega            ✅ (sem 404)
□ /ia/conversas carrega           ✅ (sem 404)
□ /ia/atendimento-humano carrega  ✅ (sem 404)
□ Sidebar mostra menu expandido   ✅

SE TODOS ACIMA MARCADOS:
🎉 REDEPLOY 100% BEM-SUCEDIDO!
```

---

## 🚀 Após o Redeploy

Seu CRM está **100% pronto com as 3 novas páginas IA!**

Você pode:
1. ✅ Customizar system prompts sem código
2. ✅ Ver histórico de conversas com clientes
3. ✅ Gerenciar fila de atendimento humano
4. ✅ Receber leads do WhatsApp (Z-API, Meta, ManyChat)
5. ✅ Transferir clientes para atendentes
6. ✅ Acompanhar métricas em tempo real

---

**Tempo Total:** ~15 minutos  
**Dificuldade:** ⭐ Fácil  
**Status:** ✅ PRONTO PARA USAR

