import React, { useState } from 'react';
import './SummaryGenerator.css';

function SummaryGenerator({ sections, showFeedback }) {
  const [selectedSection, setSelectedSection] = useState('');
  const [summaryType, setSummaryType] = useState('short');
  const [generatedSummary, setGeneratedSummary] = useState(null);

  const generateSummary = () => {
    if (!selectedSection) {
      showFeedback('Selecione uma seção primeiro');
      return;
    }

    const section = sections.find(s => s.id === selectedSection);
    if (!section) return;

    let summary = '';
    
    if (summaryType === 'short') {
      summary = generateShortSummary(section);
      showFeedback('Resumo de 3 frases gerado');
    } else {
      summary = generateLongSummary(section);
      showFeedback('Resumo de 1 parágrafo gerado');
    }

    setGeneratedSummary({
      section: section.title,
      type: summaryType,
      content: summary
    });
  };

  const generateShortSummary = (section) => {
    const summaries = {
      'abstract': 'Este estudo avaliou TCC em 86 adultos com TDAH durante 12 semanas. Houve redução significativa em desatenção e melhora na regulação emocional. Sintomas de hiperatividade motora não apresentaram mudanças significativas.',
      'introduction': 'TDAH persiste na vida adulta em 65% dos casos diagnosticados na infância. Tratamento farmacológico não funciona para 20-30% dos pacientes. Este estudo avalia um protocolo estruturado de TCC para adultos com TDAH.',
      'methods': 'Estudo randomizado controlado com 86 participantes (18-55 anos). Intervenção: 12 sessões semanais de TCC (90 minutos cada). Medidas: ASRS, BRIEF-A, DERS.',
      'results': 'Grupo experimental apresentou redução significativa em desatenção (p<0.001). Melhorias em funções executivas: inibição, memória de trabalho, planejamento. Sem diferenças em hiperatividade motora.',
      'discussion': 'TCC estruturada é eficaz para desatenção e funções executivas em adultos com TDAH. Sintomas motores requerem abordagem farmacológica. Limitação: amostra com alto nível educacional.'
    };
    return summaries[section.id] || 'Resumo não disponível para esta seção.';
  };

  const generateLongSummary = (section) => {
    const summaries = {
      'abstract': 'Este estudo investigou os efeitos de uma intervenção cognitivo-comportamental estruturada aplicada durante 12 semanas em adultos diagnosticados com TDAH. Participaram 86 adultos com idade média de 32.4 anos, randomizados entre grupo experimental e grupo controle. Os resultados demonstraram redução significativa nos sintomas de desatenção e melhora na regulação emocional no grupo que recebeu a intervenção, enquanto sintomas de hiperatividade motora não apresentaram mudanças significativas entre os grupos.',
      'introduction': 'O TDAH é uma condição neurodesenvolvmental que persiste na vida adulta em aproximadamente 65% dos casos diagnosticados na infância, causando dificuldades ocupacionais, acadêmicas e interpessoais. Embora medicamentos estimulantes sejam tratamento de primeira linha, cerca de 20-30% dos pacientes não respondem adequadamente ou experimentam efeitos colaterais significativos. A Terapia Cognitivo-Comportamental emerge como alternativa ou complemento ao tratamento farmacológico, mas as evidências sobre protocolos padronizados permanecem limitadas. Este estudo objetiva avaliar a eficácia de um protocolo estruturado de TCC focando em funções executivas, regulação emocional e sintomas nucleares do TDAH.',
      'methods': 'Foi utilizado um desenho experimental randomizado controlado com avaliações pré e pós-intervenção, além de seguimento após 3 meses. Os participantes foram recrutados através de clínicas especializadas e mídias sociais, com critérios incluindo diagnóstico de TDAH segundo DSM-5, idade entre 18-55 anos e QI estimado superior a 80. A intervenção consistiu em 12 sessões semanais de 90 minutos incluindo psicoeducação, treinamento organizacional, regulação emocional e reestruturação cognitiva. As medidas primárias foram ASRS, BRIEF-A e DERS, com análises via ANOVA mista.',
      'results': 'A amostra final de 86 participantes não apresentou diferenças significativas entre grupos na linha de base. O grupo experimental demonstrou redução significativa nos escores de desatenção comparado ao grupo controle, com tamanho de efeito grande. Em funções executivas, observou-se melhora significativa em inibição, memória de trabalho e planejamento/organização. A regulação emocional também apresentou melhora significativa, particularmente em clareza emocional e controle de impulsos. Não foram observadas diferenças significativas em sintomas de hiperatividade motora.',
      'discussion': 'Os resultados fornecem evidências robustas de que a TCC estruturada produz melhorias significativas em sintomas de desatenção e funções executivas em adultos com TDAH. A ausência de efeitos em hiperatividade motora é consistente com literatura prévia, sugerindo que sintomas motores podem ser menos responsivos a intervenções psicológicas. O estudo possui limitações incluindo amostra com alto nível educacional e seguimento de apenas 3 meses. Pesquisas futuras devem investigar componentes específicos mais eficazes e explorar diferentes modalidades de entrega e populações diversificadas.'
    };
    return summaries[section.id] || 'Resumo não disponível para esta seção.';
  };

  const clearSummary = () => {
    setGeneratedSummary(null);
    showFeedback('Resumo removido');
  };

  return (
    <div className="summary-generator">
      <h3 className="summary-title">Resumo em Camadas</h3>
      <p className="summary-description">
        Gere um resumo objetivo de uma seção específica. O resumo não substitui o texto original.
      </p>

      <div className="summary-controls">
        <div className="control-group">
          <label className="control-label">Selecione a seção:</label>
          <select
            className="control-select"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
          >
            <option value="">-- Escolha uma seção --</option>
            {sections.map(section => (
              <option key={section.id} value={section.id}>
                {section.title}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label className="control-label">Tamanho do resumo:</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="summaryType"
                value="short"
                checked={summaryType === 'short'}
                onChange={(e) => setSummaryType(e.target.value)}
              />
              3 frases
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="summaryType"
                value="long"
                checked={summaryType === 'long'}
                onChange={(e) => setSummaryType(e.target.value)}
              />
              1 parágrafo
            </label>
          </div>
        </div>

        <button className="generate-button" onClick={generateSummary}>
          Gerar Resumo
        </button>
      </div>

      {generatedSummary && (
        <div className="summary-result">
          <div className="result-header">
            <span className="result-label">RESUMO: {generatedSummary.section}</span>
            <button className="clear-button" onClick={clearSummary}>
              ✕
            </button>
          </div>
          <div className="result-content">
            {generatedSummary.content}
          </div>
          <div className="result-footer">
            Tipo: {generatedSummary.type === 'short' ? '3 frases' : '1 parágrafo'}
          </div>
        </div>
      )}

      <div className="summary-info">
        <h4 className="info-subtitle">Importante:</h4>
        <ul className="info-list">
          <li>Resumos usam linguagem objetiva e literal</li>
          <li>Não substituem a leitura do texto original</li>
          <li>Servem para visão geral rápida</li>
        </ul>
      </div>
    </div>
  );
}

export default SummaryGenerator;
