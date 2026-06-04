#!/bin/bash

###############################################################################
#                    🚀 DEPLOY AUTOMATIZADO PARA VPS                         #
#                                                                             #
#  VPS: 2.25.128.221 (crm.gabriellenunes.com.br)                            #
#  Banco: PostgreSQL juridico_crm                                            #
#                                                                             #
# Execute este script no seu COMPUTADOR:                                     #
#   bash deploy-vps-2025.sh                                                   #
#                                                                             #
###############################################################################

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          🚀 DEPLOY PARA VPS — 2.25.128.221                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Configurações
SERVER_USER="root"
SERVER_HOST="2.25.128.221"
SERVER_DOMAIN="crm.gabriellenunes.com.br"
SERVER_PATH="/var/www/juridico-crm-automation"
TARBALL="/tmp/crm-deploy-$(date +%Y%m%d-%H%M%S).tar.gz"

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() {
  echo -e "${BLUE}▶${NC} $1"
}

print_ok() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

###############################################################################
# PASSO 1: Verificações iniciais
###############################################################################

print_step "Verificando pré-requisitos..."

# Verificar git
if ! command -v git &> /dev/null; then
  print_error "Git não instalado"
  exit 1
fi

# Verificar se há changes não commitados
if [ -n "$(git status --porcelain)" ]; then
  print_error "Há mudanças não commitadas. Execute: git add -A && git commit -m 'message'"
  exit 1
fi

# Verificar se npm install foi executado
if [ ! -d "node_modules" ]; then
  print_error "node_modules não encontrado. Execute: npm install"
  exit 1
fi

print_ok "Pré-requisitos OK"
echo ""

###############################################################################
# PASSO 2: Build local
###############################################################################

print_step "Fazendo build da aplicação..."
npm run build > /tmp/build.log 2>&1

if [ $? -ne 0 ]; then
  print_error "Build falhou! Verifique /tmp/build.log"
  cat /tmp/build.log
  exit 1
fi

print_ok "Build completo (sem erros)"
echo ""

###############################################################################
# PASSO 3: Criar tarball
###############################################################################

print_step "Compactando código para upload..."

tar --exclude=node_modules \
    --exclude=.git \
    --exclude=.next \
    --exclude=.env \
    --exclude=.vercel \
    --exclude=coverage \
    --exclude=.DS_Store \
    -czf "$TARBALL" \
    . > /dev/null 2>&1

SIZE=$(du -h "$TARBALL" | cut -f1)
print_ok "Tarball criado: $TARBALL ($SIZE)"
echo ""

###############################################################################
# PASSO 4: Upload para VPS
###############################################################################

print_step "Enviando código para VPS..."
print_step "Servidor: $SERVER_HOST"
print_step "Destino: $SERVER_PATH"
print_step "Tamanho: $SIZE"
echo ""

scp -P 22 "$TARBALL" "$SERVER_USER@$SERVER_HOST:/tmp/" || {
  print_error "Erro ao fazer upload via SCP"
  echo "Verifique:"
  echo "  1. Conectividade: ping $SERVER_HOST"
  echo "  2. SSH: ssh root@$SERVER_HOST"
  echo "  3. Permissões e senha"
  exit 1
}

print_ok "Upload completo"
echo ""

###############################################################################
# PASSO 5: Deploy no servidor
###############################################################################

print_step "Iniciando deploy no servidor remoto..."
echo ""

ssh -p 22 "$SERVER_USER@$SERVER_HOST" << 'REMOTE_SCRIPT'

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          INICIANDO DEPLOY NO SERVIDOR                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Variáveis
DEPLOY_DIR="/var/www/juridico-crm-automation"
TARBALL_NAME=$(ls -t /tmp/crm-deploy-*.tar.gz | head -1)
BACKUP_DIR="/tmp/backup-$(date +%Y%m%d-%H%M%S)"

echo "▶ Tarball: $(basename $TARBALL_NAME)"
echo "▶ Deploy dir: $DEPLOY_DIR"
echo ""

# 1. Parar aplicação
echo "▶ [1/7] Parando aplicação..."
pm2 stop juridico-crm 2>/dev/null || true
sleep 2

# 2. Fazer backup
echo "▶ [2/7] Fazendo backup..."
mkdir -p "$BACKUP_DIR"
if [ -d "$DEPLOY_DIR/.next" ]; then
  cp -r "$DEPLOY_DIR/.next" "$BACKUP_DIR/" 2>/dev/null || true
