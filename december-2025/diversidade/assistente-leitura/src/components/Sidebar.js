import React, { useState } from 'react';
import './Sidebar.css';
import ArticleMap from './ArticleMap';
import GuidedReading from './GuidedReading';
import SummaryGenerator from './SummaryGenerator';
import TermExplainer from './TermExplainer';
import FunctionIdentifier from './FunctionIdentifier';
import PDFUploader from './PDFUploader';

function Sidebar({ 
  sections, 
  updateSectionStatus, 
  scrollToSection,
  guidedMode,
  toggleGuidedMode,
  nextParagraph,
  previousParagraph,
  currentParagraph,
  totalParagraphs,
  selectedText,
  showFeedback,
  onArticleLoaded
}) {
  const [activeTab, setActiveTab] = useState('map');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Ferramentas de Leitura</h2>
      </div>

      <nav className="sidebar-tabs">
        <button 
          className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => handleTabChange('upload')}
        >
          Carregar PDF
        </button>
        <button 
          className={`tab-button ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => handleTabChange('map')}
        >
          Mapa
        </button>
        <button 
          className={`tab-button ${activeTab === 'guided' ? 'active' : ''}`}
          onClick={() => handleTabChange('guided')}
        >
          Guiado
        </button>
        <button 
          className={`tab-button ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => handleTabChange('summary')}
        >
          Resumo
        </button>
        <button 
          className={`tab-button ${activeTab === 'tools' ? 'active' : ''}`}
          onClick={() => handleTabChange('tools')}
        >
          Ferramentas
        </button>
      </nav>

      <div className="sidebar-content">
        {activeTab === 'upload' && (
          <PDFUploader
            onArticleLoaded={onArticleLoaded}
            showFeedback={showFeedback}
          />
        )}

        {activeTab === 'map' && (
          <ArticleMap
            sections={sections}
            updateSectionStatus={updateSectionStatus}
            scrollToSection={scrollToSection}
          />
        )}

        {activeTab === 'guided' && (
          <GuidedReading
            guidedMode={guidedMode}
            toggleGuidedMode={toggleGuidedMode}
            nextParagraph={nextParagraph}
            previousParagraph={previousParagraph}
            currentParagraph={currentParagraph}
            totalParagraphs={totalParagraphs}
          />
        )}

        {activeTab === 'summary' && (
          <SummaryGenerator
            sections={sections}
            showFeedback={showFeedback}
          />
        )}

        {activeTab === 'tools' && (
          <div className="tools-container">
            <TermExplainer
              selectedText={selectedText}
              showFeedback={showFeedback}
            />
            <FunctionIdentifier
              selectedText={selectedText}
              sections={sections}
              showFeedback={showFeedback}
            />
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
