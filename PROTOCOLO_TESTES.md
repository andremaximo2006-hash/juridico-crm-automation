# 🧪 Protocolo de Testes - Economizar Tokens

## ORDEM CORRETA DE VERIFICAÇÃO

### ✅ PASSO 1: Verificar Conectividade (ANTES de tudo)

Executar NO SERVIDOR via SSH:

```bash
# Status do PM2
pm2 status

# Ver logs (últimas 20 linhas)
pm2 logs juridico-crm --lines 20

# Teste de resposta local
curl -s http://localhost:3000/login | head -20

# Teste de API
curl -s http://localhost:3000/api/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}' | head -20
```

**Critérios de Sucesso:**
- ✅ PM2 status mostra "online"
- ✅ Logs não têm erros críticos
- ✅ curl retorna HTML (não erro 500)
- ✅ API responde com JSON

---

### ✅ PASSO 2: Testar com Node.js (Se conectividade OK)

Executar NO SEU COMPUTADOR:

```bash
node test-login.js https://crm.gabriellenunes.com.br
```

**Critérios de Sucesso:**
- ✅ Servidor online
- ✅ Página de login carrega
- ✅ Autenticação responde

---

### ✅ PASSO 3: Testar no Navegador (SÓ se passos 1 e 2 OK)

Abrir navegador APENAS se:
- ✅ PM2 status = online
- ✅ Logs sem erros críticos
- ✅ curl retorna HTML
- ✅ Node.js test passou

**NÃO fazer teste no navegador se:**
- ❌ PM2 offline
- ❌ Logs têm erros
- ❌ curl retorna erro 500
- ❌ Node.js test falhou

---

## 🎯 Resumo

| Ordem | Ferramenta | Comando | Tempo | Tokens |
|-------|-----------|---------|-------|--------|
| 1️⃣ | SSH | `pm2 status` | 5s | 10 |
| 2️⃣ | SSH | `pm2 logs` | 10s | 15 |
| 3️⃣ | SSH | `curl` | 5s | 5 |
| 4️⃣ | Node.js | `node test-login.js` | 10s | 50 |
| 5️⃣ | Navegador | Screenshot + testes | 30s | 200+ |

**Total se tudo OK**: ~30 segundos + 50 tokens (sem navegador desnecessário)
**Se navegador necessário**: +30s + 200 tokens

---

## 📝 Checklist Antes de Me Avisar

Se você completou o deploy, verifique localmente PRIMEIRO:

- [ ] Executei: `pm2 status` → vejo "online"
- [ ] Executei: `pm2 logs juridico-crm --lines 20` → sem erros críticos
- [ ] Executei: `curl http://localhost:3000/login` → retorna HTML
- [ ] Executei: `node test-login.js` → passou tudo
- [ ] SÓ DEPOIS avise: "✅ Conectividade OK! Fazer testes no navegador"

---

## 🚫 Não Fazer

❌ Me avisar "VPS online" sem verificar logs
❌ Ir direto para navegador sem testar conectividade
❌ Gastar 200+ tokens em teste no navegador se servidor está offline

---

## ✅ Fazer

✅ Verificar `pm2 status` primeiro
✅ Ver `pm2 logs` para erros
✅ Usar `curl` para confirmar resposta
✅ Usar `node test-login.js` antes de navegador
✅ SÓ DEPOIS chamar teste do navegador

---

**Resultado:** Economiza ~80% dos tokens em testes desnecessários! 🎉
