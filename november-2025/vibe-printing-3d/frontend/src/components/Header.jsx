import { Box } from 'lucide-react';

export default function Header({ status }) {
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-red-500',
    loading: 'bg-yellow-500 animate-pulse',
  };

  return (
    <header className="py-6 px-4 border-b border-orange-200 bg-white">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
            <Box className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Vibe Printing 3D
          </h1>
        </div>
        <div className="flex items-center text-sm">
          <span className={`w-2 h-2 ${statusColors[status.type]} rounded-full mr-2`}></span>
          {status.text}
        </div>
      </div>
    </header>
  );
}
