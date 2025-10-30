"""
API FastAPI para sistema de memória unificada
"""
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import JSONResponse
from typing import Optional
import uvicorn

from models import (
    InteractRequest, InteractResponse, ContextResponse, 
    DeleteMemoryRequest, GCResponse, ClientListResponse, 
    HealthResponse
)
from core_memory import MemoryEngine

# Inicializa FastAPI
app = FastAPI(
    title="Sistema de Memória Unificada",
    description="POC de memória unificada para agente LLM multicanal",
    version="1.0.0"
)

# Inicializa motor de memória
memory_engine = MemoryEngine()


@app.post("/interact", response_model=InteractResponse)
async def interact(request: InteractRequest):
    """
    Adiciona nova interação do cliente
    """
    try:
        event_id, gc_ran = memory_engine.add_interaction(
            client_id=request.client_id,
            channel=request.channel,
            text=request.text
        )
        
        # Pega dados do evento criado
        client_data = memory_engine.get_client_data(request.client_id)
        if not client_data:
            raise HTTPException(status_code=404, detail="Cliente não encontrado após criação")
        
        # Encontra o evento criado
        created_event = None
        for interaction in client_data.interactions:
            if interaction.id == event_id:
                created_event = interaction
                break
        
        if not created_event:
            raise HTTPException(status_code=500, detail="Evento não encontrado após criação")
        
        # Gera sugestão de resposta
        assistant_suggestion = memory_engine.generate_assistant_suggestion(
            request.client_id, 
            request.channel
        )
        
        return InteractResponse(
            event_id=event_id,
            risk_score=created_event.risk.score,
            quarantined=created_event.quarantined,
            gc_ran=gc_ran,
            assistant_suggestion=assistant_suggestion
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar interação: {str(e)}")


@app.get("/context", response_model=ContextResponse)
async def get_context(
    client_id: str = Query(..., description="ID do cliente"),
    current_channel: str = Query(..., description="Canal atual")
):
    """
    Retorna contexto cruzado entre canais
    """
    try:
        client_data = memory_engine.get_client_data(client_id)
        if not client_data:
            raise HTTPException(status_code=404, detail="Cliente não encontrado")
        
        # Pega contexto de outros canais
        cross_channel_events = memory_engine.get_cross_channel_context(
            client_id, 
            current_channel, 
            limit=5
        )
        
        # Gera sugestão de resposta
        assistant_suggestion = memory_engine.generate_assistant_suggestion(
            client_id, 
            current_channel
        )
        
        return ContextResponse(
            state_summary=client_data.state_summary,
            recent_cross_channel=cross_channel_events,
            assistant_suggestion=assistant_suggestion
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar contexto: {str(e)}")


@app.delete("/memory")
async def delete_memory(request: DeleteMemoryRequest):
    """
    Exclui memória conforme escopo especificado
    """
    try:
        # Validações
        if request.scope == "event" and not request.event_id:
            raise HTTPException(status_code=400, detail="event_id é obrigatório para scope=event")
        
        if request.scope == "fields" and not request.keys:
            raise HTTPException(status_code=400, detail="keys é obrigatório para scope=fields")
        
        # Executa exclusão
        success = memory_engine.delete_memory(
            client_id=request.client_id,
            scope=request.scope,
            event_id=request.event_id,
            keys=request.keys
        )
        
        if not success:
            raise HTTPException(status_code=404, detail="Cliente não encontrado")
        
        return {"message": f"Memória excluída com sucesso (scope: {request.scope})"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao excluir memória: {str(e)}")


@app.post("/gc", response_model=GCResponse)
async def force_gc(client_id: str = Query(..., description="ID do cliente")):
    """
    Força execução do garbage collection
    """
    try:
        client_data = memory_engine.get_client_data(client_id)
        if not client_data:
            raise HTTPException(status_code=404, detail="Cliente não encontrado")
        
        result = memory_engine.run_gc(client_id)
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return GCResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao executar GC: {str(e)}")


@app.get("/memory/raw")
async def get_raw_memory(
    include_quarantined: bool = Query(False, description="Incluir eventos quarentenados")
):
    """
    Retorna memória bruta
    """
    try:
        raw_data = memory_engine.get_raw_memory(include_quarantined=include_quarantined)
        return raw_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar memória bruta: {str(e)}")


@app.get("/clients", response_model=ClientListResponse)
async def list_clients():
    """
    Lista todos os clientes
    """
    try:
        clients = memory_engine.get_all_clients()
        return ClientListResponse(clients=clients)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar clientes: {str(e)}")


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check da API
    """
    from datetime import datetime, timezone
    
    return HealthResponse(
        ok=True,
        timestamp=datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
    )


@app.get("/")
async def root():
    """
    Endpoint raiz com informações da API
    """
    return {
        "message": "Sistema de Memória Unificada - POC",
        "version": "1.0.0",
        "endpoints": {
            "POST /interact": "Adiciona nova interação",
            "GET /context": "Retorna contexto cruzado",
            "DELETE /memory": "Exclui memória",
            "POST /gc": "Força garbage collection",
            "GET /memory/raw": "Retorna memória bruta",
            "GET /clients": "Lista clientes",
            "GET /health": "Health check"
        }
    }


# Middleware para CORS (se necessário)
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
