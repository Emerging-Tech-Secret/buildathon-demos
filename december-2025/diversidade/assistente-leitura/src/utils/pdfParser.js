import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export const parsePDF = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('Erro ao processar PDF:', error);
    throw new Error('Não foi possível processar o PDF. Verifique se o arquivo está correto.');
  }
};

export const structureArticle = (text, title = 'Artigo Carregado') => {
  const sections = [];
  let paragraphCounter = 0;
  
  const sectionPatterns = [
    { pattern: /abstract|resumo/i, id: 'abstract', title: 'Resumo', type: 'abstract' },
    { pattern: /introdu[çc][ãa]o|introduction/i, id: 'introduction', title: 'Introdução', type: 'introduction' },
    { pattern: /m[ée]todos?|methods?|metodologia/i, id: 'methods', title: 'Métodos', type: 'methods' },
    { pattern: /resultados?|results?/i, id: 'results', title: 'Resultados', type: 'results' },
    { pattern: /discuss[ãa]o|discussion/i, id: 'discussion', title: 'Discussão', type: 'discussion' },
    { pattern: /conclus[ãa]o|conclusion/i, id: 'conclusion', title: 'Conclusão', type: 'conclusion' },
    { pattern: /refer[êe]ncias|references/i, id: 'references', title: 'Referências', type: 'references' }
  ];
  
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  let currentSection = null;
  let currentParagraphs = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.length === 0) continue;
    
    let foundSection = false;
    for (const sectionDef of sectionPatterns) {
      if (sectionDef.pattern.test(line) && line.length < 50) {
        if (currentSection && currentParagraphs.length > 0) {
          sections.push({
            ...currentSection,
            paragraphs: currentParagraphs
          });
        }
        
        currentSection = {
          id: sectionDef.id,
          title: sectionDef.title,
          type: sectionDef.type,
          status: 'unread'
        };
        currentParagraphs = [];
        foundSection = true;
        break;
      }
    }
    
    if (!foundSection) {
      if (line.length > 30) {
        currentParagraphs.push({
          id: `p${++paragraphCounter}`,
          text: line,
          function: inferFunction(line, currentSection?.type)
        });
      }
    }
  }
  
  if (currentSection && currentParagraphs.length > 0) {
    sections.push({
      ...currentSection,
      paragraphs: currentParagraphs
    });
  }
  
  if (sections.length === 0) {
    const allParagraphs = text
      .split('\n\n')
      .filter(p => p.trim().length > 30)
      .map((text, idx) => ({
        id: `p${idx + 1}`,
        text: text.trim(),
        function: 'general'
      }));
    
    sections.push({
      id: 'full-text',
      title: 'Texto Completo',
      type: 'general',
      status: 'unread',
      paragraphs: allParagraphs
    });
  }
  
  return {
    title,
    sections
  };
};

const inferFunction = (text, sectionType) => {
  const lowerText = text.toLowerCase();
  
  if (sectionType === 'abstract') {
    if (lowerText.includes('objetivo') || lowerText.includes('objective')) return 'objective';
    if (lowerText.includes('resultado') || lowerText.includes('result')) return 'results';
    if (lowerText.includes('conclus') || lowerText.includes('conclus')) return 'conclusion';
    return 'summary';
  }
  
  if (sectionType === 'introduction') {
    if (lowerText.includes('objetivo') || lowerText.includes('aim')) return 'objective';
    if (lowerText.includes('lacuna') || lowerText.includes('gap')) return 'gap';
    if (lowerText.includes('problema') || lowerText.includes('problem')) return 'problem';
    return 'context';
  }
  
  if (sectionType === 'methods') {
    if (lowerText.includes('participante') || lowerText.includes('participant')) return 'participants';
    if (lowerText.includes('interven') || lowerText.includes('treatment')) return 'intervention';
    if (lowerText.includes('medida') || lowerText.includes('measure')) return 'measures';
    if (lowerText.includes('procedimento') || lowerText.includes('procedure')) return 'procedure';
    return 'design';
  }
  
  if (sectionType === 'results') {
    if (lowerText.includes('significat') || lowerText.includes('p<') || lowerText.includes('p =')) return 'main_finding';
    if (lowerText.includes('não') && lowerText.includes('significat')) return 'null_finding';
    return 'finding';
  }
  
  if (sectionType === 'discussion') {
    if (lowerText.includes('limita') || lowerText.includes('limitation')) return 'limitations';
    if (lowerText.includes('futuro') || lowerText.includes('future')) return 'future_directions';
    if (lowerText.includes('interpreta') || lowerText.includes('interpret')) return 'interpretation';
    return 'comparison';
  }
  
  return 'general';
};
