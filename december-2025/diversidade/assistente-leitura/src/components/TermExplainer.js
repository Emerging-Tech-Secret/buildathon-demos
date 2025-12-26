import React, { useState } from 'react';
import './TermExplainer.css';

function TermExplainer({ selectedText, showFeedback }) {
  const [explanation, setExplanation] = useState(null);

  const termDatabase = {
    'TDAH': {
      definition: 'Transtorno de Déficit de Atenção e Hiperatividade. Condição neurodesenvolvmental caracterizada por padrões persistentes de desatenção, hiperatividade e impulsividade.',
      context: 'Neste estudo, refere-se à condição clínica dos participantes avaliados na intervenção.'
    },
    'TCC': {
      definition: 'Terapia Cognitivo-Comportamental. Forma de psicoterapia que foca em modificar padrões de pensamento e comportamento disfuncionais.',
      context: 'Neste estudo, é a intervenção aplicada ao grupo experimental durante 12 semanas.'
    },
    'RCT': {
      definition: 'Randomized Controlled Trial (Estudo Randomizado Controlado). Desenho experimental onde participantes são aleatoriamente alocados em grupos.',
      context: 'Método utilizado para garantir validade científica dos resultados comparando grupo experimental e controle.'
    },
    'funções executivas': {
      definition: 'Processos cognitivos que controlam e regulam comportamento dirigido a objetivos. Incluem planejamento, memória de trabalho, inibição e flexibilidade cognitiva.',
      context: 'Uma das principais variáveis medidas no estudo através do instrumento BRIEF-A.'
    },
    'DSM-5': {
      definition: 'Manual Diagnóstico e Estatístico de Transtornos Mentais, 5ª edição. Sistema de classificação diagnóstica da Associação Americana de Psiquiatria.',
      context: 'Critério utilizado para confirmar diagnóstico de TDAH nos participantes do estudo.'
    },
    'ASRS': {
      definition: 'Adult ADHD Self-Report Scale. Escala de autorrelato com 18 itens para avaliar sintomas de TDAH em adultos.',
      context: 'Medida primária utilizada para avaliar sintomas de desatenção e hiperatividade.'
    },
    'BRIEF-A': {
      definition: 'Behavior Rating Inventory of Executive Function - Adult Version. Questionário de 75 itens que avalia funções executivas em adultos.',
      context: 'Instrumento usado para medir mudanças em inibição, memória de trabalho e planejamento.'
    },
    'DERS': {
      definition: 'Difficulties in Emotion Regulation Scale. Escala que avalia dificuldades na regulação emocional através de múltiplas dimensões.',
      context: 'Medida utilizada para avaliar regulação emocional, incluindo clareza emocional e controle de impulsos.'
    },
    'p<0.001': {
      definition: 'Valor de probabilidade menor que 0.001. Indica que a probabilidade dos resultados ocorrerem por acaso é menor que 0.1%.',
      context: 'Demonstra significância estatística muito forte dos achados, especialmente para desatenção.'
    },
    'η²': {
      definition: 'Eta quadrado. Medida de tamanho de efeito que indica a proporção de variância explicada pelo tratamento. Valores: pequeno (0.01), médio (0.06), grande (0.14+).',
      context: 'No estudo, η²=0.54 indica tamanho de efeito muito grande para redução de sintomas de desatenção.'
    },
    'ANOVA': {
      definition: 'Analysis of Variance (Análise de Variância). Teste estatístico que compara médias entre grupos para verificar se diferenças são significativas.',
      context: 'ANOVA mista 2x2 foi usada para comparar mudanças entre grupo experimental e controle ao longo do tempo.'
    },
    'metilfenidato': {
      definition: 'Medicamento estimulante do sistema nervoso central, similar à anfetamina. Age aumentando disponibilidade de dopamina e noradrenalina.',
      context: 'Mencionado como tratamento farmacológico de primeira linha para TDAH, ao qual 20-30% não respondem adequadamente.'
    },
    'regulação emocional': {
      definition: 'Capacidade de monitorar, avaliar e modificar reações emocionais para alcançar objetivos. Inclui identificação, compreensão e modulação de emoções.',
      context: 'Variável que apresentou melhora significativa no grupo TCC, medida através do DERS.'
    },
    'psicoeducação': {
      definition: 'Processo educacional que fornece informação sobre diagnóstico, sintomas, tratamento e manejo de condição psicológica ou psiquiátrica.',
      context: 'Componente inicial do protocolo TCC para aumentar compreensão dos participantes sobre TDAH.'
    }
  };

  const explainTerm = () => {
    if (!selectedText || selectedText.trim() === '') {
      showFeedback('Selecione um termo no texto primeiro');
      return;
    }

    const normalizedText = selectedText.trim().toLowerCase();
    let foundTerm = null;

    for (const [term, data] of Object.entries(termDatabase)) {
      if (normalizedText.includes(term.toLowerCase()) || term.toLowerCase().includes(normalizedText)) {
        foundTerm = { term, ...data };
        break;
      }
    }

    if (foundTerm) {
      setExplanation(foundTerm);
      showFeedback('Explicação gerada');
    } else {
      setExplanation({
        term: selectedText,
        definition: 'Termo não encontrado no banco de dados.',
        context: 'Tente selecionar outro termo técnico ou consulte o glossário completo do artigo.'
      });
      showFeedback('Termo não encontrado no banco de dados');
    }
  };

  const clearExplanation = () => {
    setExplanation(null);
    showFeedback('Explicação removida');
  };

  return (
    <div className="term-explainer">
      <h3 className="explainer-title">Explicação de Termos</h3>
      <p className="explainer-description">
        Selecione um termo técnico no texto e clique para obter explicação objetiva.
      </p>

      {selectedText && (
        <div className="selected-term">
          <span className="selected-label">Termo selecionado:</span>
          <span className="selected-value">{selectedText}</span>
        </div>
      )}

      <button 
        className="explain-button" 
        onClick={explainTerm}
        disabled={!selectedText}
      >
        Explicar Termo
      </button>

      {explanation && (
        <div className="explanation-result">
          <div className="explanation-header">
            <span className="explanation-term">{explanation.term}</span>
            <button className="clear-button" onClick={clearExplanation}>
              ✕
            </button>
          </div>
          
          <div className="explanation-section">
            <h4 className="explanation-subtitle">Definição:</h4>
            <p className="explanation-text">{explanation.definition}</p>
          </div>

          <div className="explanation-section">
            <h4 className="explanation-subtitle">Função no estudo:</h4>
            <p className="explanation-text">{explanation.context}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TermExplainer;
