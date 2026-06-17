# 📋 CHECKLIST - O QUE FALTA FAZER

**Data da Análise:** 2026-06-12  
**Status Geral:** 85% Implementado, 15% Faltando  
**Prioridade:** Alta (7 crítico), Média (8 importante), Baixa (6 nice-to-have)

---

## 🔴 CRÍTICO (7 itens) - BLOQUEIA PRODUÇÃO

### 1. ❌ Testes Automatizados (0%)
**Status:** Não implementado  
**Impacto:** Alto - Sem testes, regressões passam despercebidas

**O que falta:**
- [ ] Setup Jest/Vitest
- [ ] Testes unitários para utils (auth.ts, schemas.ts)
- [ ] Testes de integração para APIs críticas:
  - [ ] POST /api/auth/login
  - [ ] POST /api/operacional (criar ficha)
  - [ ] PUT /api/operacional/[id]/coluna (mover)
  - [ ] POST /api/financeiro (transação)
- [ ] Testes de componentes React:
  - [ ] KanbanBoard.tsx
  - [ ] FichaModal.tsx
  - [ ] FilterBar.tsx
- [ ] E2E tests com Playwright
- [ ] Coverage: mínimo 70%

**Tempo Estimado:** 40-60 horas  
**Prioridade:** 🔴 CRÍTICO

---

### 2. ❌ CI/CD Pipeline (0%)
**Status:** Não implementado  
**Impacto:** Alto - Deployments manuais são arriscados

**O que falta:**
- [ ] Configurar GitHub Actions
- [ ] Trigger em push para main:
  - [ ] Lint (ESLint)
  - [ ] Type check (TypeScript)
  - [ ] Testes (Jest)
  - [ ] Build Next.js
  - [ ] Security scan
- [ ] Deploy automático após testes passarem:
  - [ ] Build docker image
  - [ ] Push para Docker Hub
  - [ ] Deploy na VPS (via SSH)
  - [ ] Health check
  - [ ] Rollback automático se falhar
- [ ] Configurar secrets (DATABASE_URL, JWT_SECRET, etc)
- [ ] Notificação de falha no Slack/Discord

**Tempo Estimado:** 15-20 horas  
**Prioridade:** 🔴 CRÍTICO

---

### 3. ❌ Validações de Negócio Incompletas
**Status:** Parcialmente implementado  
**Impacto:** Médio-Alto - Dados inválidos podem entrar

**O que falta:**
- [ ] Validação: CPF duplicado (clientes)
- [ ] Validação: Email duplicado (leads/clientes)
- [ ] Validação: Telefone em formato válido (Zod regex)
- [ ] Validação: Datas consistentes (dataEntrada < dataProcedimento < dataDPP)
- [ ] Validação: Transação não pode ser criada sem cliente
- [ ] Validação: Caso não pode ser concluído sem transações pagas
- [ ] Validação: Requerimento inicial precisa de pelo menos 1 documento
- [ ] Business rule: DPP não pode ser anterior a hoje

**Arquivo:** `/src/lib/schemas.ts` (estender Zod schemas)  
**Tempo Estimado:** 8-12 horas  
**Prioridade:** 🔴 CRÍTICO

---

### 4. ❌ Permissões RBAC Incompletas
**Status:** Parcialmente implementado  
**Impacto:** Alto - Usuários podem acessar dados não autorizados

**O que falta:**
- [ ] Usuário `padrao` não deve ver dados financeiros
- [ ] Usuário `padrao` não deve editar usuários
- [ ] Usuário `financeiro` não deve criar/editar operacional
- [ ] Verificação de row-level security (usuário só vê seus leads)
- [ ] Adicionar permissão customizável por endpoint
- [ ] Documentar matriz RBAC em README

**Arquivos:** `/src/middleware.ts`, `/src/lib/menu-access.ts`  
**Tempo Estimado:** 6-10 horas  
**Prioridade:** 🔴 CRÍTICO

---

### 5. ❌ Tratamento de Erros Centralizado (30%)
**Status:** Parcialmente implementado  
**Impacto:** Alto - Erros não são rastreados ou logados

**O que falta:**
- [ ] Criar error logger centralizado
- [ ] Enviar erros para Sentry/LogRocket
- [ ] Stack trace em desenvolvimento, mensagem genérica em produção
- [ ] Retry automático para falhas de rede
- [ ] Circuit breaker para APIs externas (Asaas, Google Calendar)
- [ ] Timeout para requisições externas (Asaas, Claude)
- [ ] Alert em Slack se Taxa de Erro > 5%

