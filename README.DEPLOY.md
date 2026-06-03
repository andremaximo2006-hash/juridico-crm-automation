# 🚀 DEPLOY IMEDIATO - CRM Jurídico

## Status

✅ **Build local**: Compilado com sucesso (todos os chunks gerados)
✅ **Teste local**: Login page funcionando perfeitamente
✅ **Tarball pronto**: `/tmp/crm-deploy.tar.gz` (179MB)

❌ **Production**: ChunkLoadError (`.next` corrompido no servidor)

---

## O Que Fazer Agora

### Opção 1: Deploy Automático (Recomendado)

Se você tiver acesso SSH ao servidor:

```bash
# Execute no terminal do seu computador:
bash DEPLOY.sh
```

Isso automatiza tudo: upload, build, restart.

---

### Opção 2: Deploy Manual (Passo a Passo)

#### No seu computador:

```bash
# 1. Verifique se o tarball está pronto
ls -lh /tmp/crm-deploy.tar.gz

# 2. Envie para o servidor
scp -i ~/.ssh/vps_key /tmp/crm-deploy.tar.gz root@gabriel.server.com:/tmp/
```

#### No servidor (via SSH):

```bash
# 1. Conecte ao servidor
ssh -i ~/.ssh/vps_key root@gabriel.server.com

# 2. Execute estes comandos:
cd /var/www
pm2 stop juridico-crm 2>/dev/null || true
cp -r juridico-crm-automation/.next juridico-crm-automation/.next.backup.$(date +%s)
tar -xzf /tmp/crm-deploy.tar.gz
cd juridico-crm-automation
npm install
npm run build
pm2 start server.js --name "juridico-crm" || pm2 restart juridico-crm
pm2 save
pm2 logs juridico-crm
```

---

### Opção 3: Deploy Via Git (Se configurado)

```bash
# Local
git push origin main

# Servidor
cd /var/www/juridico-crm-automation
git pull origin main
npm install && npm run build
pm2 restart juridico-crm
```

---

## Depois do Deploy

### Verifique se funcionou:

```bash
# No servidor (via SSH):
pm2 logs juridico-crm

# No navegador:
# Acesse: https://crm.gabriellenunes.com.br/login
# Limpe cache: Ctrl+Shift+Delete
# Verifique se não há ChunkLoadError no console
```

### Se funcionar:
- 🎉 Teste os módulos: /dashboard, /leads, /clientes, /ia/*
- 📝 Verifique dark mode (canto superior)
- ⌨️ Teste atalhos: Ctrl+N (novo), Ctrl+K (busca)

### Se não funcionar:
- `pm2 logs juridico-crm` (veja os erros)
- Verifique DATABASE_URL em `.env`
- `df -h` (espaço em disco)
- `free -h` (memória)
- Revise `DEPLOYMENT-GUIDE.md`

---

## Documentação Completa

- **QUICK_DEPLOY.md** - 5 linhas de código
- **DEPLOYMENT-GUIDE.md** - Guia passo a passo
- **DEPLOY.sh** - Script automatizado
- **STATUS.md** - Estado completo do projeto

---

## Support

**Build Info Local:**
- ✅ Next.js 16.2.6 build bem-sucedido
- ✅ Chunk `0r6ny.g11_ed~.js` gerado corretamente
- ✅ Login page renderizada sem erros
- ✅ Todos os 47 routes compilados

**Próximos Passos:**
1. Execute o deploy (escolha uma opção acima)
2. Verifique os logs
3. Teste no navegador
4. Se ok → trabalhe nas features pendentes
5. Se não → verifique troubleshooting em DEPLOYMENT-GUIDE.md

---

**Criado em:** 03/06/2026  
**Status:** 🟡 Pronto para deploy  
**Tempo estimado:** 15 minutos
