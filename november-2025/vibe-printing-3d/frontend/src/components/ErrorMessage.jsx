import { AlertCircle } from 'lucide-react';

export default function ErrorMessage({ message }) {
  if (!message) return null;

  return (
    <div className="bg-white rounded-2xl p-6 border border-red-300 shadow-lg">
      <h3 className="text-lg font-semibold mb-2 flex items-center text-red-500">
        <AlertCircle className="w-5 h-5 mr-2" />
        Atenção
      </h3>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}
