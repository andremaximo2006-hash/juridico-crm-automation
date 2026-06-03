// Script de importação — Fechamentos Reais Set/2025–Mai/2026
// Executa: node scripts/import-operacional-fechamentos.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function d(str) {
  if (!str || !str.trim()) return null;
  const s = str.trim();
  // Excel serial date
  if (/^\d{5}$/.test(s)) {
    const serial = parseInt(s);
    return new Date(Math.round((serial - 25569) * 86400 * 1000));
  }
  // DD/MM/YYYY
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return new Date(Date.UTC(+m[3], +m[2] - 1, +m[1]));
  return null;
}

function canal(str) {
  if (!str) return 'LEAD';
  const s = str.toLowerCase();
  if (s.includes('org') || s.includes('verde') || s.includes('🟢')) return 'ORGÂNICO';
  return 'LEAD';
}

function hon(str) {
  if (!str || !str.trim()) return null;
  const n = str.replace(/R\$\s*/g, '').replace(/\./g, '').replace(',', '.').trim();
  const v = parseFloat(n);
  return isNaN(v) ? null : v;
}

function setor(str) {
  if (!str || str.trim() === '-' || !str.trim()) return null;
  return str.trim();
}

const ROWS = [
  // Data | Cliente | Produto/Benefício | Área | Canal | Setor | Obs/Status | Situação Atual | Honorários
  ['03/09/2025','Adriana dos Santos','BPC/LOAS','Previdenciário','Meta Ads','Relacionamento','SEM RETORNO','Requerimento realizado, porém concluido com indeferimento, diante do não comparecimento da cliente na perícia médica. Enviar telegrama.',null],
  ['04/09/2025','Claudia Martins','BPC/LOAS','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO','Requerimento administrativo indeferido por superação de renda. Processo distribuido e em andamento.',null],
  ['04/09/2025','Marcos Amâncio','Aposentadoria','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO','Pedido de prorrogação do benefício realizada. Pagamentos estão sendo realizados até a perícia médica.',null],
  ['04/09/2025','Ademir José de Moura','BPC/LOAS','Previdenciário','Meta Ads','Triagem','SEM VIABILIDADE','BPC/LOAS sem viabilidade. Foi analisado a possibilidade de eventual pedido de aposentadoria por invalidez ou aposentadoria por tempo/idade, mas o cliente não possuia direito a nenhuma opção, principalmente porque a incapacidade é anterior a sua filiação ao RPGS.',null],
  ['04/09/2025','Alessandra Regina','BPC/LOAS','Previdenciário','Meta Ads','Iniciais','SEM RETORNO','Envio de telegrama - Cliente sumiu',null],
  ['06/09/2025','Mariza Alcassa - Vauderci Neves','BPC/LOAS','Previdenciário','Meta Ads','Iniciais','EM ANDAMENTO','Requerimento administrativo negado por não reconhecimento da deficiência. Processo distribuído e em andamento.',null],
  ['06/09/2025','Diva','BPC/LOAS','Previdenciário','Meta Ads','Iniciais','EM ANDAMENTO','Requerimento administrativo indeferido por superação de renda. Processo distribuido e em andamento.',null],
  ['08/09/2025','Nadja dos Santos','BPC/LOAS','Previdenciário','Meta Ads','Relacionamento','BENEFÍCIO NEGADO','Requerimento administrativo negado e não há viabilidade de recorrer judicialmente na negativa por ausencia de preenchimento dos requisitos.',null],
  ['08/09/2025','Viviana','BPC/LOAS','Previdenciário','Meta Ads',null,'DESISTÊNCIA',null,null],
  ['09/09/2025','Silvana','BPC/LOAS','Previdenciário','Meta Ads',null,'DESISTÊNCIA',null,null],
  ['09/09/2025','Daniela Rosado Cabral Rubira','Outros','Previdenciário','Meta Ads',null,'DESISTÊNCIA',null,null],
  ['09/09/2025','Adalberto - Marinalva','BPC/LOAS','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['10/09/2025','Daiane','BPC/LOAS','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO','Requerimento administrativo indeferido por superação de renda. Processo distribuido e em andamento.',null],
  ['15/09/2025','Kátia','BPC/LOAS','Previdenciário','Meta Ads',null,'SEM RETORNO','Pedido negado - Envio de telegrama - Cliente sumiu',null],
  ['15/09/2025','Luiz Eduardo','BPC/LOAS','Previdenciário','Meta Ads',null,'SEM RETORNO','Envio de telegrama - Cliente sumiu',null],
  ['17/09/2025','Gideoni','BPC/LOAS','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO','Requerimento administrativo indeferido por superação de renda. Processo distribuido e em andamento.',null],
  ['20/09/2025','Daiana Lopes','BPC/LOAS','Previdenciário','Meta Ads','Iniciais','EM ANDAMENTO','Requerimento administrativo indeferido por superação de renda. Processo distribuido e em andamento.',null],
  ['21/09/2025','Valcir - Osni de Souza','Auxílio Doença','Previdenciário','Meta Ads',null,'SEM VIABILIDADE',null,null],
  ['25/09/2025','Adalva Jeronimo Diniz','Reclamação Trabalhista','Trabalhista','Orgânico','Relacionamento','ACORDO',null,'R$ 900,00'],
  ['24/09/2025','Aline Bento','BPC/LOAS','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO','Requerimento administrativo indeferido por não reconhecimento da deficiência. Processo distribuído e em andamento.',null],
  ['30/09/2025','Vitória - Kayla','BPC/LOAS','Previdenciário','Meta Ads','Relacionamento','BENEFÍCIO CONCEDIDO',null,'R$9.311,80'],
  ['30/09/2025','Vitória - Gael','BPC/LOAS','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO','Requerimento administrativo indeferido por não reconhecimento da deficiência. Processo distribuído e em andamento.',null],
  ['30/09/2025','Leidiana','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO','Requerimento administrativo negado. Recurso ordinário apresentado.',null],
  // Out/2025
  ['01/10/2025','Rosemary','Auxílio Doença','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO','Requerimento administrativo negado por não reconhecimento da incapacidade. Processo distribuído e em andamento.',null],
  ['03/10/2025','Neriberto Vital da Silva','BPC/LOAS','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO','Requerimento administrativo indeferido por não reconhecimento da deficiência. Processo distribuído e em andamento.',null],
  ['04/10/2025','Tathiana Aparecida Santos Carreira','BPC/LOAS','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO','Requerimento administrativo indeferido por não reconhecimento da deficiência. Processo distribuído e em andamento.',null],
  ['04/10/2025','Sheila - Ronaldo Aparecido','BPC/LOAS','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO','Requerimento administrativo em andamento.',null],
  ['06/10/2025','Cristiano César de Melo','BPC/LOAS','Previdenciário','Meta Ads','Recepção','SEM RETORNO',null,null],
  ['07/10/2025','Fabio Macena Auricchio','Auxílio Doença','Previdenciário','Meta Ads','Relacionamento','BENEFÍCIO CONCEDIDO',null,'R$ 7.054,01'],
  ['08/10/2025','Edilene - Shaia','BPC/LOAS','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO','Requerimento administrativo indeferido por superação de renda. Processo distribuido e em andamento.',null],
  ['09/10/2025','Jhonys Clementino Santana','BPC/LOAS','Previdenciário','Orgânico',null,'MORREU','Cliente faleceu.',null],
  ['12/10/2025','Wilma Alves Fernandes','BPC/LOAS','Previdenciário','Meta Ads',null,'SEM RETORNO',null,null],
  ['13/10/2025','Letícia - Carolina Favoreto Losada','BPC/LOAS','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO','Requerimento administrativo indeferido por não reconhecimento da deficiência. Processo distribuído e em andamento.',null],
  ['14/10/2025','Jaislany Fernandes - Nikolas Gabriel Nascimento','BPC/LOAS','Previdenciário','Meta Ads',null,'SEM RETORNO','Envio de telegrama - Cliente sumiu',null],
  ['17/10/2025','Ana Lelia','Indenizatória','Cível','Orgânico','Relacionamento','EM ANDAMENTO','Processo distribuído e em andamento',null],
  ['17/10/2025','Maria Cristina Alves de Souza','BPC/LOAS','Previdenciário','Meta Ads',null,'SEM RETORNO',null,null],
  ['21/10/2025','Thiago Rafael Xavier representado por Josefa Angélica Caldas Xavier','BPC/LOAS','Previdenciário','Meta Ads',null,'SEM VIABILIDADE',null,null],
  ['28/10/2025','Lara','Outros','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO','Processo judicial em andamento.',null],
  ['29/10/2025','Heitor Gomes de Melo Oliveira','BPC/LOAS','Previdenciário','Orgânico',null,'DESISTÊNCIA',null,null],
  ['29/10/2025','Thiago Marcelino Neto','Reclamação Trabalhista','Trabalhista','Orgânico','Relacionamento','EM ANDAMENTO','Processo judicial em andamento.',null],
  ['29/10/2025','Vera Lucia Martins','BPC/LOAS','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO','Requerimento administrativo indeferido por não reconhecimento da deficiência. Processo distribuído e em andamento.',null],
  ['30/10/2025','Ricardo Gibran Alasmar','BPC/LOAS','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO','Requerimento administrativo indeferido por não reconhecimento da deficiência. Processo distribuído e em andamento.',null],
  ['31/10/2025','Antônio Chaves da Silva','Ação de exoneração de alimentos','Família','Orgânico','Relacionamento','EM ANDAMENTO','Processo judicial em andamento.','R$ 2.500,00'],
  // Nov/2025
  ['03/11/2025','Maria de Lourdes da Silva','BPC/LOAS','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO','Requerimento administrativo indeferido por não reconhecimento da deficiência. Processo distribuído e em andamento.',null],
  ['04/11/2025','Angélica Pereira da Silva','Inventário','Família','Orgânico','Relacionamento','EM ANDAMENTO','Ação de reconhecimento e renúncia de testamento em andamento','R$ 6.000,00'],
  ['04/11/2025','Ednalva Maria Araujo','BPC/LOAS','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO','Requerimento administrativo indeferido por não reconhecimento da deficiência. Processo distribuído e em andamento.',null],
  ['05/11/2025','Elisandra Nunes de Oliveira','Indenizatória','Cível','Orgânico','Relacionamento','EM ANDAMENTO','Processo judicial em andamento',null],
  ['05/11/2025','Rogeria Soares Mendes','BPC/LOAS','Previdenciário','Meta Ads',null,'SEM RETORNO',null,null],
  ['05/11/2025','Alessandra Nunes Mendonça','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO','Processo judicial em andamento.',null],
  ['06/11/2025','Bruna','Trabalhista','Trabalhista','Orgânico','Relacionamento','EM ANDAMENTO','Processo judicial em andamento.',null],
  ['07/11/2025','Leticia Machado Bueno','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','BENEFÍCIO CONCEDIDO',null,'R$ 1.632,63'],
  ['07/11/2025','Murillo César da Silva','Mandado de segurança','Previdenciário','Orgânico','Relacionamento','BENEFÍCIO CONCEDIDO',null,'R$ 3.036,00'],
  ['07/11/2025','Adriana Lobo','BPC/LOAS','Previdenciário','Meta Ads','Recepção','PENDENTE',null,null],
  ['07/11/2025','Maria Lúcia do Carmo','Adicional de 25%','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO','Requerimento administrativo realizado',null],
  ['10/11/2025','Edson Marcos Gonçalves','Aposentadoria','Previdenciário','Meta Ads',null,'DESISTÊNCIA',null,null],
  ['10/11/2025','Edielson de Macêdo Rocha','BPC/LOAS','Previdenciário','Meta Ads',null,'SEM RETORNO',null,null],
  ['10/11/2025','Silvana da Silva Nascimento','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO','Requerimento administrativo negado. Recurso ordinário em andamento.',null],
  ['12/11/2025','Ana Clete de Oliveira da Silva','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO','Requerimento administrativo negado. Processo judicial em andamento.',null],
  ['12/11/2025','Paulo José dos Santos','Auxílio Doença','Previdenciário','Orgânico','Relacionamento','BENEFÍCIO CONCEDIDO',null,'R$ 793,80'],
  ['13/11/2025','Michele Silva Bernardo','Reclamação Trabalhista','Trabalhista','Orgânico','Relacionamento','ACORDO',null,'R$ 2.400,00'],
  ['13/11/2025','Sara Cristina Rodrigues Soares','Salário Maternidade','Previdenciário','Meta Ads',null,'SEM RETORNO',null,null],
  ['17/11/2025','Júnior Pereira Passos','Auxílio Acidente','Previdenciário','Orgânico',null,'SEM VIABILIDADE',null,null],
  ['17/11/2025','Sandro Hiroyto Alves da Silva','BPC/LOAS','Previdenciário','Meta Ads',null,'SEM RETORNO',null,null],
  ['17/11/2025','Maria do Socorro - Maria de Lourdes','BPC/LOAS','Previdenciário','Orgânico',null,'MORREU',null,null],
  ['17/11/2025','Verônica Silva de Jesus','Salário Maternidade','Previdenciário','Meta Ads',null,'SEM VIABILIDADE',null,null],
  ['18/11/2025','Theo Felipe de Freitas Garcia','BPC/LOAS','Previdenciário','Meta Ads',null,'DESISTÊNCIA',null,null],
  ['18/11/2025','Ana Vitória de Freitas Garcia','BPC/LOAS','Previdenciário','Meta Ads',null,'SEM VIABILIDADE',null,null],
  ['19/11/2025','Roseli Maria Santana','Indenizatória','Cível','Orgânico',null,'DESISTÊNCIA',null,null],
  ['25/11/2025','Karolaine Costa','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['28/11/2025','Kauê Alves dos Santos Silva - genitora Ingrid Cristina','Execução de alimentos','Família','Orgânico','Relacionamento','ACORDO',null,'R$ 300,00'],
  // Dez/2025
  ['01/12/2025','Juliana Priscila Conceição','Salário Maternidade','Previdenciário','Meta Ads','Iniciais','SEM RETORNO','Cliente sumiu e ocorreu perda do direito.',null],
  ['01/12/2025','Gabriel Zeus','Reclamação Trabalhista','Trabalhista','Orgânico',null,'SEM VIABILIDADE',null,null],
  ['02/12/2025','Paulo Luiz','Aposentadoria','Previdenciário','Orgânico',null,'BENEFÍCIO CONCEDIDO',null,'R$ 3.069,60'],
  ['02/12/2025','Jaiane Batista Bispo','BPC/LOAS','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO','BPC/LOAS cessado por não reconhecimento da deficiência. Processo distribuído e em andamento.',null],
  ['03/12/2025','Jorge Veroneze','Divórcio','Família','Orgânico','Relacionamento','ENCERRADO',null,'R$ 1.500,00'],
  ['08/12/2025','Tatiana dos Anjos','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','BENEFÍCIO CONCEDIDO',null,'R$ 1.789,80'],
  ['08/12/2025','Beatriz Damasceno','Reclamação Trabalhista','Trabalhista','Orgânico',null,'SEM VIABILIDADE',null,null],
  ['08/12/2025','Michele Silva Bernardo','Salário Maternidade','Previdenciário','Orgânico','Relacionamento','BENEFÍCIO CONCEDIDO',null,'R$ 1.789,80'],
  ['09/12/2025','Laisa Rodrigues','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO','Requerimento administrativo negado. Recurso ordinário em andamento.',null],
  ['09/12/2025','Rayane da Silva','Salário Maternidade','Previdenciário','Meta Ads',null,'DESISTÊNCIA',null,null],
  ['09/12/2025','Altelina Santos de Oliveira','BPC/LOAS','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO','Requerimento administrativo indeferido por superação de renda. Processo distribuido e em andamento.',null],
  ['09/12/2025','Camila Santos de Oliveira','BPC/LOAS','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO','BPC/LOAS cessado por não reconhecimento da deficiência. Processo distribuído e em andamento.',null],
  ['10/12/2025','Andrea Solano','BPC/LOAS','Previdenciário','Meta Ads','Recepção','PENDENTE',null,null],
  ['10/12/2025','Joaquim Guilherme - Kate','BPC/LOAS','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO','Requerimento administrativo negado por superação de renda. Processo distribuído e em andamento.',null],
  ['10/12/2025','Sandra de Almeida','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['10/12/2025','Joaquim Guilherme Melo','BPC/LOAS','Previdenciário','Meta Ads','Relacionamento',null,null,null],
  ['10/12/2025','Raiany','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','BENEFÍCIO CONCEDIDO',null,'R$ 1.319,00'],
  ['11/12/2025','Arminda - Pyetro','BPC/LOAS','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO','Requerimento administrativo em andamento.',null],
  ['11/12/2025','Dayanne Barroso Bueno','Salário Maternidade','Previdenciário','Meta Ads',null,'SEM RETORNO','Sem retorno e perdeu o direito.',null],
  ['11/12/2025','Maria Noêmia','BPC/LOAS','Previdenciário','Meta Ads',null,'SEM RETORNO',null,null],
  ['11/12/2025','Daiane Furtado','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','BENEFÍCIO CONCEDIDO',null,'R$ 1.789,80'],
  ['11/12/2025','Maria Cristina Santana de Oliveira','Salário Maternidade','Previdenciário','Meta Ads',null,'SEM VIABILIDADE',null,null],
  ['15/12/2025','Meire Silva Santos','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO','Requerimento administrativo negado. Recurso ordinário em andamento.',null],
  ['15/12/2025','Vanusa de Oliveira','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO','Requerimento administrativo negado. Recurso ordinário em andamento.',null],
  ['16/12/2025','Tiago Douglas','Auxílio doença','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO','Processo judicial em andamento. Requerimento administrativo concedido em paralelo.','R$ 2.235,70'],
  ['17/12/2025','Sandra dos Santos Vieira - JEAN','Salário Maternidade','Previdenciário','Meta Ads',null,'SEM RETORNO','Sem retorno e perda do direito.',null],
  ['19/12/2025','Marcia Baptista','BPC/LOAS','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO','Requerimento administrativo em andamento.',null],
  ['19/12/2025','Eliane','BPC/LOAS','Previdenciário','Orgânico',null,'SEM VIABILIDADE',null,null],
  ['19/12/2025','Elaine','BPC/LOAS','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO','Requerimento administrativo em andamento.',null],
  // Jan/2026
  ['06/01/2026','Daniele Chaves Arcanjo','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','BENEFÍCIO CONCEDIDO',null,'R$ 1.621,00'],
  ['06/01/2026','Maria Elisa Carvalho','BPC/LOAS','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO','Requerimento administrativo negado por superação de renda. Processo distribuído e em andamento.',null],
  ['06/01/2026','Larissa Carneiro','Salário Maternidade','Previdenciário','Meta Ads',null,'SEM RETORNO',null,null],
  ['06/01/2026','Maria Eduarda Jacinto','Salário Maternidade','Previdenciário','Orgânico','Relacionamento','BENEFÍCIO CONCEDIDO',null,'R$ 1.701,60'],
  ['07/01/2026','Ayla Luisa da Silva','BPC/LOAS','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO','Requerimento administrativo negado por superação de renda. Processo distribuído e em andamento.',null],
  ['07/01/2026','Raimunda Lourdes Rodrigues','Auxílio Doença/Acidente','Previdenciário','Orgânico',null,'DESISTÊNCIA',null,null],
  ['08/01/2026','Alessandra Schultz Carvalho Silva','Salário Maternidade','Previdenciário','Meta Ads',null,'DESISTÊNCIA',null,null],
  ['08/01/2026','Erinaldo Rodrigues de Araújo','Defesa em reclamação trabalhista','Trabalhista','Orgânico','Relacionamento','ACORDO',null,'R$ 4.500,00'],
  ['08/01/2026','Rute Souza Cassimiro Silva','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['09/01/2026','Selma São Pedro da Silva','Pensão por Morte','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['09/01/2026','Ariane de Oliveira Santos','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','BENEFÍCIO CONCEDIDO',null,'R$ 1.799,31'],
  ['09/01/2026','Ana Paula Faiole de Souza','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['09/01/2026','Natália Saraiva Santos','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','BENEFÍCIO CONCEDIDO',null,'R$ 1.621,00'],
  ['09/01/2026','Marisa do Socorro da Silva','Pensão por Morte','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['09/01/2026','Roseli Inacia Walter','Pensão por Morte','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['10/01/2026','Gilberto Ramos Rodolfo','Pensão por Morte','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['12/01/2026','Ana Claudia da Conceição','Salário Maternidade','Previdenciário','Meta Ads',null,'SEM VIABILIDADE',null,null],
  ['12/01/2026','Viviane Silva Alves','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['12/01/2026','Yohana Andressa de Souza Santana','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['13/01/2026','Daniela Alves Santos','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO','Requerimento administrativo negado. Recurso ordinário em andamento.',null],
  ['14/01/2026','Mônica da Silva Neves','Pensão por Morte','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['14/01/2026','Milena Dariqui Rodrigues','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','BENEFÍCIO CONCEDIDO','CLIENTE DEU CALOTE',null],
  ['14/01/2026','Luana Aparecida Ferreira de Souza','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['14/01/2026','Cleiciane Fonseca Matias','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO','Requerimento administrativo negado. Recurso ordinário em andamento.',null],
  ['15/01/2026','Pamila Soares Rodrigues','Salário Maternidade','Previdenciário','Meta Ads',null,'SEM RETORNO',null,null],
  ['15/01/2026','Midilene Garrido Santos','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['15/01/2026','Joelma Ribeiro Lima','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['15/01/2026','Maria Leticia da Silva Paz','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','BENEFÍCIO CONCEDIDO',null,'R$ 1.621,00'],
  ['15/01/2026','Ana Cintia Felix Alberto','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','BENEFÍCIO CONCEDIDO',null,'R$ 1.702,05'],
  ['16/01/2026','Fernanda da Conceição','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','BENEFÍCIO CONCEDIDO',null,'R$ 1.799,24'],
  ['19/01/2026','José Leandro da Silva','BPC/LOAS','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['19/01/2026','Ana Caroline Duarte Carvalho','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','BENEFÍCIO CONCEDIDO',null,'R$ 1.297,00'],
  ['21/01/2026','Emily Natacha Lima de Souza','Salário Maternidade','Previdenciário','Meta Ads',null,'SEM RETORNO',null,null],
  ['22/01/2026','Vitória Dantas Alves','Reclamação Trabalhista','Trabalhista','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['22/01/2026','Maria Aparecida de Lima Neves','Pensão por Morte','Previdenciário','Orgânico','Iniciais',null,null,null],
  ['22/01/2026','Maria Lucia Rozendo Candido','Reclamação Trabalhista','Trabalhista','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['23/01/2026','Polyanna Santana de Oliveira','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO','Requerimento administrativo negado. Recurso ordinário em andamento.',null],
  ['23/01/2026','Daniela Rosa Gomes','Salário Maternidade','Previdenciário','Meta Ads',null,'SEM VIABILIDADE',null,null],
  ['26/01/2026','Andrea Costa Garcia','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','BENEFÍCIO CONCEDIDO',null,'R$ 1.621,00'],
  ['26/01/2026','Under Ground Santos de Oliveira Araújo','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','BENEFÍCIO CONCEDIDO',null,'R$ 1.621,00'],
  ['26/01/2026','Beatriz Soares da Silva','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','BENEFÍCIO CONCEDIDO',null,'R$ 1.621,00'],
  ['27/01/2026','Maria de Fátima Ferreira da Silva','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO','Requerimento administrativo em andamento.',null],
  ['27/01/2026','Bianca Miguel Duarte','Salário Maternidade','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO','Requerimento administrativo negado. Recurso ordinário em andamento.',null],
  ['28/01/2026','Ana Flávia Machado da Silva','Salário Maternidade','Previdenciário','Meta Ads',null,'DESISTÊNCIA',null,null],
  ['28/01/2026','Joseli Sales da Silva','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO','Requerimento administrativo negado. Recurso ordinário em andamento.',null],
  ['28/01/2026','Cleber dos Santos Silva','Trabalhista','Trabalhista','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['29/01/2026','Laissa Anias de Jesus','Salário Maternidade','Previdenciário','Meta Ads',null,'SEM RETORNO',null,null],
  ['46052','Danubia de Oliveira','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','BENEFÍCIO CONCEDIDO',null,'R$ 1.621,00'],
  // Fev/2026
  ['03/02/2026','Stephany Santana Montezano','Salário Maternidade','Previdenciário','Meta Ads',null,'SEM VIABILIDADE',null,null],
  ['03/02/2026','Fabiana dos Santos Oliveira','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['03/02/2026','Sabrina Silva Santiago','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['04/02/2026','Aline Machado Ferreira dos Santos','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['04/02/2026','Brenda Lopes Da Costa Araujo','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['04/02/2026','Aghata Vitória Lima da Costa','BPC/LOAS','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['05/02/2026','Cecília Vitória Ferreira','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['05/02/2026','Lucrecia Costa de Oliveira','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['05/02/2026','Ingrid Lorraine Gomes','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['46059','Fabiana Alves Lira','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','BENEFÍCIO CONCEDIDO',null,'R$ 1.621,00'],
  ['46059','Larissa Vitória de Moura','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','BENEFÍCIO CONCEDIDO',null,'R$ 1.621,00'],
  ['09/02/2026','Claudia da Silva Pacheco','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['10/02/2026','Viviane das Neves de Oliveira','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['46063','Dulcineia Tomaz Amaral','Auxílio Doença/Acidente','Previdenciário','Orgânico','Relacionamento','BENEFÍCIO CONCEDIDO',null,'R$ 4.006,95'],
  ['10/02/2026','Aline Souza Santos','Salário Maternidade','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['11/02/2026','Adriana Ferreira Alves','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['13/02/2026','Rosileide Santos Cabral de Sousa','Salário Maternidade','Previdenciário','Meta Ads',null,'SEM VIABILIDADE',null,null],
  ['46066','Bruna Andrade Fernandes','Salário Maternidade','Previdenciário','Orgânico','Relacionamento','BENEFÍCIO CONCEDIDO',null,'R$ 1.621,00'],
  ['18/02/2026','Juliana de Jesus Santos','Salário Maternidade','Previdenciário','Meta Ads',null,'SEM VIABILIDADE',null,null],
  ['23/02/2026','Maria Cecilia da Silva','Salário Maternidade','Previdenciário','Meta Ads',null,'SEM VIABILIDADE',null,null],
  ['23/02/2026','Helen Cristina Rocha da Conceição','BPC/LOAS','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['23/02/2026','Janini Cristini dos Santos Alves','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['24/02/2026','Wellington dos Santos','Auxílio Doença/Acidente','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['26/02/2026','Darlene Florençô da Silva','Salário Maternidade','Previdenciário','Meta Ads',null,'SEM RETORNO',null,null],
  ['26/02/2026','Isenilda Bruniele Barbosa dos Santos','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['26/02/2026','Lara Karollyne Andrade Gomes','BPC/LOAS','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['27/02/2026','Elane de Jesus Dias','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['27/02/2026','Kamila Rodrigues dos Santos','Salário Maternidade','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO','Requerimento administrativo negado. Recurso ordinário em andamento.',null],
  ['27/02/2026','Laís Regina Santos do Prado','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['27/02/2026','Deborah Caroline dos Santos','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['27/02/2026','Marielly Santos do Nascimento','Salário Maternidade','Previdenciário','Meta Ads',null,'SEM VIABILIDADE',null,null],
  ['27/02/2026','Rafaela de Sousa da Silva','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  // Mar/2026
  ['02/03/2026','Heitor de Araujo','BPC/LOAS','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['02/03/2026','Suzane Marcelino Barros','Salário Maternidade','Previdenciário','Meta Ads',null,'SEM VIABILIDADE',null,null],
  ['02/03/2026','Luzimar Batista de Araújo','BPC/LOAS','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['02/03/2026','Andresa Cristina dos Santos','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['02/03/2026','Micaelli Maia da Silva','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['02/03/2026','Brenda Romano Lopes','Salário Maternidade','Previdenciário','Meta Ads',null,'SEM RETORNO',null,null],
  ['02/03/2026','Mirivaine Machado de Miranda','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['02/03/2026','Ranieli da Silva Ramos','Salário Maternidade','Previdenciário','Meta Ads',null,'SEM VIABILIDADE',null,null],
  ['02/03/2026','Thays Cristina Solão Cintra','Salário Maternidade','Previdenciário','Meta Ads',null,'SEM VIABILIDADE',null,null],
  ['02/03/2026','Eliane Samires da Silva','Salário Maternidade','Previdenciário','Meta Ads',null,'SEM VIABILIDADE',null,null],
  ['02/03/2026','Juliana Rodrigues Guimarães','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['02/03/2026','Janaina Mirelly Mendes Fernandes','Salário Maternidade','Previdenciário','Meta Ads',null,'SEM RETORNO',null,null],
  ['03/03/2026','Carla Teodoro','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['03/03/2026','Ingrid Rafaela Aparecida da Silva','Salário Maternidade','Previdenciário','Meta Ads',null,'DESISTÊNCIA',null,null],
  ['04/03/2026','Maria de Fátima do Nascimento','BPC/LOAS','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['04/03/2026','Priscila Rezende Griffo','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['04/03/2026','Nathalia Oliveira de Souza','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['04/03/2026','Evelyn Campelo Seabra','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['04/03/2026','Amanda Macedo Tavares','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['05/03/2026','Henrique da Silva Araújo','BPC/LOAS','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['05/03/2026','Jeniffer Regina da Silva Santos Cardoso','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['05/03/2026','Geraci Anisio da Silva','BPC/LOAS','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['06/03/2026','Luiza Aparecida Ferreira Rocha','Outros','Família','Orgânico','Relacionamento','EM ANDAMENTO',null,'R$ 1.621,00'],
  ['46091','Alexsania Mariah Pinheiro','Salário Maternidade','Previdenciário','Orgânico','Relacionamento','BENEFÍCIO CONCEDIDO',null,'R$ 1.867,59'],
  ['11/03/2026','Caroline Santos de Oliveira','Trabalhista','Trabalhista','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['11/03/2026','Joelma Oliveira Hermíno da Silva','BPC/LOAS','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['11/03/2026','Rogerio Crispim dos Santos','Auxílio Doença/Acidente','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['16/03/2026','Julia Louhanny Silva de Lima','Salário Maternidade','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['17/03/2026','Lara Karollyne Andrade Gomes','BPC/LOAS','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['17/03/2026','Darlyn Barbosa Santos','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['17/03/2026','Gabriel Lopes de Jesus','BPC/LOAS','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['46099','Elezi Lozano Santos','BPC/LOAS','Previdenciário','Meta Ads',null,'SEM RETORNO',null,null],
  ['18/03/2026','Rubia Gonçalves Vitorino','Trabalhista','Trabalhista','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['19/03/2026','Daniela Maria de Oliveira Carvalho','Auxílio Doença','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['19/03/2026','Elaine Soares de Melo','Salário Maternidade','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['19/03/2026','Adenilde dos Santos','Auxílio Doença/Acidente','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['20/03/2026','Sandra Izidorio da Silva','BPC/LOAS','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['46104','Maria Lucia Rozendo Candido','BPC/LOAS','Previdenciário','Orgânico','Relacionamento','BENEFÍCIO CONCEDIDO',null,'R$ 7.359,84'],
  ['24/03/2026','Fabiane dos Santos Silva','Auxílio Acidente','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['26/03/2026','Bruno Pereira Fernandes','Dissolução de união estável','Família','Orgânico','Relacionamento','EM ANDAMENTO',null,'R$ 2.500,00'],
  ['27/03/2026','Adrielly Neves Bento da Silva','Salário Maternidade','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['27/03/2026','R.N. Materiais para Contrução','Trabalhista','Trabalhista','Orgânico','Relacionamento','CASO ENCERRADO',null,'R$ 5.000,00'],
  ['30/03/2026','Ingredy Camile Palavra Araújo','Salário Maternidade','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['31/03/2026','Jailson Alves das Neves','Trabalhista','Trabalhista','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  // Abr/2026
  ['01/04/2026','Beatriz Oliveira da Silva','BPC/LOAS','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,'R$ 3.242,00'],
  ['07/04/2026','Pedro Lucas Nobre Santos Silva','BPC/LOAS','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['08/04/2026','Natália Gonçalves de Souza','Salário Maternidade','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['08/04/2026','Luma Vitória Soares da Silva','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['08/04/2026','Roseli Pereira de Souza Perales','BPC/LOAS','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['09/04/2026','Andreza Maria do Nascimento','Salário Maternidade','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['46121','Cleimara Martins de Ramos','Salário Maternidade','Previdenciário','Meta Ads',null,'SEM RETORNO',null,null],
  ['10/04/2026','Jessica Amanda de Brito','Salário Maternidade','Previdenciário','Meta Ads','Recepção','URBANO',null,null],
  ['14/04/2026','Jully Anne Micheletto','Salário Maternidade','Previdenciário','Meta Ads','Recepção','URBANO',null,null],
  ['15/04/2026','Sara de Souza Santos','Salário Maternidade','Previdenciário','Meta Ads','Recepção','URBANO',null,null],
  ['15/04/2026','Manuella Ramos da Silva','Alimentos','Família','Orgânico','Relacionamento','EM ANDAMENTO',null,'R$ 2.000,00'],
  ['15/04/2026','Marcio Gomes da Silva','Outros','Cível',null,null,'DESISTÊNCIA',null,'R$ 400,00'],
  ['16/04/2026','Maria Aparecida Riberio dos Reis','BPC/LOAS','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['17/04/2026','Jessica Brenda Moreira da Silva','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['17/04/2026','Tatiane Feitosa da Silva','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['20/04/2026','Williane da Silva Sales','BPC/LOAS','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['20/04/2026','Luiz Miguel Oliveira da Silva','BPC/LOAS','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['20/04/2026','Gabriela Rosa Azevedo','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','BENEFÍCIO CONCEDIDO',null,'R$ 1.621,00'],
  ['20/04/2026','Isabela Santana de Jesus','BPC/LOAS','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['22/04/2026','Denise Bozano Menezes','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['22/04/2026','Crislene Morais Pereira','Execução de alimentos','Família','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['23/04/2026','Thais Rossi Pereira Gomes','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','BENEFÍCIO CONCEDIDO',null,'R$ 1.621,00'],
  ['24/04/2026','Rafaela de Melo Silva','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['27/04/2026','Lucas dos Santos Moraes','Auxílio Doença/Acidente','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['28/04/2026','Claudia Daniela dos Santos','Auxílio Doença','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['28/04/2026','Emanuel Ricardo Silva de Souza','BPC/LOAS','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['29/04/2026','Camila Maria da Silva','BPC/LOAS','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['29/04/2026','Michelle Kelly Ferreira','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['30/04/2026','Sebastiana Aparecida Santos de Oliveira','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','BENEFÍCIO CONCEDIDO',null,'R$ 1.621,00'],
  ['30/04/2026','Tuany Estevam Silveira Silveira','Trabalhista','Trabalhista','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['30/04/2026','Jessica Nicole dos Santos Oliveira','Salário Maternidade','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  // Mai/2026
  ['04/05/2026','Camila Geremias Ferreira','Auxílio Doença/Acidente','Previdenciário','Orgânico','Relacionamento','URBANO',null,'R$ 1.649,07'],
  ['04/05/2026','Deiwid Kayo Ruthes Suzin','BPC/LOAS','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['04/05/2026','Ana Cristina Salvador de Oliveira','Auxílio Doença/Acidente','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['05/05/2026','Fernanda Nascimento dos Santos','Salário Maternidade','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['05/05/2026','Nathan Henrique Alves da Silva','BPC/LOAS','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['05/05/2026','Vandérléia Miguel de Brito','BPC/LOAS','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['06/05/2026','Eduarda Fonseca da Silva','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','BENEFÍCIO CONCEDIDO',null,'R$ 1.621,00'],
  ['06/05/2026','Adriana Domingos da Silva','Auxílio Doença/Acidente','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['07/05/2026','Paulo Roberto Maturino','Aposentadoria','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,'R$ 1.800,00'],
  ['07/05/2026','Eduarda Aguiar Silva','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['07/05/2026','Flavio da Silva Junior','Execução de alimentos','Família','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['08/05/2026','Tatiane Vieira da Silva','BPC/LOAS','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['09/05/2026','Juliana Correia Campos Santos','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','BENEFÍCIO CONCEDIDO',null,'R$ 1.621,00'],
  ['11/05/2026','Tatiana Santos da Cruz Farinha','Outros','Cível','Orgânico','Relacionamento','EM ANDAMENTO',null,'R$ 2.500,00'],
  ['11/05/2026','Vitoria Sena Camilo Apolinário','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['12/05/2026','Ayla Monção Lunis','BPC/LOAS','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['12/05/2026','Neuza Mazzini dos Santos','BPC/LOAS','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['12/05/2026','Joana Antônia do Amaral Godoi','BPC/LOAS','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['13/05/2026','Marcos Vinicius da Cruz Barbosa','BPC/LOAS','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['13/05/2026','José Valdir Barreto Garcia','Divórcio','Família','Orgânico',null,'DESISTÊNCIA',null,'R$ 500,00'],
  ['13/05/2026','Geneci Tenorio da Silva','Trabalhista','Trabalhista','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['13/05/2026','Caroline Gomes da Silva','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','EM ANDAMENTO',null,null],
  ['14/05/2026','Naira Santana Ferreira','Trabalhista','Trabalhista','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['14/05/2026','Josefa Rosa Andrade de Oliveira','Aposentadoria','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['14/05/2026','Flut Distribuidora de Alimentos e Bebidas LTDA','Outros','Trabalhista','Orgânico','Relacionamento','EM ANDAMENTO',null,'R$ 2.000,00'],
  ['15/05/2026','Henry Mikael de Lima Arévalo','Salário Maternidade','Previdenciário','Meta Ads','Recepção','URBANO',null,null],
  ['18/05/2026','Maria Aparecida Nascimento dos Santos','Aposentadoria','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['18/05/2026','Benetty Ribeiro Matos','Auxílio Doença/Acidente','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['18/05/2026','Tatiana das Neves Ribeiro','Auxílio Doença/Acidente','Previdenciário','Orgânico','Relacionamento','URBANO',null,null],
  ['19/05/2026','Emily dos Santos Florêncio','Salário Maternidade','Previdenciário','Meta Ads','Relacionamento','URBANO',null,null],
  ['19/05/2026','Afonso Félix Mouzinho','BPC/LOAS','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['19/05/2026','Gilson de Jesus Bonfim','Trabalhista','Trabalhista','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['19/05/2026','Pedro Henrique dos Santos Almeida','BPC/LOAS','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['19/05/2026','Julia do Nascimento Lopes','Salário Maternidade','Previdenciário','Orgânico','Relacionamento','URBANO',null,null],
  ['19/05/2026','José Carlos Veríssimo','BPC/LOAS','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
  ['20/05/2026','Pedro Henrique Silva Borges','BPC/LOAS','Previdenciário','Meta Ads','Recepção','URBANO',null,null],
  ['20/05/2026','Lucilene dos Santos','Outros','Previdenciário','Orgânico','Relacionamento','EM ANDAMENTO',null,null],
];

async function main() {
  console.log('🗑️  Limpando tabela operacional_entries...');
  const deleted = await prisma.operacionalEntry.deleteMany({});
  console.log(`   ${deleted.count} registros removidos`);

  console.log('📥 Importando 290 registros...');
  let ok = 0, err = 0;
  for (const row of ROWS) {
    const [dataStr, cliente, beneficioDemanda, areaAtuacao, canalStr, setorStr, obsStatus, statusAtual, honorariosStr] = row;
    const dataEntrada = d(dataStr);
    if (!dataEntrada || !cliente) { err++; continue; }
    const natureza = canal(canalStr);
    const honorarios = hon(honorariosStr);
    try {
      await prisma.operacionalEntry.create({
        data: {
          dataEntrada,
          cliente,
          natureza,
          areaAtuacao: areaAtuacao || null,
          beneficioDemanda: beneficioDemanda || null,
          setor: setor(setorStr),
          obsStatus: obsStatus || null,
          statusAtual: statusAtual || null,
          honorarios: honorarios,
        },
      });
      ok++;
    } catch(e) {
      console.error(`  ❌ Erro em "${cliente}":`, e.message);
      err++;
    }
  }

  console.log(`\n✅ Concluído: ${ok} importados, ${err} erros`);
  const total = await prisma.operacionalEntry.count();
  console.log(`📊 Total na tabela: ${total}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
