import React, { useState } from 'react';
import './FunctionIdentifier.css';

function FunctionIdentifier({ selectedText, sections, showFeedback }) {
  const [identifiedFunction, setIdentifiedFunction] = useState(null);

  const functionDescriptions = {
    'objective': 'Este trecho descreve o objetivo do estudo',
    'context': 'Este trecho apresenta contexto e informações de base',
    'problem': 'Este trecho identifica um problema ou lacuna',
    'gap': 'Este trecho aponta uma lacuna na literatura',
    'design': 'Este trecho descreve o desenho do estudo',
    'participants': 'Este trecho descreve os participantes',
    'intervention': 'Este trecho descreve a intervenção aplicada',
    'measures': 'Este trecho descreve os instrumentos de medida',
    'sample': 'Este trecho descreve características da amostra',
    'main_finding': 'Este trecho apresenta resultado principal',
    'secondary_finding': 'Este trecho apresenta resultado secundário',
    'null_finding': 'Este trecho reporta resultado não significativo',
    'interpretation': 'Este trecho interpreta os resultados',
    'comparison': 'Este trecho compara achados com literatura',
    'limitations': 'Este trecho discute limitações do estudo',
    'future_directions': 'Este trecho sugere direções futuras',
    'conclusion': 'Este trecho apresenta conclusão'
  };

  const identifyFunction = () => {
    if (!selectedText || selectedText.trim() === '') {
      showFeedback('Selecione um trecho no texto primeiro');
      return;
    }

    let foundFunction = null;
    const normalizedSelection = selectedText.trim().toLowerCase();

    for (const section of sections) {
      for (const paragraph of section.paragraphs) {
        const normalizedParagraph = paragraph.text.toLowerCase();
        
        if (normalizedParagraph.includes(normalizedSelection) || 
            normalizedSelection.includes(normalizedParagraph.substring(0, 50))) {
          
          foundFunction = {
            function: paragraph.function,
            description: functionDescriptions[paragraph.function],
            section: section.title,
            explanation: generateExplanation(paragraph.function, section.type)
          };
          break;
        }
      }
      if (foundFunction) break;
    }

    if (foundFunction) {
      setIdentifiedFunction(foundFunction);
      showFeedback('Função identificada');
    } else {
      setIdentifiedFunction({
        function: 'unknown',
        description: 'Não foi possível identificar a função deste trecho',
        section: 'Desconhecida',
        explanation: 'Selecione um trecho completo do artigo para identificação precisa.'
      });
      showFeedback('Trecho não identificado');
    }
  };

  const generateExplanation = (functionType, sectionType) => {
    const explanations = {
      'objective': 'Define o que o estudo pretende investigar ou responder. Essencial para entender a motivação da pesquisa.',
      'context': 'Fornece informação de fundo necessária para compreender o problema. Pode ser pulado se você já conhece o tópico.',
      'problem': 'Identifica o problema específico que motiva o estudo. Importante para entender relevância.',
      'gap': 'Aponta o que ainda não foi estudado adequadamente. Justifica por que este estudo é necessário.',
      'design': 'Explica como o estudo foi estruturado. Essencial para avaliar qualidade metodológica.',
      'participants': 'Descreve quem participou do estudo. Importante para entender a quem os resultados se aplicam.',
      'intervention': 'Detalha o que foi feito com os participantes. Central para entender o que está sendo testado.',
      'measures': 'Lista os instrumentos usados para coletar dados. Técnico, pode ser pulado em primeira leitura.',
      'sample': 'Descreve características dos participantes. Ajuda avaliar representatividade.',
      'main_finding': 'Apresenta o resultado mais importante. Essencial, não pule.',
      'secondary_finding': 'Apresenta resultados adicionais. Importante mas não central.',
      'null_finding': 'Reporta onde não houve diferença significativa. Importante para entender limites.',
      'interpretation': 'Explica o que os resultados significam. Essencial para compreensão.',
      'comparison': 'Relaciona achados com outros estudos. Contextualiza os resultados.',
      'limitations': 'Aponta problemas do estudo. Importante para avaliação crítica.',
      'future_directions': 'Sugere próximos passos. Pode ser pulado se não for sua área.',
      'conclusion': 'Sintetiza principais achados. Essencial, sempre leia.'
    };
    
    return explanations[functionType] || 'Função do trecho no contexto do artigo.';
  };

  const clearFunction = () => {
    setIdentifiedFunction(null);
    showFeedback('Identificação removida');
  };

  return (
    <div className="function-identifier">
      <h3 className="identifier-title">Identificar Função do Trecho</h3>
      <p className="identifier-description">
        Selecione um parágrafo completo para identificar sua função no artigo.
      </p>

      {selectedText && (
        <div className="selected-text-preview">
          <span className="preview-label">Trecho selecionado:</span>
          <span className="preview-text">
            {selectedText.length > 80 ? selectedText.substring(0, 80) + '...' : selectedText}
          </span>
        </div>
      )}

      <button 
        className="identify-button" 
        onClick={identifyFunction}
        disabled={!selectedText}
      >
        Identificar Função
      </button>

      {identifiedFunction && (
        <div className="function-result">
          <div className="function-header">
            <span className="function-label">FUNÇÃO IDENTIFICADA</span>
            <button className="clear-button" onClick={clearFunction}>
              ✕
            </button>
          </div>

          <div className="function-body">
            <div className="function-item">
              <span className="function-key">Seção:</span>
              <span className="function-value">{identifiedFunction.section}</span>
            </div>

            <div className="function-item">
              <span className="function-key">Função:</span>
              <span className="function-value-main">{identifiedFunction.description}</span>
            </div>

            <div className="function-explanation">
              <h4 className="explanation-subtitle">Por que importa:</h4>
              <p className="explanation-text">{identifiedFunction.explanation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FunctionIdentifier;
