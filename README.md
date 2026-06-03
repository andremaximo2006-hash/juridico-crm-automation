# CRM Jurídico

Sistema de gestão comercial e financeira para advogados autônomos, com funil de leads, controle financeiro e integração com Astrea.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS** para UI
- **Prisma 7** + **PostgreSQL** (Supabase)
- **@prisma/adapter-pg** para conexão direta

## Pré-requisitos

1. Conta gratuita no [Supabase](https://supabase.com)
2. Node.js 18+

## Configuração inicial

### 1. Criar banco de dados no Supabase

1. Acesse [supabase.com](https://supabase.com) → New project
2. Vá em **Settings → Database → Connection string → URI**
3. Copie a string de conexão

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` e cole sua `DATABASE_URL` do Supabase:

```
DATABASE_URL="postgresql://postgres:[SUA-SENHA]@db.[SEU-ID].supabase.co:5432/postgres"
```

### 3. Criar as tabelas no banco

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## Estrutura do projeto

```
src/
├── app/
│   ├── page.tsx               # Dashboard
│   ├── leads/page.tsx         # Funil Kanban
│   ├── financeiro/page.tsx    # Módulo financeiro
│   ├── configuracoes/page.tsx # Configurações + editor de widgets
│   └── api/
│       ├── leads/             # CRUD de leads
│       ├── clientes/          # CRUD de clientes
│       ├── financeiro/        # Lançamentos financeiros
│       └── dashboard/widgets/ # Configuração de widgets
├── components/
│   ├── layout/                # Sidebar + Header
│   └── leads/                 # KanbanBoard + NewLeadModal
└── lib/
    ├── prisma.ts              # Cliente Prisma singleton
    └── utils.ts               # Formatadores e constantes
```

## Páginas

| Rota | Descrição |
|---|---|
| `/` | Dashboard com KPIs e alertas de cobrança |
| `/leads` | Funil Kanban — Novo Lead até Migração Astrea |
| `/financeiro` | Receitas, despesas e status de pagamentos |
| `/configuracoes` | Widgets do dashboard + notificações + dados do escritório |

## Deploy recomendado

[Vercel](https://vercel.com) + Supabase — ambos têm plano gratuito.

```bash
npm run build
```
