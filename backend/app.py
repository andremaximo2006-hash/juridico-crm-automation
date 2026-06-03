#!/usr/bin/env python3
"""
FastAPI Server para Super Agent IA de Atendimento
Expõe endpoints para processar mensagens via webhooks
"""

import os
import json
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from ia_agent.super_agent_whatsapp import processWhatsAppMessage

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="[%(levelname)s] %(asctime)s - %(message)s"
)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(
    title="IA Atendimento WhatsApp",
    description="Super Agent para atendimento automático via WhatsApp",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ MODELS ============

class MessageHistory(BaseModel):
    role: str
    content: str

class ProcessMessageRequest(BaseModel):
    lead_id: str
    phone: str
    message: str
    legal_area: str
    conversation_history: Optional[List[MessageHistory]] = None
    system_prompt: Optional[str] = None

class ProcessMessageResponse(BaseModel):
    success: bool
    response: str
    status: str  # "continued" or "transferred_to_human"
    reason: Optional[str] = None
    priority: Optional[str] = None
    conversation_history: Optional[List[dict]] = None

# ============ ROUTES ============

@app.get("/", tags=["Health"])
async def root():
    """Health check"""
    return {
        "status": "ok",
        "service": "IA Atendimento WhatsApp",
        "version": "1.0.0"
    }

@app.get("/health", tags=["Health"])
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Super Agent",
        "api_key_set": bool(os.getenv("ANTHROPIC_API_KEY"))
    }

@app.post("/process-message", tags=["Messages"], response_model=ProcessMessageResponse)
async def process_message(request: ProcessMessageRequest):
    """
    Process a WhatsApp message through the Super Agent

    - **lead_id**: ID do lead no sistema
    - **phone**: Telefone do cliente
    - **message**: Mensagem recebida
    - **legal_area**: Área jurídica (previdenciario, familia, etc)
    - **conversation_history**: Histórico da conversa (opcional)
    - **system_prompt**: System prompt customizado (opcional)
    """
    try:
        logger.info(f"[PROCESS] Lead {request.lead_id} | Area: {request.legal_area} | Msg: {request.message[:50]}...")

        # Converter history se fornecida
        history = []
        if request.conversation_history:
            history = [{"role": h.role, "content": h.content} for h in request.conversation_history]

        # Processar mensagem
        response, updated_history, status, reason, priority = processWhatsAppMessage(
            lead_id=request.lead_id,
            phone=request.phone,
            message=request.message,
            legal_area=request.legal_area,
            conversation_history=history,
            system_prompt=request.system_prompt
        )

        logger.info(f"[RESPONSE] Lead {request.lead_id} | Status: {status} | Response length: {len(response)}")

        return ProcessMessageResponse(
            success=True,
            response=response,
            status=status,
            reason=reason,
            priority=priority,
            conversation_history=updated_history
        )

    except Exception as e:
        logger.error(f"[ERROR] Processing message: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/webhook/test", tags=["Debug"])
async def webhook_test(request: dict):
    """
    Test endpoint para simular webhook
    """
    logger.info(f"[TEST] Webhook recebido: {json.dumps(request, indent=2)}")
    return {
        "status": "received",
        "data": request
    }

# ============ STARTUP ============

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Servidor IA iniciado")
    logger.info(f"ANTHROPIC_API_KEY: {'✅ Set' if os.getenv('ANTHROPIC_API_KEY') else '❌ NOT SET'}")
    logger.info(f"Model: claude-opus-4-6")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("🛑 Servidor IA desligado")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
