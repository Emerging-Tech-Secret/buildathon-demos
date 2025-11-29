import { Zap, Pencil } from 'lucide-react';

export default function DescriptionInput({ value, onChange, onGenerate, isLoading }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onGenerate();
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-orange-200 shadow-lg">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Pencil className="w-5 h-5 mr-2 text-primary" />
        Descreva seu objeto 3D
      </h2>

      <textarea
        className="w-full h-32 bg-gray-50 border border-orange-200 rounded-xl p-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-orange-200 transition resize-none"
        placeholder="Ex: Uma caixa de 10x5x3 cm com tampa simples..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <button
        onClick={onGenerate}
        disabled={isLoading || !value.trim()}
        className="mt-4 w-full bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Gerando...</span>
          </>
        ) : (
          <>
            <Zap className="w-5 h-5" />
            <span>Gerar STL</span>
          </>
        )}
      </button>
    </div>
  );
}
