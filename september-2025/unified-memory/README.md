# Sistema de Memória Unificada - POC

Uma POC (Proof of Concept) de sistema de memória unificada para agente LLM multicanal, implementada em Python com FastAPI.
> Autores: André Aigner, Julyana de Prá, Vanessa Fernandes
> Data: 26/09/2025

## 🎯 Características Principais

- **Memória Unificada**: Persiste toda a memória em um arquivo JSON (`memory.json`)
- **Multicanal**: Suporta chat, e-mail e voz com handoff entre canais
- **Detecção de Ataques**: Identifica tentativas de jailbreak e quarentena eventos suspeitos
- **Garbage Collection**: Compacta memória automaticamente usando similaridade Jaccard
- **Exclusão Flexível**: Remove memória por evento, campos específicos ou totalmente
- **API REST**: Interface HTTP completa com FastAPI

## 🏗️ Arquitetura

```
/
├── app.py                # FastAPI + rotas da API
├── core_memory.py        # Motor de memória (GC, risco, handoff)
├── models.py             # Modelos Pydantic
├── memory.json           # Persistência (criado automaticamente)
├── demo_sequence.py      # Script de demonstração
├── requirements.txt      # Dependências
└── README.md            # Este arquivo
```

## 🚀 Instalação e Execução

### 1. Instalar Dependências

```bash
pip install -r requirements.txt
```

### 2. Iniciar a API

```bash
# Opção 1: Usando uvicorn diretamente
uvicorn app:app --reload --host 0.0.0.0 --port 8000

# Opção 2: Executando o arquivo app.py
python app.py
```

A API estará disponível em: http://localhost:8000

### 3. Executar Demonstração

**Opção 1: Interface Gráfica (Streamlit)**
```bash
streamlit run streamlit_demo.py
```
Acesse: http://localhost:8501

**Opção 2: Script de Linha de Comando**
```bash
python demo_sequence.py
```

## 📋 Endpoints da API

### `POST /interact`
Adiciona nova interação do cliente.

**Request:**
```json
{
  "client_id": "C123",
  "channel": "chat",
  "text": "Quero parcelar minha fatura."
}
```

**Response:**
```json
{
  "event_id": "evt_12345678",
  "risk_score": 0,
  "quarantined": false,
  "gc_ran": false,
  "assistant_suggestion": "Entendi sua mensagem via chat..."
}
```

### `GET /context`
Retorna contexto cruzado entre canais.

**Query Params:**
- `client_id`: ID do cliente
- `current_channel`: Canal atual

**Response:**
```json
{
  "state_summary": "Cliente pretende parcelar fatura...",
  "recent_cross_channel": [...],
  "assistant_suggestion": "Baseado no contexto..."
}
```

### `DELETE /memory`
Exclui memória conforme escopo.

**Request Examples:**
```json
// Excluir tudo
{"client_id": "C123", "scope": "all"}

// Excluir evento específico
{"client_id": "C123", "scope": "event", "event_id": "evt_123"}

// Excluir campos do perfil
{"client_id": "C123", "scope": "fields", "keys": ["email", "phone"]}
```

### `POST /gc`
Força execução do garbage collection.

**Query Params:**
- `client_id`: ID do cliente

### `GET /memory/raw`
Retorna memória bruta.

**Query Params:**
- `include_quarantined`: Incluir eventos quarentenados (default: false)

### `GET /clients`
Lista todos os clientes.

### `GET /health`
Health check da API.

## 🧠 Como Funciona

### Detecção de Ataques/Jailbreaks

O sistema detecta padrões suspeitos como:
- `ignore previous instructions`
- `act as system|developer|root`
- `begin_system_instructions`
- `developer mode`
- `bypass safeguards|policies`
- `jailbreak`
- `leak api|secret|key|password`
- `credit card number|details|cvv`
- `cpf completo|senha do banco`

**Scoring:**
- +25 pontos por padrão detectado
- +15 pontos para textos > 2000 caracteres
- +10 pontos para densidade anômala de palavras técnicas
- Score ≥ 60 → evento quarentenado

### Garbage Collection (GC)

**Gatilhos:**
- Mais de 2500 tokens total
- Mais de 200 eventos

**Processo:**
1. Mantém últimos 10 eventos normais
2. Agrupa eventos antigos por similaridade Jaccard (threshold: 0.3)
3. Cria eventos sintéticos para cada grupo
4. Atualiza resumo do estado
5. Preserva eventos quarentenados

### Handoff Entre Canais

Quando cliente troca de canal:
1. Sistema retorna resumo do estado atual
2. Inclui últimos eventos de outros canais
3. Incrementa contador de acesso
4. Gera sugestão de resposta contextualizada

## 📊 Estrutura do JSON

