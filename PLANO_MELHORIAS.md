# Plano de Melhorias — CRM Jurídico

> Execução automática: 22h–7h, diariamente.
> Última atualização: 2026-05-27

## Status geral

| Noite | Foco | Status |
|-------|------|--------|
| 1 | Skeleton loading + Validação Zod + Limite upload + Modal detalhe lead | ✅ Concluída — 27/05/2026 |
| 2 | Paginação nas listas + Busca server-side + Estados vazios elaborados | ✅ Concluída — 29/05/2026 |
| 3 | Dashboard KPIs expandidos + Error boundaries | ✅ Concluída — 29/05/2026 |
| 4 | Dividir operacional/page.tsx + Ordenação nas tabelas | ✅ Concluída — 29/05/2026 |
| 5 | Página detalhe cliente (/clientes/[id]) + Filtros do financeiro | ✅ Concluída — 29/05/2026 |
| 6 | UI de gestão de casos + Audit logging | ⏳ Pendente |
| 7 | Criptografia AcessoEntry + Job scheduler notificações | ⏳ Pendente |
| 8 | Dark mode toggle + Responsividade mobile | ⏳ Pendente |
| 9 | Drag-and-drop Kanban + Atalhos de teclado | ⏳ Pendente |

---

## Detalhamento por noite

### Noite 1 — Fundação UX + Segurança básica

**1.1 Skeleton loading** (todos os `Carregando...` → skeleton animado)
- Arquivos: leads/page.tsx, clientes/page.tsx, financeiro/page.tsx, operacional/page.tsx
- Componente: `src/components/ui/Skeleton.tsx`

**1.2 Validação Zod nas rotas de API**
- Rotas: /api/leads POST, /api/clientes POST/PATCH, /api/financeiro POST
- Schemas em: `src/lib/schemas.ts`

**1.3 Limite de tamanho no upload**
- Rotas: /api/clientes/import, /api/operacional/import
- Limite: 5MB

**1.4 Modal/Drawer detalhe do lead**
- Componente: `src/components/leads/LeadDetailDrawer.tsx`
- Conteúdo: dados do lead, timeline, ações rápidas (ligar, WhatsApp)

---

### Noite 2 — Performance e dados

**2.1 Paginação server-side**
- Parâmetros: `page`, `limit` (default 50)
- Rotas: /api/leads, /api/clientes, /api/financeiro, /api/operacional

**2.2 Busca server-side em clientes**
- Mover filtro do client-side para WHERE no Prisma

**2.3 Empty states elaborados**
- Componente: `src/components/ui/EmptyState.tsx`
- Com ilustração SVG + mensagem contextual + CTA

---

### Noite 3 — Dashboard e robustez

**3.1 Dashboard expandido**
- Novos KPIs: leads por canal (barra), funil visual (%, quantidade), receita vs meta
- Componentes de gráfico simples (CSS puro, sem biblioteca)

**3.2 Error boundaries**
- Componente: `src/components/ui/ErrorBoundary.tsx`
- Aplicar em todas as páginas principais

---

### Noite 4 — Refatoração e UX de tabela

**4.1 Dividir operacional/page.tsx**
- Extrair: FechamentosTab, IniciaisTab, PrazosTab, CadSenhaTab, ConcoesTab, AcessosTab
- Pasta: `src/components/operacional/`

**4.2 Ordenação por coluna nas tabelas**
- Clientes, Financeiro, Operacional
- Estado local: `sortField`, `sortDir`

---

### Noite 5 — Páginas de detalhe

**5.1 /clientes/[id] — Detalhe do cliente**
- Dados do cliente, casos vinculados, transações, histórico

**5.2 Filtros expandidos no financeiro**
- Filtro por período (mês/trimestre/ano), categoria, status
- Exportação CSV

---

### Noite 6 — Cases e Auditoria

**6.1 UI de gestão de casos**
- Lista de casos por cliente
- Status, área, honorários, checklist Astrea

**6.2 Audit logging**
- Middleware que registra mutations em tabela `AuditLog`
- Quem, o quê, quando, valor anterior vs novo

---

### Noite 7 — Segurança avançada

**7.1 Criptografia de AcessoEntry**
- Criptografar campo `senha` com AES-256 usando JWT_SECRET como chave

**7.2 Job scheduler para notificações**
- `node-cron` dentro do servidor
- Disparar lembretes de vencimento às 8h diariamente

---

### Noite 8 — Visual avançado

**8.1 Dark mode toggle**
- Ativar variáveis CSS já definidas no globals.css
- Persistir preferência em localStorage

**8.2 Responsividade mobile**
- Menu hambúrguer no mobile
- Tabelas → cards no mobile

---

### Noite 9 — Polimento final

**9.1 Drag-and-drop no Kanban**
- Biblioteca: @dnd-kit/core
- Arrastar card entre colunas

**9.2 Atalhos de teclado**
- Ctrl+N: novo lead/cliente
- Ctrl+K: busca global
- Esc: fechar modal

---

## Relatórios diários

Os relatórios são salvos em `RELATORIO_NOTURNO.md` e atualizados no ClickUp.
