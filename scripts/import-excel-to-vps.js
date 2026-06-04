#!/usr/bin/env node

/**
 * 📊 IMPORTADOR EXCEL → PostgreSQL (VPS)
 * Processa planilha localmente, gera SQL, envia para VPS
 * Uso: node scripts/import-excel-to-vps.js
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { execSync } = require('child_process');

// Cores para terminal
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

// Funções utilitárias
function cleanValue(val) {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'string') return val.trim();
  return val;
}

function escapeSQL(str) {
  if (str === null || str === undefined) return 'NULL';
  if (typeof str !== 'string') return String(str);
  return "'" + str.replace(/'/g, "''") + "'";
}

function excelDateToISO(excelDate) {
  if (!excelDate) return null;
  if (typeof excelDate === 'string') {
    const parsed = new Date(excelDate);
    return isNaN(parsed.getTime()) ? null : parsed.toISOString().split('T')[0];
  }
  // Excel serial date (starts at 1900-01-01)
  const date = new Date((excelDate - 25569) * 86400 * 1000);
  return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
}

// Analisador de estrutura
function analyzeSheets(workbook) {
  const analysis = {};

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);
    const headers = rows.length > 0 ? Object.keys(rows[0]) : [];

    analysis[sheetName] = {
      rowCount: rows.length,
      headers: headers,
      sampleRow: rows[0] || {},
    };
  }

  return analysis;
}

// Mapear campos para fichas_operacionais
function mapToFichaOperacional(row) {
  // Detecta área pelo nome (heurística)
  const areaMap = {
    'previdenciario': 'Previdenciario',
    'trabalhista': 'Trabalhista',
    'civil': 'Civil',
    'família': 'Familia',
    'tributário': 'Tributario',
  };

  let area = 'Previdenciario'; // default
  const areaStr = String(cleanValue(row['Área']) || row['AREA'] || 'Previdenciario').toLowerCase();
  for (const [key, val] of Object.entries(areaMap)) {
    if (areaStr.includes(key)) {
      area = val;
      break;
    }
  }

  // Mapeamento de colunas
  const nome = cleanValue(row['Cliente'] || row['CLIENTE'] || row['Nome'] || '');
  const contato = cleanValue(row['Contato'] || row['CONTATO'] || '');
  const natureza = cleanValue(row['Natureza'] || row['NATUREZA'] || 'ORGÂNICO');
  const beneficioDemanda = cleanValue(row['Benefício'] || row['Benefício/Demanda'] || row['BENEFICIO'] || '');
  const numeroProcesso = cleanValue(row['Processo'] || row['Nº Processo'] || row['PROCESSO'] || '');
  const responsavel = cleanValue(row['Responsável'] || row['RESPONSAVEL'] || 'Gabrielle Nunes');
  const obsStatus = cleanValue(row['Obs / Status'] || row['OBS'] || row['Observações'] || '');
  const conformidade = cleanValue(row['Conformidade'] || row['CONFORMIDADE'] || null);
  const cadSenha = cleanValue(row['Cad/Senha'] || row['CadSenha'] || row['CAD_SENHA'] || 'Pendente');
  const dataEntrada = excelDateToISO(row['Data'] || row['Data Entrada'] || row['DATA']);

  return {
    nome,
    contato,
    natureza,
    area,
    beneficio: beneficioDemanda,
    numero_processo: numeroProcesso,
    responsavel,
    observacoes: obsStatus,
    conformidade,
    cad_senha: cadSenha,
    data_entrada: dataEntrada,
    coluna: 'novo', // Todas as fichas importadas começam em "novo"
    prioridade: 'normal', // Default
    natureza_ficha: 'IMPORTACAO',
  };
}

// Gera INSERT statement
function generateInsertSQL(fieldValues) {
  const fields = Object.keys(fieldValues).filter(k => fieldValues[k] !== null && fieldValues[k] !== undefined);
  const values = fields.map(f => {
    const val = fieldValues[f];
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'string') return escapeSQL(val);
    if (val instanceof Date) return escapeSQL(val.toISOString());
    return String(val);
  });

  const valuesStr = values.join(', ');
  const fieldsStr = fields.join(', ');

  return `INSERT INTO fichas_operacionais (${fieldsStr}, created_at, updated_at) VALUES (${valuesStr}, NOW(), NOW());`;
}

// Função principal
async function main() {
  log.section('📊 IMPORTADOR EXCEL → PostgreSQL (EXECUÇÃO LOCAL)');

  try {
    const excelPath = '/Users/andreluis/Downloads/GN - CONTROLE DE PRAZOS E INICIAIS - final.xlsx';

    if (!fs.existsSync(excelPath)) {
      log.error(`Arquivo não encontrado: ${excelPath}`);
      process.exit(1);
    }

    log.info(`Lendo: ${path.basename(excelPath)}`);
    const workbook = XLSX.readFile(excelPath);
    log.success(`${workbook.SheetNames.length} abas encontradas`);

    // Analisar estrutura
    log.section('📋 ANÁLISE DAS ABAS');
    const analysis = analyzeSheets(workbook);

    let totalRows = 0;
    for (const [sheetName, info] of Object.entries(analysis)) {
      log.data(`${sheetName}: ${info.rowCount} registros`);
      log.data(`  Colunas: ${info.headers.join(', ')}`);
      totalRows += info.rowCount;
    }
    log.success(`Total: ${totalRows} registros a importar`);

    // Processar todas as abas mapeadas para fichas_operacionais
    log.section('🔄 GERANDO INSERTS SQL');

    const sqlStatements = [];
    const sheetNamesToProcess = [
      'FECHAMENTOS',
      'INICIAIS',
      'PRAZOS',
      'Página16',
    ];

    let generatedCount = 0;

    for (const sheetName of sheetNamesToProcess) {
      if (!workbook.Sheets[sheetName]) {
        log.warn(`Aba '${sheetName}' não encontrada, pulando...`);
        continue;
      }

      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet);

      log.info(`Processando ${sheetName}: ${rows.length} registros`);

      for (const row of rows) {
        const mappedData = mapToFichaOperacional(row);

        // Validação básica
        if (!mappedData.nome || mappedData.nome === '') {
          log.warn(`  Linha pulada: cliente vazio`);
          continue;
        }

        const sql = generateInsertSQL(mappedData);
        sqlStatements.push(sql);
        generatedCount++;
      }

      log.success(`  ${generatedCount} INSERTs gerados até agora`);
    }

    if (sqlStatements.length === 0) {
      log.error('Nenhum registro foi gerado! Abortando.');
      process.exit(1);
    }

    // Salvar SQL em arquivo temporário
    const sqlFile = '/tmp/import_fichas_operacionais.sql';
    const sqlContent = '-- IMPORTAÇÃO AUTOMÁTICA DE FICHAS OPERACIONAIS\n' +
                      `-- Gerado em: ${new Date().toISOString()}\n` +
                      `-- Total de registros: ${sqlStatements.length}\n\n` +
                      sqlStatements.join('\n');

    fs.writeFileSync(sqlFile, sqlContent);
    log.success(`SQL gerado: ${sqlFile}`);
    log.data(`  ${sqlStatements.length} INSERT statements`);
    log.data(`  Tamanho: ${(sqlContent.length / 1024).toFixed(1)}KB`);

    // Executar na VPS via SSH
    log.section('🚀 IMPORTANDO NA VPS');
    log.info('Enviando arquivo SQL para VPS...');

    try {
      execSync(`sshpass -p '@Advprev@2026' scp -o StrictHostKeyChecking=no \
        ${sqlFile} root@2.25.128.221:/tmp/`, { stdio: 'inherit' });
      log.success('SQL enviado para VPS');
    } catch (err) {
      log.error(`Erro ao enviar SQL: ${err.message}`);
      process.exit(1);
    }

    log.info('Executando SQL na VPS...');

    try {
      execSync(`sshpass -p '@Advprev@2026' ssh -o StrictHostKeyChecking=no root@2.25.128.221 << 'EOSQL'
PGPASSWORD='juridico_local_2026' psql -h localhost -U juridico_user -d juridico_crm -f /tmp/import_fichas_operacionais.sql
echo ""
echo "✅ Importação concluída na VPS"
echo ""
echo "Verificando dados importados:"
PGPASSWORD='juridico_local_2026' psql -h localhost -U juridico_user -d juridico_crm -t -c "SELECT COUNT(*) as total_fichas FROM fichas_operacionais"
EOSQL
`, { stdio: 'inherit' });

      log.success('SQL executado na VPS');
    } catch (err) {
      log.error(`Erro ao executar SQL na VPS: ${err.message}`);
      process.exit(1);
    }

    // Dupla verificação
    log.section('✅ VERIFICAÇÃO FINAL');

    try {
      const result = execSync(`sshpass -p '@Advprev@2026' ssh -o StrictHostKeyChecking=no root@2.25.128.221 \
        "PGPASSWORD='juridico_local_2026' psql -h localhost -U juridico_user -d juridico_crm -t -c \\"SELECT COUNT(*) FROM fichas_operacionais\\""`,
        { encoding: 'utf-8' }).trim();

      const count = parseInt(result);
      log.success(`Total de fichas_operacionais no banco: ${count}`);

      if (count >= sqlStatements.length) {
        log.success(`✅ IMPORTAÇÃO COMPLETA: ${sqlStatements.length}/${count} registros`);
      } else {
        log.warn(`⚠️  ${count} de ${sqlStatements.length} registros foram importados`);
      }
    } catch (err) {
      log.error(`Erro na verificação final: ${err.message}`);
    }

    log.section('📈 RESUMO FINAL');
    log.success(`Registros processados: ${generatedCount}`);
    log.success(`Registros importados: ${sqlStatements.length}`);
    log.success(`Arquivo SQL: ${sqlFile}`);

  } catch (error) {
    log.error(`Erro fatal: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

main().catch((err) => {
  log.error(`Erro não tratado: ${err.message}`);
  process.exit(1);
});
