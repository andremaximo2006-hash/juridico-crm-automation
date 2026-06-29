-- Atualizar ConfiguradorOperacional com usuarioId
ALTER TABLE "configurador_operacional" ADD COLUMN "usuarioId" TEXT;
CREATE UNIQUE INDEX "configurador_operacional_usuarioId_key" ON "configurador_operacional"("usuarioId");

-- CreateTable preset_configurador
CREATE TABLE "preset_configurador" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "isPublico" BOOLEAN NOT NULL DEFAULT true,
    "criadoPor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "configuracao" JSONB NOT NULL,
    "configuradorId" TEXT,
    "usosCount" INTEGER NOT NULL DEFAULT 0,
    "ultimoUsoEm" TIMESTAMP(3),

    CONSTRAINT "preset_configurador_pkey" PRIMARY KEY ("id")
);

-- CreateTable historico_configurador
CREATE TABLE "historico_configurador" (
    "id" TEXT NOT NULL,
    "configuradorId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "campoAlterado" TEXT,
    "valorAnterior" TEXT,
    "valorNovo" TEXT,
    "descricao" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_configurador_pkey" PRIMARY KEY ("id")
);

-- CreateTable tecla_personalizada
CREATE TABLE "tecla_personalizada" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "teclaCombo" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tecla_personalizada_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tecla_personalizada_usuarioId_acao_key" ON "tecla_personalizada"("usuarioId", "acao");

-- AddForeignKey
ALTER TABLE "preset_configurador" ADD CONSTRAINT "preset_configurador_configuradorId_fkey" FOREIGN KEY ("configuradorId") REFERENCES "configurador_operacional"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_configurador" ADD CONSTRAINT "historico_configurador_configuradorId_fkey" FOREIGN KEY ("configuradorId") REFERENCES "configurador_operacional"("id") ON DELETE CASCADE ON UPDATE CASCADE;
