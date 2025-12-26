import React, { useState } from 'react';
import './PDFUploader.css';
import { parsePDF, structureArticle } from '../utils/pdfParser';

function PDFUploader({ onArticleLoaded, showFeedback }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      showFeedback('Por favor, selecione um arquivo PDF');
      return;
    }
    
    setFileName(file.name);
    setIsProcessing(true);
    showFeedback('Processando PDF...');
    
    try {
      const text = await parsePDF(file);
      
      const articleTitle = file.name.replace('.pdf', '');
      const structuredArticle = structureArticle(text, articleTitle);
      
      onArticleLoaded(structuredArticle);
      showFeedback(`PDF carregado: ${structuredArticle.sections.length} seções encontradas`);
      
    } catch (error) {
      showFeedback(`Erro: ${error.message}`);
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="pdf-uploader">
      <div className="uploader-header">
        <h3 className="uploader-title">Carregar Artigo PDF</h3>
        <p className="uploader-description">
          Selecione um arquivo PDF para carregar e ler com as ferramentas de navegação.
        </p>
      </div>

      <div className="uploader-controls">
        <label className="file-input-label">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="file-input"
            disabled={isProcessing}
          />
          <span className="file-input-button">
            {isProcessing ? 'Processando...' : 'Selecionar PDF'}
          </span>
        </label>

        {fileName && (
          <div className="file-info">
            <span className="file-name">{fileName}</span>
          </div>
        )}
      </div>

      <div className="uploader-info">
        <h4 className="info-subtitle">Como funciona:</h4>
        <ul className="info-list">
          <li>O PDF será convertido em texto</li>
          <li>O sistema tentará identificar seções automaticamente</li>
          <li>Você poderá usar todas as ferramentas de navegação</li>
          <li>O processo pode levar alguns segundos</li>
        </ul>
      </div>

      <div className="uploader-note">
        <strong>Nota:</strong> A qualidade da extração depende da formatação do PDF. PDFs escaneados podem não funcionar adequadamente.
      </div>
    </div>
  );
}

export default PDFUploader;
