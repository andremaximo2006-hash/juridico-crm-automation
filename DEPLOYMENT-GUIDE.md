# 🚀 Guia de Deployment - CRM Jurídico

## Status Atual

❌ **Problema**: ChunkLoadError no production (`crm.gabriellenunes.com.br`)
- Erro: `Failed to load chunk /_next/static/chunks/0r6ny.g11_ed~.js`
- Causa: `.next` directory corrompido ou incompleto no servidor
- Solução: Fazer rebuild e redeploy

✅ **Build Local**: Compilando com sucesso
- Sem erros TypeScript
- Todas as rotas compiladas

---

## Passos para Deploy

### Opção 1: Deploy Via SCP (Recomendado)

```bash
# 1. No seu computador, vá ao diretório do projeto
cd ~/juridico-crm-automation

# 2. Limpe e faça build
rm -rf .next
npm install
npm run build

# 3. Crie tarball (sem node_modules)
tar --exclude=node_modules --exclude=.git -czf deploy.tar.gz .

# 4. Envie para servidor
scp -i ~/.ssh/vps_key deploy.tar.gz root@gabriel.server.com:/tmp/

# 5. SSH para o servidor e execute deploy
ssh -i ~/.ssh/vps_key root@gabriel.server.com
```

### No Servidor (dentro do SSH):

```bash
# 1. Navegue ao diretório de produção
cd /var/www

# 2. Pare a aplicação
pm2 stop juridico-crm

# 3. Faça backup do .next atual
cp -r juridico-crm-automation/.next juridico-crm-automation/.next.backup.$(date +%Y%m%d)

# 4. Extraia novo código
tar -xzf /tmp/deploy.tar.gz

# 5. Instale dependências
cd juridico-crm-automation
npm install

# 6. Faça build (irá gerar novo .next)
npm run build

# 7. Crie/atualize server.js se necessário
# (veja Server.js Setup abaixo)

# 8. Reinicie com PM2
pm2 start server.js --name "juridico-crm" || pm2 restart juridico-crm
pm2 save

# 9. Teste
curl http://localhost:3000/login
```

---

### Opção 2: Deploy Via Git (se tiver repositório remoto)

```bash
# 1. Configure remote (substitua URL)
git remote add origin https://seu-git-repo/juridico-crm.git

# 2. Push das mudanças
git push origin main

# 3. No servidor, faça pull
ssh root@gabriel.server.com
cd /var/www/juridico-crm-automation
git pull origin main
npm install && npm run build
pm2 restart juridico-crm
```

---

## Server.js Setup

Se o arquivo `server.js` não existir no servidor, crie com este conteúdo:

```javascript
// /var/www/juridico-crm-automation/server.js
const { createServer } = require("http");
const { NextServer } = require("next/dist/server/next-server");
const path = require("path");

const isDev = process.env.NODE_ENV !== "production";
const dir = path.resolve(__dirname);
const nextServer = new NextServer({
  dir,
  dev: isDev,
});

const handler = nextServer.getRequestHandler();
const server = createServer((req, res) => {
  handler(req, res).catch((e) => {
    console.error(e);
    res.writeHead(500);
    res.end("Internal server error");
  });
});

const port = parseInt(process.env.PORT || "3000", 10);
server.listen(port, (err) => {
  if (err) throw err;
  console.log(`> Ready on http://localhost:${port}`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
```

---

## Verificação Pós-Deploy

```bash
# 1. Verificar status PM2
pm2 status

# 2. Ver logs
pm2 logs juridico-crm

# 3. Testar na navegação
curl http://localhost:3000/login

# 4. Teste no navegador
# Abra: https://crm.gabriellenunes.com.br/login
# Deve exibir formulário de login sem erro de chunk
```

---

## Troubleshooting

### Erro: "pm2 command not found"
```bash
npm install -g pm2
pm2 startup
pm2 save
```

### Erro: "port already in use"
```bash
# Encontre o processo
lsof -i :3000

# Mate o processo
kill -9 <PID>

# Ou mude a porta
PM2 start server.js --name juridico-crm -- --port 3001
```

### Erro: "npm not found"
```bash
# Instale Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Erro: "PostgreSQL connection failed"
```bash
# Verifique DATABASE_URL no .env
echo $DATABASE_URL

# Teste conexão
psql $DATABASE_URL -c "SELECT 1"
```

---

## Ambiente (.env)

Certifique-se de que o .env no servidor tem:

```bash
DATABASE_URL=postgresql://juridico_user:JuridCRM@2025@localhost:5432/juridico_crm
JWT_SECRET=seu-secret-aqui
NEXT_PUBLIC_API_BASE_URL=https://crm.gabriellenunes.com.br
PORT=3000
PYTHON_BACKEND_URL=http://localhost:8000
```

---

## Build Info

- **Next.js**: 16.2.6 (Turbopack)
- **Node.js**: v20+
- **Package Manager**: npm 10+
- **Database**: PostgreSQL 13+
- **Python Backend**: FastAPI (optional)

---

## Checklist Pós-Deploy

- [ ] PM2 status mostra "online"
- [ ] Logs não mostram erros
- [ ] Login page carrega sem ChunkLoadError
- [ ] Dashboard carrega após login
- [ ] Módulos IA acessíveis (/ia/roteiros, /ia/conversas, etc)
- [ ] Dark mode funciona
- [ ] Atalhos de teclado funcionam (Ctrl+N, Ctrl+K)
- [ ] Integração WhatsApp respondendo

---

## Contato

Se enfrentar problemas:
1. Verifique `pm2 logs juridico-crm`
2. Verifique `.env` variables
3. Teste conectividade com banco de dados
4. Verifique espaço em disco: `df -h`
5. Verifique memória: `free -h`
