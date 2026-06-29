export function calcularScore(dados: Record<string, any>) {
  let score = 0;

  // Area viável (+25)
  const areasViaveis = ["previdenciario", "trabalhista", "civil", "familia"];
  if (areasViaveis.includes(String(dados.area).toLowerCase())) {
    score += 25;
  }

  // Situação comum (+20)
  const situacoesComuns = ["aposentadoria", "pensao", "bpc", "divorcio", "guarda", "heranca"];
  const situacao = String(dados.step_2 || "").toLowerCase();
  if (situacoesComuns.some(s => situacao.includes(s))) {
    score += 20;
  }

  // Descrição clara (+20)
  if (String(dados.step_3 || "").length > 30) {
    score += 20;
  }

  // CPF válido (+15)
  const cpf = String(dados.step_4 || "");
  if (cpf.match(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)) {
    score += 15;
  }

  // Nome preenchido (+10)
  if (String(dados.step_1 || "").length > 3) {
    score += 10;
  }

  // Determinar viabilidade
  const viabilidade = score >= 70 ? "viavel" : score >= 50 ? "talvez" : "inviavel";
  
  const motivos: Record<string, string> = {
    viavel: "Seu caso é viável! Vou encaminhar para nosso time especializado analisar.",
    talvez: "Sua situação requer análise profissional. Vamos agendar uma consulta?",
    inviavel: "Desculpe, sua situação não se enquadra em nossas especialidades. Posso indicar outros colegas?"
  };

  return {
    totalScore: Math.min(100, score),
    viabilidade,
    motivo: motivos[viabilidade],
    proximosPassos: viabilidade === "viavel" ? ["Encaminhar para advogado", "Agendar reunião"] : ["Oferecer alternativa"]
  };
}
