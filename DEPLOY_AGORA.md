# 🚀 DEPLOY AGORA - Instruções Exatas

## 🔴 Situação Atual

- ❌ ChunkLoadError em produção
- ❌ Arquivo 0r6ny.g11_ed~.js faltando no servidor
- ✅ Build local OK, chunk gerado
- ✅ Novo tarball pronto

---

## 📋 Instruções EXATAS (Copie e Cole)

### NO SEU COMPUTADOR:

```bash
# 1. Ir para o diretório do projeto
cd ~/juridico-crm-automation

# 2. Criar novo tarball
tar --exclude=node_modules --exclude=.git -czf /tmp/crm-final.tar.gz .

# 3. Enviar para servidor
scp -i ~/.ssh/vps_key /tmp/crm-final.tar.gz root@gabriel.server.com:/tmp/
```

### NO SERVIDOR (via SSH):

```bash
# 1. Conectar
ssh -i ~/.ssh/vps_key root@gabriel.server.com

# 2. Parar aplicação
pm2 stop juridico-crm

# 3. Fazer backup
cp -r /var/www/juridico-crm-automation/.next /tmp/backup-.next.$(date +%s)

# 4. Limpar diretórios antigos
rm -rf /var/www/juridico-crm-automation/.next
rm -rf /var/www/juridico-crm-automation/node_modules

# 5. Extrair novo código
cd /var/www
tar -xzf /tmp/crm-final.tar.gz

# 6. Instalar dependências
cd juridico-crm-automation
npm install --production

# 7. Fazer build
npm run build

# 8. Reiniciar
pm2 restart juridico-crm
pm2 save

# 9. Verificar
pm2 logs juridico-crm --lines 10
```

---

## ✅ Verificar Sucesso

```bash
# Nos logs, deve aparecer:
# "Ready on http://localhost:3000"
# SEM erros críticos

# Teste local
curl http://localhost:3000/login | head -5
# Deve retornar HTML com "CRM Jurídico"

# Teste API
curl -s http://localhost:3000/api/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{}' | head -5
# Deve retornar JSON (não erro HTML)
```

---

## 📝 Checklist Final

- [ ] Executei: `tar --exclude=node_modules ...` no computador
- [ ] Executei: `scp ... /tmp/crm-final.tar.gz ...` no computador
- [ ] Executei: `ssh ... root@gabriel.server.com`
- [ ] Executei: `pm2 stop juridico-crm`
- [ ] Executei: `rm -rf .next node_modules`
- [ ] Executei: `tar -xzf /tmp/crm-final.tar.gz`
- [ ] Executei: `npm install --production`
- [ ] Executei: `npm run build`
- [ ] Executei: `pm2 restart juridico-crm`
- [ ] Verifico: `pm2 logs` - vejo "Ready on..."
- [ ] Verifico: `curl http://localhost:3000/login` - retorna HTML

---

## 🎯 Depois de Completar Deploy

Execute NO SERVIDOR:

```bash
pm2 logs juridico-crm --lines 5
curl http://localhost:3000/login | wc -c
node test-login.js https://crm.gabriellenunes.com.br
```

**Quando tudo passar, me avise:**

```
✅ Deploy concluído! Conectividade verificada!
```

---

## ⏱️ Tempo Estimado

- Deploy: 10-15 min
- Verificação: 5 min
- **Total: ~20 minutos**

---

## 🆘 Se der erro

1. Verifique `pm2 logs juridico-crm`
2. Procure por mensagens de erro
3. Me mostre o erro exato
4. Vou ajudar a corrigir

---

**IMPORTANTE**: Siga EXATAMENTE nesta ordem! Não pule passos!
