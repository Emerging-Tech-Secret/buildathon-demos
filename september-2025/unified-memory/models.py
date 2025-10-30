"""
Modelos Pydantic para o sistema de memória unificada
"""
from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field
from datetime import datetime


class RiskAssessment(BaseModel):
    """Avaliação de risco de jailbreak/ataque"""
    score: int = Field(default=0, ge=0, le=100, description="Score de risco (0-100)")
    signals: List[str] = Field(default_factory=list, description="Sinais detectados")


class Interaction(BaseModel):
    """Evento de interação com o cliente"""
    id: str = Field(description="ID único do evento")
    ts: str = Field(description="Timestamp UTC ISO-8601")
    channel: str = Field(description="Canal da interação (chat, email, voice, memory)")
    text: str = Field(description="Texto da interação")
    tokens: int = Field(description="Número de tokens (palavras)")
    access_count: int = Field(default=1, description="Número de vezes acessado")
    risk: RiskAssessment = Field(default_factory=RiskAssessment)
    quarantined: bool = Field(default=False, description="Se está em quarentena")


class ClientProfile(BaseModel):
    """Perfil do cliente"""
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    updated_at: str = Field(description="Timestamp da última atualização")


class ClientLimits(BaseModel):
    """Limites para garbage collection"""
    max_tokens: int = Field(default=2500, description="Máximo de tokens antes do GC")
    max_events: int = Field(default=200, description="Máximo de eventos antes do GC")
    last_gc_at: Optional[str] = Field(default=None, description="Último GC executado")


class ClientMeta(BaseModel):
    """Metadados do cliente"""
    version: int = Field(default=1, description="Versão do esquema")
    last_delete: Optional[str] = Field(default=None, description="Último delete executado")


class ClientData(BaseModel):
    """Dados completos de um cliente"""
    profile: ClientProfile
    state_summary: str = Field(default="", description="Resumo do estado atual")
    channels: List[str] = Field(default_factory=list, description="Canais utilizados")
    interactions: List[Interaction] = Field(default_factory=list)
    limits: ClientLimits = Field(default_factory=ClientLimits)
    meta: ClientMeta = Field(default_factory=ClientMeta)


class MemoryData(BaseModel):
    """Estrutura completa da memória"""
    clients: Dict[str, ClientData] = Field(default_factory=dict)


# Request/Response models para API
class InteractRequest(BaseModel):
    """Request para interação"""
    client_id: str = Field(description="ID do cliente")
    channel: str = Field(description="Canal da interação")
    text: str = Field(description="Texto da mensagem")


class InteractResponse(BaseModel):
    """Response da interação"""
    event_id: str = Field(description="ID do evento criado")
    risk_score: int = Field(description="Score de risco detectado")
    quarantined: bool = Field(description="Se foi quarentenado")
    gc_ran: bool = Field(description="Se o GC foi executado")
    assistant_suggestion: str = Field(description="Sugestão de resposta contextualizada")


class ContextResponse(BaseModel):
    """Response do contexto"""
    state_summary: str = Field(description="Resumo do estado atual")
    recent_cross_channel: List[Interaction] = Field(description="Eventos recentes de outros canais")
    assistant_suggestion: str = Field(description="Sugestão de resposta contextualizada")


class DeleteMemoryRequest(BaseModel):
    """Request para exclusão de memória"""
    client_id: str = Field(description="ID do cliente")
    scope: Literal["all", "event", "fields"] = Field(description="Escopo da exclusão")
    event_id: Optional[str] = Field(default=None, description="ID do evento (para scope=event)")
    keys: Optional[List[str]] = Field(default=None, description="Chaves do perfil (para scope=fields)")


class GCResponse(BaseModel):
    """Response do garbage collection"""
    events_before: int = Field(description="Eventos antes do GC")
    events_after: int = Field(description="Eventos após o GC")
    tokens_before: int = Field(description="Tokens antes do GC")
    tokens_after: int = Field(description="Tokens após o GC")
    summary_updated: bool = Field(description="Se o resumo foi atualizado")


class ClientListResponse(BaseModel):
    """Response da listagem de clientes"""
    clients: List[str] = Field(description="Lista de IDs de clientes")


class HealthResponse(BaseModel):
    """Response do health check"""
    ok: bool = Field(default=True)
    timestamp: str = Field(description="Timestamp atual")
