# ⚡ Deploy Rápido - 5 Minutos

## TL;DR - Copie e cole no terminal

### No seu computador (macOS/Linux):

```bash
cd ~/juridico-crm-automation
rm -rf .next
npm run build
tar --exclude=node_modules --exclude=.git -czf /tmp/deploy.tar.gz .
scp -i ~/.ssh/vps_key /tmp/deploy.tar.gz root@gabriel.server.com:/tmp/
ssh -i ~/.ssh/vps_key root@gabriel.server.com
```

### No servidor (dentro do SSH):

```bash
cd /var/www
pm2 stop juridico-crm
tar -xzf /tmp/deploy.tar.gz
cd juridico-crm-automation
npm install && npm run build
pm2 start server.js --name juridico-crm || pm2 restart juridico-crm
pm2 logs juridico-crm
```

Pronto! ✅

---

## Se algo der errado

### Erro de conexão
- Verifique IP/hostname do servidor em `SERVER_HOST`
- Teste: `ssh -i ~/.ssh/vps_key root@gabriel.server.com`

### Build falha
- Limpe: `rm -rf node_modules .next`
- Reinstale: `npm install`
- Tente novamente: `npm run build`

### PM2 falha
- Instale: `npm install -g pm2`
- Verifique: `pm2 status`
- Reinicie: `pm2 restart juridico-crm`

---

## Verificar depois

```bash
# No servidor
pm2 logs juridico-crm    # Ver logs
pm2 status               # Ver status
curl http://localhost:3000/login  # Testar

# No navegador
# Abra: https://crm.gabriellenunes.com.br/login
# Limpe cache: Ctrl+Shift+Delete
```

Done! 🎉
