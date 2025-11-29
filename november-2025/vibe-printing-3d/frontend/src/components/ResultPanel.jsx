import { useState } from 'react';
import { CheckCircle, Download, Copy, Check } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

export default function ResultPanel({ result }) {
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);

  if (!result) return null;

  const handleCopy = async () => {
    if (result.scad_code) {
      await navigator.clipboard.writeText(result.scad_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-green-300 shadow-lg">
      <h3 className="text-lg font-semibold mb-4 flex items-center text-green-600">
        <CheckCircle className="w-5 h-5 mr-2" />
        Modelo Gerado!
      </h3>

      <div className="flex gap-3 mb-4">
        {result.success && result.download_url ? (
          <a
            href={`${API_BASE_URL}${result.download_url}`}
            download
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-semibold transition flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download STL
          </a>
        ) : (
          <button
            disabled
            className="flex-1 bg-gray-300 text-gray-500 py-3 px-4 rounded-xl font-semibold opacity-50 cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            STL não disponível
          </button>
        )}

        <button
          onClick={handleCopy}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold transition flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5" />
              Copiado!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              Copiar Código
            </>
          )}
        </button>
      </div>

      {/* SCAD Code Preview */}
      <div className="mt-4">
        <button
          onClick={() => setShowCode(!showCode)}
          className="text-sm text-gray-500 hover:text-gray-900 transition cursor-pointer"
        >
          {showCode ? '▼' : '▶'} Ver código OpenSCAD
        </button>
        
        {showCode && result.scad_code && (
          <pre className="mt-2 p-4 bg-gray-800 rounded-lg text-xs text-green-400 overflow-x-auto max-h-60 overflow-y-auto">
            {result.scad_code}
          </pre>
        )}
      </div>
    </div>
  );
}