**Arquivo:** `/src/lib/logger.ts` (estender)  
**Tempo Estimado:** 10-15 horas  
**Prioridade:** 🔴 CRÍTICO

---

### 6. ❌ Cache e Performance (0%)
**Status:** Não implementado  
**Impacto:** Alto - App fica lenta com muitos registros

**O que falta:**
- [ ] Redis cache para queries frequentes:
  - [ ] `GET /api/operacional` (cache 5min)
  - [ ] `GET /api/leads` (cache 5min)
  - [ ] `GET /api/operacional/stats` (cache 1min)
- [ ] Invalidar cache ao criar/atualizar dados
- [ ] Paginação em mais endpoints (Kanban é limit 500)
- [ ] Lazy loading de imagens
- [ ] Compressão GZIP em bundles
- [ ] CDN para assets estáticos

**Tempo Estimado:** 20-30 horas  
**Prioridade:** 🔴 CRÍTICO

---

### 7. ❌ Refresh Tokens & Sessão (0%)
**Status:** Não implementado  
**Impacto:** Médio-Alto - Segurança fraca

**O que falta:**
- [ ] Implementar refresh tokens (14 dias)
- [ ] Access token (8 horas, atual)
- [ ] Logout de todos os dispositivos
- [ ] Detectar login em outro lugar
- [ ] 2FA (autenticação de dois fatores)
- [ ] Recuperação de sessão

**Arquivo:** `/src/lib/auth.ts`  
**Tempo Estimado:** 8-12 horas  
**Prioridade:** 🔴 CRÍTICO

---

## 🟡 IMPORTANTE (8 itens) - AFETA USABILIDADE

### 8. ❌ Data Export/Import Melhorado
**Status:** Parcialmente implementado  
**Impacto:** Médio - Usuários querem exportar dados

**O que falta:**
- [ ] Exportar Kanban como Excel (com formatação)
- [ ] Exportar por coluna (novo, triagem, etc)
- [ ] Exportar por período (data início/fim)
- [ ] Importar dados com validação de duplicatas
- [ ] Preview antes de importar
- [ ] Rollback se importação falhar
- [ ] Suporte para CSVs além de XLSX

**Tempo Estimado:** 12-18 horas  
**Prioridade:** 🟡 IMPORTANTE

---

### 9. ❌ Relatórios Avançados
**Status:** Não implementado  
**Impacto:** Médio - Gerência precisa de insights

**O que falta:**
- [ ] Relatório: Tempo médio por coluna
- [ ] Relatório: Taxa de conversão (novo → concluído)
- [ ] Relatório: Fichas vencidas por responsável
- [ ] Relatório: Análise de estrangulamento (bottleneck)
- [ ] Gráficos: Distribuição por área
- [ ] Gráficos: Distribuição por prioridade
- [ ] Export PDF com logo/cabeçalho
- [ ] Agendamento automático (enviar via email)

**Tempo Estimado:** 15-20 horas  
**Prioridade:** 🟡 IMPORTANTE

---

### 10. ❌ Notificações Avançadas
**Status:** Parcialmente implementado (Asaas only)  
**Impacto:** Médio - Usuários perdem informações

**O que falta:**
- [ ] Notificação: Ficha sem retorno há 7+ dias
- [ ] Notificação: DPP próxima (3 dias antes)
- [ ] Notificação: Responsável mudou
- [ ] Notificação: Comentário novo em ficha
- [ ] Email template para notificações
- [ ] Preferências de notificação por usuário
- [ ] Push notifications (PWA)
- [ ] Webhook para integrações (Slack)

**Tempo Estimado:** 12-16 horas  
**Prioridade:** 🟡 IMPORTANTE

---

### 11. ❌ Auditoria Completa
**Status:** Silenciosa (não rastreia falhas)  
**Impacto:** Médio - Conformidade regulatória fraca

**O que falta:**
- [ ] Audit trail com timezone
- [ ] Rastrear alterações de campo (old → new)
- [ ] Rastrear quem fez cada ação
- [ ] Timestamp de última modificação por campo
- [ ] Permitir rollback de alterações (undo)
- [ ] Relatório de auditoria (filtrar por usuário/data/tabela)
- [ ] Archiving de registros deletados (soft delete)

**Arquivo:** `/src/lib/audit.ts` (reescrever)  
**Tempo Estimado:** 10-14 horas  
**Prioridade:** 🟡 IMPORTANTE

---

### 12. ❌ Backup & Disaster Recovery
**Status:** Não implementado  
**Impacto:** Alto - Perda de dados crítica