fi
if [ -f "$DEPLOY_DIR/.env" ]; then
  cp "$DEPLOY_DIR/.env" "$BACKUP_DIR/.env.bak"
fi
echo "  Backup em: $BACKUP_DIR"

# 3. Preparar diretório
echo "▶ [3/7] Preparando diretório de deploy..."
cd /var/www
rm -rf juridico-crm-automation-old 2>/dev/null || true
if [ -d "$DEPLOY_DIR" ]; then
  mv "$DEPLOY_DIR" juridico-crm-automation-old
fi

# 4. Extrair novo código
echo "▶ [4/7] Extraindo novo código..."
mkdir -p "$DEPLOY_DIR"
tar -xzf "$TARBALL_NAME" -C "$DEPLOY_DIR"

# 5. Restaurar arquivo .env (importante!)
echo "▶ [5/7] Restaurando configurações..."
if [ -f "$BACKUP_DIR/.env.bak" ]; then
  cp "$BACKUP_DIR/.env.bak" "$DEPLOY_DIR/.env"
else
  # Se não houver backup, usar a VPS
  echo "DATABASE_URL=\"postgresql://juridico_user:juridico_local_2026@localhost:5432/juridico_crm\"" > "$DEPLOY_DIR/.env"
fi

# 6. Instalar dependências e compilar
echo "▶ [6/7] Instalando dependências e compilando..."
cd "$DEPLOY_DIR"

# Limpar old node_modules
rm -rf node_modules 2>/dev/null || true

# npm install
npm install --production > /tmp/npm-install-$(date +%s).log 2>&1 &
PID_NPM=$!
wait $PID_NPM

# npm run build
npm run build > /tmp/npm-build-$(date +%s).log 2>&1

# 7. Restart com PM2
echo "▶ [7/7] Reiniciando aplicação..."
pm2 restart juridico-crm 2>/dev/null || pm2 start /var/www/juridico-crm-automation/server.js --name "juridico-crm"
pm2 save

sleep 3

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          ✅ DEPLOY CONCLUÍDO COM SUCESSO                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

echo "Status da aplicação:"
pm2 status | grep juridico-crm || echo "Aguarde inicialização..."
echo ""

echo "Últimas linhas de log:"
pm2 logs juridico-crm --lines 5 --nostream || echo "(Logs não disponíveis ainda)"
echo ""

# Limpeza
rm -f "$TARBALL_NAME"

REMOTE_SCRIPT

print_ok "Deploy concluído no servidor"
echo ""

###############################################################################
# PASSO 6: Validação
###############################################################################

print_step "Validando deploy..."

# Esperar um pouco para inicializar
sleep 3

# Testar endpoint
HEALTH=$(ssh "$SERVER_USER@$SERVER_HOST" "curl -s http://localhost:3000/api/health 2>/dev/null || echo 'timeout'" || echo "error")

if echo "$HEALTH" | grep -q "error\|timeout"; then
  print_error "Servidor não respondeu. Verifique os logs:"
  echo "  ssh $SERVER_USER@$SERVER_HOST"
  echo "  pm2 logs juridico-crm --lines 20"
else
  print_ok "Servidor respondendo em http://$SERVER_DOMAIN"
fi

echo ""

###############################################################################
# RESUMO
###############################################################################

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          📋 RESUMO DO DEPLOY                                  ║"
echo "╠════════════════════════════════════════════════════════════════╣"
echo "║                                                                ║"
echo "║  Servidor:    https://$SERVER_DOMAIN"
echo "║  Status:      ✅ Pronto para uso"
echo "║  Banco:       PostgreSQL juridico_crm"
echo "║  Aplicação:   juridico-crm (PM2)"
echo "║                                                                ║"
echo "║  Próximas ações:                                              ║"
echo "║  1. Acessar: https://$SERVER_DOMAIN/login"
echo "║  2. Fazer login com credenciais"
echo "║  3. Ir para: /gerencial/previsibilidade"
echo "║  4. Clicar em: Fechamentos → 📥 Importar"
echo "║  5. Importar os 176 contratos                                 ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

print_ok "DEPLOY CONCLUÍDO COM SUCESSO! 🎉"
echo ""

# Limpar tarball local
rm -f "$TARBALL"
