-- ═══════════════════════════════════════════════════════════════════════════
-- CRIAÇÃO DE 9 TABELAS PARA ORGANIZAR DADOS CONFORME ABAS DA PLANILHA EXCEL
-- ═══════════════════════════════════════════════════════════════════════════

-- 1️⃣ FECHAMENTOS (330 registros)
CREATE TABLE IF NOT EXISTS "fechamentos_entries" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "data" TIMESTAMP(3),
    "cliente" TEXT NOT NULL,
    "contato" TEXT,
    "natureza" TEXT,
    "area" TEXT,
    "beneficio" TEXT,
    "observacao" TEXT,
    "setor" TEXT,
    "cadSenha" TEXT,
    "statusAtual" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "fechamentos_entries_cliente_idx" ON "fechamentos_entries"("cliente");
CREATE INDEX IF NOT EXISTS "fechamentos_entries_area_idx" ON "fechamentos_entries"("area");

-- 2️⃣ INICIAIS (388 registros)
CREATE TABLE IF NOT EXISTS "iniciais_entries" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "cliente" TEXT NOT NULL,
    "processo" TEXT,
    "area" TEXT,
    "tipoRequerimento" TEXT,
    "dataInicial" TIMESTAMP(3),
    "protocolo" TEXT,
    "responsavel" TEXT,
    "status" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "iniciais_entries_cliente_idx" ON "iniciais_entries"("cliente");
CREATE INDEX IF NOT EXISTS "iniciais_entries_area_idx" ON "iniciais_entries"("area");

-- 3️⃣ PRAZOS (484 registros)
CREATE TABLE IF NOT EXISTS "prazos_entries" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "cliente" TEXT NOT NULL,
    "processo" TEXT,
    "area" TEXT,
    "tipoPrazo" TEXT,
    "dataInicial" TIMESTAMP(3),
    "dataFinal" TIMESTAMP(3),
    "responsavel" TEXT,
    "status" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "prazos_entries_cliente_idx" ON "prazos_entries"("cliente");
CREATE INDEX IF NOT EXISTS "prazos_entries_dataFinal_idx" ON "prazos_entries"("dataFinal");

-- 4️⃣ SALÁRIO MATERNIDADE (98 registros)
CREATE TABLE IF NOT EXISTS "sal_maternidade_entries" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "cliente" TEXT NOT NULL,
    "contato" TEXT,
    "beneficio" TEXT,
    "contribuicao" TEXT,
    "dppOuDn" TIMESTAMP(3),
    "pagamento" TEXT,
    "planejamento" TEXT,
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "sal_maternidade_entries_cliente_idx" ON "sal_maternidade_entries"("cliente");
CREATE INDEX IF NOT EXISTS "sal_maternidade_entries_dpp_idx" ON "sal_maternidade_entries"("dppOuDn");

-- 5️⃣ CADSENHA (28 registros)
CREATE TABLE IF NOT EXISTS "cad_senha_entries" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "entrada" TIMESTAMP(3),
    "cliente" TEXT NOT NULL,
    "contato" TEXT,
    "natureza" TEXT,
    "beneficio" TEXT,
    "procuracao" TEXT,
    "substabelecimento" TEXT,
    "rg" TEXT,
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "cad_senha_entries_cliente_idx" ON "cad_senha_entries"("cliente");

-- 6️⃣ CONCESSÕES (21 registros)
CREATE TABLE IF NOT EXISTS "concessoes_entries" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "data" TIMESTAMP(3) NOT NULL,
    "cliente" TEXT NOT NULL,
    "beneficio" TEXT,
    "dataRecebimento" TIMESTAMP(3),
    "valorHonorarios" DECIMAL(10, 2),
    "boletos" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "concessoes_entries_cliente_idx" ON "concessoes_entries"("cliente");
CREATE INDEX IF NOT EXISTS "concessoes_entries_data_idx" ON "concessoes_entries"("data");

-- 7️⃣ RELATÓRIOS (53 registros)
CREATE TABLE IF NOT EXISTS "relatorios_entries" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "mes" INTEGER,
    "ano" INTEGER,
    "tipo" TEXT,
    "descricao" TEXT,
    "valor" INTEGER,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "relatorios_entries_ano_mes_idx" ON "relatorios_entries"("ano", "mes");

-- 8️⃣ ACESSOS (14 registros)
CREATE TABLE IF NOT EXISTS "acessos_entries" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "sistema" TEXT NOT NULL,
    "login" TEXT,
    "senha" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "acessos_entries_sistema_idx" ON "acessos_entries"("sistema");

-- 9️⃣ PÁGINA 16 (52 registros)
CREATE TABLE IF NOT EXISTS "pagina16_entries" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "numero" INTEGER,
    "cliente" TEXT NOT NULL,
    "demanda" TEXT,
    "area" TEXT,
    "tipoRequerimento" TEXT,
    "data" TIMESTAMP(3),
    "responsavel" TEXT,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "pagina16_entries_cliente_idx" ON "pagina16_entries"("cliente");
CREATE INDEX IF NOT EXISTS "pagina16_entries_area_idx" ON "pagina16_entries"("area");

-- ═══════════════════════════════════════════════════════════════════════════
-- SUMÁRIO: 9 Tabelas Criadas com Índices de Performance
-- ═══════════════════════════════════════════════════════════════════════════
-- 1️⃣ fechamentos_entries (para FECHAMENTOS)
-- 2️⃣ iniciais_entries (para INICIAIS)
-- 3️⃣ prazos_entries (para PRAZOS)
-- 4️⃣ sal_maternidade_entries (para SALÁRIO MATERNIDADE)
-- 5️⃣ cad_senha_entries (para CADSENHA)
-- 6️⃣ concessoes_entries (para CONCESSÕES)
-- 7️⃣ relatorios_entries (para RELATÓRIOS)
-- 8️⃣ acessos_entries (para ACESSOS)
-- 9️⃣ pagina16_entries (para PÁGINA 16)
