import React from 'react';
import './GuidedReading.css';

function GuidedReading({ 
  guidedMode, 
  toggleGuidedMode, 
  nextParagraph, 
  previousParagraph,
  currentParagraph,
  totalParagraphs
}) {
  return (
    <div className="guided-reading">
      <h3 className="guided-title">Modo Leitura Guiada</h3>
      <p className="guided-description">
        Destaca um parágrafo por vez, reduzindo distrações visuais. Você controla o ritmo de avanço.
      </p>

      <div className="guided-controls">
        <button
          className={`toggle-button ${guidedMode ? 'active' : ''}`}
          onClick={toggleGuidedMode}
        >
          {guidedMode ? 'Desativar Modo Guiado' : 'Ativar Modo Guiado'}
        </button>

        {guidedMode && (
          <div className="navigation-controls">
            <div className="progress-indicator">
              Parágrafo {currentParagraph !== null ? currentParagraph + 1 : 0} de {totalParagraphs}
            </div>

            <div className="navigation-buttons">
              <button
                className="nav-button"
                onClick={previousParagraph}
                disabled={currentParagraph === null || currentParagraph === 0}
              >
                ← Anterior
              </button>
              <button
                className="nav-button"
                onClick={nextParagraph}
                disabled={currentParagraph === null || currentParagraph >= totalParagraphs - 1}
              >
                Próximo →
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="guided-info">
        <h4 className="info-subtitle">Como funciona:</h4>
        <ul className="info-list">
          <li>O parágrafo atual fica destacado em amarelo claro</li>
          <li>Os demais parágrafos ficam com opacidade reduzida</li>
          <li>Use os botões para avançar no seu ritmo</li>
          <li>Você pode desativar a qualquer momento</li>
        </ul>
      </div>
    </div>
  );
}

export default GuidedReading;
