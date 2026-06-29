#!/bin/bash

# 🚀 DEPLOY PRODUCTION - Script Universal para VPS e Local

set -e

# ─── CONFIG ──────────────────────────────────────────────────────

VPS_IP="${1:-2.25.128.221}"
VPS_USER="root"
VPS_PATH="/root/juridico-crm-automation"
LOCAL_MODE="${2:-false}"

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 DEPLOY PRODUCTION${NC}"
echo "════════════════════════════════════════════════════════════"
echo ""

if [ "$LOCAL_MODE" = "local" ]; then
  echo "📍 Modo: LOCAL"
  echo ""

  # ─── DEPLOY LOCAL ─────────────────────────────────────────────────

  echo "📦 1. Git Pull..."
  git pull origin main

  echo "📦 2. Install Dependencies..."
  npm install --legacy-peer-deps

  echo "📦 3. Prisma Generate..."
  npx prisma generate

  echo "📦 4. Build Next.js..."
  npm run build

  echo "✅ Deploy local concluído!"
  echo ""
  echo "Para iniciar o servidor:"
  echo "  npm run dev"
  echo ""

else
  echo "📍 Modo: VPS ($VPS_IP)"
  echo ""

  # ─── DEPLOY VPS ───────────────────────────────────────────────────

  echo "🔐 Conectando à VPS..."
  echo ""

  ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_IP} << 'EOFVPS'

set -e

echo "📂 Navegando para projeto..."
cd /root/juridico-crm-automation

echo ""
echo "📦 1. Git Pull..."
git pull origin main

echo ""
echo "📦 2. Install Dependencies..."
npm install --legacy-peer-deps

echo ""
echo "📦 3. Prisma Migrate..."
npx prisma migrate deploy

echo ""
echo "📦 4. Prisma Generate..."
npx prisma generate

echo ""
echo "📦 5. Seed Data..."
npx ts-node prisma/seed.ts || echo "⚠️  Seed já executado"
npx ts-node prisma/seed-email-sms.ts || echo "⚠️  Seed email-sms já executado"

echo ""
echo "📦 6. Build Next.js..."
npm run build

echo ""
echo "🔄 7. Restart PM2..."
pm2 restart juridico-crm

echo ""
echo "✅ Health Check..."
pm2 list

echo ""
echo "✅ Deploy VPS concluído!"
echo ""
echo "Verificações:"
curl -s http://localhost:3000 > /dev/null && echo "✅ Server respondendo" || echo "❌ Server não respondendo"

EOFVPS

  echo ""
  echo "════════════════════════════════════════════════════════════"
  echo -e "${GREEN}✅ Deploy VPS concluído!${NC}"
  echo ""
  echo "URL de produção:"
  echo "  🌐 https://crm.gabriellenunes.com.br"
  echo ""

fi

echo "════════════════════════════════════════════════════════════"
