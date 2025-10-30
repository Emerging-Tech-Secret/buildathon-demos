"""
Motor de memória unificada com GC, detecção de risco e handoff entre canais
"""
import json
import os
import re
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Set, Tuple, Optional
from collections import Counter

from models import (
    MemoryData, ClientData, Interaction, RiskAssessment, 
    ClientProfile, ClientLimits, ClientMeta
)


class MemoryEngine:
    """Motor principal de memória unificada"""
    
    def __init__(self, memory_file: str = "memory.json"):
        self.memory_file = memory_file
        self.memory_data = self._load_memory()
        
        # Padrões para detecção de jailbreak/ataques
        self.risk_patterns = [
            r"ignore\s+previous\s+instructions",
            r"act\s+as\s+(system|developer|root)",
            r"begin_system_instructions",
            r"developer\s+mode",
            r"bypass\s+(safeguards|policies)",
            r"jailbreak",
            r"leak\s+(api|secret|key|password)",
            r"credit\s+card\s+(number|details|cvv)",
            r"cpf\s+completo",
            r"senha\s+do\s+banco"
        ]
        
    def _load_memory(self) -> MemoryData:
        """Carrega memória do arquivo JSON"""
        if os.path.exists(self.memory_file):
            try:
                with open(self.memory_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    return MemoryData(**data)
            except Exception as e:
                print(f"Erro ao carregar memória: {e}")
                return MemoryData()
        return MemoryData()
    
    def _save_memory(self):
        """Salva memória no arquivo JSON"""
        try:
            with open(self.memory_file, 'w', encoding='utf-8') as f:
                json.dump(self.memory_data.model_dump(), f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Erro ao salvar memória: {e}")
    
    def _get_current_timestamp(self) -> str:
        """Retorna timestamp atual em UTC ISO-8601"""
        return datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
    
    def _count_tokens(self, text: str) -> int:
        """Conta tokens (aproximação usando número de palavras)"""
        return len(text.split())
    
    def _assess_risk(self, text: str) -> RiskAssessment:
        """Avalia risco de jailbreak/ataque no texto"""
        score = 0
        signals = []
        
        text_lower = text.lower()
        
        # Verifica padrões de risco
        for pattern in self.risk_patterns:
            if re.search(pattern, text_lower, re.IGNORECASE):
                score += 25
                signals.append(f"Padrão suspeito: {pattern}")
        
        # Texto muito longo
        if len(text) > 2000:
            score += 15
            signals.append("Texto excessivamente longo")
        
        # Densidade anômala de palavras-chave
        system_count = text_lower.count('system')
        backtick_count = text.count('```')
        if system_count > 3 or backtick_count > 5:
            score += 10
            signals.append("Densidade anômala de palavras-chave técnicas")
        
        # Limita score a 100
        score = min(score, 100)
        
        return RiskAssessment(score=score, signals=signals)
    
    def _jaccard_similarity(self, text1: str, text2: str) -> float:
        """Calcula similaridade Jaccard entre dois textos"""
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        if not words1 and not words2:
            return 1.0
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        return len(intersection) / len(union) if union else 0.0
    
    def _group_similar_interactions(self, interactions: List[Interaction], threshold: float = 0.3) -> List[List[Interaction]]:
        """Agrupa interações similares usando Jaccard"""
        groups = []
        used = set()
        
        for i, interaction in enumerate(interactions):
            if i in used:
                continue
                
            group = [interaction]
            used.add(i)
            
            for j, other in enumerate(interactions[i+1:], i+1):
                if j in used:
                    continue
                    
                similarity = self._jaccard_similarity(interaction.text, other.text)
                if similarity >= threshold:
                    group.append(other)
                    used.add(j)
            
            groups.append(group)
        
        return groups
    
    def _create_summary_from_group(self, group: List[Interaction]) -> str:
        """Cria resumo de um grupo de interações similares"""
        if len(group) == 1:
            return group[0].text[:100] + "..." if len(group[0].text) > 100 else group[0].text
        
        # Pega palavras mais comuns do grupo
        all_words = []
        for interaction in group:
            all_words.extend(interaction.text.lower().split())
        
        word_counts = Counter(all_words)
        top_words = [word for word, _ in word_counts.most_common(5)]
        
        channels = list(set(i.channel for i in group))
        
        return f"Múltiplas interações sobre: {', '.join(top_words)} (canais: {', '.join(channels)})"
    
    def _update_state_summary(self, client_id: str):
        """Atualiza resumo do estado do cliente"""
        if client_id not in self.memory_data.clients:
            return
        
        client = self.memory_data.clients[client_id]
        
        # Pega últimas 10 interações não quarentenadas
        recent_interactions = [
            i for i in client.interactions[-10:] 
            if not i.quarantined and i.channel != "memory"
        ]
        
        if not recent_interactions:
            client.state_summary = "Nenhuma interação recente disponível."
            return
        
        # Extrai temas principais das interações recentes
        all_text = " ".join([i.text for i in recent_interactions])
        words = all_text.lower().split()
        word_counts = Counter(words)
        
        # Remove palavras muito comuns
        stop_words = {"o", "a", "de", "do", "da", "em", "um", "uma", "para", "com", "não", "que", "se", "por", "mais", "como", "mas", "foi", "ao", "ele", "das", "tem", "à", "seu", "sua", "ou", "ser", "quando", "muito", "há", "nos", "já", "está", "eu", "também", "só", "pelo", "pela", "até", "isso", "ela", "entre", "era", "depois", "sem", "mesmo", "aos", "ter", "seus", "suas", "numa", "pelos", "pelas", "esse", "esses", "pelas", "essa", "essas", "dele", "deles", "desta", "deste", "nesta", "neste", "nessa", "nesse", "numa", "nuns", "umas", "pelos", "pelas"}
        
        relevant_words = [
            word for word, count in word_counts.most_common(10) 
            if word not in stop_words and len(word) > 2
        ]
        
        channels_used = list(set(i.channel for i in recent_interactions))
        
        client.state_summary = f"Cliente interagiu via {', '.join(channels_used)} sobre: {', '.join(relevant_words[:5])}."
    
    def add_interaction(self, client_id: str, channel: str, text: str) -> Tuple[str, bool]:
        """Adiciona nova interação e retorna (event_id, gc_ran)"""
        # Cria cliente se não existir
        if client_id not in self.memory_data.clients:
            self.memory_data.clients[client_id] = ClientData(
                profile=ClientProfile(updated_at=self._get_current_timestamp())
            )
        
        client = self.memory_data.clients[client_id]
        
        # Cria evento
        event_id = f"evt_{uuid.uuid4().hex[:8]}"
        risk = self._assess_risk(text)
        
        interaction = Interaction(
            id=event_id,
            ts=self._get_current_timestamp(),
            channel=channel,
            text=text,
            tokens=self._count_tokens(text),
            risk=risk,
            quarantined=risk.score >= 60
        )
        
        # Adiciona à lista
        client.interactions.append(interaction)
        
        # Atualiza canais
        if channel not in client.channels:
            client.channels.append(channel)
        
        # Atualiza perfil
        client.profile.updated_at = self._get_current_timestamp()
        
        # Verifica se precisa de GC
        gc_ran = self._maybe_run_gc(client_id)
        
        # Atualiza resumo
        self._update_state_summary(client_id)
        
        # Salva
        self._save_memory()
        
        return event_id, gc_ran
    
    def get_cross_channel_context(self, client_id: str, current_channel: str, limit: int = 5) -> List[Interaction]:
        """Retorna contexto de outros canais"""
        if client_id not in self.memory_data.clients:
            return []
        
        client = self.memory_data.clients[client_id]
        
        # Filtra eventos de outros canais, não quarentenados
        other_channel_events = [
            i for i in client.interactions 
            if i.channel != current_channel and not i.quarantined and i.channel != "memory"
        ]
        
        # Ordena por timestamp (mais recentes primeiro)
        other_channel_events.sort(key=lambda x: x.ts, reverse=True)
        
        # Pega os mais recentes
        recent_events = other_channel_events[:limit]
        
        # Incrementa access_count
        for event in recent_events:
            event.access_count += 1
        
        if recent_events:
            self._save_memory()
        
        return recent_events
    
    def _maybe_run_gc(self, client_id: str) -> bool:
        """Executa GC se necessário"""
        if client_id not in self.memory_data.clients:
            return False
        
        client = self.memory_data.clients[client_id]
        
        # Calcula totais
        total_tokens = sum(i.tokens for i in client.interactions)
        total_events = len(client.interactions)
        
        # Verifica se precisa de GC
        needs_gc = (
            total_tokens > client.limits.max_tokens or 
            total_events > client.limits.max_events
        )
        
        if needs_gc:
            return self.run_gc(client_id)
        
        return False
    
    def run_gc(self, client_id: str) -> Dict:
        """Executa garbage collection"""
        if client_id not in self.memory_data.clients:
            return {"error": "Cliente não encontrado"}
        
        client = self.memory_data.clients[client_id]
        
        # Estatísticas antes
        events_before = len(client.interactions)
        tokens_before = sum(i.tokens for i in client.interactions)
        
        # Separa eventos quarentenados e normais
        quarantined = [i for i in client.interactions if i.quarantined]
        normal = [i for i in client.interactions if not i.quarantined]
        
        # Mantém últimos 10 eventos normais
        keep_recent = normal[-10:] if len(normal) > 10 else normal
        old_events = normal[:-10] if len(normal) > 10 else []
        
        # Agrupa eventos antigos por similaridade
        if old_events:
            groups = self._group_similar_interactions(old_events)
            
            # Cria eventos sintéticos para cada grupo
            synthetic_events = []
            for group in groups:
                if len(group) > 1:
                    # Cria evento sintético
                    summary_text = self._create_summary_from_group(group)
                    synthetic_event = Interaction(
                        id=f"mem_{uuid.uuid4().hex[:8]}",
                        ts=self._get_current_timestamp(),
                        channel="memory",
                        text=summary_text,
                        tokens=self._count_tokens(summary_text),
                        access_count=sum(i.access_count for i in group),
                        risk=RiskAssessment(score=0, signals=[]),
                        quarantined=False
                    )
                    synthetic_events.append(synthetic_event)
                else:
                    # Mantém evento único
                    synthetic_events.append(group[0])
            
            # Nova lista: eventos sintéticos + recentes + quarentenados
            client.interactions = synthetic_events + keep_recent + quarantined
        else:
            # Só mantém recentes + quarentenados
            client.interactions = keep_recent + quarantined
        
        # Atualiza resumo
        self._update_state_summary(client_id)
        
        # Atualiza timestamp do GC
        client.limits.last_gc_at = self._get_current_timestamp()
        
        # Estatísticas depois
        events_after = len(client.interactions)
        tokens_after = sum(i.tokens for i in client.interactions)
        
        # Salva
        self._save_memory()
        
        return {
            "events_before": events_before,
            "events_after": events_after,
            "tokens_before": tokens_before,
            "tokens_after": tokens_after,
            "summary_updated": True
        }
    
    def delete_memory(self, client_id: str, scope: str, event_id: str = None, keys: List[str] = None) -> bool:
        """Exclui memória conforme escopo"""
        if client_id not in self.memory_data.clients:
            return False
        
        client = self.memory_data.clients[client_id]
        
        if scope == "all":
            # Remove cliente completamente
            del self.memory_data.clients[client_id]
        
        elif scope == "event" and event_id:
            # Remove evento específico
            client.interactions = [i for i in client.interactions if i.id != event_id]
            self._update_state_summary(client_id)
        
        elif scope == "fields" and keys:
            # Remove campos do perfil
            profile_dict = client.profile.model_dump()
            for key in keys:
                if key in profile_dict:
                    setattr(client.profile, key, None)
            client.profile.updated_at = self._get_current_timestamp()
        
        # Atualiza meta
        if client_id in self.memory_data.clients:
            self.memory_data.clients[client_id].meta.last_delete = self._get_current_timestamp()
        
        self._save_memory()
        return True
    
    def get_client_data(self, client_id: str) -> Optional[ClientData]:
        """Retorna dados do cliente"""
        return self.memory_data.clients.get(client_id)
    
    def get_all_clients(self) -> List[str]:
        """Retorna lista de todos os clientes"""
        return list(self.memory_data.clients.keys())
    
    def get_raw_memory(self, include_quarantined: bool = False) -> Dict:
        """Retorna memória bruta"""
        if include_quarantined:
            return self.memory_data.model_dump()
        
        # Filtra quarentenados
        filtered_data = self.memory_data.model_copy(deep=True)
        for client_id, client in filtered_data.clients.items():
            client.interactions = [i for i in client.interactions if not i.quarantined]
        
        return filtered_data.model_dump()
    
    def generate_assistant_suggestion(self, client_id: str, current_channel: str) -> str:
        """Gera sugestão de resposta contextualizada e natural"""
        if client_id not in self.memory_data.clients:
            return "Olá! Como posso ajudá-lo hoje?"
        
        client = self.memory_data.clients[client_id]
        
        # Pega última interação do canal atual
        current_channel_interactions = [
            i for i in client.interactions 
            if i.channel == current_channel and not i.quarantined
        ]
        
        # Contexto de outros canais
        cross_channel = self.get_cross_channel_context(client_id, current_channel, 3)
        
        # Mapeia canais para nomes mais naturais
        channel_names = {
            "chat": "chat do site",
            "email": "e-mail", 
            "voice": "telefone",
            "whatsapp": "WhatsApp",
            "sms": "SMS"
        }
        
        current_channel_name = channel_names.get(current_channel, current_channel)
        
        # Primeira interação do cliente
        if not current_channel_interactions and not cross_channel:
            greetings = [
                "Olá! Seja bem-vindo. Como posso ajudá-lo hoje?",
                "Oi! Em que posso ajudá-lo?",
                "Olá! Estou aqui para ajudar. Qual é a sua dúvida?"
            ]
            return greetings[0]  # Pode randomizar depois
        
        # Primeira vez neste canal, mas tem histórico em outros
        if not current_channel_interactions and cross_channel:
            other_channels = list(set(channel_names.get(i.channel, i.channel) for i in cross_channel))
            
            # Identifica tópicos principais do histórico
            topics = self._extract_main_topics(cross_channel)
            
            if len(other_channels) == 1:
                return f"Olá! Vejo que você já conversou conosco via {other_channels[0]} sobre {topics}. Como posso continuar ajudando você aqui no {current_channel_name}?"
            else:
                return f"Olá! Vi seu histórico via {' e '.join(other_channels)} sobre {topics}. Estou aqui para dar continuidade pelo {current_channel_name}. Em que posso ajudar?"
        
        # Já tem interação neste canal
        last_interaction = current_channel_interactions[-1]
        
        # Analisa o tipo de mensagem para resposta mais específica
        suggestion = self._generate_contextual_response(last_interaction, cross_channel, current_channel_name)
        
        return suggestion
    
    def _extract_main_topics(self, interactions: List[Interaction]) -> str:
        """Extrai tópicos principais das interações de forma mais inteligente"""
        if not interactions:
            return "suas solicitações"
        
        # Palavras-chave por categoria
        topics_map = {
            "parcelamento": ["parcelar", "parcela", "parcelamento", "dividir", "prestação"],
            "endereço": ["endereço", "endereco", "mudança", "mudar", "atualizar", "rua", "cep"],
            "cartão": ["cartão", "cartao", "card", "fatura", "conta"],
            "pagamento": ["pagar", "pagamento", "boleto", "pix", "transferência"],
            "cancelamento": ["cancelar", "cancelamento", "encerrar", "desativar"],
            "dúvidas": ["dúvida", "duvida", "informação", "saber", "como", "quando"],
            "problema": ["problema", "erro", "não", "nao", "conseguir", "dificuldade"]
        }
        
        all_text = " ".join([i.text.lower() for i in interactions])
        detected_topics = []
        
        for topic, keywords in topics_map.items():
            if any(keyword in all_text for keyword in keywords):
                detected_topics.append(topic)
        
        if not detected_topics:
            return "suas solicitações"
        elif len(detected_topics) == 1:
            return detected_topics[0]
        elif len(detected_topics) == 2:
            return f"{detected_topics[0]} e {detected_topics[1]}"
        else:
            return f"{', '.join(detected_topics[:-1])} e {detected_topics[-1]}"
    
    def _generate_contextual_response(self, last_interaction: Interaction, cross_channel: List[Interaction], current_channel_name: str) -> str:
        """Gera resposta contextual baseada no tipo de mensagem"""
        text = last_interaction.text.lower()
        
        # Detecta tipo de mensagem
        if any(word in text for word in ["obrigado", "obrigada", "valeu", "agradeço"]):
            if cross_channel:
                return "Fico feliz em poder ajudar! Se precisar de mais alguma coisa relacionada ao que conversamos anteriormente, estarei aqui."
            else:
                return "Por nada! Fico feliz em ajudar. Se tiver mais alguma dúvida, é só falar."
        
        elif any(word in text for word in ["tchau", "até", "falou", "bye"]):
            return "Até mais! Qualquer coisa, pode entrar em contato novamente. Tenha um ótimo dia!"
        
        elif "?" in text or any(word in text for word in ["como", "quando", "onde", "qual", "que", "posso", "consigo"]):
            # É uma pergunta
            topics = self._extract_main_topics([last_interaction] + cross_channel)
            
            if cross_channel:
                return f"Perfeito! Vou ajudar você com essa dúvida sobre {topics}. Já tenho o contexto das nossas conversas anteriores, então posso dar uma resposta mais completa."
            else:
                return f"Claro! Vou esclarecer sua dúvida sobre {topics}. Me dê um momento para verificar as informações mais atualizadas."
        
        elif any(word in text for word in ["problema", "erro", "não consegui", "dificuldade", "ajuda"]):
            # É um problema
            if cross_channel:
                return "Entendi o problema. Vou analisar junto com o histórico das nossas conversas para encontrar a melhor solução. Me dê um momento."
            else:
                return "Compreendo a situação. Vou verificar o que pode estar acontecendo e te ajudar a resolver isso."
        
        elif any(word in text for word in ["quero", "preciso", "gostaria", "solicitar"]):
            # É uma solicitação
            topics = self._extract_main_topics([last_interaction] + cross_channel)
            
            if cross_channel:
                return f"Entendi sua solicitação sobre {topics}. Como já temos um histórico, posso agilizar o processo. Vou verificar o que precisa ser feito."
            else:
                return f"Perfeito! Vou processar sua solicitação sobre {topics}. Me dê um momento para verificar os procedimentos."
        
        else:
            # Resposta genérica mais natural
            if cross_channel:
                topics = self._extract_main_topics(cross_channel)
                return f"Entendi! Considerando nossa conversa anterior sobre {topics}, vou dar continuidade ao atendimento. Como posso ajudar especificamente?"
            else:
                return "Entendi sua mensagem. Como posso ajudá-lo da melhor forma?"
