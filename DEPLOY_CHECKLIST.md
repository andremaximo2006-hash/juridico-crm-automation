# ✅ Checklist de Deploy - Confirmar Quando Pronto

Use este checklist para confirmar que o deploy foi bem-sucedido antes de me avisar.

---

## 📋 Pré-Deploy

- [ ] Leu o README.DEPLOY.md ou QUICK_DEPLOY.md
- [ ] Tem acesso SSH ao servidor
- [ ] Tarball está em `/tmp/crm-deploy.tar.gz`

---

## 🚀 Durante o Deploy

- [ ] Executou `bash DEPLOY.sh` (ou deploy manual)
- [ ] Viu mensagem de sucesso ao final
- [ ] Esperou 2-3 minutos para PM2 reiniciar

---

## ✅ Após o Deploy - Verificação Rápida

Execute estes comandos **no servidor via SSH**:

```bash
# 1. Verificar status PM2
pm2 status
# Esperado: juridico-crm online

# 2. Ver logs (últimas linhas)
pm2 logs juridico-crm --lines 10
# Esperado: "Ready on http://localhost:3000" (sem erros)

# 3. Testar resposta da API
curl http://localhost:3000/login
# Esperado: HTML da página de login (não erro JSON)
```

---

## 🟢 Pronto para Teste

Se todos os itens acima passarem, **copie e cole EXATAMENTE isto**:

```
✅ VPS ONLINE! Fazer teste com usuario andre.maximo@gabriellenunes.com.br / Teste@123
```

---

## 📝 Detalhes para Referência

**Usuario**: andre.maximo@gabriellenunes.com.br  
**Senha**: Teste@123  
**URL**: https://crm.gabriellenunes.com.br/login

---

**IMPORTANTE**: Só me avise quando:
1. PM2 status mostrar "online"
2. Logs não tiverem erros
3. curl retornar HTML (não erro)

Então farei teste completo no navegador automaticamente! 🤖
