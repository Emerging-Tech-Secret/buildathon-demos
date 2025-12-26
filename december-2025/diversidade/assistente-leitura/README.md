# Assistente de Leitura para Artigos Científicos

## Descrição

Assistente de navegação para leitura de artigos científicos, focado em usuários neurodivergentes (TEA e TDAH).

O objetivo é reduzir carga cognitiva, preservar o texto original intacto e oferecer controle total ao usuário.

## Princípios de Design

- **Controle total**: Nada acontece sem ação do usuário
- **Linguagem clara**: Comunicação direta e literal
- **Sem distrações**: Sem animações, pop-ups ou notificações automáticas
- **Feedback explícito**: Cada ação gera confirmação visual
- **Previsibilidade**: Comportamento consistente e esperado

## Funcionalidades

### 1. Mapa do Artigo
- Visualização da estrutura completa do artigo
- Navegação por seções (Abstract, Introdução, Métodos, Resultados, Discussão)
- Marcação de progresso: Não lido / Em progresso / Lido
- Contador de parágrafos por seção

### 2. Modo Leitura Guiada
- Destaque visual do parágrafo ativo
- Redução de opacidade nos demais parágrafos
- Navegação manual (botões Anterior/Próximo)
- Indicador de progresso (parágrafo X de Y)
- Controle total: ativar/desativar a qualquer momento

### 3. Resumo em Camadas
- Geração de resumos sob demanda
- Duas opções: 3 frases ou 1 parágrafo
- Linguagem objetiva e literal
- Indicação clara de que é um resumo (não substitui o original)

### 4. Explicação de Termos
- Seleção de termos técnicos no texto
- Definição objetiva
- Contexto: função do termo no estudo
- Banco de dados com termos comuns (TDAH, TCC, ASRS, BRIEF-A, etc.)

### 5. Identificação de Função do Trecho
- Identifica o papel de cada parágrafo (objetivo, método, resultado, etc.)
- Explica por que o trecho é importante
- Ajuda a decidir o que pode ser pulado ou priorizado

## Como Usar

### Instalação

```bash
npm install
```

### Executar

```bash
npm start
```

A aplicação abrirá em `http://localhost:3000`

## Estrutura de Decisão UX

### Por que controles manuais?
Usuários neurodivergentes frequentemente preferem controle explícito sobre automação "inteligente" que pode ser imprevisível.

### Por que sem animações?
Transições automáticas podem ser distratantes e aumentar carga sensorial.

### Por que feedback textual?
Confirmações visuais explícitas reduzem incerteza sobre o estado do sistema.

### Por que modo guiado opcional?
Alguns usuários se beneficiam de foco reduzido, outros preferem visão completa. Ambos são válidos.

### Por que linguagem literal?
Metáforas e linguagem figurada podem ser ambíguas. Linguagem direta é mais acessível.

## Estrutura Técnica

```
src/
├── App.js                    # Componente principal e gerenciamento de estado
├── components/
│   ├── ArticleReader.js      # Visualização do artigo
│   ├── Sidebar.js            # Container das ferramentas
│   ├── ArticleMap.js         # Mapa de navegação
│   ├── GuidedReading.js      # Controles de leitura guiada
│   ├── SummaryGenerator.js   # Gerador de resumos
│   ├── TermExplainer.js      # Explicação de termos
│   └── FunctionIdentifier.js # Identificador de função
└── data/
    └── sampleArticle.js      # Artigo de exemplo
```

## Limitações Conhecidas (MVP)

- Artigo de exemplo fixo (não carrega PDFs externos ainda)
- Banco de termos limitado (14 termos técnicos)
- Resumos pré-escritos (não usa IA generativa)
- Sem persistência de estado (recarregar página perde progresso)
- Sem modo escuro
- Sem ajuste de fonte/tamanho

## Próximos Passos (Fora do Escopo MVP)

- Upload de PDFs
- Conversão PDF → texto estruturado
- Persistência local (localStorage)
- Expansão do banco de termos
- Temas de cores customizáveis
- Exportação de notas
- Integração com APIs de resumo (opcional, com consentimento)

## Tecnologias

- React 18
- CSS puro (sem frameworks para reduzir dependências)
- Processamento local (sem servidor)

## Testes de Usabilidade

Para testar com usuários reais:

1. Observe sem interromper
2. Pergunte: "O que você esperava que acontecesse?"
3. Evite sugerir funcionalidades
4. Foque em barreiras reais, não preferências estéticas

## Licença

MIT

## Contato

Para feedback sobre acessibilidade, por favor abra uma issue com:
- Descrição clara do problema
- O que você esperava
- Configuração do seu sistema (browser, leitores de tela, etc.)
