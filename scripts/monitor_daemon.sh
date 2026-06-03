#!/bin/bash
# Monitor contínuo com notificações push
# Mantém o monitoramento ligado em background

PROJECT_DIR="/Users/andreluis/juridico-crm-automation"
MONITOR_LOG="${PROJECT_DIR}/logs/monitor_daemon.log"

echo "[$(date)] Iniciando daemon de monitoramento" >> "$MONITOR_LOG"

cd "$PROJECT_DIR"

# Executa o Python script diretamente
python3 << 'EOF'
import requests
import time
import json
import os
import signal
import sys
from datetime import datetime
from pathlib import Path

PROJECT_DIR = Path("/Users/andreluis/juridico-crm-automation")
LOGS_DIR = PROJECT_DIR / "logs"

# Cria diretório se não existe
LOGS_DIR.mkdir(exist_ok=True)

# Condições críticas a monitorar
MONITOR_CONDITIONS = {
    "nightly_task": {"file": LOGS_DIR / "launchd_err.log", "threshold": 0},
    "report_delivery": {"file": LOGS_DIR / "report_delivery_err.log", "threshold": 0},
}

# Webhook ntfy.sh
NTFY_TOPIC = "juridico_crm_alerts"
NTFY_WEBHOOK = f"https://ntfy.sh/{NTFY_TOPIC}"
EVENT_LOG_FILE = LOGS_DIR / "monitor_events.json"

running = True

def signal_handler(signum, frame):
    global running
    running = False

signal.signal(signal.SIGINT, signal_handler)

def check_condition(condition_name, condition_config):
    log_file = condition_config["file"]
    if not log_file.exists():
        return "ok", f"{condition_name}: Aguardando..."
    with open(log_file, 'r') as f:
        content = f.read()
    size = len(content)
    if size > condition_config["threshold"]:
        return "error", f"{condition_name}: ERRO ({size} bytes)"
    return "ok", f"{condition_name}: OK"

def send_alert(alert_type, title, message):
    headers = {"Title": title, "Priority": "high" if alert_type == "error" else "normal"}
    try:
        response = requests.post(NTFY_WEBHOOK, data=message, headers=headers, timeout=5)
        return response.status_code == 200
    except:
        return False

def log_event(event_type, condition, status, message):
    if EVENT_LOG_FILE.exists():
        with open(EVENT_LOG_FILE, 'r') as f:
            events = json.load(f)
    else:
        events = []
    events.append({"timestamp": datetime.now().isoformat(), "type": event_type, "condition": condition, "status": status, "message": message})
    events = events[-1000:]
    with open(EVENT_LOG_FILE, 'w') as f:
        json.dump(events, f)

# Loop de monitoramento
check_count = 0
last_states = {}

print(f"[{datetime.now()}] Monitor iniciado", file=sys.stderr)

while running:
    check_count += 1
    try:
        for condition_name, condition_config in MONITOR_CONDITIONS.items():
            status, message = check_condition(condition_name, condition_config)
            previous_status = last_states.get(condition_name)
            last_states[condition_name] = status
            log_event("check", condition_name, status, message)
            
            if status == "error" and previous_status != "error":
                send_alert("error", f"🚨 {condition_name}", message)
                log_event("alert", condition_name, "sent", message)
        
        time.sleep(30)  # Verifica a cada 30 segundos
    except Exception as e:
        log_event("error", "monitor", "failed", str(e))
        time.sleep(60)

print(f"[{datetime.now()}] Monitor parado", file=sys.stderr)
EOF

echo "[$(date)] Daemon de monitoramento finalizado" >> "$MONITOR_LOG"
