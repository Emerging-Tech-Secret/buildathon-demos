import React from 'react';
import './ArticleMap.css';

function ArticleMap({ sections, updateSectionStatus, scrollToSection }) {
  const statusLabels = {
    unread: 'Não lido',
    'in-progress': 'Em progresso',
    read: 'Lido'
  };

  const handleStatusChange = (sectionId, newStatus) => {
    updateSectionStatus(sectionId, newStatus);
  };

  return (
    <div className="article-map">
      <h3 className="map-title">Estrutura do Artigo</h3>
      <p className="map-description">
        Clique em uma seção para navegar. Use os botões para marcar seu progresso.
      </p>

      <div className="sections-list">
        {sections.map(section => (
          <div key={section.id} className="section-item">
            <div className="section-header">
              <button
                className="section-name"
                onClick={() => scrollToSection(section.id)}
              >
                {section.title}
              </button>
              <span className={`status-badge status-${section.status}`}>
                {statusLabels[section.status]}
              </span>
            </div>

            <div className="section-actions">
              <button
                className={`status-button ${section.status === 'unread' ? 'active' : ''}`}
                onClick={() => handleStatusChange(section.id, 'unread')}
              >
                Não lido
              </button>
              <button
                className={`status-button ${section.status === 'in-progress' ? 'active' : ''}`}
                onClick={() => handleStatusChange(section.id, 'in-progress')}
              >
                Em progresso
              </button>
              <button
                className={`status-button ${section.status === 'read' ? 'active' : ''}`}
                onClick={() => handleStatusChange(section.id, 'read')}
              >
                Lido
              </button>
            </div>

            <div className="section-info">
              {section.paragraphs.length} parágrafo{section.paragraphs.length !== 1 ? 's' : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ArticleMap;
