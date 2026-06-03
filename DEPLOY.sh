#!/bin/bash

# CRM Jurídico - Production Deployment Script
# Este script faz o deploy da aplicação para o servidor de produção

set -e

SERVER_USER="root"
SERVER_HOST="gabriel.server.com"  # Alterar para IP/hostname correto
SERVER_PATH="/var/www/juridico-crm-automation"
SSH_KEY="~/.ssh/vps_key"

echo "🚀 CRM Jurídico - Deploy Script"
echo "================================"
echo ""

# 1. Verificar se está no diretório certo
if [ ! -f "package.json" ]; then
    echo "❌ Erro: package.json não encontrado. Execute este script do raiz do projeto."
    exit 1
fi

echo "✅ Diretório correto"

# 2. Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Há mudanças não commitadas:"
    git status
    read -p "Deseja continuar? (s/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
fi

# 3. Limpar e fazer build
echo ""
echo "🔨 Fazendo build..."
rm -rf .next
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build falhou!"
    exit 1
fi

echo "✅ Build completado com sucesso"

# 4. Criar tarball
echo ""
echo "📦 Criando tarball para deploy..."
tar --exclude=node_modules --exclude=.git -czf /tmp/deploy.tar.gz .

TARBALL_SIZE=$(du -h /tmp/deploy.tar.gz | cut -f1)
echo "✅ Tarball criado: $TARBALL_SIZE"

# 5. SSH para servidor
echo ""
echo "🌐 Enviando para servidor..."
echo "Servidor: $SERVER_USER@$SERVER_HOST"
echo "Caminho: $SERVER_PATH"
echo ""

# Verificar conexão
ssh -i $SSH_KEY -o ConnectTimeout=5 $SERVER_USER@$SERVER_HOST "echo '✅ Conectado ao servidor'" || {
    echo "❌ Erro ao conectar ao servidor"
    exit 1
}

# Fazer upload
echo "Fazendo upload... (pode levar alguns minutos)"
scp -i $SSH_KEY /tmp/deploy.tar.gz $SERVER_USER@$SERVER_HOST:/tmp/

# Fazer deploy no servidor
echo "Extraindo e atualizando..."
ssh -i $SSH_KEY $SERVER_USER@$SERVER_HOST << 'REMOTE_COMMANDS'
set -e

# Parar aplicação
pm2 stop juridico-crm 2>/dev/null || true

# Backup
BACKUP_DIR="/var/www/backups/juridico-crm-$(date +%Y%m%d-%H%M%S)"
mkdir -p $BACKUP_DIR
cp -r /var/www/juridico-crm-automation/.next $BACKUP_DIR/ 2>/dev/null || true

# Extrair novo código
cd /var/www
tar -xzf /tmp/deploy.tar.gz

# Instalar dependências
cd /var/www/juridico-crm-automation
npm install

# Fazer build
npm run build

# Criar server.js se não existir
if [ ! -f "server.js" ]; then
    cat > server.js << 'EOF'
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
EOF
fi

# Reiniciar com PM2
pm2 start server.js --name "juridico-crm" || pm2 restart "juridico-crm"
pm2 save

echo "✅ Deploy completado com sucesso!"
echo "Acesse: https://crm.gabriellenunes.com.br"

REMOTE_COMMANDS

echo ""
echo "✅ Deploy finalizado!"
echo "Limpando arquivos temporários..."
rm /tmp/deploy.tar.gz

echo ""
echo "🎉 Sucesso! A aplicação foi atualizada."
echo ""
echo "Próximos passos:"
echo "1. Teste a aplicação em: https://crm.gabriellenunes.com.br"
echo "2. Verifique os logs: pm2 logs juridico-crm"
