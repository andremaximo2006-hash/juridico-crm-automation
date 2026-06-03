# Guia de Deploy — Hostinger VPS

Este guia cobre o deploy completo do CRM Jurídico em um VPS da Hostinger com Ubuntu 22.04.

---

## Pré-requisitos no VPS

- VPS Ubuntu 22.04 (mín. 2 GB RAM, 20 GB disco)
- Domínio apontando para o IP do VPS (DNS A record)
- Acesso SSH como root ou usuário com sudo

---

## Passo 1 — Preparar o servidor

```bash
# Atualizar pacotes
apt update && apt upgrade -y

# Instalar Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Instalar PM2 (gerenciador de processos)
npm install -g pm2

# Instalar Nginx

apt install -y nginx

# Instalar Certbot (SSL gratuito)
apt install -y certbot python3-certbot-nginx
```

---

## Passo 2 — Configurar banco de dados (Supabase)

O CRM usa **Supabase** como banco de dados. Configure em [supabase.com](https://supabase.com):

1. Crie um novo projeto
2. Vá em **Settings → Database → Connection string → URI**
3. Copie a string de conexão — você vai precisar no Passo 4

> Alternativa: instalar PostgreSQL localmente no VPS com `apt install -y postgresql`

---

## Passo 3 — Fazer upload do projeto

### Opção A: Git (recomendado)

```bash
# No VPS
mkdir -p /var/www
cd /var/www
git clone https://github.com/andremaximo2006-hash/juridico-crm
cd juridico-crm
```

### Opção B: SFTP / Hostinger File Manager

1. Compacte a pasta do projeto (excluindo `node_modules` e `.next`)
2. Faça upload via Hostinger File Manager ou FileZilla
3. Extraia em `/var/www/juridico-crm`

---

## Passo 4 — Configurar variáveis de ambiente

```bash
cd /var/www/juridico-crm
cp .env.example .env
nano .env
```

Preencha o `.env`:

```env
# Banco de dados Supabase
DATABASE_URL="postgresql://postgres:SENHA@db.ID.supabase.co:5432/postgres"

# Chave JWT — gere uma string aleatória segura (mín. 32 caracteres)
JWT_SECRET="cole-aqui-uma-string-aleatoria-de-32-caracteres-ou-mais"

# Usuário admin inicial (para o seed)
ADMIN_EMAIL="seu@email.com"
ADMIN_PASSWORD="SenhaForte@2025"
```

> **Gerar JWT_SECRET seguro:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

---

## Passo 5 — Instalar dependências e fazer build

```bash
cd /var/www/juridico-crm

# Instalar dependências
npm ci --omit=dev

# Gerar Prisma Client
npx prisma generate

# Criar tabelas no banco
npx prisma migrate deploy

# Criar usuário administrador inicial
npm run seed

# Build de produção
npm run build
```

Após o build, os arquivos de produção ficam em `.next/standalone/`.

---

## Passo 6 — Copiar arquivos estáticos (necessário para standalone)

```bash
# Arquivos estáticos do Next.js
cp -r .next/static .next/standalone/.next/static

# Pasta public
cp -r public .next/standalone/public
```

---

## Passo 7 — Iniciar com PM2

```bash
cd /var/www/juridico-crm

# Iniciar a aplicação
pm2 start ecosystem.config.js

# Salvar configuração (auto-start no boot)
pm2 save
pm2 startup

# Verificar se está rodando
pm2 status
pm2 logs juridico-crm
```

---

## Passo 8 — Configurar Nginx

```bash
# Copiar configuração de exemplo
cp /var/www/juridico-crm/nginx.conf.example /etc/nginx/sites-available/juridico-crm

# Editar e substituir 'seudominio.com' pelo domínio real
nano /etc/nginx/sites-available/juridico-crm

# Ativar o site
ln -s /etc/nginx/sites-available/juridico-crm /etc/nginx/sites-enabled/

# Remover config default
rm -f /etc/nginx/sites-enabled/default

# Testar e recarregar
nginx -t
systemctl reload nginx
```

---

## Passo 9 — Instalar SSL (HTTPS)

```bash
# Instalar certificado Let's Encrypt
certbot --nginx -d seudominio.com -d www.seudominio.com

# Renovação automática (já configurada pelo Certbot)
# Verificar: certbot renew --dry-run
```

---

## Passo 10 — Acessar o sistema

Acesse `https://seudominio.com/login` com as credenciais do `.env`:
- **Email:** valor de `ADMIN_EMAIL`
- **Senha:** valor de `ADMIN_PASSWORD`

> ⚠️ **Troque a senha do admin imediatamente** após o primeiro acesso em **Configurações → Usuários**.

---

## Atualização do sistema

Para atualizar o CRM após mudanças no código:

```bash
cd /var/www/juridico-crm

# Baixar atualizações
git pull

# Instalar novas dependências (se houver)
npm ci --omit=dev

# Aplicar novas migrations
npx prisma migrate deploy

# Rebuild
npm run build

# Copiar estáticos
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public

# Reiniciar
pm2 restart juridico-crm
```

---

## Comandos úteis PM2

```bash
pm2 status              # Ver status de todos os apps
pm2 logs juridico-crm  # Ver logs em tempo real
pm2 restart juridico-crm
pm2 stop juridico-crm
pm2 delete juridico-crm
```

---

## Estrutura de portas

| Serviço | Porta | Acesso |
|---|---|---|
| Next.js (PM2) | 3000 | Interno apenas |
| Nginx | 80 / 443 | Público |
| PostgreSQL (se local) | 5432 | Interno apenas |

---

## Variáveis de ambiente completas

| Variável | Descrição | Obrigatório |
|---|---|---|
| `DATABASE_URL` | String de conexão PostgreSQL | ✅ |
| `JWT_SECRET` | Chave secreta para tokens JWT (mín. 32 chars) | ✅ |
| `ADMIN_EMAIL` | Email do admin inicial (usado no seed) | ✅ (seed) |
| `ADMIN_PASSWORD` | Senha do admin inicial | ✅ (seed) |
| `NODE_ENV` | Deve ser `production` | Auto (PM2) |
| `PORT` | Porta do servidor (padrão: 3000) | Auto (PM2) |

---

## Solução de problemas

**App não inicia:**
```bash
pm2 logs juridico-crm --lines 50
```

**Erro de banco de dados:**
```bash
# Testar conexão
node -e "const {PrismaClient}=require('@prisma/client'); const p=new PrismaClient(); p.\$connect().then(()=>console.log('OK')).catch(console.error)"
```

**Nginx 502 Bad Gateway:**
```bash
# Verificar se o app está rodando na porta 3000
curl http://localhost:3000
pm2 status
```

**Certificado SSL expirado:**
```bash
certbot renew
systemctl reload nginx
```
