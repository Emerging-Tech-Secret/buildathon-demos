import React, { useEffect } from 'react';
import './ArticleReader.css';

function ArticleReader({ title, sections, guidedMode, currentParagraph, onTextSelection }) {
  useEffect(() => {
    if (guidedMode && currentParagraph !== null) {
      const allParagraphs = sections.flatMap(s => s.paragraphs);
      const targetParagraph = allParagraphs[currentParagraph];
      if (targetParagraph) {
        const element = document.getElementById(targetParagraph.id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [currentParagraph, guidedMode, sections]);

  const allParagraphs = sections.flatMap(s => s.paragraphs);
  const currentParagraphId = currentParagraph !== null ? allParagraphs[currentParagraph]?.id : null;

  return (
    <div 
      className={`article-reader ${guidedMode ? 'guided-mode' : ''}`}
      onMouseUp={onTextSelection}
    >
      <div className="article-content">
        <h1 className="article-title">
          {title}
        </h1>

        {sections.map(section => (
          <section key={section.id} id={section.id} className="article-section">
            <h2 className="section-title">{section.title}</h2>
            
            {section.paragraphs.map(paragraph => (
              <p
                key={paragraph.id}
                id={paragraph.id}
                className={`paragraph ${
                  guidedMode && currentParagraphId === paragraph.id ? 'active' : ''
                } ${
                  guidedMode && currentParagraphId !== paragraph.id ? 'dimmed' : ''
                }`}
              >
                {paragraph.text}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}

export default ArticleReader;
