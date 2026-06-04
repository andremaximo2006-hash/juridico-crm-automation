#!/usr/bin/env node

/**
 * 📊 IMPORTADOR EXCEL FINAL → PostgreSQL (VPS)
 * Lê planilha com estrutura desalinhada, mapeia para fichas_operacionais
 * Uso: node scripts/import-excel-final.js
 */

const XLSX = require('xlsx');
const { execSync } = require('child_process');
const fs = require('fs');
const crypto = require('crypto');

// Função para gerar UUID v4
function generateUUID() {
  return crypto.randomUUID();
}

// Cores
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  data: (msg) => console.log(`${colors.cyan}📌 ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.magenta}═══════════════════════════════════${colors.reset}\n${colors.magenta}${msg}${colors.reset}\n${colors.magenta}═══════════════════════════════════${colors.reset}\n`),
};

function escapeSQL(str) {
  if (!str) return 'NULL';
  if (typeof str !== 'string') return String(str).replace(/'/g, "''");
  return "'" + str.trim().replace(/'/g, "''") + "'";
}

function excelDateToISO(excelDate) {
  if (!excelDate || excelDate === '') return null;
  if (typeof excelDate === 'string') {
    const d = new Date(excelDate);
    return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
  }
  if (typeof excelDate === 'number') {
    const d = new Date((excelDate - 25569) * 86400 * 1000);
    return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
  }
  return null;
}

// Mapeamento de responsáveis
const RESPONSAVEL_MAP = {
  'gabrielle': 'DraGabrielle',
  'thauan': 'DrThauan',
  'rafael': 'DrRafael',
  'nicoli': 'NicoliMoreira',
  'cinthia': 'CinthiaFerreira',
  'daniel': 'DanielMartins',
  'vanderli': 'VanderliFernandes',
  'kailane': 'KailaneSantos',
  'fhellipe': 'FhellipeMatheus',
  'heloísa': 'HeloisaEstag',
  'giulia': 'GiuliaDesid',
  'andréluís': 'AndréLuís',
};

function normalizarResponsavel(nome) {
  if (!nome) return 'DraGabrielle'; // default
  const lower = String(nome).toLowerCase().trim();
  for (const [key, val] of Object.entries(RESPONSAVEL_MAP)) {
    if (lower.includes(key)) return val;
  }
  return 'DraGabrielle'; // fallback
}

function isHeaderRow(row) {
  // Identifica linhas de cabeçalho por padrões conhecidos
  const headerKeywords = ['CLIENTE', 'ENTRADA', 'DATA', 'CONTATO', 'BENEFÍCIO', 'NATUREZA', 'PROCESSO'];
  const values = Object.values(row).join('|').toUpperCase();
  return headerKeywords.some(kw => values.includes(kw));
}

function isEmptyRow(row) {
  return Object.values(row).every(v => !v || v === '' || v === 0);
}

function isTitleRow(row) {
  // Linhas com apenas ano ou mês
  const values = Object.values(row).filter(v => v).map(String);
  return values.length === 1 && (/^\d{4}$/.test(values[0]) || ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'].includes(values[0].toUpperCase()));
}

function processSheetData(sheetName, workbook) {
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  const result = [];
  let headerIdx = -1;
  let headers = [];

  // Encontrar cabeçalho
  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    if (isHeaderRow(rows[i])) {
      headerIdx = i;
      headers = Object.keys(rows[i]);
      break;
    }
  }

  if (headerIdx === -1) {
    log.warn(`  ⚠️  ${sheetName}: cabeçalho não encontrado`);
    return result;
  }

  // Processar dados após cabeçalho
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    if (isEmptyRow(row) || isTitleRow(row) || isHeaderRow(row)) continue;
    result.push(row);
  }

  return result;
}

function mapToFichaSQL(row, defaultResponsavel = 'Gabrielle Nunes') {
  // Mapeia campos dinâmicos (colunas podem estar em posições diferentes)
  const getField = (obj, ...keys) => {
    for (const key of keys) {
      const val = obj[key];
      if (val && val !== '') return String(val).trim();
    }
    return '';
  };

  const nome = getField(row, 'CONTROLE DE PRAZOS', 'CLIENTE', '__EMPTY_1', 'Cliente', 'cliente');
  const contato = getField(row, 'CONTATO', '__EMPTY_2', 'contato');
  const natureza = getField(row, 'NATUREZA', '__EMPTY', 'CONTROLE DE ENTRADA', 'natureza') || 'ORGÂNICO';
  const area = getField(row, 'AREA DE ATUAÇÃO', '__EMPTY_3', 'AREA', 'area', '__EMPTY_2') || 'Previdenciario';
  const beneficio = getField(row, 'BENEFÍCIO', 'BENEFÍCIO | DEMANDA', '__EMPTY_4', 'BENEFÍCIO');
  const processo = getField(row, 'PROCESSO', '__EMPTY_2', '__EMPTY_1', 'processo');
  const responsavelStr = getField(row, 'RESPONSAVEL', '__EMPTY_7', 'RESPONSAVEL', 'responsavel') || defaultResponsavel;
  const responsavel = normalizarResponsavel(responsavelStr);
  const dataEntrada = excelDateToISO(getField(row, 'ENTRADA', '__EMPTY', 'DATA', '__EMPTY_5', 'data_entrada'));
  const obs = getField(row, 'OBSERVAÇÕES', '__EMPTY_8', '__EMPTY_9', 'OBS', 'observacoes');

  // Normalizar área
  const areaNorm = String(area).toLowerCase().replace(/\s+/g, '');
  let areaFinal = 'Previdenciario';
  if (areaNorm.includes('previdenciario')) areaFinal = 'Previdenciario';
  else if (areaNorm.includes('trabalhista')) areaFinal = 'Trabalhista';
  else if (areaNorm.includes('civil')) areaFinal = 'Civil';
  else if (areaNorm.includes('familia')) areaFinal = 'Familia';
  else if (areaNorm.includes('tributario')) areaFinal = 'Tributario';

  // Normalizar natureza
  const naturezaNorm = String(natureza).toUpperCase().includes('ORGANICO') ? 'ORGÂNICO' : 'LEAD';

  // Validação
  if (!nome || nome === '') return null;

  const id = generateUUID();
  const campos = ['id', 'nome', 'contato', 'natureza', 'area', 'beneficio', 'numeroProcesso', 'responsavel', 'observacoes', 'cadSenha', 'coluna', 'prioridade'];
  const valores = [
    escapeSQL(id),
    escapeSQL(nome),
    escapeSQL(contato),
    escapeSQL(naturezaNorm),
    escapeSQL(areaFinal),
    escapeSQL(beneficio),
    escapeSQL(processo),
    escapeSQL(responsavel),
    escapeSQL(obs),
    escapeSQL('Pendente'),
    escapeSQL('novo'),
    escapeSQL('normal'),
  ];

  if (dataEntrada) {
    campos.push('dataEntrada');
    valores.push(escapeSQL(dataEntrada));
  } else {
    campos.push('dataEntrada');
    valores.push('NOW()');
  }

  return { campos, valores };
}

async function main() {
  log.section('📊 IMPORTADOR EXCEL FINAL → VPS');

  try {
    const excelPath = '/Users/andreluis/Downloads/GN - CONTROLE DE PRAZOS E INICIAIS - final.xlsx';

    if (!fs.existsSync(excelPath)) {
      log.error(`Arquivo não encontrado: ${excelPath}`);
      process.exit(1);
    }

    log.info(`Lendo: ${excelPath.split('/').pop()}`);
    const workbook = XLSX.readFile(excelPath);
    log.success(`${workbook.SheetNames.length} abas encontradas`);

    const sheetsToProcess = {
      'FECHAMENTOS': 'Gabrielle Nunes',
      'INICIAIS': 'Gabrielle Nunes',
      'PRAZOS': 'Gabrielle Nunes',
      'SALÁRIO MATERNIDADE': 'Gabrielle Nunes',
      'CADSENHA': 'Gabrielle Nunes',
      'CONCESSÕES': 'Gabrielle Nunes',
      'Página16': 'Daniel Martins',
    };

    let totalGenerated = 0;
    const inserts = [];

    log.section('🔄 PROCESSANDO ABAS');

    for (const [sheetName, defaultResponsavel] of Object.entries(sheetsToProcess)) {
      if (!workbook.Sheets[sheetName]) {
        log.warn(`Aba '${sheetName}' não encontrada`);
        continue;
      }

      log.info(`Processando: ${sheetName}`);
      const rows = processSheetData(sheetName, workbook);
      log.data(`  ${rows.length} registros encontrados`);

      let processed = 0;
      for (const row of rows) {
        const result = mapToFichaSQL(row, defaultResponsavel);
        if (result) {
          const { campos, valores } = result;
          const camposQuoted = [...campos.map(c => `"${c}"`), '"createdAt"', '"updatedAt"'];
          const camposStr = camposQuoted.join(', ');
          const valoresStr = [...valores, 'NOW()', 'NOW()'].join(', ');
          inserts.push(
            `INSERT INTO fichas_operacionais (${camposStr}) VALUES (${valoresStr});`
          );
          processed++;
        }
      }

      totalGenerated += processed;
      log.success(`  ${processed}/${rows.length} registros válidos`);
    }

    if (inserts.length === 0) {
      log.error('Nenhum registro foi processado!');
      process.exit(1);
    }

    // Salvar SQL
    const sqlFile = '/tmp/import_fichas_final.sql';
    const sqlContent = `-- IMPORTAÇÃO AUTOMÁTICA: ${new Date().toISOString()}
-- Total: ${inserts.length} registros
${inserts.join('\n')}
`;

    fs.writeFileSync(sqlFile, sqlContent);
    log.success(`SQL gerado: ${inserts.length} INSERTs`);
    log.data(`  Arquivo: ${sqlFile}`);
    log.data(`  Tamanho: ${(sqlContent.length / 1024).toFixed(1)}KB`);

    // Enviar para VPS
    log.section('🚀 IMPORTANDO NA VPS');

    log.info('Copiando SQL para VPS...');
    execSync(`sshpass -p '@Advprev@2026' scp -o StrictHostKeyChecking=no \
      ${sqlFile} root@2.25.128.221:/tmp/`, { stdio: 'inherit' });
    log.success('SQL copiado');

    log.info('Executando na VPS...');
    execSync(`sshpass -p '@Advprev@2026' ssh -o StrictHostKeyChecking=no root@2.25.128.221 << 'EOFVPS'
PGPASSWORD='juridico_local_2026' psql -h localhost -U juridico_user -d juridico_crm -f /tmp/import_fichas_final.sql
EOFVPS
`, { stdio: 'inherit' });

    log.success('Importação executada');

    // Verificar resultado
    log.section('✅ VERIFICAÇÃO FINAL');

    const countResult = execSync(`sshpass -p '@Advprev@2026' ssh -o StrictHostKeyChecking=no root@2.25.128.221 \
      "PGPASSWORD='juridico_local_2026' psql -h localhost -U juridico_user -d juridico_crm -t -c 'SELECT COUNT(*) FROM fichas_operacionais'"`,
      { encoding: 'utf-8' }).trim();

    const count = parseInt(countResult);
    log.success(`Total de fichas no banco: ${count}`);
    log.success(`✅ IMPORTAÇÃO CONCLUÍDA: ${inserts.length} registros importados`);

    log.section('📈 RESUMO');
    log.data(`Abas processadas: ${Object.keys(sheetsToProcess).length}`);
    log.data(`Registros importados: ${inserts.length}`);
    log.data(`Total no banco: ${count}`);

  } catch (error) {
    log.error(`Erro: ${error.message}`);
    process.exit(1);
  }
}

main();
