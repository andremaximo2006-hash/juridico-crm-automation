#!/bin/bash

# 🚀 DEPLOY EMAIL IA NA VPS
# Script para fazer deploy do Email IA na VPS

set -e

VPS_IP="2.25.128.221"
VPS_USER="root"
VPS_PATH="/root/juridico-crm-automation"

echo "🚀 Iniciando deploy Email IA na VPS..."
echo "IP: $VPS_IP"
echo "Path: $VPS_PATH"
echo ""

# Conectar e executar deploy
ssh ${VPS_USER}@${VPS_IP} << 'EOF'

set -e

cd /root/juridico-crm-automation

echo "📦 1. Git Pull..."
git pull origin main

echo "📦 2. Install Dependencies..."
npm install --legacy-peer-deps

echo "📦 3. Prisma Migration..."
npx prisma migrate deploy

echo "📦 4. Prisma Generate..."
npx prisma generate

echo "📦 5. Build Next.js..."
npm run build

echo "🔄 6. Restart PM2..."
pm2 restart juridico-crm

echo "✅ Health Check..."
pm2 list

echo ""
echo "✅ Email IA Deploy Completo!"
echo "🌐 URL: https://crm.gabriellenunes.com.br/ia/email"

EOF

echo ""
echo "✅ Deploy finalizado com sucesso!"