**O que falta:**
- [ ] Backup automático do PostgreSQL (diariamente)
- [ ] Backup em S3 (off-site)
- [ ] Teste de restore (mensal)
- [ ] Point-in-time recovery
- [ ] Replicação para standby (hot backup)
- [ ] Documentação de disaster recovery

**Tempo Estimado:** 8-12 horas  
**Prioridade:** 🟡 IMPORTANTE

---

### 13. ❌ Multi-tenant (Saas)
**Status:** Não implementado  
**Impacto:** Médio - Não é multi-empresa

**O que falta:**
- [ ] Adicionar `tenantId` em todas tabelas
- [ ] Middleware para isolar dados por tenant
- [ ] Planos de preço (Free, Pro, Enterprise)
- [ ] Billing (Stripe/Asaas)
- [ ] Dashboard de cobrança
- [ ] Limite de usuários por plano
- [ ] Upgrade/downgrade automático

**Tempo Estimado:** 30-40 horas  
**Prioridade:** 🟡 IMPORTANTE (se entrar Saas)

---

### 14. ❌ Integração com Asaas Completa
**Status:** Parcial (cria pagamentos, não sincroniza)  
**Impacto:** Médio - Pagamentos e operacional desincronizados

**O que falta:**
- [ ] Sincronizar status do Asaas → fichas operacionais
- [ ] Webhook de pagamento recebido
- [ ] Webhook de cobrança vencida
- [ ] Desconto automático se ficha for concluída
- [ ] Parcelas de pagamento
- [ ] Duplicata eletrônica

**Tempo Estimado:** 10-15 horas  
**Prioridade:** 🟡 IMPORTANTE

---

### 15. ❌ Mobile App (PWA)
**Status:** Não implementado  
**Impacto:** Médio - Usuários querem versão mobile

**O que falta:**
- [ ] Service Worker para offline
- [ ] Web App Manifest
- [ ] Ícone home screen
- [ ] Responsive design em mobile (testar)
- [ ] Touch-friendly buttons
- [ ] Drag-drop em mobile (alternativa)
- [ ] Push notifications nativas

**Tempo Estimado:** 15-20 horas  
**Prioridade:** 🟡 IMPORTANTE

---

## 🟢 NICE-TO-HAVE (6 itens) - MELHORIAS

### 16. ⚠️ Refactor: Estrutura de Abas
**Status:** Duplicação de código  
**Impacto:** Baixo - Funciona, mas código duplicado

**O que fazer:**
- [ ] Unificar `fichas_operacionais` + `CadSenhaEntry`, `IniciaisEntry`, etc
- [ ] Usar herança ou polimorfismo
- [ ] Reduzir endpoints de 40+ para 25+
- [ ] Simplificar lógica de filtros

**Tempo Estimado:** 20-25 horas  
**Prioridade:** 🟢 NICE-TO-HAVE

---

### 17. ⚠️ Refactor: Rate Limiting em Redis
**Status:** In-memory (perde em restart)  
**Impacto:** Baixo - Não é issue em produção com VPS 24/7

**O que fazer:**
- [ ] Mover rate limiting para Redis
- [ ] Persistir entre deploys
- [ ] Configurável por endpoint

**Tempo Estimado:** 4-6 horas  
**Prioridade:** 🟢 NICE-TO-HAVE

---

### 18. ⚠️ Melhorar Error Messages
**Status:** Genéricos  
**Impacto:** Baixo - UX poderia ser melhor

**O que fazer:**
- [ ] Traduzir erros para português claro
- [ ] Sugerir ação corretiva em cada erro
- [ ] Exemplo: "CPF já existe. Use outro ou contate admin"

**Tempo Estimado:** 3-5 horas  
**Prioridade:** 🟢 NICE-TO-HAVE

---

### 19. ⚠️ Temas Visuais Adicionais
**Status:** 3 temas (claro, escuro, compacto)  
**Impacto:** Baixo - Cosmético

**O que fazer:**
- [ ] Tema de Alto Contraste (acessibilidade)
- [ ] Tema com ícones maiores
- [ ] Tema com fonte maior (para visão baixa)

**Tempo Estimado:** 4-8 horas  
**Prioridade:** 🟢 NICE-TO-HAVE

---

### 20. ⚠️ Documentação API (OpenAPI/Swagger)
**Status:** Não documentada  
**Impacto:** Baixo - Devs sabem, mas integradores sofrem

**O que fazer:**
- [ ] Adicionar OpenAPI schema
- [ ] Swagger UI em /api/docs
- [ ] Documentar todos 40+ endpoints
- [ ] Exemplos de request/response

