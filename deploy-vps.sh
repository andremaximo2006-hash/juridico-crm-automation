#!/bin/bash

###############################################################################
#                    🚀 DEPLOY AUTOMATIZADO PARA VPS                         #
#                                                                             #
# Execute este script no seu COMPUTADOR:                                     #
#   bash deploy-vps.sh                                                        #
#                                                                             #
# Ele vai fazer TUDO automaticamente!                                        #
###############################################################################

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          🚀 INICIANDO DEPLOY PARA VPS                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Configurações
SERVER_USER="root"
SERVER_HOST="gabriel.server.com"
SSH_KEY="$HOME/.ssh/vps_key"
SERVER_PATH="/var/www"
TARBALL="/tmp/crm-final.tar.gz"

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificações iniciais
echo -e "${YELLOW}1. Verificando pré-requisitos...${NC}"

if [ ! -f "$TARBALL" ]; then
    echo -e "${RED}❌ Tarball não encontrado: $TARBALL${NC}"
    echo "Execute primeiro: cd ~/juridico-crm-automation && tar --exclude=node_modules --exclude=.git -czf /tmp/crm-final.tar.gz ."
    exit 1
fi

if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}❌ SSH key não encontrada: $SSH_KEY${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Pré-requisitos OK${NC}"
echo ""

# Upload tarball
echo -e "${YELLOW}2. Enviando tarball para servidor (pode levar alguns minutos)...${NC}"
scp -i "$SSH_KEY" "$TARBALL" "$SERVER_USER@$SERVER_HOST:/tmp/" || {
    echo -e "${RED}❌ Erro ao fazer upload${NC}"
    exit 1
}
echo -e "${GREEN}✅ Upload completo${NC}"
echo ""

# Deploy
echo -e "${YELLOW}3. Executando deploy no servidor...${NC}"

ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" << 'REMOTE_SCRIPT'

set -e

echo "═══════════════════════════════════════════════════════════════"
echo "  INICIANDO DEPLOY NO SERVIDOR"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Parar aplicação
echo "▶ Parando aplicação..."
pm2 stop juridico-crm 2>/dev/null || true
sleep 2

# Fazer backup
echo "▶ Fazendo backup..."
BACKUP_DIR="/tmp/backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r /var/www/juridico-crm-automation/.next "$BACKUP_DIR/" 2>/dev/null || true
echo "  Backup em: $BACKUP_DIR"

# Limpar diretórios antigos
echo "▶ Limpando diretórios antigos..."
rm -rf /var/www/juridico-crm-automation/.next
rm -rf /var/www/juridico-crm-automation/node_modules

# Extrair novo código
echo "▶ Extraindo novo código..."
cd /var/www
tar -xzf /tmp/crm-final.tar.gz

# Instalar dependências
echo "▶ Instalando dependências (pode levar 2-3 minutos)..."
cd /var/www/juridico-crm-automation
npm install --production > /tmp/npm-install.log 2>&1

# Fazer build
echo "▶ Compilando aplicação (pode levar 1-2 minutos)..."
npm run build > /tmp/npm-build.log 2>&1

# Criar server.js se não existir
if [ ! -f "server.js" ]; then
    echo "▶ Criando server.js..."
    cat > server.js << 'SERVERJS'
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const path = require("path");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, dir: path.resolve(__dirname) });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl).catch((err) => {
      console.error("Error handling request:", err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    });
  }).listen(parseInt(process.env.PORT || "3000", 10), (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${process.env.PORT || 3000}`);
  });

  process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully");
    process.exit(0);
  });
});
SERVERJS
fi

# Reiniciar com PM2
echo "▶ Reiniciando aplicação..."
pm2 restart juridico-crm || pm2 start server.js --name "juridico-crm"
pm2 save

sleep 3

# Verificar status
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  ✅ DEPLOY CONCLUÍDO"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Status PM2:"
pm2 status | grep juridico-crm || echo "Status não disponível"
echo ""
echo "Últimas linhas de log:"
pm2 logs juridico-crm --lines 5
echo ""
echo "Teste local:"
echo "  curl http://localhost:3000/login | head -5"
echo ""

REMOTE_SCRIPT

echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  📋 PRÓXIMOS PASSOS"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "1. Execute no servidor para verificar:"
echo "   ssh -i ~/.ssh/vps_key root@gabriel.server.com"
echo "   pm2 logs juridico-crm --lines 10"
echo "   curl http://localhost:3000/login | head -5"
echo ""
echo "2. Teste com Node.js:"
echo "   node test-login.js https://crm.gabriellenunes.com.br"
echo ""
echo "3. Se tudo OK, avise:"
echo "   ✅ Deploy concluído e verificado!"
echo ""
echo "═══════════════════════════════════════════════════════════════"
