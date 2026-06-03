#!/usr/bin/env python3
"""
Super Agent para IA de Atendimento WhatsApp
Padrão: System Prompt → Tools → Loop Agêntico → Histórico
Data: 2026-06-03
"""

import os
import json
import logging
from anthropic import Anthropic
from typing import Tuple

# ============ SETUP ============

logging.basicConfig(
    level=logging.INFO,
    format="[%(levelname)s] %(message)s"
)

MODEL = "claude-opus-4-6"
client = Anthropic()

# ============ TOOLS ============

TOOLS = [
    {
        "name": "transfer_to_human",
        "description": "Use quando o cliente for qualificado ou precisar de atendimento humano especializado. Pausa a IA e transfere para fila de atendentes.",
        "input_schema": {
            "type": "object",
            "properties": {
                "reason": {
                    "type": "string",
                    "description": "Motivo da transferência (ex: 'Cliente qualificado para BPC', 'Dúvida fora do escopo')"
                },
                "priority": {
                    "type": "string",
                    "enum": ["low", "normal", "high"],
                    "description": "Prioridade do atendimento"
                }
            },
            "required": ["reason", "priority"]
        }
    },
    {
        "name": "search_jurisprudence",
        "description": "Busca jurisprudência brasileira relevante para o caso. Use quando precisar de referências legais.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Tema/termo para buscar (ex: 'BPC/LOAS requisitos', 'Aposentadoria por tempo de contribuição')"
                }
            },
            "required": ["query"]
        }
    },
    {
        "name": "check_requirements",
        "description": "Verifica requisitos e documentação necessária para um tipo de caso jurídico.",
        "input_schema": {
            "type": "object",
            "properties": {
                "case_type": {
                    "type": "string",
                    "description": "Tipo de caso (ex: 'aposentadoria', 'bpc', 'auxilio_doenca')"
                }
            },
            "required": ["case_type"]
        }
    },
    {
        "name": "save_to_memory",
        "description": "Salva informação importante do cliente para referência futura na conversa.",
        "input_schema": {
            "type": "object",
            "properties": {
                "key": {
                    "type": "string",
                    "description": "Chave para armazenar (ex: 'cliente_idade', 'tempo_contribuicao')"
                },
                "value": {
                    "type": "string",
                    "description": "Valor a salvar"
                }
            },
            "required": ["key", "value"]
        }
    }
]

# ============ EXECUTOR DE TOOLS ============

def execute_tool(tool_name: str, tool_input: dict, lead_id: str, conversation_memory: dict) -> str:
    """
    Executa uma tool e retorna resultado como string.

    Args:
        tool_name: Nome da tool a executar
        tool_input: Dicionário com os inputs
        lead_id: ID do lead (para referência)
        conversation_memory: Dicionário para armazenar dados de memória

    Returns:
        String com resultado da execução
    """

    logging.info(f"[Tool] Executando: {tool_name}")

    if tool_name == "transfer_to_human":
        reason = tool_input.get("reason", "Transferência do cliente")
        priority = tool_input.get("priority", "normal")

        logging.info(f"[Tool] ✓ Transferência solicitada: {reason} (prioridade: {priority})")

        # TODO: Integrar com BD para criar WhatsAppHumanTicket
        # ticket = create_human_ticket(
        #     lead_id=lead_id,
        #     reason=reason,
        #     priority=priority
        # )

        return f"✓ TRANSFERÊNCIA CRIADA\nMotivo: {reason}\nPrioridade: {priority}\n\nVocê será atendido por um especialista em breve."

    elif tool_name == "search_jurisprudence":
        query = tool_input.get("query", "")

        logging.info(f"[Tool] Buscando jurisprudência: {query}")

        # TODO: Integrar com Serper API ou banco jurídico
        # response = requests.post(
        #     "https://google.serper.dev/search",
        #     json={"q": f"jurisprudência {query}", "num": 5, "hl": "pt-br"},
        #     headers={"X-API-KEY": os.getenv("SERPER_API_KEY")}
        # )

        return f"Jurisprudência encontrada para: {query}\n[Integração Serper API — implementar]"

    elif tool_name == "check_requirements":
        case_type = tool_input.get("case_type", "")

        logging.info(f"[Tool] Verificando requisitos para: {case_type}")

        requirements = {
            "aposentadoria": "1. RG e CPF\n2. Carteira de trabalho\n3. Comprovante de contribuições\n4. Extrato do INSS",
            "bpc": "1. RG e CPF\n2. Comprovante de renda da família\n3. Documento de propriedade imóvel\n4. Comprovante de residência",
            "auxilio_doenca": "1. RG e CPF\n2. Comprovante de contribuição ao INSS\n3. Atestado médico\n4. Comprovante de residência"
        }

        result = requirements.get(
            case_type.lower(),
            f"Tipo de caso '{case_type}' não encontrado. Consulte um atendente."
        )

        return f"Requisitos para {case_type}:\n{result}"

    elif tool_name == "save_to_memory":
        key = tool_input.get("key", "")
        value = tool_input.get("value", "")

        conversation_memory[key] = value

        logging.info(f"[Tool] Salvo em memória: {key} = {value}")

        return f"✓ Informação salva: {key} = {value}"

    else:
        logging.warning(f"[Tool] Tool não encontrada: {tool_name}")
        return f"[Erro] Tool não encontrada: {tool_name}"

# ============ LOOP AGÊNTICO (Super Agent Pattern) ============

