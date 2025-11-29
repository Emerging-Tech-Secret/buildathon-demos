import { Lightbulb } from 'lucide-react';

const examples = [
  {
    description: "Uma caixa de 10x5x3 cm com tampa simples",
    translation: "A 10x5x3 cm box with a simple lid"
  },
  {
    description: "Um suporte minimalista para celular inclinado a 30 graus",
    translation: "A minimalist phone stand angled at 30 degrees"
  },
  {
    description: "Um organizador com três divisórias retangulares",
    translation: "An organizer with three rectangular dividers"
  },
  {
    description: "Um gancho robusto para pendurar mochila",
    translation: "A robust hook for hanging a backpack"
  },
  {
    description: "Um porta-lápis cilíndrico, vibe futurista",
    translation: "A cylindrical pencil holder with futuristic vibe"
  }
];

export default function Examples({ onSelect }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-orange-200 shadow-lg">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Lightbulb className="w-5 h-5 mr-2 text-primary" />
        Exemplos
      </h3>
      <div className="space-y-2">
        {examples.map((ex, i) => (
          <button
            key={i}
            onClick={() => onSelect(ex.description)}
            className="w-full text-left p-3 rounded-lg bg-gray-50 border border-orange-200 hover:border-primary hover:bg-orange-50 transition-all"
          >
            <p className="text-sm text-gray-900">{ex.description}</p>
            <p className="text-xs text-gray-500 mt-1">{ex.translation}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
