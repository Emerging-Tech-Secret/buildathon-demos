import React, { useState } from 'react';
import './App.css';
import ArticleReader from './components/ArticleReader';
import Sidebar from './components/Sidebar';
import sampleArticle from './data/sampleArticle';

function App() {
  const [articleTitle, setArticleTitle] = useState(sampleArticle.title);
  const [sections, setSections] = useState(sampleArticle.sections);
  const [guidedMode, setGuidedMode] = useState(false);
  const [currentParagraph, setCurrentParagraph] = useState(null);
  const [selectedText, setSelectedText] = useState(null);
  const [feedback, setFeedback] = useState('');

  const updateSectionStatus = (sectionId, status) => {
    setSections(sections.map(section => 
      section.id === sectionId ? { ...section, status } : section
    ));
    showFeedback(`Seção marcada como: ${status}`);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      showFeedback('Navegando para seção');
    }
  };

  const toggleGuidedMode = () => {
    const newMode = !guidedMode;
    setGuidedMode(newMode);
    if (newMode) {
      setCurrentParagraph(0);
      showFeedback('Modo leitura guiada ativado');
    } else {
      setCurrentParagraph(null);
      showFeedback('Modo leitura guiada desativado');
    }
  };

  const nextParagraph = () => {
    const allParagraphs = sections.flatMap(s => s.paragraphs);
    if (currentParagraph !== null && currentParagraph < allParagraphs.length - 1) {
      setCurrentParagraph(currentParagraph + 1);
      showFeedback(`Parágrafo ${currentParagraph + 2} de ${allParagraphs.length}`);
    }
  };

  const previousParagraph = () => {
    if (currentParagraph !== null && currentParagraph > 0) {
      setCurrentParagraph(currentParagraph - 1);
      showFeedback(`Parágrafo ${currentParagraph} de ${sections.flatMap(s => s.paragraphs).length}`);
    }
  };

  const showFeedback = (message) => {
    setFeedback(message);
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (text.length > 0) {
      setSelectedText(text);
    }
  };

  const handleArticleLoaded = (article) => {
    setArticleTitle(article.title);
    setSections(article.sections);
    setGuidedMode(false);
    setCurrentParagraph(null);
    setSelectedText(null);
  };

  return (
    <div className="App">
      {feedback && (
        <div className="feedback-banner">
          {feedback}
        </div>
      )}
      
      <div className="main-container">
        <ArticleReader
          title={articleTitle}
          sections={sections}
          guidedMode={guidedMode}
          currentParagraph={currentParagraph}
          onTextSelection={handleTextSelection}
        />
        
        <Sidebar
          sections={sections}
          updateSectionStatus={updateSectionStatus}
          scrollToSection={scrollToSection}
          guidedMode={guidedMode}
          toggleGuidedMode={toggleGuidedMode}
          nextParagraph={nextParagraph}
          previousParagraph={previousParagraph}
          currentParagraph={currentParagraph}
          totalParagraphs={sections.flatMap(s => s.paragraphs).length}
          selectedText={selectedText}
          showFeedback={showFeedback}
          onArticleLoaded={handleArticleLoaded}
        />
      </div>
    </div>
  );
}

export default App;
