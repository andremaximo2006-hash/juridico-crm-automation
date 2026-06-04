#!/usr/bin/env node

/**
 * 📊 SCRIPT DE IMPORTAÇÃO COMPLETA
 * Importa dados de todas as 9 abas da planilha Excel
 * para a VPS (banco PostgreSQL)
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { Client } = require('pg');

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.magenta}═══════════════════════════════════${colors.reset}\n${colors.magenta}${msg}${colors.reset}\n${colors.magenta}═══════════════════════════════════${colors.reset}\n`),
};

// Config do banco
const db = new Client({
  host: 'localhost',
  port: 5432,
  user: 'juridico_user',
  password: 'juridico_local_2026',
  database: 'juridico_crm',
});

// Função para limpar valor
function cleanValue(val) {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'string') return val.trim();
  return val;
}

// Função para converter data Excel para JavaScript
function excelDateToJSDate(excelDate) {
  if (!excelDate) return null;
  if (typeof excelDate === 'string') {
    const parsed = new Date(excelDate);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  // Excel serial date
  const date = new Date((excelDate - 25569) * 86400 * 1000);
  return isNaN(date.getTime()) ? null : date;
}

// Mapeamento de abas para tabelas
const sheetMapping = {
  'FECHAMENTOS': {
    table: 'operacional_entries',
    mapping: (row) => ({
      dataEntrada: excelDateToJSDate(row['Data']),
      cliente: cleanValue(row['Cliente']),
      contato: cleanValue(row['Contato']),
      natureza: cleanValue(row['Natureza']) || 'LEAD',
      areaAtuacao: cleanValue(row['Área']),
      beneficioDemanda: cleanValue(row['Benefício/Demanda']),
      obsStatus: cleanValue(row['Obs / Status']),
      conformidade: cleanValue(row['Conformidade']),
      setor: cleanValue(row['Setor']),
      cadSenha: cleanValue(row['Cad/Senha']),
      statusAtual: cleanValue(row['Situação Atual']),
    }),
  },
  'INICIAIS': {
    table: 'inicial_entries',
    mapping: (row) => ({
      cliente: cleanValue(row['Cliente']),
      processo: cleanValue(row['Processo']),
      areaAtuacao: cleanValue(row['Área']),
      tipoRequerimento: cleanValue(row['Tipo de Requerimento']),
      dataInicial: excelDateToJSDate(row['Data Inicial']),
      protocolo: cleanValue(row['Protocolo']),
      responsavel: cleanValue(row['Responsável']),
      status: cleanValue(row['Status']),
      observacoes: cleanValue(row['Observações']),
    }),
  },
  'PRAZOS': {
    table: 'prazo_entries',
    mapping: (row) => ({
      cliente: cleanValue(row['Cliente']),
      processo: cleanValue(row['Processo']),
      areaAtuacao: cleanValue(row['Área']),
      tipoPrazo: cleanValue(row['Tipo de Prazo']),
      dataInicial: excelDateToJSDate(row['Data Inicial']),
      dataFinal: excelDateToJSDate(row['Data Final']),
      responsavel: cleanValue(row['Responsável']),
      status: cleanValue(row['Status']),
      observacoes: cleanValue(row['Observações']),
    }),
  },
  'SALÁRIO MATERNIDADE': {
    table: 'sal_maternidade_entries',
    mapping: (row) => ({
      cliente: cleanValue(row['Cliente']),
      contato: cleanValue(row['Contato']),
      beneficio: cleanValue(row['Benefício']),
      contribuicao: cleanValue(row['Contribuição']),
      dppOuDn: cleanValue(row['DPP ou DN']),
      pagamento: cleanValue(row['Pagamento']),
      planejamento: cleanValue(row['Planejamento']),
      status: cleanValue(row['Status']),
    }),
  },
  'CADSENHA': {
    table: 'cad_senha_entries',
    mapping: (row) => ({
      entrada: excelDateToJSDate(row['Entrada']),
      cliente: cleanValue(row['Cliente']),
      contato: cleanValue(row['Contato']),
      natureza: cleanValue(row['Natureza']),
      beneficio: cleanValue(row['Benefício']),
      procuracao: cleanValue(row['Procuração']),
      substabelecimento: cleanValue(row['Substabelecimento']),
      rg: cleanValue(row['RG']),
      status: cleanValue(row['Status']),
    }),
  },
  'CONCESSÕES': {
    table: 'concessao_entries',
    mapping: (row) => ({
      data: excelDateToJSDate(row['Data']),
      cliente: cleanValue(row['Cliente']),
      beneficio: cleanValue(row['Benefício']),
      dataRecebimento: excelDateToJSDate(row['Data Recebimento']),
      valorHonorarios: cleanValue(row['Valor Honorários']),
      boletos: cleanValue(row['Boletos']),
    }),
  },
  'ACESSOS': {
    table: 'acesso_entries',
    mapping: (row) => ({
      sistema: cleanValue(row['Sistema']),
      login: cleanValue(row['Login']),
      senha: cleanValue(row['Senha']),
    }),
  },
  'Página16': {
    table: 'operacional_entries',
    mapping: (row) => ({
      dataEntrada: excelDateToJSDate(row['Data']),
      cliente: cleanValue(row['Cliente']),
      contato: cleanValue(row['Contato']),
      natureza: cleanValue(row['Natureza']) || 'LEAD',
      areaAtuacao: cleanValue(row['Área']),
      beneficioDemanda: cleanValue(row['Benefício/Demanda']),
      obsStatus: cleanValue(row['Obs / Status']),
      statusAtual: cleanValue(row['Situação Atual']),
    }),
  },
};

// Função para inserir dados
async function insertData(table, data) {
  if (!data || Object.keys(data).length === 0) return 0;

  const columns = Object.keys(data);
  const values = Object.values(data);
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
  const columnNames = columns.join(', ');

  const query = `
    INSERT INTO ${table} (${columnNames}, created_at, updated_at)
    VALUES (${placeholders}, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;

  try {
    await db.query(query, values);
    return 1;
  } catch (err) {
    log.warn(`Erro ao inserir em ${table}: ${err.message}`);
    return 0;
  }
}

// Função principal
async function main() {
  log.section('🚀 IMPORTAÇÃO COMPLETA - PLANILHA EXCEL');

  try {
    // Conectar ao banco
    log.info('Conectando ao banco de dados...');
    await db.connect();
    log.success('Conectado ao PostgreSQL');

    // Ler planilha
    const filePath = process.argv[2] || '/Users/andreluis/Downloads/GN - CONTROLE DE PRAZOS E INICIAIS - final.xlsx';

    if (!fs.existsSync(filePath)) {
      log.error(`Arquivo não encontrado: ${filePath}`);
      process.exit(1);
    }

    log.info(`Lendo planilha: ${path.basename(filePath)}`);
    const workbook = XLSX.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    log.success(`${sheetNames.length} abas encontradas: ${sheetNames.join(', ')}`);

    let totalRows = 0;
    let totalInserted = 0;

    // Processar cada aba
    for (const sheetName of sheetNames) {
      if (!sheetMapping[sheetName]) {
        log.warn(`Aba '${sheetName}' não mapeada, pulando...`);
        continue;
      }

      log.section(`📊 Processando: ${sheetName}`);

      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet);
      const { table, mapping } = sheetMapping[sheetName];

      log.info(`${rows.length} registros encontrados`);

      let inserted = 0;
      for (const row of rows) {
        const mappedData = mapping(row);
        const result = await insertData(table, mappedData);
        inserted += result;
      }

      totalRows += rows.length;
      totalInserted += inserted;
      log.success(`${inserted}/${rows.length} registros importados para ${table}`);
    }

    log.section('📈 RESUMO FINAL');
    log.success(`Total de registros processados: ${totalRows}`);
    log.success(`Total de registros importados: ${totalInserted}`);
    log.info(`Taxa de sucesso: ${((totalInserted / totalRows) * 100).toFixed(1)}%`);

  } catch (error) {
    log.error(`Erro durante importação: ${error.message}`);
    process.exit(1);
  } finally {
    await db.end();
    log.info('Conexão fechada');
  }
}

// Executar
main().catch((err) => {
  log.error(`Erro fatal: ${err.message}`);
  process.exit(1);
});