```json
{
  "clients": {
    "C123": {
      "profile": {
        "name": "Ana Silva",
        "email": "ana@email.com",
        "updated_at": "2025-09-26T12:00:00Z"
      },
      "state_summary": "Cliente pretende parcelar fatura...",
      "channels": ["chat", "email", "voice"],
      "interactions": [
        {
          "id": "evt_001",
          "ts": "2025-09-25T14:32:10Z",
          "channel": "chat",
          "text": "Quero parcelar minha fatura.",
          "tokens": 7,
          "access_count": 3,
          "risk": {"score": 0, "signals": []},
          "quarantined": false
        }
      ],
      "limits": {
        "max_tokens": 2500,
        "max_events": 200,
        "last_gc_at": "2025-09-26T12:00:00Z"
      },
      "meta": {
        "version": 1,
        "last_delete": null
      }
    }
  }
}
```

## 🖥️ Interface Gráfica (Streamlit)

A interface Streamlit oferece uma demonstração visual e interativa de todas as funcionalidades:

### Funcionalidades da Interface

#### 💬 **Aba Interações**
- Simulador multicanal (chat, email, voice, whatsapp, sms)
- Exemplos pré-definidos para teste rápido
- Visualização em tempo real das métricas de risco
- Sugestões contextualizadas do assistente

#### 🔄 **Aba Contexto Cruzado**
- Busca de contexto entre canais
- Visualização do histórico de outros canais
- Demonstração do handoff inteligente
- Análise de access_count

#### 🧹 **Aba Garbage Collection**
- Execução manual do GC
- Métricas antes/depois da compactação
- Gráficos de eficiência
- Visualização da redução de eventos

#### 📊 **Aba Análise de Memória**
- Métricas gerais do cliente
- Gráficos de distribuição por canal
- Timeline de interações
- Análise de tokens e quarentena

#### 🚨 **Aba Segurança**
- Teste de detecção de jailbreak
- Análise de score de risco
- Estatísticas de segurança
- Demonstração de quarentena

### Como Usar a Interface

1. **Inicie a API**: `python app.py`
2. **Inicie o Streamlit**: `streamlit run streamlit_demo.py`
3. **Acesse**: http://localhost:8501
4. **Configure**: Client ID no painel lateral
5. **Teste**: Use as abas para explorar funcionalidades

## 🎬 Demonstração (Script)

O script `demo_sequence.py` simula o seguinte fluxo:

1. **Health Check**: Verifica se API está funcionando
2. **Chat**: "Quero parcelar minha fatura em 6 vezes"
3. **E-mail**: "Preciso atualizar meu endereço..."
4. **Voz**: "Qual status do parcelamento?" (com contexto cruzado)
5. **Ataque**: Tentativa de jailbreak (quarentenado)
6. **Inspeção**: Visualiza memória com/sem quarentenados
7. **GC**: Força compactação
8. **Exclusão**: Remove evento específico e campos do perfil
9. **Estado Final**: Mostra resultado final
10. **Limpeza**: Opção para excluir tudo

## 🔧 Configurações

### Limites Padrão
- **max_tokens**: 2500
- **max_events**: 200
- **Similaridade Jaccard**: 0.3
- **Eventos recentes mantidos**: 10
- **Score de quarentena**: ≥ 60

### Personalização

Você pode modificar os limites editando a classe `ClientLimits` em `models.py` ou os padrões de risco em `core_memory.py`.

## 🧪 Testes

### Teste Manual via cURL

```bash
# Health check
curl http://localhost:8000/health

# Adicionar interação
curl -X POST http://localhost:8000/interact \
  -H "Content-Type: application/json" \
  -d '{"client_id":"TEST","channel":"chat","text":"Olá!"}'

# Buscar contexto
curl "http://localhost:8000/context?client_id=TEST&current_channel=email"

# Ver memória
curl "http://localhost:8000/memory/raw"
```

### Teste com Navegador

Acesse http://localhost:8000/docs para interface Swagger automática.

## 🚨 Limitações Conhecidas

- **Tokens**: Aproximação usando contagem de palavras
- **Similaridade**: Apenas Jaccard sobre bag-of-words
- **Persistência**: Arquivo JSON único (não escalável)
- **Concorrência**: Não há locks para acesso simultâneo
- **Validação**: Validação básica de entrada

## 🔮 Melhorias Futuras

- [ ] Embeddings semânticos para similaridade
- [ ] Banco de dados real (PostgreSQL/MongoDB)
- [ ] Cache em memória (Redis)
- [ ] Autenticação e autorização
- [ ] Métricas e observabilidade
- [ ] Interface web (Streamlit/React)
- [ ] Máscara automática de PII
- [ ] Suporte a múltiplos idiomas

## 📝 Licença

Este é um projeto de demonstração/POC. Use livremente para fins educacionais e de teste.

## 🤝 Contribuição

Para contribuir:
1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

---

**Desenvolvido como POC de sistema de memória unificada para agentes LLM multicanal.**
