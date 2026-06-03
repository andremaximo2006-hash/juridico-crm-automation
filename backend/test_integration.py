#!/usr/bin/env python3
"""
Script de teste para validar integração completa
Testa: Backend Python → Frontend Next.js → BD → APIs
"""

import requests
import json
import time
from typing import dict

BASE_URL_PYTHON = "http://localhost:8000"
BASE_URL_FRONTEND = "http://localhost:3000"

# ANSI Colors
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_header(text):
    print(f"\n{BLUE}{'=' * 60}")
    print(f"  {text}")
    print(f"{'=' * 60}{RESET}\n")

def print_success(text):
    print(f"{GREEN}✓ {text}{RESET}")

def print_error(text):
    print(f"{RED}✗ {text}{RESET}")

def print_warning(text):
    print(f"{YELLOW}⚠ {text}{RESET}")

def print_info(text):
    print(f"  {text}")

# ============ TESTS ============

def test_python_backend():
    """Teste 1: Backend Python está online?"""
    print_header("Teste 1: Backend Python Health Check")

    try:
        response = requests.get(f"{BASE_URL_PYTHON}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_success(f"Backend respondendo em {BASE_URL_PYTHON}")
            print_info(f"Service: {data.get('service')}")
            print_info(f"API Key set: {data.get('api_key_set')}")
            return True
        else:
            print_error(f"Backend respondeu com status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Erro ao conectar ao backend: {str(e)}")
        print_warning("Certifique-se de que o servidor Python está rodando:")
        print_info("$ cd backend && python -m uvicorn app:app --reload")
        return False

def test_frontend():
    """Teste 2: Frontend Next.js está online?"""
    print_header("Teste 2: Frontend Health Check")

    try:
        response = requests.get(BASE_URL_FRONTEND, timeout=5)
        if response.status_code == 200:
            print_success(f"Frontend respondendo em {BASE_URL_FRONTEND}")
            return True
        else:
            print_error(f"Frontend respondeu com status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Erro ao conectar ao frontend: {str(e)}")
        print_warning("Certifique-se de que o Next.js está rodando:")
        print_info("$ npm run dev")
        return False

def test_process_message():
    """Teste 3: Processar mensagem via API Python"""
    print_header("Teste 3: Processar Mensagem (Super Agent)")

    payload = {
        "lead_id": "test-lead-001",
        "phone": "5585988123456",
        "message": "Olá, tenho 68 anos e contribuí 35 anos ao INSS. Posso me aposentar?",
        "legal_area": "previdenciario",
        "conversation_history": [],
        "system_prompt": None
    }

    try:
        print_info("Enviando mensagem para processar...")
        response = requests.post(
            f"{BASE_URL_PYTHON}/process-message",
            json=payload,
            timeout=30
        )

        if response.status_code == 200:
            data = response.json()
            print_success(f"Mensagem processada com sucesso")
            print_info(f"Status: {data.get('status')}")
            print_info(f"Response length: {len(data.get('response', ''))}")

            if data.get('status') == 'transferred_to_human':
                print_info(f"Reason: {data.get('reason')}")

            return True
        else:
            print_error(f"Backend retornou status {response.status_code}")
            print_info(f"Response: {response.text}")
            return False
    except Exception as e:
        print_error(f"Erro ao processar mensagem: {str(e)}")
        return False

def test_webhook_zapi():
    """Teste 4: Webhook Z-API"""
    print_header("Teste 4: Webhook Z-API")

    payload = {
        "phone": "5585988123456",
        "name": "João Silva",
        "message": "Olá, tenho uma dúvida sobre meu INSS",
        "timestamp": int(time.time()),
        "instanceId": "123456"
    }

    try:
        print_info("Enviando webhook Z-API...")
        response = requests.post(
            f"{BASE_URL_FRONTEND}/api/webhooks/whatsapp/zapi",
            json=payload,
            timeout=10
        )

        if response.status_code == 200:
            data = response.json()
            print_success(f"Webhook processado")
            if 'leadId' in data:
                print_info(f"Lead ID: {data.get('leadId')}")
            if 'response' in data:
                print_info(f"Response: {data.get('response')[:100]}...")
            return True
        else:
            print_error(f"Webhook retornou status {response.status_code}")
            print_info(f"Response: {response.text}")
            return False
    except Exception as e:
        print_error(f"Erro ao processar webhook: {str(e)}")
        return False

def test_get_routines():
    """Teste 5: Listar roteiros via API"""
    print_header("Teste 5: Listar Roteiros")

    try:
        print_info("Buscando roteiros...")
        response = requests.get(
            f"{BASE_URL_FRONTEND}/api/whatsapp/routines",
            timeout=10
        )

        if response.status_code == 200:
            data = response.json()
            count = data.get('count', 0)
            print_success(f"Roteiros listados: {count}")

            if 'data' in data:
                for routine in data['data'][:3]:
                    print_info(f"  - {routine.get('legalArea')}: {routine.get('name')}")
            return True
        else:
            print_error(f"API retornou status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Erro ao listar roteiros: {str(e)}")
        return False

def test_conversations_api():
    """Teste 6: API de conversas"""
    print_header("Teste 6: API de Conversas")

    try:
        print_info("Buscando conversas...")
        response = requests.get(
            f"{BASE_URL_FRONTEND}/api/webhooks/whatsapp/conversations",
            timeout=10
        )

        if response.status_code == 200:
            data = response.json()
            count = data.get('count', 0)
            print_success(f"Conversas encontradas: {count}")

            if 'data' in data and len(data['data']) > 0:
                conv = data['data'][0]
                print_info(f"  Lead: {conv.get('lead', {}).get('name', 'N/A')}")
                print_info(f"  Status: {conv.get('status')}")
            return True
        else:
            print_error(f"API retornou status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Erro ao buscar conversas: {str(e)}")
        return False

def test_ui_pages():
    """Teste 7: Páginas UI carregam?"""
    print_header("Teste 7: Páginas UI")

    pages = [
        ("/ia/roteiros", "Roteiros"),
        ("/ia/conversas", "Conversas"),
        ("/ia/atendimento-humano", "Atendimento Humano"),
    ]

    all_ok = True
    for path, name in pages:
        try:
            response = requests.get(f"{BASE_URL_FRONTEND}{path}", timeout=5)
            if response.status_code == 200:
                print_success(f"Página {name} ({path}) carregada")
            else:
                print_error(f"Página {name} retornou {response.status_code}")
                all_ok = False
        except Exception as e:
            print_error(f"Erro ao carregar {name}: {str(e)}")
            all_ok = False

    return all_ok

# ============ MAIN ============

def main():
    print(f"\n{BLUE}")
    print("╔" + "═" * 58 + "╗")
    print("║" + " " * 58 + "║")
    print("║" + "  TESTES DE INTEGRAÇÃO - IA ATENDIMENTO WHATSAPP".center(58) + "║")
    print("║" + " " * 58 + "║")
    print("╚" + "═" * 58 + "╝")
    print(f"{RESET}")

    results = []

    # Executar testes
    print_info("Iniciando testes de integração...\n")

    results.append(("Backend Python Health", test_python_backend()))
    if not results[-1][1]:
        print_error("Backend não está disponível. Abortando testes.")
        return

    results.append(("Frontend Next.js Health", test_frontend()))
    if not results[-1][1]:
        print_error("Frontend não está disponível. Abortando testes.")
        return

    results.append(("Process Message API", test_process_message()))
    results.append(("Webhook Z-API", test_webhook_zapi()))
    results.append(("List Routines API", test_get_routines()))
    results.append(("Conversations API", test_conversations_api()))
    results.append(("UI Pages", test_ui_pages()))

    # Resumo
    print_header("RESUMO DOS TESTES")

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for test_name, result in results:
        status = f"{GREEN}PASS{RESET}" if result else f"{RED}FAIL{RESET}"
        print(f"  [{status}] {test_name}")

    print(f"\n{BLUE}Resultado: {passed}/{total} testes passaram{RESET}\n")

    if passed == total:
        print_success("Todos os testes passaram! ✨")
        print_info("\nAplicação pronta para Phase 5.")
    else:
        print_error(f"{total - passed} teste(s) falharam.")
        print_warning("Verifique os logs acima para detalhes.")

if __name__ == "__main__":
    main()