**Tempo Estimado:** 8-12 horas  
**Prioridade:** 🟢 NICE-TO-HAVE

---

### 21. ⚠️ Analytics Avançado
**Status:** Básico (só dashboard)  
**Impacto:** Baixo - Gerência está satisfeita

**O que fazer:**
- [ ] Funnel analytics (lead → cliente → caso → fechamento)
- [ ] Cohort analysis (usuários por período)
- [ ] Heatmap de cliques
- [ ] Session replay
- [ ] A/B testing framework

**Tempo Estimado:** 15-20 horas  
**Prioridade:** 🟢 NICE-TO-HAVE

---

## 📊 SUMÁRIO DO QUE FALTA

| Tipo | Quantidade | Horas | Prioridade |
|------|-----------|-------|-----------|
| **Crítico** | 7 | 140-170 | 🔴 |
| **Importante** | 8 | 110-160 | 🟡 |
| **Nice-to-have** | 6 | 45-75 | 🟢 |
| **TOTAL** | **21** | **295-405** | - |

---

## 🎯 PLANO DE IMPLEMENTAÇÃO RECOMENDADO

### Fase 1: Crítico (4-5 semanas)
```
Semana 1-2: Testes + CI/CD
Semana 3: Validações + RBAC
Semana 4: Tratamento de erros + Logging
Semana 5: Cache + Refresh tokens
```

### Fase 2: Importante (3-4 semanas)
```
Semana 6: Export/Import + Relatórios
Semana 7: Notificações
Semana 8: Auditoria
Semana 9: Backup (se 3-4 semanas)
```

### Fase 3: Nice-to-have (2-3 semanas)
```
Semana 10: Refactor + Rate Limiting
Semana 11: UI/UX melhorias
Semana 12: Documentação API
```

---

## 💰 ESTIMATIVA TOTAL

| Fase | Horas | Dias (8h/dia) | Semanas |
|------|-------|--------------|---------|
| Crítico | 140-170 | 18-21 | 4-5 |
| Importante | 110-160 | 14-20 | 3-4 |
| Nice-to-have | 45-75 | 6-10 | 1-2 |
| **TOTAL** | **295-405** | **38-51** | **8-11** |

---

## ✅ CHECKLIST POR PRIORIDADE

### 🔴 CRÍTICO - FAZER AGORA

- [ ] 1. Testes automatizados (Jest/Vitest)
- [ ] 2. CI/CD pipeline (GitHub Actions)
- [ ] 3. Validações de negócio completas
- [ ] 4. RBAC matrix e permissions
- [ ] 5. Error logging centralizado
- [ ] 6. Cache com Redis
- [ ] 7. Refresh tokens + 2FA

### 🟡 IMPORTANTE - PRÓXIMAS 4 SEMANAS

- [ ] 8. Export/Import de dados
- [ ] 9. Relatórios avançados
- [ ] 10. Notificações (email, push)
- [ ] 11. Audit trail completo
- [ ] 12. Backup & disaster recovery
- [ ] 13. Multi-tenant (se SaaS)
- [ ] 14. Asaas integração completa
- [ ] 15. Mobile PWA

### 🟢 NICE-TO-HAVE - DEPOIS

- [ ] 16. Refactor estrutura de abas
- [ ] 17. Rate limiting em Redis
- [ ] 18. Melhorar mensagens de erro
- [ ] 19. Temas visuais adicionais
- [ ] 20. OpenAPI/Swagger docs
- [ ] 21. Analytics avançado

---

## 🚀 QUICK WINS (Fácil fazer, impacto médio)

Se quiser começar por algo rápido:

1. **Adicionar testes simples** (4h) - 3-4 testes críticos para ganhar confiança
2. **Melhorar mensagens de erro** (3h) - Traduzir para português
3. **Documentar RBAC matrix** (2h) - Tabela com permissões por role
4. **Adicionar timeout em APIs** (3h) - Evitar travamentos
5. **Configurar Sentry** (2h) - Error logging centralizado

**Total: 14 horas = 2 dias de trabalho**

---

## 📞 PRÓXIMOS PASSOS

1. **Confirmar prioridades** - Qual desses 21 itens é mais urgente para o negócio?
2. **Organizar timeline** - Quantas horas/semana vocês podem dedicar?
3. **Designar responsáveis** - Quem faz cada item?
4. **Criar issues no GitHub** - Rastrear progresso
5. **Configurar CI/CD** - Primeiro crítico a fazer

---

**Documento gerado:** 2026-06-12  
**Análise do projeto:** Completa  
**Status:** Pronto para implementação

