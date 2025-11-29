import { ClipboardList } from 'lucide-react';

const labels = {
  object_type: 'Tipo',
  width: 'Largura',
  depth: 'Profundidade',
  height: 'Altura',
  style: 'Estilo',
  has_lid: 'Tampa',
  has_dividers: 'Divisórias',
  divider_count: 'Qtd. Divisórias',
  angle: 'Ângulo',
  wall_thickness: 'Espessura'
};

const formatters = {
  object_type: (v) => v ? v.charAt(0).toUpperCase() + v.slice(1) : '-',
  width: (v) => `${v} mm`,
  depth: (v) => `${v} mm`,
  height: (v) => `${v} mm`,
  style: (v) => v ? v.charAt(0).toUpperCase() + v.slice(1) : '-',
  has_lid: (v) => v ? 'Sim' : 'Não',
  has_dividers: (v) => v ? 'Sim' : 'Não',
  angle: (v) => `${v}°`,
  wall_thickness: (v) => `${v} mm`
};

export default function ObjectSpecs({ spec }) {
  if (!spec) return null;

  const relevantKeys = ['object_type', 'width', 'depth', 'height', 'style', 'wall_thickness'];
  
  if (spec.has_lid) relevantKeys.push('has_lid');
  if (spec.has_dividers) {
    relevantKeys.push('has_dividers', 'divider_count');
  }
  if (spec.object_type === 'support') relevantKeys.push('angle');

  return (
    <div className="bg-white rounded-2xl p-6 border border-orange-200 shadow-lg">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <ClipboardList className="w-5 h-5 mr-2 text-primary" />
        Especificações Detectadas
      </h3>
      <div className="grid grid-cols-2 gap-3 text-sm">
        {relevantKeys.map((key) => (
          <div
            key={key}
            className="bg-orange-50 p-3 rounded-lg border border-orange-200"
          >
            <div className="text-gray-400 text-xs uppercase tracking-wide">
              {labels[key] || key}
            </div>
            <div className="text-gray-900 font-medium mt-1">
              {formatters[key] ? formatters[key](spec[key]) : String(spec[key] ?? '-')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
