#!/usr/bin/env node

/**
 * Script de Importação Segura de Excel para Kanban
 * Valida e separa corretamente: Nome, Telefone, Área, Benefício, etc.
 *
 * Uso: node import-excel-safe.js <arquivo.xlsx>
 */

const fs = require('fs');
const XLSX = require('xlsx');
const path = require('path');

// Validadores
const validators = {
  // Detecta se é um telefone/número
  isTelefone: (str) => {
    if (!str) return false;
    return /^[\s()0-9\-+]*\d{8,}[\s()0-9\-]*$/.test(String(str).trim());
  },

  // Detecta se é um nome válido (contém letras)
  isNomeValido: (str) => {
    if (!str) return false;
    const trimmed = String(str).trim();
    return /[a-záéíóúâêôãõç\s]/i.test(trimmed) && trimmed.length > 2;
  },

  // Normaliza telefone
  normalizaTelefone: (str) => {
    if (!str) return null;
    const nums = String(str).replace(/\D/g, '');
    if (nums.length >= 10) {
      return nums.length === 11
        ? `(${nums.slice(0, 2)})${nums.slice(2, 7)}-${nums.slice(7)}`
        : `(${nums.slice(0, 2)})${nums.slice(2, 6)}-${nums.slice(6)}`;
    }
    return str;
  },

  // Detecta área de atuação
  detectaArea: (str) => {
    if (!str) return 'Previdenciario';
    const s = String(str).toLowerCase();
    if (s.includes('previdenci')) return 'Previdenciario';
    if (s.includes('trabalh')) return 'Trabalhista';
    if (s.includes('cível') || s.includes('civil')) return 'Civil';
    if (s.includes('famí') || s.includes('familia')) return 'Familia';
    if (s.includes('tribut')) return 'Tributario';
    return 'Previdenciario';
  },
};

function processarLinhaExcel(row, colunas) {
  const resultado = {
    nome: null,
    contato: null,
    area: 'Previdenciario',
    beneficio: null,
    numeroProcesso: null,
    natureza: 'LEAD',
    responsavel: 'Sistema',
    observacoes: null,
    erros: []
  };

  // Processar cada campo
  Object.entries(colunas).forEach(([campo, indice]) => {
    const valor = row[indice];
    if (!valor) return;

    const str = String(valor).trim();

    switch (campo) {
      case 'nome':
        // Se for telefone, usa como contato
        if (validators.isTelefone(str)) {
          if (!resultado.contato) {
            resultado.contato = validators.normalizaTelefone(str);
          }
          resultado.erros.push(`Nome é um telefone (${str})`);
        } else if (validators.isNomeValido(str)) {
          resultado.nome = str;
        } else {
          resultado.erros.push(`Nome inválido: ${str}`);
        }
        break;

      case 'contato':
      case 'telefone':
        if (validators.isTelefone(str)) {
          resultado.contato = validators.normalizaTelefone(str);
        } else if (!resultado.nome && validators.isNomeValido(str)) {
          resultado.nome = str;
        }
        break;

      case 'area':
        resultado.area = validators.detectaArea(str);
        break;

      case 'beneficio':
        resultado.beneficio = str;
        break;

      case 'processo':
      case 'numeroProcesso':
        resultado.numeroProcesso = str;
        break;

      case 'natureza':
        if (['LEAD', 'ORGANICO'].includes(str.toUpperCase())) {
          resultado.natureza = str.toUpperCase();
        }
        break;

      case 'observacoes':
        resultado.observacoes = str;
        break;
    }
  });

  // Validações finais
  if (!resultado.nome) {
    resultado.erros.push('Nome obrigatório não encontrado');
  }
  if (!resultado.beneficio) {
    resultado.erros.push('Benefício não especificado');
  }

  return resultado;
}

function importarExcel(caminhoArquivo) {
  console.log(`📁 Lendo arquivo: ${caminhoArquivo}`);

  if (!fs.existsSync(caminhoArquivo)) {
    console.error(`❌ Arquivo não encontrado: ${caminhoArquivo}`);
    process.exit(1);
  }

  const workbook = XLSX.readFile(caminhoArquivo);
  const resultado = {
    abas: {},
    totalLinhas: 0,
    linhasComErro: 0,
    resumo: []
  };

  workbook.SheetNames.forEach((nomeAba) => {
    console.log(`\n📊 Processando aba: ${nomeAba}`);
    const ws = workbook.Sheets[nomeAba];
    const dados = XLSX.utils.sheet_to_json(ws, { header: 'A' });

    const abaResultado = {
      nome: nomeAba,
      linhas: [],
      total: 0,
      comErro: 0,
      comNome: 0,
      comTelefone: 0
    };

    dados.forEach((row, idx) => {
      if (idx === 0) return; // Skip header

      // Detectar colunas automaticamente
      const colunas = {
        nome: 0,
        contato: 1,
        area: 2,
        beneficio: 3,
        numeroProcesso: 4,
        natureza: 5,
      };

      const linhaProcessada = processarLinhaExcel(row, colunas);
      abaResultado.linhas.push(linhaProcessada);
      abaResultado.total++;
      resultado.totalLinhas++;

      if (linhaProcessada.erros.length > 0) {
        abaResultado.comErro++;
        resultado.linhasComErro++;
      }
      if (linhaProcessada.nome && linhaProcessada.nome !== '[SEM NOME]') {
        abaResultado.comNome++;
      }
      if (linhaProcessada.contato) {
        abaResultado.comTelefone++;
      }
    });

    resultado.abas[nomeAba] = abaResultado;
    resultado.resumo.push({
      aba: nomeAba,
      total: abaResultado.total,
      comNome: abaResultado.comNome,
      comTelefone: abaResultado.comTelefone,
      comErro: abaResultado.comErro
    });

    console.log(`  ✅ ${abaResultado.total} linhas`);
    console.log(`     - Com nome: ${abaResultado.comNome}`);
    console.log(`     - Com telefone: ${abaResultado.comTelefone}`);
    if (abaResultado.comErro > 0) {
      console.log(`     ⚠️  Com erros: ${abaResultado.comErro}`);
    }
  });

  // Salvar relatório
  const nomeRelatorio = `import-report-${Date.now()}.json`;
  fs.writeFileSync(nomeRelatorio, JSON.stringify(resultado, null, 2));
  console.log(`\n📋 Relatório salvo: ${nomeRelatorio}`);

  // Exibir resumo
  console.log('\n📊 RESUMO FINAL:');
  console.log(`  Total de linhas: ${resultado.totalLinhas}`);
  console.log(`  Linhas com erro: ${resultado.linhasComErro}`);
  resultado.resumo.forEach(r => {
    console.log(`  ${r.aba}: ${r.total} (${r.comNome} com nome, ${r.comTelefone} com telefone)`);
  });

  return resultado;
}

// Executar
if (require.main === module) {
  const arquivo = process.argv[2];
  if (!arquivo) {
    console.error('Uso: node import-excel-safe.js <arquivo.xlsx>');
    process.exit(1);
  }
  importarExcel(arquivo);
}

module.exports = { importarExcel, validators };
