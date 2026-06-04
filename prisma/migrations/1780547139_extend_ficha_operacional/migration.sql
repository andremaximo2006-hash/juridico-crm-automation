-- CreateEnum
CREATE TYPE "AreaAtuacao" AS ENUM ('Previdenciario', 'Trabalhista', 'Civil', 'Familia', 'Tributario');

-- CreateEnum
CREATE TYPE "TipoRequerimento" AS ENUM ('RequerimentoAdministrativo', 'PeticaoInicial', 'InicialJudicial', 'MandadoDeSeguranca', 'MinutaDeAcordo', 'Contestacao', 'Replica', 'PeticaoIntermediaria', 'RecursoOrdinario', 'RecursoInominado', 'RecursoEspecial', 'EmbargosDeDeclaracao', 'AgravoDeInstrumento', 'AgravoDePeticao', 'Apelacao', 'CumprimentoDeSentenca', 'CumprimentoDeExigencia', 'HabilitacaoEmExecucao', 'EmendaAInicial', 'RazoeFinais', 'Contrarrazoes', 'Impugnacao', 'DefesaIDPJ', 'AnaliseDeViabilidade');

-- CreateEnum
CREATE TYPE "Responsavel" AS ENUM ('DraGabrielle', 'DrThauan', 'DrRafael', 'NicoliMoreira', 'CinthiaFerreira', 'DanielMartins', 'VanderliFernandes', 'KailaneSantos', 'FhellipeMatheus', 'HeloisaEstag', 'GabriellyEstag', 'GiuliaEstag');

-- CreateEnum
CREATE TYPE "StatusCadSenha" AS ENUM ('Vazio', 'Pendente', 'AguardandoAssinatura', 'OK', 'Bloqueado', 'Verificar');

-- CreateEnum
CREATE TYPE "StatusConformidade" AS ENUM ('Vazio', 'AguardandoLaudosMedicos', 'AguardandoCadUnico', 'AguardandoCadUnicoAtualizado', 'AguardandoDocumentos', 'AguardandoAcessoGOV', 'AguardandoExtratosBancarios', 'AguardandoTituloDeEleitor', 'Pendente', 'OK', 'SemViabilidade', 'Desistencia');

-- CreateEnum
CREATE TYPE "StatusGuia" AS ENUM ('GuiaEmitidaAguardandoPagamento', 'GuiaEmitidaPagamentoRealizado', 'GuiaEncaminhadaPagamentoRealizado', 'NaoEmitida');

-- CreateEnum
CREATE TYPE "KanbanColuna" AS ENUM ('novo', 'triagem', 'andamento', 'concluido');

-- CreateEnum
CREATE TYPE "Prioridade" AS ENUM ('baixa', 'normal', 'alta', 'urgente');

-- CreateEnum
CREATE TYPE "ContribuicaoSM" AS ENUM ('CI', 'FBR');

-- CreateEnum
CREATE TYPE "QuemPagaSM" AS ENUM ('GN', 'Cliente');

-- CreateEnum
CREATE TYPE "NaturezaFicha" AS ENUM ('LEAD', 'ORGANICO');

-- CreateTable
CREATE TABLE "fichas_operacionais" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nome" TEXT NOT NULL,
    "contato" TEXT,
    "natureza" "NaturezaFicha" NOT NULL,
    "area" "AreaAtuacao" NOT NULL,
    "beneficio" TEXT NOT NULL,
    "tipoRequerimento" "TipoRequerimento",
    "numeroProcesso" TEXT,
    "dataEntrada" TIMESTAMP(3) NOT NULL,
    "dataProtocolo" TIMESTAMP(3),
    "numeroProtocolo" TEXT,
    "responsavel" "Responsavel" NOT NULL,
    "setor" TEXT,
    "coluna" "KanbanColuna" NOT NULL DEFAULT 'novo',
    "prioridade" "Prioridade" NOT NULL DEFAULT 'normal',
    "cadSenha" "StatusCadSenha",
    "conformidade" "StatusConformidade",
    "smContribuicao" "ContribuicaoSM",
    "smDpp" TIMESTAMP(3),
    "smQuemPaga" "QuemPagaSM",
    "smStatusGuia" "StatusGuia",
    "observacoes" TEXT,
    "historicoLog" TEXT,

    CONSTRAINT "fichas_operacionais_pkey" PRIMARY KEY ("id")
);