def run_agent_conversation(
    lead_id: str,
    user_message: str,
    legal_area: str,
    system_prompt: str,
    conversation_history: list = None
) -> Tuple[str, list, str]:
    """
    Executa o loop agêntico do Super Agent.

    Retorna:
        (resposta_texto, histórico_atualizado, status)
        onde status = 'continued' ou 'transferred_to_human'
    """

    if conversation_history is None:
        conversation_history = []

    conversation_memory = {}

    logging.info(f"[Agente] Iniciando conversa para lead: {lead_id}")
    logging.info(f"[Agente] Área jurídica: {legal_area}")

    # 1. Adicionar mensagem do usuário ao histórico
    conversation_history.append({
        "role": "user",
        "content": user_message
    })

    # 2. LOOP AGÊNTICO (idêntico ao seu padrão Super Agent)
    while True:
        logging.info(f"[Agente] Chamando Claude (stop_reason: ?)")

        response = client.messages.create(
            model=MODEL,
            max_tokens=4096,
            system=system_prompt,
            tools=TOOLS,
            messages=conversation_history
        )

        logging.info(f"[Agente] Stop reason: {response.stop_reason}")

        # ─── FERRAMENTA USE ───
        if response.stop_reason == "tool_use":
            # Adicionar resposta (com tool_use blocks)
            conversation_history.append({
                "role": "assistant",
                "content": response.content
            })

            tool_results = []

            # Processar cada tool_use block
            for block in response.content:
                if block.type == "tool_use":
                    tool_name = block.name
                    tool_input = block.input
                    tool_id = block.id  # ← DINÂMICO (crítico!)

                    logging.info(f"[Agente] Tool use: {tool_name}")

                    # ⭐ TRANSFERÊNCIA PARA HUMANO
                    if tool_name == "transfer_to_human":
                        reason = tool_input.get("reason")
                        priority = tool_input.get("priority", "normal")

                        logging.info(f"[Agente] ✓✓✓ TRANSFERINDO PARA HUMANO: {reason}")

                        # TODO: Salvar conversa em BD com status "transferred"
                        # save_conversation(
                        #     lead_id=lead_id,
                        #     platform="whatsapp",
                        #     legal_area=legal_area,
                        #     history=conversation_history,
                        #     status="transferred"
                        # )

                        return (
                            f"Estou transferindo você para um atendente especializado em {legal_area.upper()}...\n\n{reason}",
                            conversation_history,
                            "transferred_to_human"
                        )

                    # Executar outras tools
                    result = execute_tool(tool_name, tool_input, lead_id, conversation_memory)

                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": tool_id,  # ← ID dinâmico do block
                        "content": str(result)
                    })

            # Adicionar resultados de tools como mensagem do usuário
            conversation_history.append({
                "role": "user",
                "content": tool_results
            })

            continue  # Continua o loop

        # ─── END TURN ───
        # Extrair texto final
        final_text = "".join(
            b.text for b in response.content
            if hasattr(b, "text")
        )

        # Adicionar resposta ao histórico
        conversation_history.append({
            "role": "assistant",
            "content": final_text
        })

        logging.info(f"[Agente] ✓ Conversa finalizada. Resposta: {len(final_text)} chars")

        # TODO: Salvar conversa em BD com status "active"
        # save_conversation(
        #     lead_id=lead_id,
        #     platform="whatsapp",
        #     legal_area=legal_area,
        #     history=conversation_history,
        #     status="active"
        # )

        return final_text, conversation_history, "continued"

# ============ EXEMPLO DE USO ============

if __name__ == "__main__":
    # ─── Dados de Teste ───
    lead_id = "test-lead-001"
    legal_area = "previdenciario"

    system_prompt = """Você é um assistente jurídico especializado em Direito Previdenciário.

    Seu objetivo:
    1. Entender a situação do cliente (idade, tempo de contribuição, tipo de benefício)
    2. Oferecer orientação inicial sobre direitos e possibilidades
    3. Qualificar se é um caso de BPC/LOAS, Aposentadoria, Auxílio Doença, etc
    4. Se o cliente estiver qualificado, SEMPRE use a tool 'transfer_to_human' com motivo claro
    5. Se a dúvida for fora do seu escopo, use 'transfer_to_human' com prioridade 'low'

    Seja amigável, profissional e conciso. Máximo 3 parágrafos por resposta.
    """

    # ─── Primeira Mensagem ───
    user_message = "Olá! Tenho 68 anos e contribui ao INSS por 35 anos. Posso me aposentar?"

    logging.info("[Main] Iniciando teste do Super Agent...")
    response, history, status = run_agent_conversation(
        lead_id=lead_id,
        user_message=user_message,
        legal_area=legal_area,
        system_prompt=system_prompt
    )

    print(f"\n{'='*60}")
    print(f"Status: {status}")
    print(f"Resposta da IA:\n{response}")
    print(f"{'='*60}")
    print(f"\nHistórico da conversa ({len(history)} mensagens):")
    for i, msg in enumerate(history):
        role = msg['role'].upper()
        content = msg['content'][:50] + "..." if isinstance(msg['content'], str) else "[Tool result]"
        print(f"  {i+1}. {role}: {content}")

    # ─── Simulação de Continuação ───
    if status == "continued":
        logging.info("\n[Main] Continuando conversa...")
        user_message2 = "Quais documentos preciso apresentar?"

        response2, history2, status2 = run_agent_conversation(
            lead_id=lead_id,
            user_message=user_message2,
            legal_area=legal_area,
            system_prompt=system_prompt,
            conversation_history=history  # ← Passa histórico anterior
        )

        print(f"\n{'='*60}")
        print(f"Resposta 2 (Status: {status2}):\n{response2}")
        print(f"{'='*60}")
