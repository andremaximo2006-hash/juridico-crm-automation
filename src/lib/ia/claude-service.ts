import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export class ClaudeIAService {
  /**
   * Obter resposta de Marta (Recepção)
   */
  static async obterRespostaMarta(
    mensagem: string,
    historico: ConversationMessage[] = []
  ): Promise<string> {
    const sistemaMarta = `Você é Marta, analista jurídica do escritório Gabrielle Nunes. Seu papel é:

1. **RECEPÇÃO**: Dar boas-vindas genuínas e apresentar o escritório
2. **COLETA DE DADOS**: Fazer perguntas sobre a situação jurídica do cliente
3. **QUALIFICAÇÃO**: Entender o tipo de benefício procurado
4. **ENCAMINHAMENTO**: Indicar o próximo passo

REGRAS OBRIGATÓRIAS:
- NUNCA comece com "Entendi", "Certo", "Ok", "Compreendo"
- Use o NOME do cliente NO MÁXIMO 2 vezes (início e fim)
- NUNCA diga que é IA ou robô
- Mensagens CURTAS (máximo 3 linhas)
- Seja empática e genuína
- Siga a ordem: nome → apresentação → qualificação

BENEFÍCIOS que pode ajudar:
- Aposentadoria por tempo de contribuição
- BPC/LOAS (deficientes e idosos)
- Salário Maternidade
- Auxílio Acidente
- Pensão por Morte
- Seguro Desemprego

Responda de forma natural e humana.`;

    try {
      const messages: ConversationMessage[] = [
        ...historico,
        { role: "user", content: mensagem },
      ];

      const response = await client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 256,
        system: sistemaMarta,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      if (response.content[0].type === "text") {
        return response.content[0].text;
      }

      throw new Error("Resposta não é texto");
    } catch (error) {
      console.error("Erro ao obter resposta de Marta:", error);
      throw new Error(
        "Falha ao processar mensagem. Tente novamente em alguns segundos."
      );
    }
  }

  /**
   * Obter análise de especialista
   */
  static async obterAnaliseEspecialista(
    tipoEspecialista: string,
    situacaoCliente: string,
    perguntaCliente: string,
    historico: ConversationMessage[] = []
  ): Promise<string> {
    const sistemasEspecialistas: Record<string, string> = {
      inss: `Você é Ana, especialista em INSS. Analise a situação do cliente para:
      - Tempo de contribuição
      - Tipo de aposentadoria possível
      - Documentação necessária
      - Próximos passos

      Seja objetiva e técnica.`,

      bpc_loas: `Você é Carolina, especialista em BPC/LOAS. Analise:
      - Se o cliente é elegível (deficiente ou idoso 65+)
      - Renda familiar
      - Documentação do INSS
      - Tempo de processo

      Seja clara e compassiva.`,

      maternidade: `Você é Helena, especialista em Salário Maternidade. Oriense sobre:
      - Período de licença (120 dias)
      - Valor do benefício
      - Documentação necessária
      - Quanto tempo demora

      Seja acolhedora.`,

      acidente: `Você é Ricardo, especialista em Auxílio Acidente. Avalie:
      - Nexo causal com trabalho
      - Documentação médica
      - Valor do benefício
      - Prazos processuais

      Seja empático.`,
    };

    const sistema =
      sistemasEspecialistas[tipoEspecialista] ||
      "Você é um especialista jurídico. Responda de forma clara e precisa.";

    try {
      const messages: ConversationMessage[] = [
        {
          role: "user",
          content: `Situação do cliente: ${situacaoCliente}\n\nPergunta: ${perguntaCliente}`,
        },
      ];

      const response = await client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 512,
        system: sistema,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      if (response.content[0].type === "text") {
        return response.content[0].text;
      }

      throw new Error("Resposta não é texto");
    } catch (error) {
      console.error("Erro ao obter análise de especialista:", error);
      throw new Error(
        "Falha ao processar análise. Tente novamente em alguns segundos."
      );
    }
  }

  /**
   * Calcular score de viabilidade
   */
  static async calcularScoreEViabilidade(
    dados: Record<string, any>
  ): Promise<{ score: number; viabilidade: "viavel" | "talvez" | "inviavel" }> {
    let score = 0;

    // Pontuação por dados coletados
    if (dados.nome) score += 10;
    if (dados.idade) score += 15;
    if (dados.tempoTrabalhado) score += 15;
    if (dados.situacao) score += 20;
    if (dados.documentacao) score += 15;
    if (dados.contato) score += 15;

    // Viabilidade baseada no tipo de benefício
    let viabilidade: "viavel" | "talvez" | "inviavel" = "talvez";

    if (dados.tipoBeneficio === "inss_aposentadoria") {
      const tempoTrabalhado = parseInt(dados.tempoTrabalhado) || 0;
      if (tempoTrabalhado >= 30) viabilidade = "viavel";
      else if (tempoTrabalhado >= 20) viabilidade = "talvez";
      else viabilidade = "inviavel";
    } else if (dados.tipoBeneficio === "bpc_loas") {
      const idade = parseInt(dados.idade) || 0;
      if (idade >= 65 || dados.deficiente) viabilidade = "viavel";
      else viabilidade = "talvez";
    } else if (
      dados.tipoBeneficio === "maternidade" &&
      dados.genero === "feminino"
    ) {
      viabilidade = "viavel";
    }

    return { score: Math.min(100, score), viabilidade };
  }
}
