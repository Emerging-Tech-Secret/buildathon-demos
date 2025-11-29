import { useState, useEffect } from 'react';
import Header from './components/Header';
import DescriptionInput from './components/DescriptionInput';
import Examples from './components/Examples';
import ObjectSpecs from './components/ObjectSpecs';
import STLViewer from './components/STLViewer';
import ResultPanel from './components/ResultPanel';
import ErrorMessage from './components/ErrorMessage';

const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: 'loading', text: 'Verificando...' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [stlUrl, setStlUrl] = useState(null);

  // Check API health on mount
  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        setStatus({ type: 'online', text: 'API Online' });
      } else {
        setStatus({ type: 'offline', text: 'API Offline' });
      }
    } catch {
      setStatus({ type: 'offline', text: 'API Indisponível' });
    }
  };

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('Por favor, insira uma descrição do objeto.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setStlUrl(null);
    setStatus({ type: 'loading', text: 'Gerando...' });

    try {
      const response = await fetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        if (data.success && data.download_url) {
          setStlUrl(`${API_BASE_URL}${data.download_url}`);
        }
        if (!data.success && data.message) {
          setError(data.message);
        }
        setStatus({ type: 'online', text: 'Modelo Gerado!' });
      } else {
        setError(data.detail || 'Erro ao gerar modelo.');
        setStatus({ type: 'offline', text: 'Erro' });
      }
    } catch (err) {
      setError('Erro de conexão com o servidor. Verifique se a API está rodando.');
      setStatus({ type: 'offline', text: 'Erro de conexão' });
    } finally {
      setIsLoading(false);
      setTimeout(checkHealth, 2000);
    }
  };

  return (
    <div className="bg-white min-h-screen text-gray-900">
      <Header status={status} />

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Input */}
          <div className="space-y-6">
            <DescriptionInput
              value={description}
              onChange={setDescription}
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />
            <Examples onSelect={setDescription} />
            {result?.object_spec && <ObjectSpecs spec={result.object_spec} />}
          </div>

          {/* Right Column - Preview & Results */}
          <div className="space-y-6">
            <STLViewer stlUrl={stlUrl} />
            {result && <ResultPanel result={result} />}
            {error && <ErrorMessage message={error} />}
          </div>
        </div>
      </main>

      <footer className="py-6 px-4 border-t border-orange-200 mt-8">
        <div className="container mx-auto text-center text-gray-500 text-sm">
          <p>Vibe Printing 3D - Buildathon MVP</p>
          <p className="mt-1">Gere modelos 3D imprimíveis a partir de descrições em linguagem natural</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
