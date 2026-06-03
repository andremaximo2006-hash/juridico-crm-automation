# ⚡ LEIA PRIMEIRO - CRM Jurídico

## 🚨 Status Atual

**Problema**: ChunkLoadError em crm.gabriellenunes.com.br (arquivo corrompido no servidor)  
**Solução**: Fazer redeploy com build limpo  
**Tempo**: 15-25 minutos  

---

## ✅ O que está pronto

- ✅ Build compilando sem erros (0 TypeScript errors)
- ✅ Login page testada e funcionando localmente
- ✅ Tarball pronto em `/tmp/crm-deploy.tar.gz`
- ✅ Toda documentação de deploy criada

---

## 🎯 O que fazer AGORA

### Opção Mais Rápida (15 min):

```bash
bash DEPLOY.sh
```

### Opção Manual (20 min):

```bash
# No seu computador:
scp -i ~/.ssh/vps_key /tmp/crm-deploy.tar.gz root@gabriel.server.com:/tmp/
ssh -i ~/.ssh/vps_key root@gabriel.server.com

# No servidor:
cd /var/www && pm2 stop juridico-crm
tar -xzf /tmp/crm-deploy.tar.gz
cd juridico-crm-automation && npm install && npm run build
pm2 start server.js --name juridico-crm || pm2 restart juridico-crm
```

### Opção Rápida (5 linhas):

```bash
# Ver QUICK_DEPLOY.md
```

---

## 📋 Depois do Deploy

1. Abra: https://crm.gabriellenunes.com.br/login
2. Limpe cache: Ctrl+Shift+Delete
3. Verifique console (F12) → não deve ter erros
4. Siga checklist em: **VERIFICATION.md**

---

## 📚 Documentação

| Arquivo | Conteúdo |
|---------|----------|
| **QUICK_DEPLOY.md** | Deploy em 5 linhas (mais rápido!) |
| **README.DEPLOY.md** | Guia com 3 opções de deploy |
| **DEPLOYMENT-GUIDE.md** | Manual completo + troubleshooting |
| **VERIFICATION.md** | Checklist pós-deploy |
| **STATUS.md** | Estado completo do projeto |
| **PROJECT_SUMMARY.txt** | Resumo visual |

---

## ❓ Dúvidas?

- **"Que servidor?"** → gabriel.server.com (VPS)
- **"Qual SSH key?"** → ~/.ssh/vps_key
- **"E se der erro?"** → Leia DEPLOYMENT-GUIDE.md (seção Troubleshooting)
- **"Está funcionando?"** → Siga VERIFICATION.md

---

**Status**: 🟡 Pronto para deploy  
**Ação requerida**: Execute um dos 3 métodos acima  
**Tempo estimado**: 15-25 minutos
